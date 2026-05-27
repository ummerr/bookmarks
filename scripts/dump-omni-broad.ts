/**
 * One-off: dump all Omni-related bookmarks using a broader filter than dump-omni.ts.
 * Used by app/omni-report/report.md refresh.
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
  // Broader: match "gemini omni", "omni flash", "google omni", "flowbygoogle", "google flow"
  const rows = await sql`
    SELECT id, tweet_id, tweet_text, author_handle, thread_tweets, bookmarked_at, category
    FROM bookmarks
    WHERE tweet_text ILIKE '%gemini omni%'
       OR tweet_text ILIKE '%omni flash%'
       OR tweet_text ILIKE '%google omni%'
       OR tweet_text ~* '\\m(omni)\\M'
       OR tweet_text ILIKE '%flowbygoogle%'
       OR tweet_text ILIKE '%google flow%'
       OR thread_tweets::text ILIKE '%gemini omni%'
       OR thread_tweets::text ILIKE '%omni flash%'
       OR thread_tweets::text ILIKE '%google omni%'
       OR thread_tweets::text ILIKE '%flowbygoogle%'
       OR thread_tweets::text ILIKE '%google flow%'
    ORDER BY bookmarked_at DESC NULLS LAST
  `;
  writeFileSync(join(ROOT, "evals", "runs", "_omni-tweets-broad.json"), JSON.stringify(rows, null, 2));
  console.log(`Dumped ${rows.length} rows.`);
  await sql.end();
}
run();
