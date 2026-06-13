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
    // Serverless-friendly pool: keep few connections so many Vercel
    // instances don't exhaust the shared-hosting connection limit.
    connectionLimit: 5,
    idleTimeout: 30,
    acquireTimeout: 20000,
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
