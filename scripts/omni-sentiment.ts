/**
 * Pulls bookmarks mentioning Google's Gemini Omni / Omni Flash, scores
 * sentiment via Sonnet, and writes a markdown report.
 *
 * Usage:
 *   npx tsx scripts/omni-sentiment.ts
 *   npx tsx scripts/omni-sentiment.ts --since=2026-05-01
 *   npx tsx scripts/omni-sentiment.ts --dry-run   (skip API, just show matches)
 *
 * Costs: hits the Anthropic API with Sonnet. Roughly ~$0.003 per tweet.
 */

import Anthropic from "@anthropic-ai/sdk";
import postgres from "postgres";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");

if (!process.env.DATABASE_URL || !process.env.ANTHROPIC_API_KEY) {
  try {
    const envFile = readFileSync(join(ROOT, ".env.local"), "utf-8");
    for (const line of envFile.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  } catch {}
}

const DATABASE_URL = process.env.DATABASE_URL;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const args = process.argv.slice(2);
const sinceArg = args.find((a) => a.startsWith("--since="))?.split("=")[1];
const dryRun = args.includes("--dry-run");

if (!dryRun && !ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set (use --dry-run to skip the API)");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: "require", prepare: false });

type Row = {
  id: string;
  tweet_id: string;
  tweet_text: string;
  author_handle: string;
  thread_tweets: { tweet_id: string; tweet_text: string }[] | null;
  bookmarked_at: Date | null;
  category: string | null;
};

type Sentiment = "positive" | "negative" | "neutral" | "mixed";

type Scored = {
  id: string;
  tweet_id: string;
  author_handle: string;
  bookmarked_at: Date | null;
  text: string;
  sentiment: Sentiment;
  confidence: number;
  quote: string;
  theme: string;
};

const SENTIMENT_TOOL: Anthropic.Tool = {
  name: "score_sentiment",
  description: "Score sentiment of each tweet about Google Gemini Omni / Omni Flash",
  input_schema: {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Copy id from input exactly" },
            sentiment: {
              type: "string",
              enum: ["positive", "negative", "neutral", "mixed"],
              description: "positive: excited/impressed; negative: critical/disappointed; neutral: factual reporting; mixed: both sides",
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            quote: { type: "string", description: "Short excerpt (<=140 chars) supporting the sentiment" },
            theme: { type: "string", description: "1-3 word theme (e.g. 'video quality', 'pricing', 'comparisons to Veo')" },
          },
          required: ["id", "sentiment", "confidence", "quote", "theme"],
        },
      },
    },
    required: ["results"],
  },
};

const SYSTEM = `You are analyzing tweets about Google's Gemini Omni (also called Gemini Omni Flash), a video-generation model announced in May 2026.

For each tweet, score the author's sentiment SPECIFICALLY toward Gemini Omni — not toward AI in general, not toward Google as a company, and not toward competing models. If the tweet only mentions Omni in passing (e.g. comparing against another model) and the author's attitude toward Omni itself is unclear, use "neutral".

Buckets:
- positive: excitement, impressed by quality/capability, recommendation
- negative: criticism of quality, disappointment, dismissal, complaints
- neutral: factual reporting, news summary, neutral observation
- mixed: clearly expresses both positive and negative views

Pick a short quote (verbatim from the tweet) that supports your label. Pick a 1-3 word theme describing what aspect the tweet focuses on.`;

function isoDate(d: Date | string | null): string {
  if (!d) return "unknown";
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? "unknown" : dt.toISOString().slice(0, 10);
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return `${((n / d) * 100).toFixed(1)}%`;
}

async function scoreBatch(batch: Row[]): Promise<Scored[]> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const indexToRow = new Map(batch.map((r, i) => [String(i + 1), r]));
  const input = batch.map((r, i) => {
    const thread = r.thread_tweets?.length
      ? "\n\nThread:\n" + r.thread_tweets.map((t) => t.tweet_text).join("\n---\n")
      : "";
    return { id: String(i + 1), text: (r.tweet_text + thread).slice(0, 2000) };
  });

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: SYSTEM,
    tools: [SENTIMENT_TOOL],
    tool_choice: { type: "tool", name: "score_sentiment" },
    messages: [{ role: "user", content: `Score sentiment for these tweets:\n${JSON.stringify(input)}` }],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    console.warn(`  batch undercount: no tool_use, stop_reason=${message.stop_reason}`);
    return [];
  }

  const raw = (toolUse.input as { results: unknown }).results;
  const results = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const scored: Scored[] = [];
  for (const r of results as Record<string, unknown>[]) {
    const id = r.id != null ? String(r.id) : null;
    if (!id) continue;
    const row = indexToRow.get(id);
    if (!row) continue;
    scored.push({
      id: row.id,
      tweet_id: row.tweet_id,
      author_handle: row.author_handle,
      bookmarked_at: row.bookmarked_at,
      text: row.tweet_text,
      sentiment: r.sentiment as Sentiment,
      confidence: Number(r.confidence) || 0,
      quote: String(r.quote ?? ""),
      theme: String(r.theme ?? ""),
    });
  }

  if (scored.length < batch.length) {
    console.warn(`  batch undercount: sent ${batch.length}, got ${scored.length}`);
  }
  return scored;
}

