/**
 * One-off: dump the Omni/Flow corpus (May 19 onward) to a simplified JSON that
 * a Sonnet subagent can score for sentiment without touching the paid API.
 * Writes evals/runs/_flow-scoring-input.json. Used by the /omni-report + /flow-brief refresh.
 */
import postgres from "postgres";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
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

const SINCE = process.argv.find((a) => a.startsWith("--since="))?.split("=")[1] ?? "2026-05-19";

type Row = {
  tweet_id: string;
  tweet_text: string;
  author_handle: string;
  thread_tweets: { tweet_text?: string }[] | null;
  bookmarked_at: string | null;
};

async function run() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", prepare: false });
  const rows = (await sql`
    SELECT tweet_id, tweet_text, author_handle, thread_tweets, bookmarked_at
    FROM bookmarks
    WHERE bookmarked_at >= ${SINCE}
      AND (
        tweet_text ILIKE '%gemini omni%'
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
      )
    ORDER BY bookmarked_at ASC
  `) as unknown as Row[];

  const out = rows.map((r) => ({
    id: r.tweet_id,
    handle: r.author_handle,
    date: r.bookmarked_at ? new Date(r.bookmarked_at).toISOString().slice(0, 10) : "unknown",
    text: r.tweet_text,
    thread: JSON.stringify((r.thread_tweets ?? []).map((t) => t.tweet_text ?? "").filter(Boolean)),
  }));

  const outDir = join(ROOT, "evals", "runs");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "_flow-scoring-input.json"), JSON.stringify(out, null, 2));

  // quick by-day histogram for sanity
  const byDay = new Map<string, number>();
  for (const r of out) byDay.set(r.date, (byDay.get(r.date) ?? 0) + 1);
  console.log(`Dumped ${out.length} rows since ${SINCE}.`);
  console.log("By day:");
  for (const d of [...byDay.keys()].sort()) console.log(`  ${d}  ${byDay.get(d)}`);
  await sql.end();
}
run().catch((e) => { console.error(e); process.exit(1); });
