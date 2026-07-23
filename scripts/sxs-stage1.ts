/**
 * Side-by-side Stage 1 triage harness.
 *
 * Pulls N random bookmarks (unfiltered by category), runs each variant's
 * classifyBatch (Haiku triage) against the same sample, writes raw JSON per
 * variant + a markdown diff report.
 *
 * Stage 1 question: is the current Haiku triage missing real prompts by
 * labeling them tech_ai_product / uncategorized? Compare Haiku against Sonnet
 * on the same triage prompt to surface disagreement rows worth spot-checking.
 *
 * Run:
 *   npx tsx scripts/sxs-stage1.ts                 # default: n=50, seed=0.42, all categories
 *   npx tsx scripts/sxs-stage1.ts --n=100
 *   npx tsx scripts/sxs-stage1.ts --n=20 --seed=0.7
 *   npx tsx scripts/sxs-stage1.ts --categories=tech_ai_product,uncategorized,career_productivity --n=500
 *
 * --categories filters the sample to those DB labels (comma-separated). Combine
 * with a large --n to exhaustively classify a minority partition — e.g. the 70
 * non-prompt rows as a false-negative recall test.
 *
 * Output: evals/runs/<ts>-stage1-<label>.json and evals/runs/<ts>-stage1-report.md
 */

import postgres from 'postgres'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { classifyBatch, CLASSIFY_SYSTEM } from '../lib/classifier'
import type { Bookmark, ClassificationResult } from '../lib/types'

// ── env loading ───────────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  const envPath = join(new URL('.', import.meta.url).pathname, '..', '.env.local')
  try {
    const envFile = readFileSync(envPath, 'utf-8')
    for (const line of envFile.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch {}
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')

// ── CLI args ──────────────────────────────────────────────────────────────
function arg(name: string, fallback: string): string {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback
}
const N = parseInt(arg('n', '50'), 10)
const SEED = parseFloat(arg('seed', '0.42'))
const CATEGORIES_FILTER = arg('categories', '').split(',').map((s) => s.trim()).filter(Boolean)
const BATCH = 5

// ── Variant definitions ───────────────────────────────────────────────────
type Variant = { label: string; systemPrompt: string; model?: string }

const VARIANTS: Variant[] = [
  { label: 'A-haiku',  systemPrompt: CLASSIFY_SYSTEM },
  { label: 'B-sonnet', systemPrompt: CLASSIFY_SYSTEM, model: 'claude-sonnet-4-5-20250929' },
]

// ── DB sample loader ──────────────────────────────────────────────────────
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false })

type BookmarkRow = Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text' | 'category'>

async function loadSample(n: number, seed: number, cats: string[]): Promise<BookmarkRow[]> {
  // setseed makes random() deterministic for this session, so A and B run on
  // the same sample and re-running with the same seed reproduces it.
  await sql`SELECT setseed(${seed})`
  const rows = cats.length
    ? await sql<Record<string, unknown>[]>`
        SELECT id, tweet_id, tweet_text, category
        FROM bookmarks
        WHERE category = ANY(${cats})
        ORDER BY random()
        LIMIT ${n}
      `
    : await sql<Record<string, unknown>[]>`
        SELECT id, tweet_id, tweet_text, category
        FROM bookmarks
        ORDER BY random()
        LIMIT ${n}
      `
  return rows.map((r) => ({
    id: String(r.id),
    tweet_id: String(r.tweet_id),
    tweet_text: String(r.tweet_text ?? ''),
    category: r.category as Bookmark['category'],
  }))
}

// ── Run one variant across the sample ─────────────────────────────────────
// Stage 1 matches on tweet_id (classifyBatch's id field). Retry-on-undercount
// mirrors scripts/sxs.ts: split missing rows in half, retry, cap depth at 3.
const RETRY_DEPTH_CAP = 3

