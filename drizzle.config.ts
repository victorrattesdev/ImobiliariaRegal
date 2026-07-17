import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config({ override: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL deve estar definida no .env");
}

export default {
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
