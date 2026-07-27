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

  const users = await client.execute({
    sql: "SELECT id, name, phone, role, createdAt FROM User ORDER BY createdAt DESC",
    args: [],
  });

  const salesByUser = await client.execute({
    sql: "SELECT userId, COUNT(*) as totalSales, SUM(price * quantity) as totalRevenue FROM Sale GROUP BY userId",
    args: [],
  });

  const movementsByUser = await client.execute({
    sql: "SELECT userId, COUNT(*) as totalMovements FROM Movement GROUP BY userId",
    args: [],
  });

  const recentSales = await client.execute({
    sql: "SELECT s.*, p.name as productName, u.name as userName FROM Sale s JOIN Product p ON s.productId = p.id LEFT JOIN User u ON s.userId = u.id ORDER BY s.createdAt DESC LIMIT 50",
    args: [],
  });

  const recentMovements = await client.execute({
    sql: "SELECT m.*, p.name as productName, u.name as userName FROM Movement m JOIN Product p ON m.productId = p.id LEFT JOIN User u ON m.userId = u.id ORDER BY m.createdAt DESC LIMIT 50",
    args: [],
  });

  const salesMap: Record<number, { totalSales: number; totalRevenue: number }> = {};
  for (const row of salesByUser.rows) {
    salesMap[row.userId as number] = {
      totalSales: Number(row.totalSales),
      totalRevenue: Number(row.totalRevenue),
    };
  }

  const movementsMap: Record<number, number> = {};
  for (const row of movementsByUser.rows) {
    movementsMap[row.userId as number] = Number(row.totalMovements);
  }

  const usersWithStats = users.rows.map((u) => ({
    ...u,
    totalSales: salesMap[u.id as number]?.totalSales || 0,
    totalRevenue: salesMap[u.id as number]?.totalRevenue || 0,
    totalMovements: movementsMap[u.id as number] || 0,
  }));

  return NextResponse.json({
    users: usersWithStats,
    recentSales: recentSales.rows,
    recentMovements: recentMovements.rows,
  });
}
