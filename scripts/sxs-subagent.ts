/**
 * SxS classifier harness — subagent edition.
 *
 * Same sample/metric shape as scripts/sxs.ts, but the classification step is
 * done by Claude Code subagents (model: "sonnet" | "haiku") rather than the
 * Anthropic API. No user-paid API charges.
 *
 * Phases:
 *   prepare  — load sample, preprocess, write <ts>-subagent-sample.json
 *              (contains batches in the exact shape subagents should receive)
 *   analyze  — read <ts>-subagent-{sonnet,haiku}-raw.json (one array per
 *              batch), apply prod post-processing (normaliseModel +
 *              reference-consistency enforcement), write normalized per-
 *              variant files + <ts>-subagent-report.md
 *
 * Between prepare and analyze: the caller (Claude Code) runs N subagents,
 * collects their JSON outputs, writes them to the raw files.
 *
 * Run:
 *   npx tsx scripts/sxs-subagent.ts prepare [--n=50] [--seed=0.42]
 *   npx tsx scripts/sxs-subagent.ts analyze <ts>
 */

import postgres from 'postgres'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { preprocessTweet, normaliseModel } from '../lib/classifier'
import type { ArtStyle, Bookmark, PromptCategory, PromptTheme, ReferenceType } from '../lib/types'

// ── env ───────────────────────────────────────────────────────────────────
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

const BATCH = 5

// ── args ──────────────────────────────────────────────────────────────────
function arg(name: string, fallback: string): string {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback
}
const phase = process.argv[2]

const outDir = join(new URL('.', import.meta.url).pathname, '..', 'evals', 'runs')
mkdirSync(outDir, { recursive: true })

// ── types ─────────────────────────────────────────────────────────────────
type PromptRow = Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text' | 'thread_tweets'> & {
  media_alt_texts?: (string | null)[]
}

type BatchItem = { id: string; text: string }
type SampleFile = {
  ts: string
  n: number
  seed: number
  sample: PromptRow[]
  batches: BatchItem[][]
  indexToId: Record<string, string>
}

type RawResult = {
  id: string
  prompt_category: string
  detected_model: string | null
  extracted_prompt: string | null
  prompt_themes: string[]
  art_styles: string[]
  requires_reference: boolean | null
  reference_type: string | null
  is_multi_shot: boolean | null
}

type NormalizedResult = {
  id: string
  prompt_category: PromptCategory
  detected_model: string | null
  extracted_prompt: string | null
  prompt_themes: PromptTheme[]
  art_styles: ArtStyle[]
  requires_reference: boolean | null
  reference_type: ReferenceType | null
  is_multi_shot: boolean | null
}

