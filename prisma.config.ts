import { defineConfig } from "prisma/config";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations / db push run DDL, so prefer Supabase's DIRECT connection
    // (port 5432) — the transaction pooler (6543) can't run them reliably.
    // Read process.env directly (not prisma's env() which throws when unset) so
    // `prisma generate` on Vercel — where only DATABASE_URL exists and no URL is
    // even needed for codegen — doesn't fail. Falls back to DATABASE_URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
