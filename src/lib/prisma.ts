import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const isProd = process.env.NODE_ENV === "production";
  const url = isProd ? process.env.TURSO_DB_URL! : (process.env.DATABASE_URL || "file:./dev.db");
  const authToken = isProd ? process.env.TURSO_AUTH_TOKEN : undefined;

  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
