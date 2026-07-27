import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

function getClient() {
  return createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { productId } = body;
  const client = getClient();

  const result = await client.execute({
    sql: "UPDATE Product SET isFavorite = CASE WHEN isFavorite = 1 THEN 0 ELSE 1 END WHERE id = ? RETURNING isFavorite",
    args: [productId],
  });

  return NextResponse.json({ isFavorite: result.rows[0]?.isFavorite });
}