async function classifyWithRecovery(
  chunk: BookmarkRow[],
  variant: Variant,
  depth = 0,
): Promise<ClassificationResult[]> {
  let res: ClassificationResult[] = []
  try {
    res = await classifyBatch(chunk, { systemPrompt: variant.systemPrompt, model: variant.model })
  } catch (err) {
    if (depth >= RETRY_DEPTH_CAP) {
      console.warn(`    [retry-cap depth=${depth} size=${chunk.length}] error: ${err instanceof Error ? err.message : String(err)}`)
      return []
    }
    console.warn(`    [retry depth=${depth} size=${chunk.length}] error: ${err instanceof Error ? err.message : String(err)}`)
  }

  const gotIds = new Set(res.map((r) => r.tweet_id))
  const missing = chunk.filter((p) => !gotIds.has(p.tweet_id))
  if (missing.length === 0) return res

  if (depth >= RETRY_DEPTH_CAP) {
    console.warn(`    [retry-cap depth=${depth} size=${chunk.length}] still missing ${missing.length}; giving up`)
    return res
  }

  const half = Math.max(1, Math.ceil(missing.length / 2))
  process.stdout.write(`retry(${missing.length}→${half}) `)
  const retried: ClassificationResult[] = []
  for (let j = 0; j < missing.length; j += half) {
    const subChunk = missing.slice(j, j + half)
    await new Promise((r) => setTimeout(r, 400))
    const sub = await classifyWithRecovery(subChunk, variant, depth + 1)
    retried.push(...sub)
  }
  return [...res, ...retried]
}

async function runVariant(variant: Variant, sample: BookmarkRow[]): Promise<ClassificationResult[]> {
  const out: ClassificationResult[] = []
  for (let i = 0; i < sample.length; i += BATCH) {
    const chunk = sample.slice(i, i + BATCH)
    process.stdout.write(`  [${variant.label}] batch ${i / BATCH + 1}/${Math.ceil(sample.length / BATCH)} (${chunk.length})... `)
    const res = await classifyWithRecovery(chunk, variant)
    out.push(...res)
    console.log(`done (${res.length}/${chunk.length})`)
    await new Promise((r) => setTimeout(r, 400))
  }
  return out
}

// ── Diff report ───────────────────────────────────────────────────────────
const CATEGORIES = ['tech_ai_product', 'career_productivity', 'prompts', 'uncategorized'] as const

