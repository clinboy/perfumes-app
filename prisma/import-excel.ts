import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as XLSX from "xlsx";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const wb = XLSX.readFile("../INVENTARIO PERFUMES (1).xlsx");
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", header: 1 }) as string[][];

  let headerRow = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === "Producto") { headerRow = i; break; }
  }

  if (headerRow === -1) {
    console.error("No se encontró la fila de encabezados");
    process.exit(1);
  }

  let imported = 0;
  let skipped = 0;

  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] as string[];
    const name = (row[0] || "").trim();
    if (!name) { skipped++; continue; }

    const size = (row[1] || "").trim();
    const price = parseFloat(String(row[12] || 0).replace(/[^0-9.]/g, "")) || 0;
    const stockMercadito = parseInt(String(row[4] || 0)) || 0;
    const stockBoutique = parseInt(String(row[5] || 0)) || 0;
    const stockMiravalle = parseInt(String(row[6] || 0)) || 0;
    const stockDiamond = parseInt(String(row[7] || 0)) || 0;
    const stockMorelos = parseInt(String(row[8] || 0)) || 0;
    const totalStock = parseInt(String(row[9] || 0)) || 0;
    const stockValue = parseFloat(String(row[10] || 0).replace(/[^0-9.]/g, "")) || 0;
    const orders = (row[11] || "").toString().trim();
    const notes = (row[13] || "").toString().trim();

    await prisma.product.create({
      data: {
        name,
        size,
        price,
        totalStock,
        stockMercadito,
        stockBoutique,
        stockMiravalle,
        stockDiamond,
        stockMorelos,
        stockValue,
        orders,
        notes,
      },
    });
    imported++;
  }

  console.log(`Importados: ${imported} productos`);
  console.log(`Saltados: ${skipped} filas vacías`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
