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
    sql: "SELECT s.*, p.name as productName, p.imageUrl, u.name as userName, u.phone as userPhone FROM Sale s JOIN Product p ON s.productId = p.id LEFT JOIN User u ON s.userId = u.id ORDER BY s.createdAt DESC",
    args: [],
  });
  return NextResponse.json({ sales: result.rows });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, quantity, price, location } = body;
  const session = await getSession();
  const client = getClient();

  const userId = session?.userId || 0;

  await client.execute({
    sql: "INSERT INTO Sale (productId, quantity, price, location, userId) VALUES (?, ?, ?, ?, ?)",
    args: [productId, quantity || 1, price, location, userId],
  });

  const stockCol = `stock${location}`;
  await client.execute({
    sql: `UPDATE Product SET ${stockCol} = MAX(0, ${stockCol} - ?), totalStock = MAX(0, totalStock - ?) WHERE id = ?`,
    args: [quantity || 1, quantity || 1, productId],
  });

  return NextResponse.json({ success: true });
}
