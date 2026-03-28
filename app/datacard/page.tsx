'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { modelToFamily } from '@/components/prompts/constants'

// ── Types ──────────────────────────────────────────────────────────────────

interface LabelValue { label: string; value: number }

interface StatsData {
  total: number
  withReference: number
  byCategory: LabelValue[]
  byModel: LabelValue[]
  byTheme?: LabelValue[]
  byReferenceType: LabelValue[]
  byPromptLength: LabelValue[]
}

// ── Schema docs ────────────────────────────────────────────────────────────

const SCHEMA_FIELDS = [
  { field: 'id',                 type: 'uuid',           nullable: false, description: 'Primary key' },
  { field: 'tweet_id',           type: 'text',           nullable: false, description: 'Original post ID - enables deduplication and provenance tracing' },
  { field: 'tweet_text',         type: 'text',           nullable: false, description: 'Full text of the source post (unmodified)' },
  { field: 'author_handle',      type: 'text',           nullable: false, description: 'Platform username of the practitioner who shared the prompt' },
  { field: 'author_name',        type: 'text',           nullable: true,  description: 'Display name' },
  { field: 'tweet_url',          type: 'text',           nullable: false, description: 'Canonical URL - links to output media and original engagement context' },
  { field: 'media_urls',         type: 'text[]',         nullable: false, description: 'Output image/video URLs attached to the post' },
  { field: 'source',             type: 'enum',           nullable: false, description: 'Ingestion origin: twitter | reddit | manual' },
  { field: 'category',           type: 'enum',           nullable: false, description: 'Top-level bucket: prompts | tech_ai_product | career_productivity | uncategorized' },
  { field: 'prompt_category',    type: 'enum',           nullable: true,  description: 'Modality + technique: image_t2i, video_t2v, video_i2v, audio, etc.' },
  { field: 'extracted_prompt',   type: 'text',           nullable: true,  description: 'Clean prompt text extracted from post + comments - social framing stripped' },
  { field: 'detected_model',     type: 'text',           nullable: true,  description: 'AI model mentioned (free-text canonical slug, e.g. "Midjourney v6.1")' },
  { field: 'prompt_themes',      type: 'text[]',         nullable: true,  description: 'Visual themes: person, cinematic, landscape, scifi, fantasy, etc.' },
  { field: 'art_styles',         type: 'text[]',         nullable: true,  description: 'Art styles: photorealistic, anime, oil_painting, pixel_art, etc.' },
  { field: 'requires_reference', type: 'boolean',        nullable: true,  description: 'True if prompt requires a reference image as input' },
  { field: 'reference_type',     type: 'enum',           nullable: true,  description: 'face_person | style_artwork | subject_object | pose_structure | scene_background' },
  { field: 'is_thread',          type: 'boolean',        nullable: false, description: 'True if post is a multi-tweet thread' },
  { field: 'thread_tweets',      type: 'jsonb',          nullable: true,  description: 'Array of {tweet_id, tweet_text} for threaded posts' },
  { field: 'confidence',         type: 'float',          nullable: false, description: 'Classifier confidence score (0–1)' },
  { field: 'rationale',          type: 'text',           nullable: true,  description: 'LLM reasoning for the category assignment' },
  { field: 'user_notes',         type: 'text',           nullable: true,  description: 'Human curator notes' },
  { field: 'bookmarked_at',      type: 'timestamptz',    nullable: true,  description: 'When the post was originally bookmarked' },
  { field: 'created_at',         type: 'timestamptz',    nullable: false, description: 'Row insertion timestamp' },
  { field: 'updated_at',         type: 'timestamptz',    nullable: false, description: 'Last modification timestamp' },
]

