import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const client = createClient({
  url: process.env.TURSO_DB_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

function parseMoney(s: unknown) {
  if (s === null || s === undefined) return 0;
  const n = parseFloat(String(s).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseDateDDMM(fecha: string) {
  const [d, m, y] = fecha.split("/").map((x) => parseInt(x, 10));
  return new Date(Date.UTC(y, m - 1, d));
}

function parseDateMMDD(fecha: string) {
  const [m, d, y] = fecha.split("/").map((x) => parseInt(x, 10));
  return new Date(Date.UTC(y, m - 1, d));
}

interface Compra {
  fecha?: string;
  codigo?: string;
  producto?: string;
  cantidad?: string;
  costo?: string;
  total?: string;
  pedido?: string;
  proveedor?: string;
}

interface Venta {
  fecha?: string;
  idArticulo?: string;
  producto?: string;
  canal?: string;
  costo?: string;
  ingreso?: string;
  cantidad?: string;
  gastos?: string;
  utilidadBruta?: string;
  utilidadNeta?: string;
  pedido?: string;
}

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS HistoricalPurchase (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      date DATETIME NOT NULL,
      code TEXT NOT NULL DEFAULT '',
      product TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unitCost REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      "order" TEXT NOT NULL DEFAULT '',
      supplier TEXT NOT NULL DEFAULT ''
    );
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS HistoricalSale (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      date DATETIME NOT NULL,
      articleId TEXT NOT NULL DEFAULT '',
      product TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT '',
      unitCost REAL NOT NULL DEFAULT 0,
      grossIncome REAL NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      variableExpenses REAL NOT NULL DEFAULT 0,
      grossProfit REAL NOT NULL DEFAULT 0,
      netProfit REAL NOT NULL DEFAULT 0,
      "order" TEXT NOT NULL DEFAULT ''
    );
  `);

  const stripBom = (p: string) => readFileSync(p, "utf8").replace(/^\uFEFF/, "");
  const compras = JSON.parse(stripBom(process.env.COMPRAS_JSON || "")) as Compra[];
  const ventas = JSON.parse(stripBom(process.env.VENTAS_JSON || "")) as Venta[];

  await client.execute("DELETE FROM HistoricalPurchase");
  await client.execute("DELETE FROM HistoricalSale");

  let purchased = 0;
  let skipped = 0;
  for (const c of compras) {
    const qty = parseInt(c.cantidad || "", 10);
    if (!c.producto || !c.fecha) { skipped++; continue; }
    if (!qty || qty <= 0) { skipped++; continue; }
    await client.execute({
      sql: "INSERT INTO HistoricalPurchase (date, code, product, quantity, unitCost, total, \"order\", supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        parseDateMMDD(c.fecha || "").toISOString(),
        (c.codigo || "").trim(),
        c.producto.trim(),
        qty,
        parseMoney(c.costo),
        parseMoney(c.total),
        (c.pedido || "").trim(),
        (c.proveedor || "").trim(),
      ],
    });
    purchased++;
  }

  let sold = 0;
  let soldSkipped = 0;
  for (const v of ventas) {
    const qty = parseInt(v.cantidad || "", 10);
    if (!v.producto || !v.fecha) { soldSkipped++; continue; }
    if (!qty || qty <= 0) { soldSkipped++; continue; }
    await client.execute({
      sql: "INSERT INTO HistoricalSale (date, articleId, product, channel, unitCost, grossIncome, quantity, variableExpenses, grossProfit, netProfit, \"order\") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        parseDateDDMM(v.fecha || "").toISOString(),
        (v.idArticulo || "").trim(),
        v.producto.trim(),
        (v.canal || "").trim(),
        parseMoney(v.costo),
        parseMoney(v.ingreso),
        qty,
        parseMoney(v.gastos),
        parseMoney(v.utilidadBruta),
        parseMoney(v.utilidadNeta),
        (v.pedido || "").trim(),
      ],
    });
    sold++;
  }

  console.log(`Compras importadas: ${purchased} (omitidas: ${skipped})`);
  console.log(`Ventas importadas: ${sold} (omitidas: ${soldSkipped})`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