function fmtText(v: string, max = 400): string {
  const s = v.replace(/\s+/g, ' ').trim()
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function buildReport(
  sample: BookmarkRow[],
  results: Record<string, ClassificationResult[]>,
  variantLabels: string[],
): string {
  const byId: Record<string, Record<string, ClassificationResult | undefined>> = {}
  for (const label of variantLabels) {
    for (const r of results[label]) {
      byId[r.tweet_id] ??= {}
      byId[r.tweet_id][label] = r
    }
  }
  const paired = sample.filter((s) => {
    const row = byId[s.tweet_id]
    return row && variantLabels.every((l) => row[l])
  })

  const lines: string[] = []
  const [la, lb] = variantLabels
  lines.push(`# SxS Stage 1 report — ${variantLabels.join(' vs ')}`)
  lines.push('')
  lines.push(`- sample: ${sample.length} random bookmarks (unfiltered by category)`)
  lines.push(`- classified both sides: ${paired.length}`)
  lines.push('')

  // Category agreement
  lines.push('## Category agreement')
  lines.push('')
  let agree = 0, disagree = 0
  const disagreeIds = new Set<string>()
  for (const s of paired) {
    const a = byId[s.tweet_id][la]!, b = byId[s.tweet_id][lb]!
    if (a.category === b.category) agree++
    else { disagree++; disagreeIds.add(s.tweet_id) }
  }
  const pct = agree + disagree === 0 ? 0 : (100 * agree) / (agree + disagree)
  lines.push(`| field | agree | disagree | agree % |`)
  lines.push(`|---|---:|---:|---:|`)
  lines.push(`| category | ${agree} | ${disagree} | ${pct.toFixed(1)}% |`)
  lines.push('')

  // Category distribution side-by-side
  lines.push('## Category distribution (paired rows only)')
  lines.push('')
  lines.push(`| category | ${la} | ${lb} | Δ (B−A) |`)
  lines.push(`|---|---:|---:|---:|`)
  for (const cat of CATEGORIES) {
    const aN = paired.filter((s) => byId[s.tweet_id][la]?.category === cat).length
    const bN = paired.filter((s) => byId[s.tweet_id][lb]?.category === cat).length
    const delta = bN - aN
    const deltaStr = delta > 0 ? `+${delta}` : String(delta)
    lines.push(`| ${cat} | ${aN} | ${bN} | ${deltaStr} |`)
  }
  lines.push('')

  // DB category vs each variant (ground-truth-ish comparison — the DB label
  // came from the current Haiku triage, so A-haiku should match closely. Gaps
  // between DB and B-sonnet are where Sonnet sees something different.)
  lines.push('## Variant vs current DB label')
  lines.push('')
  lines.push(`| variant | matches DB | differs from DB | match % |`)
  lines.push(`|---|---:|---:|---:|`)
  for (const label of variantLabels) {
    let m = 0, d = 0
    for (const s of paired) {
      const v = byId[s.tweet_id][label]
      if (!v) continue
      if (v.category === s.category) m++
      else d++
    }
    const p = m + d === 0 ? 0 : (100 * m) / (m + d)
    lines.push(`| ${label} | ${m} | ${d} | ${p.toFixed(1)}% |`)
  }
  lines.push('')

  // Avg confidence gap — informational, not signal
  let confSum = 0, confN = 0
  for (const s of paired) {
    const a = byId[s.tweet_id][la], b = byId[s.tweet_id][lb]
    if (!a || !b) continue
    confSum += Math.abs((a.confidence ?? 0) - (b.confidence ?? 0))
    confN++
  }
  const avgGap = confN === 0 ? 0 : confSum / confN
  lines.push(`Avg |confidence Δ|: ${avgGap.toFixed(3)} across ${confN} paired rows.`)
  lines.push('')

  // Category disagreements — spot-check rows
  lines.push('## Category disagreements')
  lines.push('')
  lines.push(`${disagreeIds.size} rows where ${la} and ${lb} disagree on category.`)
  lines.push('')

  const sampleByTweetId = new Map(sample.map((s) => [s.tweet_id, s]))
  for (const tid of disagreeIds) {
    const s = sampleByTweetId.get(tid)!
    const a = byId[tid][la]!, b = byId[tid][lb]!
    lines.push(`### ${s.id}  \`${s.tweet_id}\``)
    lines.push('')
    lines.push(`DB label: \`${s.category}\``)
    lines.push('')
    lines.push(`> ${fmtText(s.tweet_text)}`)
    lines.push('')
    lines.push(`| variant | category | confidence | rationale |`)
    lines.push(`|---|---|---:|---|`)
    lines.push(`| ${la} | **${a.category}** | ${a.confidence.toFixed(2)} | ${fmtText(a.rationale ?? '', 260)} |`)
    lines.push(`| ${lb} | **${b.category}** | ${b.confidence.toFixed(2)} | ${fmtText(b.rationale ?? '', 260)} |`)
    lines.push('')
  }

  return lines.join('\n')
}

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const outDir = join(new URL('.', import.meta.url).pathname, '..', 'evals', 'runs')
  mkdirSync(outDir, { recursive: true })

  const filterNote = CATEGORIES_FILTER.length ? `categories=${CATEGORIES_FILTER.join(',')}` : 'unfiltered'
  console.log(`Loading sample: n=${N}, seed=${SEED} (${filterNote})`)
  const sample = await loadSample(N, SEED, CATEGORIES_FILTER)
  console.log(`  got ${sample.length} rows`)

  const results: Record<string, ClassificationResult[]> = {}
  for (const v of VARIANTS) {
    console.log(`\nRunning variant ${v.label}${v.model ? ` (${v.model})` : ''}...`)
    results[v.label] = await runVariant(v, sample)
    const path = join(outDir, `${ts}-stage1-${v.label}.json`)
    writeFileSync(path, JSON.stringify({ variant: v.label, model: v.model ?? 'claude-haiku-4-5-20251001', seed: SEED, n: N, ts, results: results[v.label] }, null, 2))
    console.log(`  wrote ${path}`)
  }

  const report = buildReport(sample, results, VARIANTS.map((v) => v.label))
  const reportPath = join(outDir, `${ts}-stage1-report.md`)
  writeFileSync(reportPath, report)
  console.log(`\nReport: ${reportPath}`)

  await sql.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