async function run() {
  const sinceClause = sinceArg ? sql`AND bookmarked_at >= ${sinceArg}` : sql``;

  console.log("Querying bookmarks mentioning Gemini Omni...");
  const rows = (await sql<Row[]>`
    SELECT id, tweet_id, tweet_text, author_handle, thread_tweets, bookmarked_at, category
    FROM bookmarks
    WHERE (
        tweet_text ILIKE '%gemini omni%'
        OR tweet_text ILIKE '%omni flash%'
        OR thread_tweets::text ILIKE '%gemini omni%'
        OR thread_tweets::text ILIKE '%omni flash%'
    )
    ${sinceClause}
    ORDER BY bookmarked_at DESC NULLS LAST
  `) as unknown as Row[];

  console.log(`Matched ${rows.length} bookmarks${sinceArg ? ` since ${sinceArg}` : ""}.`);

  if (rows.length === 0) {
    console.log("Nothing to score. Classify your new bookmarks and re-run.");
    await sql.end();
    return;
  }

  if (dryRun) {
    console.log("\n--- dry run: matches ---");
    for (const r of rows.slice(0, 20)) {
      console.log(`  [${isoDate(r.bookmarked_at)}] @${r.author_handle} (${r.category ?? "?"}): ${r.tweet_text.slice(0, 120).replace(/\s+/g, " ")}`);
    }
    if (rows.length > 20) console.log(`  ... and ${rows.length - 20} more`);
    await sql.end();
    return;
  }

  console.log(`Scoring ${rows.length} tweets in batches of 10...`);
  const scored: Scored[] = [];
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    process.stdout.write(`  batch ${Math.floor(i / 10) + 1}/${Math.ceil(rows.length / 10)}... `);
    try {
      const out = await scoreBatch(batch);
      scored.push(...out);
      console.log(`${out.length}/${batch.length} ok`);
    } catch (err) {
      console.log(`failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ── Aggregate ──────────────────────────────────────────────────────────
  const counts: Record<Sentiment, number> = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
  const byTheme = new Map<string, number>();
  for (const s of scored) {
    counts[s.sentiment]++;
    const key = s.theme.toLowerCase().trim();
    if (key) byTheme.set(key, (byTheme.get(key) ?? 0) + 1);
  }

  const sortByConf = (a: Scored, b: Scored) => b.confidence - a.confidence;
  const top = (label: Sentiment, n = 5) =>
    scored.filter((s) => s.sentiment === label).sort(sortByConf).slice(0, n);

  // ── Report ─────────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push(`# Gemini Omni Sentiment — ${today}`);
  lines.push("");
  lines.push(`**Source:** bookmarks matching \`gemini omni\` or \`omni flash\` (tweet text + thread).`);
  if (sinceArg) lines.push(`**Filter:** bookmarked_at >= ${sinceArg}`);
  lines.push(`**Total scored:** ${scored.length} (of ${rows.length} matched)`);
  lines.push("");

  lines.push("## Sentiment breakdown (overall)");
  lines.push("");
  lines.push("| Sentiment | N | % |");
  lines.push("|---|---|---|");
  for (const k of ["positive", "neutral", "mixed", "negative"] as const) {
    lines.push(`| ${k} | ${counts[k]} | ${pct(counts[k], scored.length)} |`);
  }
  lines.push("");

  // ── By-day breakdown ───────────────────────────────────────────────────
  const byDay = new Map<string, Record<Sentiment, number>>();
  for (const s of scored) {
    const day = isoDate(s.bookmarked_at);
    if (!byDay.has(day)) byDay.set(day, { positive: 0, negative: 0, neutral: 0, mixed: 0 });
    byDay.get(day)![s.sentiment]++;
  }
  const days = [...byDay.keys()].sort();

  lines.push("## Sentiment by day");
  lines.push("");
  lines.push("| Day | N | + | – | ~ | ± | net | % positive |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const day of days) {
    const c = byDay.get(day)!;
    const n = c.positive + c.negative + c.neutral + c.mixed;
    const net = c.positive - c.negative;
    const posPct = pct(c.positive, n);
    lines.push(`| ${day} | ${n} | ${c.positive} | ${c.negative} | ${c.neutral} | ${c.mixed} | ${net >= 0 ? "+" : ""}${net} | ${posPct} |`);
  }
  lines.push("");
  lines.push("_Legend: + positive, – negative, ~ neutral, ± mixed. Net = positive − negative._");
  lines.push("");

  lines.push("## Top themes");
  lines.push("");
  const themes = [...byTheme.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  for (const [theme, n] of themes) lines.push(`- ${theme} (${n})`);
  lines.push("");

  for (const bucket of ["positive", "negative", "mixed", "neutral"] as const) {
    const sample = top(bucket, 5);
    if (!sample.length) continue;
    lines.push(`## ${bucket[0].toUpperCase() + bucket.slice(1)} — top ${sample.length}`);
    lines.push("");
    for (const s of sample) {
      lines.push(`- **@${s.author_handle}** (conf ${s.confidence.toFixed(2)}, theme: ${s.theme})`);
      lines.push(`  > ${s.quote}`);
      lines.push(`  [tweet](https://twitter.com/${s.author_handle}/status/${s.tweet_id})`);
      lines.push("");
    }
  }

  const outDir = join(ROOT, "evals", "runs");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `omni-sentiment-${today}.md`);
  writeFileSync(outPath, lines.join("\n"));
  console.log(`\nReport written: ${outPath}`);
  console.log(`Overall: +${counts.positive} / -${counts.negative} / ~${counts.neutral} / ±${counts.mixed}`);
  console.log("By day:");
  for (const day of days) {
    const c = byDay.get(day)!;
    const n = c.positive + c.negative + c.neutral + c.mixed;
    console.log(`  ${day}  n=${n}  +${c.positive} -${c.negative} ~${c.neutral} ±${c.mixed}  net=${c.positive - c.negative >= 0 ? "+" : ""}${c.positive - c.negative}`);
  }

  await sql.end();
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
