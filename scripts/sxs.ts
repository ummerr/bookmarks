/**
 * Side-by-side classifier harness.
 *
 * Pulls N bookmarks WHERE category='prompts', runs each variant against the
 * same sample, writes raw JSON per variant + a markdown diff report.
 *
 * Run:
 *   npx tsx scripts/sxs.ts                 # default: n=50, seed=0.42
 *   npx tsx scripts/sxs.ts --n=100
 *   npx tsx scripts/sxs.ts --n=20 --seed=0.7
 *
 * Output: evals/runs/<ts>-<label>.json and evals/runs/<ts>-report.md
 */

import postgres from 'postgres'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { classifyPromptBatch, PROMPT_SYSTEM } from '../lib/classifier'
import type { Bookmark } from '../lib/types'

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
const BATCH = 5

// ── Variant definitions ───────────────────────────────────────────────────
type Variant = { label: string; systemPrompt: string; model?: string }

const VARIANTS: Variant[] = [
  { label: 'A-baseline', systemPrompt: PROMPT_SYSTEM },
]

// ── DB sample loader ──────────────────────────────────────────────────────
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false })

type PromptRow = Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text' | 'thread_tweets'> & {
  media_alt_texts?: (string | null)[]
}

async function loadSample(n: number, seed: number): Promise<PromptRow[]> {
  // setseed makes random() deterministic for this session, so A and B run on
  // the same sample and re-running with the same seed reproduces it.
  await sql`SELECT setseed(${seed})`
  const rows = await sql<Record<string, unknown>[]>`
    SELECT id, tweet_id, tweet_text, thread_tweets, media_alt_texts
    FROM bookmarks
    WHERE category = 'prompts'
    ORDER BY random()
    LIMIT ${n}
  `
  return rows.map((r) => {
    const altRaw = r.media_alt_texts
    const media_alt_texts = typeof altRaw === 'string' ? JSON.parse(altRaw) : (altRaw ?? [])
    const threadRaw = r.thread_tweets
    const thread_tweets = typeof threadRaw === 'string' ? JSON.parse(threadRaw) : (threadRaw ?? null)
    return {
      id: String(r.id),
      tweet_id: String(r.tweet_id),
      tweet_text: String(r.tweet_text ?? ''),
      thread_tweets,
      media_alt_texts: Array.isArray(media_alt_texts) ? media_alt_texts : [],
    }
  })
}

// ── Run one variant across the sample ─────────────────────────────────────
type VariantResult = Awaited<ReturnType<typeof classifyPromptBatch>>[number]

// Classify with retry-on-undercount: if a batch returns fewer matched rows
// than prompts sent, split the missing prompts in half and retry. Caps at
// depth 3 (size 5 → 2 → 1), then gives up on any still-missing rows.
const RETRY_DEPTH_CAP = 3

async function classifyWithRecovery(
  chunk: PromptRow[],
  variant: Variant,
  depth = 0,
): Promise<VariantResult[]> {
  let res: VariantResult[] = []
  try {
    res = await classifyPromptBatch(chunk, { systemPrompt: variant.systemPrompt, model: variant.model })
  } catch (err) {
    if (depth >= RETRY_DEPTH_CAP) {
      console.warn(`    [retry-cap depth=${depth} size=${chunk.length}] error: ${err instanceof Error ? err.message : String(err)}`)
      return []
    }
    console.warn(`    [retry depth=${depth} size=${chunk.length}] error: ${err instanceof Error ? err.message : String(err)}`)
  }

  const gotIds = new Set(res.map((r) => r.id))
  const missing = chunk.filter((p) => !gotIds.has(p.id))
  if (missing.length === 0) return res

  if (depth >= RETRY_DEPTH_CAP) {
    console.warn(`    [retry-cap depth=${depth} size=${chunk.length}] still missing ${missing.length}; giving up`)
    return res
  }

  const half = Math.max(1, Math.ceil(missing.length / 2))
  process.stdout.write(`retry(${missing.length}→${half}) `)
  const retried: VariantResult[] = []
  for (let j = 0; j < missing.length; j += half) {
    const subChunk = missing.slice(j, j + half)
    await new Promise((r) => setTimeout(r, 400))
    const sub = await classifyWithRecovery(subChunk, variant, depth + 1)
    retried.push(...sub)
  }
  return [...res, ...retried]
}

async function runVariant(variant: Variant, sample: PromptRow[]): Promise<VariantResult[]> {
  const out: VariantResult[] = []
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
const FIELDS = [
  'prompt_category', 'detected_model', 'requires_reference', 'reference_type',
  'is_multi_shot', 'prompt_themes', 'art_styles', 'extracted_prompt',
] as const
type Field = typeof FIELDS[number]

function eq(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    const sa = [...a].sort(), sb = [...b].sort()
    return sa.every((v, i) => v === sb[i])
  }
  return a === b
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '_null_'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '_[]_'
  if (typeof v === 'string') {
    const s = v.replace(/\s+/g, ' ').trim()
    return s.length > 220 ? s.slice(0, 217) + '…' : s
  }
  return String(v)
}

