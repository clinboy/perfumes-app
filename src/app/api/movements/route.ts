import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

function getClient() {
  return createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
}

export async function GET() {
  const client = getClient();
  const result = await client.execute({
    sql: "SELECT m.*, p.name as productName, p.imageUrl FROM Movement m JOIN Product p ON m.productId = p.id ORDER BY m.createdAt DESC",
    args: [],
  });
  return NextResponse.json({ movements: result.rows });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, from, to, quantity, notes } = body;
  const client = getClient();

  await client.execute({
    sql: "INSERT INTO Movement (productId, fromLocation, toLocation, quantity, notes) VALUES (?, ?, ?, ?, ?)",
    args: [productId, from, to, quantity || 1, notes || ""],
  });

  const fromCol = `stock${from}`;
  const toCol = `stock${to}`;
  const q = quantity || 1;

  await client.execute({
    sql: `UPDATE Product SET ${fromCol} = MAX(0, ${fromCol} - ?), ${toCol} = ${toCol} + ? WHERE id = ?`,
    args: [q, q, productId],
  });

  return NextResponse.json({ success: true });
}
