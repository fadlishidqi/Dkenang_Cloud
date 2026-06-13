import { defineConfig, env } from "prisma/config";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations / db push run DDL, so use Supabase's DIRECT connection
    // (port 5432) — the transaction pooler (6543) can't run them reliably.
    url: env("DIRECT_URL"),
  },
});
