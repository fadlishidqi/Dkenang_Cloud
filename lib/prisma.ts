import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const url = new URL(databaseUrl);

  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    // Hostinger shared MySQL caps max_user_connections at 75. A single page can
    // fan out ~5 concurrent queries, so 2 was starving the pool; 5 gives burst
    // headroom while staying well under the cap even with a couple of instances.
    connectionLimit: 5,
    minimumIdle: 0,
    // Keep idle connections warm for a minute instead of tearing them down after
    // 10s — reopening to a remote host costs ~800ms and caused the acquire stalls.
    idleTimeout: 60,
    acquireTimeout: 15000,
  });
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    {
      adapter: createAdapter(),
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    },
  );

// Cache in every environment so the module is never re-evaluated into a second
// pool (each extra pool would consume more of the shared connection cap).
globalForPrisma.prisma = prisma;
