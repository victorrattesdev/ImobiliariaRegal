import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("no DATABASE_URL");
  console.log("host hint:", url.includes("neon.tech") ? "neon" : "other");

  const sql = neon(url);
  const rows = await sql`select now() as now`;
  console.log("NEON OK", rows[0]);
}

main().catch((e) => {
  console.error("FAIL", e.message);
  process.exit(1);
});
