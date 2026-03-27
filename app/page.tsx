'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Benchmark data (condensed from datacard) ────────────────────────────────

function getBenchmarks(liveTotal: number) {
  return [
    { name: 'DrawBench',      size: '200',   source: 'Synthetic (LLM)',        modality: 'Image only',    engagement: '—' },
    { name: 'PartiPrompts',   size: '1,632', source: 'Crowdworkers (Google)',  modality: 'Image only',    engagement: '—' },
    { name: 'ummerr/prompts', size: liveTotal ? `${liveTotal.toLocaleString()}+` : '—', source: 'Organic / in-the-wild', modality: 'Image + Video', engagement: 'Yes (viral filter)', highlight: true },
  ]
}

// ── Animated counter ────────────────────────────────────────────────────────

function AnimatedCount({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 1200
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

// ── Image vs Video breakdown bar ────────────────────────────────────────────

interface MediaBreakdown { label: string; count: number; pct: number; color: string }

function computeMediaBreakdown(byCategory: { label: string; value: number }[]): MediaBreakdown[] {
  // Only count image_* and video_* categories — the actual dataset scope
  const image = byCategory
    .filter((c) => c.label.startsWith('image_'))
    .reduce((s, c) => s + c.value, 0)
  const video = byCategory
    .filter((c) => c.label.startsWith('video_'))
    .reduce((s, c) => s + c.value, 0)
  const total = image + video
  if (total === 0) return []

  return [
    { label: 'Video', count: video, pct: Math.round((video / total) * 100), color: '#8b5cf6' },
    { label: 'Image', count: image, pct: Math.round((image / total) * 100), color: '#ec4899' },
  ].filter((g) => g.count > 0)
}

// Compute technique breakdown from category labels
interface TechniqueBreakdown { label: string; count: number; color: string }

const TECHNIQUE_LABELS: Record<string, { label: string; color: string }> = {
  image_t2i:           { label: 'Text to Image',      color: '#ec4899' },
  image_i2i:           { label: 'Image to Image',     color: '#d946ef' },
  image_r2i:           { label: 'Reference to Image', color: '#f97316' },
  image_character_ref: { label: 'Character Ref',      color: '#f43f5e' },
  image_person:        { label: 'Person / Portrait',  color: '#3b82f6' },
  image_advertisement: { label: 'Ad / Product',       color: '#f59e0b' },
  image_collage:       { label: 'Collage / Grid',     color: '#a855f7' },
  image_inpainting:    { label: 'Inpainting',         color: '#ef4444' },
  video_t2v:           { label: 'Text to Video',      color: '#8b5cf6' },
  video_i2v:           { label: 'Image to Video',     color: '#6366f1' },
  video_r2v:           { label: 'Reference to Video', color: '#a855f7' },
  video_v2v:           { label: 'Video to Video',     color: '#3b82f6' },
}

function computeTechniques(byCategory: { label: string; value: number }[]): TechniqueBreakdown[] {
  return byCategory
    .filter((c) => c.label in TECHNIQUE_LABELS)
    .map((c) => ({
      label: TECHNIQUE_LABELS[c.label].label,
      count: c.value,
      color: TECHNIQUE_LABELS[c.label].color,
    }))
    .sort((a, b) => b.count - a.count)
}

function MediaBar({ breakdown }: { breakdown: MediaBreakdown[] }) {
  if (breakdown.length === 0) return null
  return (
    <div className="space-y-3">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
        {breakdown.map((t) => (
          <div
            key={t.label}
            className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
            style={{ width: `${t.pct}%`, backgroundColor: t.color }}
          />
        ))}
      </div>
      <div className="flex gap-6">
        {breakdown.map((t) => (
          <div key={t.label} className="flex items-center gap-2 text-sm">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="font-medium text-gray-700 dark:text-zinc-200">{t.label}</span>
            <span className="text-gray-400 dark:text-zinc-500">{t.pct}% ({t.count.toLocaleString()})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Featured prompt card ────────────────────────────────────────────────────

interface FeaturedPrompt {
  extracted_prompt: string
  detected_model: string
  prompt_category: string
  tweet_url: string
  author_handle: string
}

function FeaturedPromptCard({ prompt }: { prompt: FeaturedPrompt }) {
  const [copied, setCopied] = useState(false)

  const categoryLabel = prompt.prompt_category
    ? TECHNIQUE_LABELS[prompt.prompt_category]?.label ?? prompt.prompt_category.replace(/_/g, ' ')
    : null

  return (
    <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-zinc-500">
          Random prompt
        </span>
        <div className="flex items-center gap-2">
          {prompt.detected_model && (
            <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
              {prompt.detected_model}
            </span>
          )}
          {categoryLabel && (
            <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-medium text-pink-600 dark:text-pink-400">
              {categoryLabel}
            </span>
          )}
        </div>
      </div>
      <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-gray-800 dark:text-zinc-200 max-h-48 overflow-y-auto mb-5">
        {prompt.extracted_prompt}
      </pre>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            navigator.clipboard.writeText(prompt.extracted_prompt)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="rounded-lg bg-black/5 dark:bg-white/5 px-3.5 py-1.5 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>
        <a
          href={prompt.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
        >
          @{prompt.author_handle} &rarr;
        </a>
      </div>
    </div>
  )
}

// ── Top models bar chart ────────────────────────────────────────────────────

interface ModelCount { label: string; value: number }

function TopModelsChart({ models }: { models: ModelCount[] }) {
  const top = models.slice(0, 8)
  if (top.length === 0) return null
  const max = top[0].value

  return (
    <div className="flex flex-col gap-2">
      {top.map((m) => (
        <div key={m.label} className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 w-32 truncate text-right shrink-0">{m.label}</span>
          <div className="flex-1 h-6 bg-black/[0.03] dark:bg-white/[0.03] rounded-md overflow-hidden">
            <div
              className="h-full rounded-md bg-violet-500/20 dark:bg-violet-400/20 border-l-[3px] border-violet-500 dark:border-violet-400 transition-all duration-700"
              style={{ width: `${Math.max(4, (m.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 w-8 shrink-0">{m.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Stats type ──────────────────────────────────────────────────────────────

interface Stats {
  total: number
  models: number
  withReference: number
  imageCount: number
  videoCount: number
  loaded: boolean
}

// ── Main landing page ───────────────────────────────────────────────────────

export default function LandingPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0, models: 0, withReference: 0, imageCount: 0, videoCount: 0, loaded: false,
  })
  const [featured, setFeatured] = useState<FeaturedPrompt | null>(null)
  const [mediaBreakdown, setMediaBreakdown] = useState<MediaBreakdown[]>([])
  const [techniques, setTechniques] = useState<TechniqueBreakdown[]>([])
  const [topModels, setTopModels] = useState<ModelCount[]>([])

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.total) {
          const uniqueModels = data.byModel?.length ?? 0
          const breakdown = data.byCategory ? computeMediaBreakdown(data.byCategory) : []
          const imageCount = breakdown.find((b) => b.label === 'Image')?.count ?? 0
          const videoCount = breakdown.find((b) => b.label === 'Video')?.count ?? 0
          setStats({
            total: data.total,
            models: uniqueModels,
            withReference: data.withReference ?? 0,
            imageCount,
            videoCount,
            loaded: true,
          })
          setMediaBreakdown(breakdown)
          if (data.byCategory) setTechniques(computeTechniques(data.byCategory))
          if (data.byModel) setTopModels(data.byModel)
        }
      })
      .catch(() => {})

    fetch('/api/prompts/random')
      .then((r) => r.json())
      .then((data) => {
        if (data.extracted_prompt) setFeatured(data)
      })
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[720px] rounded-full bg-gradient-to-br from-violet-400/20 via-pink-300/10 to-transparent blur-3xl dark:from-violet-600/10 dark:via-pink-500/5" />

        <div className="relative max-w-4xl mx-auto px-5 pt-24 pb-16 md:pt-32 md:pb-20 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            The most shared<br className="hidden md:block" /> AI prompts on X
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-zinc-400 leading-relaxed">
            A curated dataset of image and video generation prompts sourced from viral posts on X.
            Every entry is a real prompt that real practitioners shared — and thousands of people copied.
          </p>
          <p className="mt-3 text-sm text-gray-400 dark:text-zinc-500">
            Hand-labelled by model, technique, theme, and reference type. Zero synthetic prompts.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/prompts"
              className="rounded-xl bg-gray-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              Browse prompts
            </Link>
            <Link
              href="/state-of-prompting"
              className="rounded-xl border border-black/[0.12] dark:border-white/[0.12] px-6 py-3 text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
            >
              State of Prompting 2026
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: stats.total, suffix: '+', label: 'Prompts', show: true },
            { value: stats.models, suffix: '', label: 'AI models', show: true },
            { value: stats.withReference, suffix: '', label: 'Use references', show: true },
            { value: 0, suffix: '%', label: 'Synthetic', show: true, static: true },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] px-5 py-6 text-center"
            >
              <div className="font-serif text-3xl md:text-4xl font-medium text-gray-900 dark:text-white">
                {s.static ? (
                  `${s.value}${s.suffix}`
                ) : !stats.loaded ? (
                  '—'
                ) : (
                  <AnimatedCount target={s.value} suffix={s.suffix} />
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Image vs Video ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
          Image vs. Video
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 max-w-2xl">
          The split between image generation and video generation prompts in the dataset.
        </p>
        <MediaBar breakdown={mediaBreakdown} />
      </section>

      {/* ── Techniques ────────────────────────────────────────────────── */}
      {techniques.length > 0 && (
        <section className="max-w-4xl mx-auto px-5 pb-20">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
            Techniques
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 mb-8 max-w-2xl">
            How prompts break down by generation technique — text-to-image, image-to-video, character references, and more.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {techniques.map((t) => (
              <div
                key={t.label}
                className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-4"
              >
                <div className="text-lg font-semibold text-gray-900 dark:text-white font-mono">{t.count}</div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">{t.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Top models ────────────────────────────────────────────────── */}
      {topModels.length > 0 && (
        <section className="max-w-4xl mx-auto px-5 pb-20">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
            Most-used models
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 mb-8 max-w-2xl">
            Which AI models appear most often in viral prompts.
          </p>
          <TopModelsChart models={topModels} />
        </section>
      )}

      {/* ── Featured prompt ───────────────────────────────────────────── */}
      {featured && (
        <section className="max-w-4xl mx-auto px-5 pb-20">
          <FeaturedPromptCard prompt={featured} />
        </section>
      )}

      {/* ── Benchmark comparison ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
          How this compares
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 max-w-2xl">
          Most prompt benchmarks use synthetic or crowdsourced prompts with no engagement signal.
          This dataset captures what real practitioners actually share.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-left">
                <th className="px-5 py-3 font-medium text-gray-500 dark:text-zinc-400">Dataset</th>
                <th className="px-5 py-3 font-medium text-gray-500 dark:text-zinc-400">Size</th>
                <th className="px-5 py-3 font-medium text-gray-500 dark:text-zinc-400">Source</th>
                <th className="px-5 py-3 font-medium text-gray-500 dark:text-zinc-400">Modality</th>
                <th className="px-5 py-3 font-medium text-gray-500 dark:text-zinc-400">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {getBenchmarks(stats.total).map((b) => (
                <tr
                  key={b.name}
                  className={`border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 ${
                    b.highlight
                      ? 'bg-violet-500/[0.04] dark:bg-violet-400/[0.04]'
                      : ''
                  }`}
                >
                  <td className={`px-5 py-3 ${b.highlight ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-300'}`}>
                    {b.name}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-zinc-300 font-mono text-xs">{b.size}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-zinc-300">{b.source}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-zinc-300">{b.modality}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-zinc-300">{b.engagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link
            href="/datacard"
            className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          >
            Full dataset documentation &rarr;
          </Link>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pb-24">
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-8 md:p-12 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
            Start exploring
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 mb-6 max-w-lg mx-auto">
            Filter by model, technique, or theme. Copy what works. See what the community is actually making.
          </p>
          <Link
            href="/prompts"
            className="inline-block rounded-xl bg-gray-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
          >
            Browse prompts &rarr;
          </Link>
        </div>
      </section>
    </main>
  )
}
