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

async function isSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return false;
  const session = verifyToken(token);
  if (!session) return false;
  const client = getClient();
  const result = await client.execute({
    sql: "SELECT role FROM User WHERE id = ?",
    args: [session.userId],
  });
  if (result.rows.length === 0) return false;
  return String(result.rows[0].role) === "superadmin";
}

export async function GET() {
  const authorized = await isSuperAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const client = getClient();
  const [purchases, sales] = await Promise.all([
    client.execute("SELECT * FROM HistoricalPurchase ORDER BY date DESC"),
    client.execute("SELECT * FROM HistoricalSale ORDER BY date DESC"),
  ]);

  return NextResponse.json({
    purchases: purchases.rows,
    sales: sales.rows,
  });
}
