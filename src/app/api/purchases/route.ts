import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

function getClient() {
  return createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
}

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

function isSuperAdmin(session: { role: string } | null) {
  return session?.role === "superadmin";
}

export async function GET() {
  const session = await getSession();
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const client = getClient();
  const result = await client.execute({
    sql: "SELECT p.*, pr.name as productName, pr.price as productPrice, pr.imageUrl, u.name as userName FROM Purchase p JOIN Product pr ON p.productId = pr.id LEFT JOIN User u ON p.userId = u.id ORDER BY p.createdAt DESC",
    args: [],
  });

  return NextResponse.json({ purchases: result.rows });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { productId, quantity, unitCost, location, notes } = body;

  const client = getClient();
  const productResult = await client.execute({
    sql: "SELECT price, totalStock FROM Product WHERE id = ?",
    args: [productId],
  });

  if (productResult.rows.length === 0) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const qty = Math.max(1, parseInt(quantity) || 1);
  const cost = Math.max(0, parseFloat(unitCost) || 0);

  await client.execute({
    sql: "INSERT INTO Purchase (productId, userId, quantity, unitCost, location, notes) VALUES (?, ?, ?, ?, ?, ?)",
    args: [productId, session!.userId, qty, cost, location || "", notes || ""],
  });

  const stockCol = `stock${location || ""}`;
  await client.execute({
    sql: `UPDATE Product SET ${stockCol} = ${stockCol} + ?, totalStock = totalStock + ?, cost = CASE WHEN ? > 0 THEN ? ELSE cost END WHERE id = ?`,
    args: [qty, qty, cost, cost, productId],
  });

  return NextResponse.json({ success: true });
}
