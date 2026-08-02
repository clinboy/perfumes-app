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

export async function GET() {
  const client = getClient();
  const result = await client.execute({
    sql: "SELECT m.*, p.name as productName, p.imageUrl, u.name as userName, u.phone as userPhone FROM Movement m JOIN Product p ON m.productId = p.id LEFT JOIN User u ON m.userId = u.id ORDER BY m.createdAt DESC",
    args: [],
  });
  return NextResponse.json({ movements: result.rows });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, from, to, quantity, notes } = body;
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const client = getClient();
  const userId = session.userId;

  await client.execute({
    sql: "INSERT INTO Movement (productId, fromLocation, toLocation, quantity, notes, userId) VALUES (?, ?, ?, ?, ?, ?)",
    args: [productId, from, to, quantity || 1, notes || "", userId],
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
