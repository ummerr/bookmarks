'use client'

import { useState, useEffect, useMemo } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

interface StatsData {
  total: number
  withReference: number
  withTheme: number
  byCategory: { label: string; value: number }[]
  byModel: { label: string; value: number }[]
  byTheme: { label: string; value: number }[]
}

// ── Schema docs ────────────────────────────────────────────────────────────

const SCHEMA_FIELDS = [
  { field: 'id',                 type: 'uuid',           nullable: false, description: 'Primary key' },
  { field: 'tweet_id',           type: 'text',           nullable: false, description: 'Original post ID from source platform' },
  { field: 'tweet_text',         type: 'text',           nullable: false, description: 'Full text of the source post' },
  { field: 'author_handle',      type: 'text',           nullable: false, description: 'Platform username / subreddit handle' },
  { field: 'author_name',        type: 'text',           nullable: true,  description: 'Display name or r/subreddit identifier' },
  { field: 'tweet_url',          type: 'text',           nullable: false, description: 'Canonical URL of the original post' },
  { field: 'media_urls',         type: 'text[]',         nullable: false, description: 'Output image/video URLs attached to the post' },
  { field: 'source',             type: 'enum',           nullable: false, description: 'Ingestion origin: twitter | reddit | manual' },
  { field: 'category',           type: 'enum',           nullable: false, description: 'Top-level bucket: prompts | tech_ai_product | career_productivity | uncategorized' },
  { field: 'prompt_category',    type: 'enum',           nullable: true,  description: 'Prompt technique: image_t2i, video_t2v, audio, coding, etc. (17 values)' },
  { field: 'extracted_prompt',   type: 'text',           nullable: true,  description: 'The clean prompt text extracted from post + comments' },
  { field: 'detected_model',     type: 'text',           nullable: true,  description: 'AI model/tool mentioned (free-text, e.g. "Midjourney v6")' },
  { field: 'prompt_themes',      type: 'text[]',         nullable: true,  description: 'Visual themes: person, cinematic, landscape, scifi, fantasy, etc.' },
  { field: 'art_styles',         type: 'text[]',         nullable: true,  description: 'Art styles: photorealistic, anime, oil_painting, pixel_art, etc.' },
  { field: 'requires_reference', type: 'boolean',        nullable: true,  description: 'Whether the prompt requires a reference image as input' },
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
  { key: 'image_inpainting',    label: 'Inpainting',        group: 'Image', color: '#ef4444' },
  { key: 'video_t2v',           label: 'Text → Video',      group: 'Video', color: '#8b5cf6' },
  { key: 'video_i2v',           label: 'Image → Video',     group: 'Video', color: '#6366f1' },
  { key: 'video_r2v',           label: 'Reference → Video', group: 'Video', color: '#a855f7' },
  { key: 'video_v2v',           label: 'Video → Video',     group: 'Video', color: '#3b82f6' },
  { key: 'audio',               label: 'Audio',             group: 'Other', color: '#06b6d4' },
  { key: 'threed',              label: '3D',                group: 'Other', color: '#14b8a6' },
  { key: 'system_prompt',       label: 'System Prompt',     group: 'Text',  color: '#0ea5e9' },
  { key: 'writing',             label: 'Writing',           group: 'Text',  color: '#22c55e' },
  { key: 'coding',              label: 'Coding',            group: 'Text',  color: '#eab308' },
  { key: 'analysis',            label: 'Analysis',          group: 'Text',  color: '#f59e0b' },
  { key: 'other',               label: 'Other',             group: 'Other', color: '#71717a' },
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight border-b border-black/[0.06] dark:border-white/6 pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function StatPill({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.03] px-5 py-4">
      <div className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-gray-500 dark:text-zinc-400">{label}</div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DatacardPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const modelCount = useMemo(() => {
    if (!stats) return 0
    return stats.byModel.length
  }, [stats])

  const topCategory = useMemo(() => {
    if (!stats || stats.byCategory.length === 0) return null
    return stats.byCategory[0]
  }, [stats])

  const topModel = useMemo(() => {
    if (!stats || stats.byModel.length === 0) return null
    return stats.byModel[0]
  }, [stats])

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-10">

        {/* Hero */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6 md:p-8 flex flex-col gap-5">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge color="#1DA1F2">Dataset</Badge>
            <Badge color="#22c55e">CC BY 4.0</Badge>
            <Badge color="#a855f7">Multimodal</Badge>
            <Badge color="#f97316">AI Prompts</Badge>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ummerr/ai-prompts</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
              A hand-curated dataset of real-world AI generation prompts collected from practitioners sharing their work on Twitter/X and Reddit.
              Covers image, video, audio, 3D, and text generation techniques — with structured metadata, model attribution, and visual theme tagging.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tag color="#ec4899">image-generation</Tag>
            <Tag color="#8b5cf6">video-generation</Tag>
            <Tag color="#06b6d4">text-to-image</Tag>
            <Tag color="#22c55e">prompt-engineering</Tag>
            <Tag color="#f97316">midjourney</Tag>
            <Tag color="#a855f7">stable-diffusion</Tag>
            <Tag color="#3b82f6">flux</Tag>
          </div>
        </div>

        {/* Live stats */}
        <Section title="Dataset Size">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0,1,2,3].map((i) => (
                <div key={i} className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.03] px-5 py-4 h-20 animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatPill value={stats.total} label="total prompts" color="#1DA1F2" />
              <StatPill value={modelCount} label="AI models tracked" color="#a855f7" />
              <StatPill value={stats.withTheme} label="theme-tagged prompts" color="#22c55e" />
              <StatPill value={stats.withReference} label="need reference image" color="#f97316" />
            </div>
          ) : (
            <p className="text-sm text-gray-400">Failed to load live stats.</p>
          )}
        </Section>

        {/* About */}
        <Section title="About the Dataset">
          <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/6 p-4 flex flex-col gap-3">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Curation.</span>{' '}
                Prompts are sourced from public posts by AI practitioners — people actively using these tools and sharing their process.
                Each entry is classified by an LLM (Claude claude-sonnet-4-6) and reviewed for quality before inclusion.
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Scope.</span>{' '}
                The dataset covers the full spectrum of generative AI: image generation (text-to-image, img2img, inpainting, character references),
                video generation (text-to-video, image-to-video, video-to-video), audio, 3D, and LLM use cases (system prompts, writing, coding).
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Metadata.</span>{' '}
                Beyond the raw prompt text, each row includes detected model/tool, visual theme tags, art style tags, whether a reference image
                is needed, and the type of reference — making it useful for fine-grained retrieval and analysis.
              </div>
            </div>
          </div>
        </Section>

        {/* Limitations */}
        <Section title="Limitations">
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Selection and survivorship bias',
                body: 'Prompts are drawn exclusively from posts that practitioners chose to share publicly. This systematically over-represents prompts that produced visually impressive or socially shareable results, and under-represents failed attempts, iterative drafts, and everyday utility prompts.',
                mitigation: 'Sourcing across both Twitter/X and Reddit partially offsets this — Reddit communities reward technical depth and reproducibility alongside aesthetics, introducing prompts that were shared for instructional value rather than purely visual impact.',
                color: '#f97316',
              },
              {
                title: 'Platform and demographic skew',
                body: 'Source content is dominated by English-language posts from Twitter/X and a small set of Reddit communities. Non-English prompts, closed communities, Discord servers, and professional workflows are not represented. The dataset likely reflects the aesthetics and interests of a specific online subculture rather than the broader global practitioner population.',
                mitigation: 'Ingestion spans multiple subreddits with different community cultures (r/midjourney, r/StableDiffusion, r/PromptEngineering, r/AIArt), broadening the range of styles, use cases, and practitioner skill levels captured.',
                color: '#f97316',
              },
              {
                title: 'LLM-assisted classification errors',
                body: 'Category labels (prompt_category), theme tags, art style tags, model attribution, and extracted prompt text are assigned by Claude Sonnet 4.6 — not human annotators. Classification accuracy is high but not perfect. Errors cluster around: ambiguous multi-technique prompts, unfamiliar or emerging tools, non-English content, and prompts where the model name is absent from the post text.',
                mitigation: 'The classifier uses structured tool-use output with strict enum validation, reducing free-form hallucination. Confidence scores are stored alongside labels, allowing downstream users to filter to high-confidence subsets. The raw source text is always preserved, so reclassification is non-destructive.',
                color: '#eab308',
              },
              {
                title: 'No output quality validation',
                body: 'The dataset records what practitioners shared, not whether the prompt reliably produces good results. A prompt with many upvotes or retweets is not equivalent to a prompt that has been reproducibly validated across seeds, model versions, or hardware configurations.',
                mitigation: 'Source post URLs are retained for every entry, allowing researchers to inspect the original post context, view attached media outputs, and assess community reception. The media_urls field links directly to the output images or videos shared alongside the prompt.',
                color: '#eab308',
              },
              {
                title: 'Temporal and model coverage skew',
                body: 'Ingestion began in 2024 and runs on a rolling basis. Older models (pre-2023) are under-represented; newly released models may be under-represented until ingestion catches up. Coverage of any given model reflects its social media footprint, not its market share or quality.',
                mitigation: 'The bookmarked_at and created_at timestamps are preserved for every entry, making temporal filtering straightforward. Model attribution is stored as free-text alongside a normalised canonical slug, so analyses can distinguish between model generations.',
                color: '#eab308',
              },
              {
                title: 'Near-duplicate prompts',
                body: 'Deduplication is exact-match only on the source post ID. Reposts, quote-tweets, and community re-shares of the same underlying prompt may appear as distinct entries. Downstream users performing similarity search or fine-tuning should apply their own deduplication.',
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
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: l.color }}>Limitation</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{l.title}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{l.body}</p>
                <div className="flex gap-2 pt-1 border-t border-black/[0.05] dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 shrink-0 mt-0.5">Mitigation</span>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{l.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Sources */}
        <Section title="Data Sources">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                name: 'Twitter / X',
                icon: '✦',
                iconColor: '#1DA1F2',
                desc: 'Bookmarked posts from accounts sharing AI generation workflows. Includes media outputs, threads, and referenced works.',
                badge: 'Primary',
                badgeColor: '#1DA1F2',
              },
              {
                name: 'Reddit',
                icon: '◉',
                iconColor: '#ff4500',
                desc: 'Posts from subreddits such as r/midjourney, r/StableDiffusion, r/FluxAI, and r/kling_ai with extracted prompts from post bodies and comments.',
                badge: 'Secondary',
                badgeColor: '#ff4500',
              },
              {
                name: 'Manual',
                icon: '◈',
                iconColor: '#22c55e',
                desc: 'Hand-entered prompts from other sources — blog posts, tutorials, or community shares not covered by automated ingestion.',
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

        {/* Task categories */}
        <Section title="Task Categories">
          <div className="flex flex-col gap-4">
            {['Image', 'Video', 'Text', 'Other'].map((group) => {
              const cats = PROMPT_CATEGORIES.filter((c) => c.group === group)
              const counts = stats?.byCategory ?? []
              return (
                <div key={group} className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">{group}</h3>
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

        {/* Schema */}
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

        {/* Highlights from live data */}
        {stats && (topCategory || topModel) && (
          <Section title="Highlights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topCategory && (
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1">
                  <span className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">Most common technique</span>
                  <span className="text-lg font-bold text-pink-500">{topCategory.label}</span>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">{topCategory.value.toLocaleString()} prompts</span>
                </div>
              )}
              {topModel && (
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1">
                  <span className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">Most referenced model</span>
                  <span className="text-lg font-bold text-violet-500">{topModel.label}</span>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">{topModel.value.toLocaleString()} prompts</span>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* License */}
        <Section title="License & Attribution">
          <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5 flex flex-col gap-3 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">License: </span>
              <Badge color="#22c55e">Creative Commons Attribution 4.0 (CC BY 4.0)</Badge>
            </div>
            <p>
              You are free to use, share, and adapt this dataset for any purpose — including commercial — as long as you give appropriate credit.
              The original prompt texts remain the intellectual property of their authors; this dataset provides structured metadata for research purposes.
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-600">
              Suggested citation: ummerr. (2025). AI Prompts Dataset. Retrieved from the ummerr bookmarks app.
            </p>
          </div>
        </Section>

      </div>
    </div>
  )
}