function buildReport(
  sample: PromptRow[],
  results: Record<string, VariantResult[]>,
  variantLabels: string[],
): string {
  const byId: Record<string, Record<string, VariantResult | undefined>> = {}
  for (const label of variantLabels) {
    for (const r of results[label]) {
      byId[r.id] ??= {}
      byId[r.id][label] = r
    }
  }
  const ids = sample.map((s) => s.id).filter((id) => byId[id])

  const lines: string[] = []
  lines.push(`# SxS report — ${variantLabels.join(' vs ')}`)
  lines.push('')
  lines.push(`- sample: ${sample.length} rows WHERE category='prompts'`)
  lines.push(`- classified both sides: ${ids.length}`)
  lines.push('')

  // Per-field agreement
  lines.push('## Per-field agreement')
  lines.push('')
  lines.push('| field | agree | disagree | agree % |')
  lines.push('|---|---:|---:|---:|')
  const [la, lb] = variantLabels
  const disagreeIds: Record<Field, Set<string>> = Object.fromEntries(FIELDS.map((f) => [f, new Set()])) as Record<Field, Set<string>>
  for (const field of FIELDS) {
    let agree = 0, disagree = 0
    for (const id of ids) {
      const a = byId[id][la], b = byId[id][lb]
      if (!a || !b) continue
      if (eq(a[field], b[field])) agree++
      else { disagree++; disagreeIds[field].add(id) }
    }
    const pct = agree + disagree === 0 ? 0 : (100 * agree) / (agree + disagree)
    lines.push(`| ${field} | ${agree} | ${disagree} | ${pct.toFixed(1)}% |`)
  }
  lines.push('')

  // Null / invalid counts per variant
  lines.push('## Null counts per variant')
  lines.push('')
  lines.push(`| field | ${la} nulls | ${lb} nulls |`)
  lines.push('|---|---:|---:|')
  for (const field of FIELDS) {
    const nullsA = ids.filter((id) => {
      const v = byId[id][la]?.[field]
      return v === null || (Array.isArray(v) && v.length === 0)
    }).length
    const nullsB = ids.filter((id) => {
      const v = byId[id][lb]?.[field]
      return v === null || (Array.isArray(v) && v.length === 0)
    }).length
    lines.push(`| ${field} | ${nullsA} | ${nullsB} |`)
  }
  lines.push('')

  // Side-by-side disagreements
  lines.push('## Disagreements')
  lines.push('')
  const anyDisagree = ids.filter((id) => FIELDS.some((f) => disagreeIds[f].has(id)))
  lines.push(`${anyDisagree.length} rows with at least one field difference.`)
  lines.push('')

  const sampleById = new Map(sample.map((s) => [s.id, s]))
  for (const id of anyDisagree) {
    const s = sampleById.get(id)!
    const a = byId[id][la]!, b = byId[id][lb]!
    const text = s.tweet_text.replace(/\s+/g, ' ').trim().slice(0, 400)
    lines.push(`### ${id}  \`${s.tweet_id}\``)
    lines.push('')
    lines.push(`> ${text}`)
    lines.push('')
    lines.push(`| field | ${la} | ${lb} |`)
    lines.push('|---|---|---|')
    for (const field of FIELDS) {
      if (!disagreeIds[field].has(id)) continue
      lines.push(`| **${field}** | ${fmt(a[field])} | ${fmt(b[field])} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const outDir = join(new URL('.', import.meta.url).pathname, '..', 'evals', 'runs')
  mkdirSync(outDir, { recursive: true })

  console.log(`Loading sample: n=${N}, seed=${SEED}`)
  const sample = await loadSample(N, SEED)
  console.log(`  got ${sample.length} rows`)

  const results: Record<string, VariantResult[]> = {}
  for (const v of VARIANTS) {
    console.log(`\nRunning variant ${v.label}...`)
    results[v.label] = await runVariant(v, sample)
    const path = join(outDir, `${ts}-${v.label}.json`)
    writeFileSync(path, JSON.stringify({ variant: v.label, seed: SEED, n: N, ts, results: results[v.label] }, null, 2))
    console.log(`  wrote ${path}`)
  }

  const report = buildReport(sample, results, VARIANTS.map((v) => v.label))
  const reportPath = join(outDir, `${ts}-report.md`)
  writeFileSync(reportPath, report)
  console.log(`\nReport: ${reportPath}`)

  await sql.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