const PROMPT_CATEGORIES = [
  { key: 'image_t2i',           label: 'Text → Image',      group: 'Image', color: '#ec4899' },
  { key: 'image_i2i',           label: 'Image → Image',     group: 'Image', color: '#d946ef' },
  { key: 'image_r2i',           label: 'Reference → Image', group: 'Image', color: '#f97316' },
  { key: 'image_character_ref', label: 'Character Ref',     group: 'Image', color: '#f43f5e' },
  { key: 'video_t2v',           label: 'Text → Video',      group: 'Video', color: '#8b5cf6' },
  { key: 'video_i2v',           label: 'Image → Video',     group: 'Video', color: '#6366f1' },
  { key: 'video_r2v',           label: 'Reference → Video', group: 'Video', color: '#a855f7' },
  { key: 'video_v2v',           label: 'Video → Video',     group: 'Video', color: '#3b82f6' },
]

const THEME_LABELS: Record<string, string> = {
  person: 'Person',
  cinematic: 'Cinematic',
  landscape: 'Landscape',
  architecture: 'Architecture',
  scifi: 'Sci-Fi',
  fantasy: 'Fantasy',
  abstract: 'Abstract',
  fashion: 'Fashion',
  product: 'Product',
  horror: 'Horror',
}

function getBenchmarks(total: number) {
  return [
    { name: 'DrawBench',       size: '200',    source: 'Synthetic (LLM)',      modality: 'Image only',     provenance: 'None',            curated: '2022',       engagement: '-' },
    { name: 'PartiPrompts',    size: '1,632',  source: 'Crowdworkers (Google)', modality: 'Image only',     provenance: 'None',            curated: '2022',       engagement: '-' },
    { name: 'T2I-CompBench',   size: '6,000',  source: 'Synthetic (GPT-4)',    modality: 'Image only',     provenance: 'None',            curated: '2023',       engagement: '-' },
    { name: 'GenAI-Bench',     size: '1,200',  source: 'LLM + human mix',      modality: 'Image + Video',  provenance: 'None',            curated: '2024',       engagement: '-' },
    { name: 'ummerr/prompts',  size: total ? `${total.toLocaleString()}+` : '-', source: 'Organic / in-the-wild', modality: 'Image + Video', provenance: 'Full (URL + author)', curated: 'Mar 2026', engagement: 'Yes (viral filter)' },
  ]
}

const RESEARCH_APPLICATIONS = [
  {
    title: 'In-the-wild prompt distribution',
    body: 'Study what the actual distribution of prompts looks like across modalities, models, and technique types - as opposed to the synthetic or curated distributions used in most benchmarks. Useful for calibrating evaluation sets to real practitioner behavior.',
    color: '#8b5cf6',
  },
  {
    title: 'Engagement as a quality signal',
    body: 'Each entry is sourced from high-engagement posts (high views, reposts, saves). This creates a weak but organic quality label: prompts that practitioners found compelling enough to share and reshare. Researchers can study whether engagement correlates with automated quality metrics.',
    color: '#1DA1F2',
  },
  {
    title: 'Multi-modal prompt structure analysis',
    body: 'The dataset covers image and video generation with structured technique labels. Most existing prompt datasets are image-only. This enables cross-modal comparison: how does a T2V prompt differ structurally from a T2I prompt for the same subject?',
    color: '#ec4899',
  },
  {
    title: 'Model-conditioned prompt analysis',
    body: 'Each entry includes a detected model field. Researchers can study how prompt style, length, technique invocation, and reference usage vary across models - Midjourney vs. FLUX vs. Kling vs. Sora - and how practitioner prompting strategies adapt to model capabilities.',
    color: '#f97316',
  },
  {
    title: 'Temporal adoption analysis',
    body: 'bookmarked_at and created_at timestamps enable temporal slicing. Study how the prompt distribution evolves as new models are released, how quickly practitioners adopt new techniques, and how model market share shifts over time in the practitioner community.',
    color: '#22c55e',
  },
  {
    title: 'Reference image usage patterns',
    body: 'The requires_reference and reference_type fields capture which prompts require a reference image as input, and what kind (face, style, subject, pose, background). Useful for studying how practitioners use image conditioning vs. text-only prompting across different task types.',
    color: '#14b8a6',
  },
]

