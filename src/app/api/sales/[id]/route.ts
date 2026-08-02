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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const client = getClient();

  const saleResult = await client.execute({
    sql: "SELECT price, quantity, amountPaid, paymentType FROM Sale WHERE id = ?",
    args: [id],
  });

  if (saleResult.rows.length === 0) {
    return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
  }

  const sale = saleResult.rows[0];
  const total = Number(sale.price) * Number(sale.quantity);
  const newPayment = Number(body.amount) || 0;
  const newAmount = Math.min(Number(sale.amountPaid) + newPayment, total);

  await client.execute({
    sql: "UPDATE Sale SET amountPaid = ? WHERE id = ?",
    args: [newAmount, id],
  });

  const fullyPaid = newAmount >= total;

  return NextResponse.json({
    success: true,
    amountPaid: newAmount,
    total,
    remaining: Math.max(total - newAmount, 0),
    fullyPaid,
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const client = getClient();

  const saleResult = await client.execute({
    sql: "SELECT productId, quantity, location FROM Sale WHERE id = ?",
    args: [id],
  });

  if (saleResult.rows.length === 0) {
    return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
  }

  const sale = saleResult.rows[0];
  const productId = Number(sale.productId);
  const qty = Number(sale.quantity);
  const location = String(sale.location);

  await client.execute({
    sql: "DELETE FROM Sale WHERE id = ?",
    args: [id],
  });

  const stockCol = `stock${location}`;
  await client.execute({
    sql: `UPDATE Product SET ${stockCol} = ${stockCol} + ?, totalStock = totalStock + ? WHERE id = ?`,
    args: [qty, qty, productId],
  });

  return NextResponse.json({ success: true });
}
