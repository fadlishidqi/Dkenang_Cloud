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
    // Serverless-friendly pool: Hostinger shared MySQL caps max_user_connections
    // very low, so keep each instance tiny and release idle connections fast.
    connectionLimit: 2,
    minimumIdle: 0,
    idleTimeout: 10,
    acquireTimeout: 10000,
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

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