// ── Mini components ────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={
        color
          ? { color, borderColor: `${color}40`, background: `${color}12` }
          : undefined
      }
    >
      {children}
    </span>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ color, background: `${color}18` }}
    >
      {children}
    </span>
  )
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="flex flex-col gap-5">
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-zinc-500">
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

function StatPill({ value, label, sub, color }: { value: string | number; label: string; sub?: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.03] px-5 py-4">
      <div className="font-mono text-2xl md:text-3xl font-bold tabular-nums tracking-tight" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs font-medium text-gray-700 dark:text-zinc-300">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 dark:text-zinc-600">{sub}</div>}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DatacardPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((d) => { if (d.total != null) setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Merge model variants into families (e.g. "Nano Banana Pro" + "Nano Banana 2" → "Nano Banana")
  const byModelAggregated = useMemo(() => {
    if (!stats?.byModel) return []
    const map = new Map<string, number>()
    for (const m of stats.byModel) {
      const family = modelToFamily(m.label)
      map.set(family, (map.get(family) ?? 0) + m.value)
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [stats])

  const modelCount = useMemo(() => byModelAggregated.length, [byModelAggregated])
  const techniqueCount = useMemo(() => stats?.byCategory?.length ?? 0, [stats])
  const topCategory = useMemo(() => stats?.byCategory?.[0] ?? null, [stats])
  const topModel = useMemo(() => byModelAggregated[0] ?? null, [byModelAggregated])
  const imageCount = useMemo(() =>
    stats?.byCategory?.filter((c) => c.label.startsWith('image_')).reduce((s, c) => s + c.value, 0) ?? 0
  , [stats])
  const videoCount = useMemo(() =>
    stats?.byCategory?.filter((c) => c.label.startsWith('video_')).reduce((s, c) => s + c.value, 0) ?? 0
  , [stats])
  const refPct = stats?.total ? Math.round((stats.withReference / stats.total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-12">

        {/* Hero ─────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge color="#1DA1F2">Dataset</Badge>
            <Badge color="#22c55e">CC BY 4.0</Badge>
            <Badge color="#a855f7">Multi-Modal</Badge>
            <Badge color="#f97316">In-the-Wild</Badge>
            <Badge color="#ec4899">Engagement-Filtered</Badge>
          </div>

          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">ummerr/prompts</h1>
            <p className="mt-3 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.7] max-w-2xl">
              A corpus of organic, in-the-wild generative AI prompts sourced from high-engagement
              posts on X/Twitter - covering image and video generation. Unlike synthetic
              benchmarks or crowdworker sets, every entry reflects a real practitioner decision:
              what to generate, how to phrase it, and which model to use. High engagement acts as an
              organic peer-review filter - these prompts were judged worth sharing by thousands of
              practitioners, not by a crowdworker rubric.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tag color="#ec4899">image-generation</Tag>
            <Tag color="#8b5cf6">video-generation</Tag>
            <Tag color="#22c55e">in-the-wild-prompts</Tag>
            <Tag color="#f97316">practitioner-behavior</Tag>
            <Tag color="#3b82f6">engagement-filtered</Tag>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-black/[0.06] dark:border-white/6 flex-wrap">
            {[
              { format: 'jsonl', label: 'JSONL' },
              { format: 'csv',   label: 'CSV' },
              { format: 'json',  label: 'JSON' },
            ].map(({ format, label }) => (
              <a
                key={format}
                href={`/api/prompts/download?format=${format}`}
                className="rounded-lg bg-black/[0.05] dark:bg-white/[0.05] px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-colors"
              >
                Download {label}
              </a>
            ))}
            <span className="text-[11px] text-gray-400 dark:text-zinc-600">CC BY 4.0 - cite as ummerr/prompts</span>
          </div>
        </div>

        {/* Research Context ─────────────────────────────────────────────── */}
        <Section title="Why This Dataset Exists">
          <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
            <p>
              Existing prompt evaluation benchmarks - DrawBench, PartiPrompts, T2I-CompBench - were
              designed for model evaluation, not for studying practitioner behavior. They are either
              synthetically generated or produced by crowdworkers following annotation rubrics.
              Neither reflects the prompt distribution that real practitioners actually use when they
              sit down to generate content.
            </p>
            <p>
              This dataset fills that gap. It captures the organic prompt distribution from people
              who actively use generative AI tools and share their results publicly. The selection
              mechanism - social engagement - is imperfect but meaningful: a prompt that accumulates
              high view and repost counts has passed a form of community judgment that no benchmark
              can replicate.
            </p>
          </div>

          {/* Comparison table */}
          <div className="rounded-xl border border-black/[0.08] dark:border-white/8 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/[0.08] dark:border-white/8 bg-black/[0.03] dark:bg-white/[0.03]">
                  {['Dataset', 'Size', 'Source', 'Modalities', 'Provenance', 'Curated', 'Engagement signal'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getBenchmarks(stats?.total ?? 0).map((b, i) => {
                  const isThis = b.name === 'ummerr/prompts'
                  return (
                    <tr
                      key={b.name}
                      className={`border-b border-black/[0.04] dark:border-white/4 last:border-0 ${
                        isThis
                          ? 'bg-violet-500/[0.06] dark:bg-violet-500/[0.08]'
                          : i % 2 !== 0 ? 'bg-black/[0.015] dark:bg-white/[0.015]' : ''
                      }`}
                    >
                      <td className={`px-4 py-2.5 font-mono text-[11px] whitespace-nowrap ${isThis ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-gray-800 dark:text-zinc-200'}`}>{b.name}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-zinc-400 tabular-nums">{b.size}</td>
                      <td className={`px-4 py-2.5 ${isThis ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-zinc-500'}`}>{b.source}</td>
                      <td className={`px-4 py-2.5 ${isThis ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-zinc-500'}`}>{b.modality}</td>
                      <td className={`px-4 py-2.5 ${isThis ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-zinc-500'}`}>{b.provenance}</td>
                      <td className={`px-4 py-2.5 font-mono text-[11px] ${isThis ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-400 dark:text-zinc-500'}`}>{b.curated}</td>
                      <td className={`px-4 py-2.5 ${isThis ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400 dark:text-zinc-600'}`}>{b.engagement}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Stats ────────────────────────────────────────────────────────── */}
        <Section title="Dataset Size">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0,1,2,3].map((i) => (
                <div key={i} className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.03] px-5 py-4 h-24 animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <StatPill value={stats.total} label="total prompts" sub="sourced from X/Twitter" color="#1DA1F2" />
                <StatPill value={imageCount} label="image prompts" color="#ec4899" />
                <StatPill value={videoCount} label="video prompts" color="#8b5cf6" />
                <StatPill value={`${refPct}%`} label="use references" sub={`${stats.withReference} prompts`} color="#f97316" />
                <StatPill value={modelCount} label="distinct models" color="#3b82f6" />
              </div>

              {/* Model distribution */}
              <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Model distribution</h3>
                <div className="flex flex-col gap-1.5">
                  {byModelAggregated.slice(0, 12).map((m) => {
                    const pct = stats!.total ? (m.value / stats!.total) * 100 : 0
                    const maxModelValue = byModelAggregated[0]?.value || 1
                    return (
                      <Link
                        key={m.label}
                        href={`/prompts?model=${encodeURIComponent(m.label)}`}
                        className="flex items-center gap-3 group"
                      >
                        <span className="text-xs text-gray-600 dark:text-zinc-300 w-28 truncate text-right shrink-0 font-medium group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{m.label}</span>
                        <div className="flex-1 h-5 bg-black/[0.03] dark:bg-white/[0.03] rounded overflow-hidden">
                          <div
                            className="h-full rounded bg-violet-500/20 border-l-2 border-violet-500 group-hover:bg-violet-500/30 transition-colors"
                            style={{ width: `${Math.max(3, (m.value / maxModelValue) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 w-16 text-right shrink-0">
                          {m.value} ({Math.round(pct)}%)
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Theme distribution */}
              {(stats.byTheme?.length ?? 0) > 0 && (
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Theme distribution</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.byTheme!.map((t) => (
                      <span
                        key={t.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/8 px-3 py-1 text-xs"
                      >
                        <span className="font-medium text-gray-700 dark:text-zinc-300">{THEME_LABELS[t.label] ?? t.label.replace(/_/g, ' ')}</span>
                        <span className="text-gray-400 dark:text-zinc-500 tabular-nums">{t.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Failed to load live stats.</p>
          )}
        </Section>

        {/* Research Applications ────────────────────────────────────────── */}
        <Section title="Research Applications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RESEARCH_APPLICATIONS.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border bg-white dark:bg-[#111] p-4 flex flex-col gap-2"
                style={{ borderColor: `${r.color}30` }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.color }} />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.title}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Task categories ──────────────────────────────────────────────── */}
        <Section title="Task Categories">
          <div className="flex flex-col gap-4">
            {['Image', 'Video'].map((group) => {
              const cats = PROMPT_CATEGORIES.filter((c) => c.group === group)
              const counts = stats?.byCategory ?? []
              const groupTotal = cats.reduce((s, c) => s + (counts.find((x) => x.label === c.key)?.value ?? 0), 0)
              return (
                <div key={group} className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                    {group}{groupTotal > 0 && <span className="ml-2 text-gray-300 dark:text-zinc-600">{groupTotal.toLocaleString()} total</span>}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cats.map((c) => {
                      const count = counts.find((x) => x.label === c.key)?.value
                      return (
                        <div
                          key={c.key}
                          className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                          style={{ color: c.color, borderColor: `${c.color}40`, background: `${c.color}10` }}
                        >
                          <span className="font-medium">{c.label}</span>
                          {count !== undefined && (
                            <span className="opacity-60 tabular-nums">{count}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* About ────────────────────────────────────────────────────────── */}
        <Section title="Curation & Collection">
          <div className="flex flex-col gap-3 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
            <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/6 p-4 flex flex-col gap-4">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Selection mechanism.</span>{' '}
                Posts are identified via X/Twitter search and bookmark capture from practitioner accounts actively sharing AI generation work.
                Selection is biased toward high-engagement content - posts with substantial view counts, reposts, and saves. This is not a random
                sample; it is a practitioner-judged quality filter. Prompts that circulated widely did so because other practitioners found them
                useful, reproducible, or instructive.
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Extraction & labeling.</span>{' '}
                Each entry is classified by Claude Sonnet 4.6 using structured tool-use output with strict enum validation. The classifier assigns
                modality + technique category, detects the target model from post text, extracts the clean prompt (stripping social framing and
                hashtags), and tags visual themes and art styles. Confidence scores are stored alongside all labels; the original post text is
                always preserved for reclassification.
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Coverage.</span>{' '}
                Image generation (text-to-image, image-to-image, character references, reference-guided generation) and
                video generation (text-to-video, image-to-video, reference-to-video, video-to-video).
                No LLM / text-generation prompts - this is a generative media dataset.
              </div>
            </div>
          </div>
        </Section>

        {/* Highlights ───────────────────────────────────────────────────── */}
        {stats && (topCategory || topModel) && (
          <Section title="Highlights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topCategory && (
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1">
                  <span className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">Most common technique</span>
                  <span className="text-lg font-bold text-pink-500">
                    {PROMPT_CATEGORIES.find((c) => c.key === topCategory.label)?.label ?? topCategory.label.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">{topCategory.value.toLocaleString()} prompts ({stats.total ? Math.round((topCategory.value / stats.total) * 100) : 0}%)</span>
                </div>
              )}
              {topModel && (
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1">
                  <span className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">Most referenced model</span>
                  <span className="text-lg font-bold text-violet-500">{topModel.label}</span>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">{topModel.value.toLocaleString()} prompts ({stats.total ? Math.round((topModel.value / stats.total) * 100) : 0}%)</span>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Limitations ──────────────────────────────────────────────────── */}
        <Section title="Limitations">
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Selection and survivorship bias',
                body: 'Prompts are drawn exclusively from posts that practitioners chose to share publicly. This systematically over-represents prompts that produced visually impressive or socially shareable results, and under-represents failed attempts, iterative drafts, and everyday utility prompts.',
                mitigation: 'This bias is also the dataset\'s signal: understanding the distribution of prompts that practitioners consider share-worthy is itself a research question. Sourcing across both Twitter/X and Reddit partially offsets pure aesthetics bias - Reddit communities reward technical depth and reproducibility.',
                color: '#f97316',
              },
              {
                title: 'Platform and demographic skew',
                body: 'Source content is dominated by English-language posts from Twitter/X and a small set of Reddit communities. Non-English prompts, closed communities, Discord servers, and professional workflows are not represented. The dataset likely reflects the aesthetics and interests of a specific online subculture rather than the broader global practitioner population.',
                mitigation: 'Ingestion spans multiple subreddits with different community cultures (r/midjourney, r/StableDiffusion, r/FluxAI, r/kling_ai), broadening the range of styles, use cases, and practitioner skill levels captured.',
                color: '#f97316',
              },
              {
                title: 'LLM-assisted classification errors',
                body: 'Category labels, theme tags, art style tags, model attribution, and extracted prompt text are assigned by Claude Sonnet 4.6 - not human annotators. Errors cluster around ambiguous multi-technique prompts, unfamiliar or emerging tools, non-English content, and prompts where the model name is absent from the post text.',
                mitigation: 'The classifier uses structured tool-use output with strict enum validation, reducing free-form hallucination. Confidence scores are stored alongside labels. The raw source text is always preserved, so reclassification is non-destructive.',
                color: '#eab308',
              },
              {
                title: 'Engagement ≠ controlled quality validation',
                body: 'The dataset records what practitioners shared, not whether the prompt reliably produces good results across seeds, model versions, or hardware configurations. High engagement reflects community judgment, not empirical reproducibility.',
                mitigation: 'Source post URLs and media_urls are retained for every entry, allowing researchers to inspect original post context, attached output media, and community reception. Engagement is best treated as a weak positive label, not a ground-truth quality rating.',
                color: '#eab308',
              },
              {
                title: 'Temporal and model coverage skew',
                body: 'Ingestion began in 2024 and runs on a rolling basis. Older models (pre-2023) are under-represented; newly released models may lag until ingestion catches up. Coverage of any given model reflects its social media footprint, not its market share or capability.',
                mitigation: 'bookmarked_at and created_at timestamps are preserved for every entry, making temporal filtering straightforward. Model attribution is stored as free-text alongside a normalised canonical slug, so analyses can distinguish between model generations.',
                color: '#eab308',
              },
              {
                title: 'Near-duplicate prompts',
                body: 'Deduplication is exact-match only on the source post ID. Reposts, quote-tweets, and community re-shares of the same underlying prompt may appear as distinct entries. Downstream fine-tuning or similarity studies should apply semantic deduplication.',
                mitigation: 'Each entry retains its author_handle and tweet_url, making provenance traceable. Semantic deduplication can be applied against the extracted_prompt field, which strips social framing and hashtags to surface the underlying prompt text.',
                color: '#71717a',
              },
            ].map((l) => (
              <div
                key={l.title}
                className="rounded-xl border bg-white dark:bg-[#111] p-4 flex flex-col gap-3"
                style={{ borderColor: `${l.color}30` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: l.color }}>Limitation</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{l.title}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{l.body}</p>
                <div className="flex gap-2 pt-1 border-t border-black/[0.05] dark:border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 shrink-0 mt-0.5">Mitigation</span>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{l.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Sources ──────────────────────────────────────────────────────── */}
        <Section title="Data Sources">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                name: 'Twitter / X',
                icon: '✦',
                iconColor: '#1DA1F2',
                desc: 'Primary source. Bookmarked posts from practitioners sharing AI generation workflows. Filtered for high engagement - views, reposts, and saves. Includes media outputs, threads, and referenced works.',
                badge: 'Primary',
                badgeColor: '#1DA1F2',
              },
              {
                name: 'Reddit',
                icon: '◉',
                iconColor: '#ff4500',
                desc: 'r/midjourney, r/StableDiffusion, r/FluxAI, r/kling_ai, r/PromptEngineering. Reddit sourcing broadens demographic coverage - communities reward technical reproducibility alongside visual impact.',
                badge: 'Secondary',
                badgeColor: '#ff4500',
              },
              {
                name: 'Manual',
                icon: '◈',
                iconColor: '#22c55e',
                desc: 'Hand-entered prompts from tutorials, blog posts, or community shares not covered by automated ingestion.',
                badge: 'Supplementary',
                badgeColor: '#22c55e',
              },
            ].map((s) => (
              <div
                key={s.name}
                className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: s.iconColor }}>{s.icon}</span>
                    <span className="font-semibold text-sm">{s.name}</span>
                  </div>
                  <Badge color={s.badgeColor}>{s.badge}</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Schema ───────────────────────────────────────────────────────── */}
        <Section title="Schema">
          <div className="rounded-xl border border-black/[0.08] dark:border-white/8 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/[0.08] dark:border-white/8 bg-black/[0.03] dark:bg-white/[0.03]">
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400">Field</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400 hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400 hidden md:table-cell">Nullable</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400">Description</th>
                </tr>
              </thead>
              <tbody>
                {SCHEMA_FIELDS.map((f, i) => (
                  <tr
                    key={f.field}
                    className={`border-b border-black/[0.04] dark:border-white/4 last:border-0 ${
                      i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-[11px] text-gray-800 dark:text-zinc-200 whitespace-nowrap">{f.field}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-violet-500 dark:text-violet-400 whitespace-nowrap hidden sm:table-cell">{f.type}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      {f.nullable ? (
                        <span className="text-gray-400 dark:text-zinc-600">yes</span>
                      ) : (
                        <span className="text-emerald-500">no</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-zinc-400 leading-relaxed">{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* License ──────────────────────────────────────────────────────── */}
        <Section title="License & Citation">
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5 flex flex-col gap-3 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">License:</span>
                <Badge color="#22c55e">Creative Commons Attribution 4.0 (CC BY 4.0)</Badge>
              </div>
              <p>
                Free to use, share, and adapt for any purpose - including commercial - with appropriate credit.
                The original prompt texts remain the intellectual property of their authors; this dataset provides
                structured metadata for research purposes.
              </p>
            </div>

            {/* BibTeX */}
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-black/[0.06] dark:border-white/6 bg-black/[0.03] dark:bg-white/[0.03]">
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">BibTeX</span>
              </div>
              <pre className="px-4 py-4 text-[11px] font-mono text-gray-700 dark:text-zinc-300 leading-relaxed overflow-x-auto">{`@dataset{ummerr_prompts_2025,
  title        = {ummerr/prompts: An In-the-Wild Generative AI Prompt Dataset},
  author       = {ummerr},
  year         = {2025},
  url          = {https://prompts.ummerr.com/datacard},
  note         = {Organic prompts sourced from high-engagement posts on X/Twitter.
                  Covers image and video generation with structured
                  metadata, model attribution, and technique labels.},
  license      = {CC BY 4.0}
}`}</pre>
            </div>
          </div>
        </Section>

      </div>
    </div>
  )
}
