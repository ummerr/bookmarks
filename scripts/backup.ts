import postgres from "postgres";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Load .env.local if DATABASE_URL not already set
if (!process.env.DATABASE_URL) {
  const envPath = join(new URL(".", import.meta.url).pathname, "..", ".env.local");
  try {
    const envFile = readFileSync(envPath, "utf-8");
    for (const line of envFile.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  } catch {}
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: "require" });

async function backup() {
  const rows = await sql`SELECT * FROM bookmarks ORDER BY bookmarked_at DESC`;
  console.log(`Fetched ${rows.length} bookmarks`);

  const dir = join(new URL(".", import.meta.url).pathname, "..", "backups");
  mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = join(dir, `backup-${timestamp}.json`);
  writeFileSync(file, JSON.stringify(rows, null, 2));
  console.log(`Saved to ${file}`);

  await sql.end();
}

backup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
