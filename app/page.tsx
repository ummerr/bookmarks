'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { modelToFamily } from '@/components/prompts/constants'

// ── Related datasets (context table) ─────────────────────────────────────────

function getBenchmarks(liveTotal: number) {
  return [
    { name: 'DrawBench',       size: '200',    source: 'Synthetic (LLM)',        modality: 'Image',         engagement: 'None',        curated: '2022' },
    { name: 'PartiPrompts',    size: '1,632',  source: 'Crowdworkers (Google)',  modality: 'Image',         engagement: 'None',        curated: '2022' },
    { name: 'T2I-CompBench',   size: '6,000',  source: 'Synthetic (GPT-4)',      modality: 'Image',         engagement: 'None',        curated: '2023' },
    { name: 'GenAI-Bench',     size: '1,200',  source: 'LLM + human mix',        modality: 'Image + Video', engagement: 'None',        curated: '2024' },
    { name: 'EvalCrafter',     size: '700',    source: 'LLM + real users',       modality: 'Video',         engagement: 'None',        curated: '2024' },
    { name: 'VBench',          size: '1,600',  source: 'Manual per dimension',   modality: 'Video',         engagement: 'None',        curated: '2024' },
    { name: 'T2VEval-Bench',   size: '1,783',  source: 'LLM + manual',           modality: 'Video',         engagement: 'Lab MOS',     curated: '2025' },
    { name: 'ummerr/prompts',  size: liveTotal ? `${liveTotal.toLocaleString()}+` : '-', source: 'Organic / in-the-wild', modality: 'Image + Video', engagement: 'Viral filter', curated: 'Mar 2026', highlight: true },
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
  // Only count image_* and video_* categories - the actual dataset scope
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

function FeaturedPromptCard() {
  const [prompt, setPrompt] = useState<FeaturedPrompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  function fetchRandom() {
    setLoading(true)
    fetch('/api/prompts/random')
      .then((r) => r.json())
      .then((data) => { if (data.extracted_prompt) setPrompt(data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRandom() }, [])

  const categoryLabel = prompt?.prompt_category
    ? TECHNIQUE_LABELS[prompt.prompt_category]?.label ?? prompt.prompt_category.replace(/_/g, ' ')
    : null

  return (
    <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-zinc-500">
          Random prompt
        </span>
        <div className="flex items-center gap-2">
          {prompt?.detected_model && (
            <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
              {prompt.detected_model}
            </span>
          )}
          {categoryLabel && (
            <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-medium text-pink-600 dark:text-pink-400">
              {categoryLabel}
            </span>
          )}
          <button
            onClick={fetchRandom}
            disabled={loading}
            className="rounded-full p-1.5 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors disabled:opacity-40"
            title="Shuffle"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      {prompt ? (
        <>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-[1.7] text-gray-800 dark:text-zinc-200 max-h-48 overflow-y-auto mb-5">
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
        </>
      ) : (
        <div className="h-24 flex items-center justify-center">
          <svg className="h-4 w-4 animate-spin text-gray-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}
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
  const [mediaBreakdown, setMediaBreakdown] = useState<MediaBreakdown[]>([])
  const [techniques, setTechniques] = useState<TechniqueBreakdown[]>([])
  const [topModels, setTopModels] = useState<ModelCount[]>([])
  const [cameraInsight, setCameraInsight] = useState<{ model: string; pct: number; total: number }[]>([])
  const [avgPromptLength, setAvgPromptLength] = useState<{ model: string; avgLength: number }[]>([])

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((data) => {
        const breakdown = data.byCategory ? computeMediaBreakdown(data.byCategory) : []
        const imageCount = breakdown.find((b) => b.label === 'Image')?.count ?? 0
        const videoCount = breakdown.find((b) => b.label === 'Video')?.count ?? 0
        setStats({
          total: data.total ?? 0,
          models: 0, // will be overwritten after aggregation below
          withReference: data.withReference ?? 0,
          imageCount,
          videoCount,
          loaded: true,
        })
        setMediaBreakdown(breakdown)
        if (data.byCategory) setTechniques(computeTechniques(data.byCategory))
        if (data.byModel) {
          const map = new Map<string, number>()
          for (const m of data.byModel as { label: string; value: number }[]) {
            const family = modelToFamily(m.label)
            map.set(family, (map.get(family) ?? 0) + m.value)
          }
          const aggregated = Array.from(map.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
          setTopModels(aggregated)
          setStats((s) => ({ ...s, models: aggregated.length }))
        }
      })
      .catch(() => {
        setStats((s) => ({ ...s, loaded: true }))
      })

    fetch('/api/stats/insight')
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((data) => {
        if (data.cameraMotion?.length) setCameraInsight(data.cameraMotion.slice(0, 5))
        if (data.promptLength?.length) setAvgPromptLength(data.promptLength.slice(0, 5))
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
            How people actually prompt<br className="hidden md:block" /> generative AI
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-zinc-400 leading-relaxed">
            {stats.loaded && stats.total > 0 ? `${stats.total.toLocaleString()}+` : '1,000+'} real
            prompts from viral posts on X — classified by model, technique, theme, and reference type.
            Every entry traces back to a practitioner who shipped something worth sharing.
          </p>
          <p className="mt-3 text-base text-gray-400 dark:text-zinc-500">
            A prompt observatory. Zero synthetic data. Zero crowdworkers. Just the organic distribution of how people talk to image and video models.
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
              <div className="font-mono text-3xl md:text-4xl font-bold tabular-nums text-gray-900 dark:text-white">
                {s.static ? (
                  `${s.value}${s.suffix}`
                ) : !stats.loaded ? (
                  '-'
                ) : (
                  <AnimatedCount target={s.value} suffix={s.suffix} />
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Insight callout ─────────────────────────────────────────── */}
      {stats.loaded && stats.total > 0 && (
        <section className="max-w-4xl mx-auto px-5 pb-20">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
            From the data
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 mb-8 max-w-2xl">
            Live queries against the dataset.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Camera motion comparison across video models */}
            {cameraInsight.length >= 2 && (
              <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-6 md:p-8">
                <span className="text-[10px] font-mono font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">
                  Camera direction in video prompts
                </span>
                <div className="mt-4 flex flex-col gap-2">
                  {cameraInsight.map((m) => (
                    <div key={m.model} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 w-28 truncate text-right shrink-0">{m.model}</span>
                      <div className="flex-1 h-5 bg-black/[0.03] dark:bg-white/[0.03] rounded-md overflow-hidden">
                        <div
                          className="h-full rounded-md bg-violet-500/20 dark:bg-violet-400/20 border-l-[3px] border-violet-500 dark:border-violet-400 transition-all duration-700"
                          style={{ width: `${Math.max(4, m.pct)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-500 dark:text-zinc-400 w-10 shrink-0">{m.pct}%</span>
                      <span className="text-[10px] font-mono text-gray-300 dark:text-zinc-600 w-12 shrink-0">n={m.total}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
                  Share of video prompts that specify camera movement (pan, dolly, tracking, etc.) by model.
                </p>
                <Link href="/insights" className="mt-2 inline-block text-xs text-violet-500 dark:text-violet-400 hover:underline">
                  More in Insights &rarr;
                </Link>
              </div>
            )}
            {/* Reference usage + prompt length */}
            <div className="flex flex-col gap-4">
              {stats.withReference > 0 && (
                <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {Math.round((stats.withReference / stats.total) * 100)}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-zinc-400">use reference images</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
                    Pure text prompting is the minority workflow. Most practitioners now upload a face, a style frame, or a composition sketch alongside their prompt.
                  </p>
                </div>
              )}
              {avgPromptLength.length >= 2 && (() => {
                const longest = avgPromptLength[0]
                const shortest = avgPromptLength[avgPromptLength.length - 1]
                return (
                  <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-6">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {longest.avgLength}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-zinc-400">chars avg</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
                      {longest.model} video prompts average {longest.avgLength} characters — {Math.round(longest.avgLength / shortest.avgLength)}x longer than {shortest.model} ({shortest.avgLength} chars).
                    </p>
                  </div>
                )
              })()}
            </div>
          </div>
        </section>
      )}

      {/* ── Methodology ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
          How it&apos;s built
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 max-w-2xl">
          No crowdworkers. No GPT-generated prompts. Every entry traces back to a real post by a real practitioner.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Collect',
              desc: 'Viral image and video generation posts are sourced from X. Only posts with high engagement pass the filter — likes, reposts, and replies act as a quality signal.',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              ),
            },
            {
              step: '02',
              title: 'Extract',
              desc: 'Claude strips social framing ("check out this image I made!") to isolate the raw generation prompt. The model, technique, and reference type are detected automatically.',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              ),
            },
            {
              step: '03',
              title: 'Label',
              desc: 'Each prompt is classified across 5 dimensions: category, visual theme, art style, reference requirements, and model family. Every label links back to its source post.',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              ),
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  {s.icon}
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{s.step}</span>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{s.title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-right">
          <Link
            href="/methodology"
            className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          >
            Full methodology &rarr;
          </Link>
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
            How prompts break down by generation technique - text-to-image, image-to-video, character references, and more.
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
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <FeaturedPromptCard />
      </section>

      {/* ── Related datasets ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-3">
          Related prompt datasets
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 max-w-2xl">
          Several prompt datasets exist for evaluating generative AI models.
          This collection serves a different purpose — documenting organic practitioner behavior rather than providing evaluation prompts.
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
                <th className="px-5 py-3 font-medium text-gray-500 dark:text-zinc-400">Curated</th>
              </tr>
            </thead>
            <tbody>
              {getBenchmarks(stats.total).map((b) => (
                <tr
                  key={b.name}
                  className={`border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 ${
                    b.highlight
                      ? 'bg-violet-500/[0.03] dark:bg-violet-400/[0.03]'
                      : ''
                  }`}
                >
                  <td className={`px-5 py-3 whitespace-nowrap ${b.highlight ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-300'}`}>
                    {b.name}{b.highlight && <span className="ml-1.5 text-[10px] text-violet-500 dark:text-violet-400 font-normal">(this dataset)</span>}
                  </td>
                  <td className={`px-5 py-3 font-mono text-xs ${b.highlight ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-300'}`}>{b.size}</td>
                  <td className={`px-5 py-3 whitespace-nowrap ${b.highlight ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-300'}`}>
                    {b.source}
                  </td>
                  <td className={`px-5 py-3 whitespace-nowrap ${b.highlight ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-300'}`}>{b.modality}</td>
                  <td className={`px-5 py-3 whitespace-nowrap ${b.highlight ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-500'}`}>{b.engagement}</td>
                  <td className={`px-5 py-3 font-mono text-xs whitespace-nowrap ${b.highlight ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-500'}`}>{b.curated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link
            href="/dataset"
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
