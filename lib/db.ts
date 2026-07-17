import dotenv from "dotenv";
dotenv.config({ override: true });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/shared/schema";

const connectionString = process.env.DATABASE_URL || "";

export const usePostgres =
  connectionString.startsWith("postgres") &&
  process.env.STORAGE !== "json";

const needsSsl =
  connectionString.includes("sslmode=require") ||
  connectionString.includes("neon.tech");

const globalForDb = globalThis as unknown as {
  pool?: Pool;
};

export const pool = usePostgres
  ? globalForDb.pool ??
    new Pool({
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    })
  : null;

if (usePostgres && pool && process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = pool ? drizzle(pool, { schema }) : null;
