import dotenv from "dotenv";
dotenv.config({ override: true });
import { getProperties } from "../lib/properties";

async function main() {
  const all = await getProperties({ includeInactive: true, limit: 50 });
  console.log("count", all.length);
  for (const p of all) console.log(p.city, "|", p.title);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
