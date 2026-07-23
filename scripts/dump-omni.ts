/**
 * One-off: dump Omni-matching bookmarks to JSON so a subagent can score sentiment
 * without touching the Anthropic API. Delete after use.
 */
import postgres from "postgres";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");
if (!process.env.DATABASE_URL) {
  try {
    const envFile = readFileSync(join(ROOT, ".env.local"), "utf-8");
    for (const line of envFile.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {}
}

async function run() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", prepare: false });
  const rows = await sql`
    SELECT id, tweet_id, tweet_text, author_handle, thread_tweets, bookmarked_at, category
    FROM bookmarks
    WHERE tweet_text ILIKE '%gemini omni%'
       OR tweet_text ILIKE '%omni flash%'
       OR thread_tweets::text ILIKE '%gemini omni%'
       OR thread_tweets::text ILIKE '%omni flash%'
    ORDER BY bookmarked_at DESC NULLS LAST
  `;
  writeFileSync(join(ROOT, "evals", "runs", "_omni-tweets.json"), JSON.stringify(rows, null, 2));
  console.log(`Dumped ${rows.length} rows.`);
  await sql.end();
}
run();