// ── prepare ───────────────────────────────────────────────────────────────
async function prepare() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  const n = parseInt(arg('n', '50'), 10)
  const seed = parseFloat(arg('seed', '0.42'))

  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false })
  await sql`SELECT setseed(${seed})`
  const rows = await sql<Record<string, unknown>[]>`
    SELECT id, tweet_id, tweet_text, thread_tweets, media_alt_texts
    FROM bookmarks
    WHERE category = 'prompts'
    ORDER BY random()
    LIMIT ${n}
  `
  await sql.end()

  const sample: PromptRow[] = rows.map((r) => {
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

  // Preprocess identically to classifyPromptBatch (lib/classifier.ts)
  const preprocessed = sample.map((p, i) => {
    const threadContext = p.thread_tweets?.length
      ? '\n\nThread:\n' + p.thread_tweets.map((t) => t.tweet_text).join('\n---\n')
      : ''
    const altTexts = (p.media_alt_texts ?? []).filter(Boolean)
    const altContext = altTexts.length ? '\n\nImage descriptions: ' + altTexts.join(' | ') : ''
    const fullText = preprocessTweet(p.tweet_text + threadContext + altContext).slice(0, 3000)
    return { id: String(i + 1), text: fullText, dbId: p.id }
  })

  const indexToId: Record<string, string> = {}
  for (const p of preprocessed) indexToId[p.id] = p.dbId

  const batches: BatchItem[][] = []
  for (let i = 0; i < preprocessed.length; i += BATCH) {
    batches.push(preprocessed.slice(i, i + BATCH).map(({ id, text }) => ({ id, text })))
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const out: SampleFile = { ts, n, seed, sample, batches, indexToId }
  const path = join(outDir, `${ts}-subagent-sample.json`)
  writeFileSync(path, JSON.stringify(out, null, 2))

  console.log(`Wrote sample: ${path}`)
  console.log(`  ${sample.length} rows in ${batches.length} batches of ≤${BATCH}`)
  console.log(`  ts=${ts}`)
  console.log('')
  console.log('Next: run subagents for each batch with PROMPT_SYSTEM and save raw')
  console.log('results to evals/runs/<ts>-subagent-sonnet-raw.json and')
  console.log('<ts>-subagent-haiku-raw.json as a flat array of RawResult objects.')
  console.log('Then: npx tsx scripts/sxs-subagent.ts analyze ' + ts)
}

// ── analyze ───────────────────────────────────────────────────────────────
const VALID_PROMPT_CATEGORIES_LIST = [
  'image_person', 'image_advertisement', 'image_collage',
  'image_t2i', 'image_i2i', 'image_r2i',
  'video_t2v', 'video_i2v', 'video_r2v', 'video_v2v',
  'audio', 'threed',
  'system_prompt', 'writing', 'coding', 'analysis', 'other',
] as const
const VALID_PROMPT_CATEGORIES = new Set<PromptCategory>(VALID_PROMPT_CATEGORIES_LIST)

const VALID_THEMES_LIST = [
  'person', 'cinematic', 'landscape', 'architecture', 'scifi',
  'fantasy', 'abstract', 'fashion', 'product', 'horror',
] as const
const VALID_THEMES = new Set<PromptTheme>(VALID_THEMES_LIST)

const VALID_ART_STYLES_LIST = [
  'photorealistic', 'anime', 'illustration', 'oil_painting', 'watercolor',
  'digital_art', 'sketch', 'pixel_art', '3d_render', 'concept_art',
  'comic_book', 'minimalist', 'surrealist', 'impressionist',
  'cinematic_photo', 'neon_noir', 'vintage', 'flat_design',
] as const
const VALID_ART_STYLES = new Set<ArtStyle>(VALID_ART_STYLES_LIST)

const VALID_REF_TYPES_LIST = [
  'face_person', 'style_artwork', 'subject_object', 'pose_structure', 'scene_background',
] as const
const VALID_REF_TYPES = new Set<ReferenceType>(VALID_REF_TYPES_LIST)

const REFERENCE_CATEGORIES = new Set(['image_r2i', 'image_i2i', 'video_r2v', 'video_i2v'])

function normalize(raw: RawResult[], indexToId: Record<string, string>): NormalizedResult[] {
  const out: NormalizedResult[] = []
  for (const r of raw) {
    const dbId = indexToId[String(r.id)]
    if (!dbId) continue
    const category = (VALID_PROMPT_CATEGORIES.has(r.prompt_category as PromptCategory)
      ? r.prompt_category
      : 'other') as PromptCategory
    let requires_reference = typeof r.requires_reference === 'boolean' ? r.requires_reference : null
    let reference_type: ReferenceType | null = VALID_REF_TYPES.has(r.reference_type as ReferenceType)
      ? (r.reference_type as ReferenceType)
      : null
    if (REFERENCE_CATEGORIES.has(category) && requires_reference !== true) requires_reference = true
    if (requires_reference === true && !reference_type) reference_type = 'subject_object'
    out.push({
      id: dbId,
      prompt_category: category,
      detected_model: normaliseModel(r.detected_model ?? null, category),
      extracted_prompt: r.extracted_prompt ?? null,
      prompt_themes: Array.isArray(r.prompt_themes)
        ? (r.prompt_themes.filter((t) => VALID_THEMES.has(t as PromptTheme)) as PromptTheme[])
        : [],
      art_styles: Array.isArray(r.art_styles)
        ? (r.art_styles.filter((s) => VALID_ART_STYLES.has(s as ArtStyle)) as ArtStyle[])
        : [],
      requires_reference,
      reference_type,
      is_multi_shot: typeof r.is_multi_shot === 'boolean' ? r.is_multi_shot : null,
    })
  }
  return out
}

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
  results: Record<string, NormalizedResult[]>,
  variantLabels: string[],
): string {
  const byId: Record<string, Record<string, NormalizedResult | undefined>> = {}
  for (const label of variantLabels) {
    for (const r of results[label]) {
      byId[r.id] ??= {}
      byId[r.id][label] = r
    }
  }
  const ids = sample.map((s) => s.id).filter((id) => byId[id])

  const lines: string[] = []
  lines.push(`# SxS subagent report — ${variantLabels.join(' vs ')}`)
  lines.push('')
  lines.push(`- sample: ${sample.length} rows WHERE category='prompts'`)
  lines.push(`- classified both sides: ${ids.length}`)
  lines.push('- classifier: Claude Code subagents (no user-paid API charges)')
  lines.push('- post-processing: prod normaliseModel + reference-consistency enforcement applied to both sides')
  lines.push('')

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

function analyze(ts: string) {
  const samplePath = join(outDir, `${ts}-subagent-sample.json`)
  const sonnetRawPath = join(outDir, `${ts}-subagent-sonnet-raw.json`)
  const haikuRawPath = join(outDir, `${ts}-subagent-haiku-raw.json`)

  const sampleFile: SampleFile = JSON.parse(readFileSync(samplePath, 'utf-8'))
  const sonnetRaw: RawResult[] = JSON.parse(readFileSync(sonnetRawPath, 'utf-8'))
  const haikuRaw: RawResult[] = JSON.parse(readFileSync(haikuRawPath, 'utf-8'))

  const sonnet = normalize(sonnetRaw, sampleFile.indexToId)
  const haiku = normalize(haikuRaw, sampleFile.indexToId)

  writeFileSync(
    join(outDir, `${ts}-subagent-sonnet.json`),
    JSON.stringify({ variant: 'subagent-sonnet', ts, n: sampleFile.n, seed: sampleFile.seed, results: sonnet }, null, 2)
  )
  writeFileSync(
    join(outDir, `${ts}-subagent-haiku.json`),
    JSON.stringify({ variant: 'subagent-haiku', ts, n: sampleFile.n, seed: sampleFile.seed, results: haiku }, null, 2)
  )

  const report = buildReport(sampleFile.sample, { 'subagent-sonnet': sonnet, 'subagent-haiku': haiku }, ['subagent-sonnet', 'subagent-haiku'])
  const reportPath = join(outDir, `${ts}-subagent-report.md`)
  writeFileSync(reportPath, report)
  console.log(`Sonnet results: ${sonnet.length}/${sampleFile.sample.length}`)
  console.log(`Haiku results:  ${haiku.length}/${sampleFile.sample.length}`)
  console.log(`Report: ${reportPath}`)
}

// ── dispatch ──────────────────────────────────────────────────────────────
if (phase === 'prepare') {
  prepare().catch((err) => { console.error(err); process.exit(1) })
} else if (phase === 'analyze') {
  const ts = process.argv[3]
  if (!ts) { console.error('Usage: npx tsx scripts/sxs-subagent.ts analyze <ts>'); process.exit(1) }
  analyze(ts)
} else {
  console.error('Usage:')
  console.error('  npx tsx scripts/sxs-subagent.ts prepare [--n=50] [--seed=0.42]')
  console.error('  npx tsx scripts/sxs-subagent.ts analyze <ts>')
  process.exit(1)
}
