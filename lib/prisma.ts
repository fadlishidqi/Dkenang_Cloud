import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createAdapter() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  // DATABASE_URL points at Supabase's transaction pooler (port 6543). On Vercel
  // every serverless instance gets its own pool, so keep each one tiny and let
  // idle connections drop fast — Supavisor multiplexes the real Postgres ones.
  // PrismaPg does not cache prepared statements by default, which is exactly
  // what the transaction pooler needs.
  return new PrismaPg({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cache in every environment so the module is never re-evaluated into a second
// pool (each extra pool would consume more pooler connections).
globalForPrisma.prisma = prisma;
