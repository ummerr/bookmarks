'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface LabelValue { label: string; value: number }
interface MonthModel { month: string; model: string; value: number }
interface StatsData {
  total: number
  withReference: number
  byCategory: LabelValue[]
  byModel: LabelValue[]
  byTheme?: LabelValue[]
  byPromptLength: LabelValue[]
  modelTimeline?: MonthModel[]
}

interface PromptExample {
  id: string
  extracted_prompt: string | null
  detected_model: string | null
  prompt_category: string | null
  author_handle: string
  tweet_url: string
  requires_reference: boolean | null
  reference_type: string | null
  is_multi_shot: boolean
  prompt_themes: string[]
  art_styles: string[]
}

const CATEGORY_LABELS: Record<string, string> = {
  image_t2i: 'Text → Image',
  image_i2i: 'Image → Image',
  image_r2i: 'Ref → Image',
  image_character_ref: 'Character Ref',
  image_person: 'Person',
  image_advertisement: 'Ad / Product',
  image_collage: 'Collage',
  video_t2v: 'Text → Video',
  video_i2v: 'Image → Video',
  video_r2v: 'Ref → Video',
  video_v2v: 'Video → Video',
}

const NAV_SECTIONS = [
  { id: 'april-dispatches',   label: 'April Dispatches' },
  { id: 'findings',            label: 'Key Findings' },
  { id: 'references',         label: 'The Reference Shift' },
  { id: 'prompt-engineering', label: 'Context Engineering' },
  { id: 'practitioners',      label: 'Takeaways' },
  { id: 'video',              label: 'Video Prompting' },
  { id: 'seedance',           label: 'Seedance Takeover' },
  { id: 'multishot',          label: 'Multi-Shot' },
  { id: 'multimodal',         label: 'Multimodal' },
  { id: 'from-the-data',      label: 'From the Dataset' },
  { id: 'realness-gap',       label: 'The Realness Gap' },
  { id: 'sora',               label: 'Why Sora Shut Down' },
  { id: 'sources',            label: 'Sources' },
]

function SectionNav({ activeId }: { activeId: string }) {
  return (
    <nav className="flex flex-col gap-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2 px-2">
        On this page
      </p>
      {NAV_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className={`text-xs px-2 py-1 rounded-md transition-colors leading-snug ${
            activeId === s.id
              ? 'text-gray-900 dark:text-white bg-black/[0.06] dark:bg-white/[0.08] font-medium'
              : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
          }`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={color ? { color, borderColor: `${color}40`, background: `${color}12` } : undefined}
    >
      {children}
    </span>
  )
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div className="flex flex-col gap-6 scroll-mt-20" id={id}>
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
        <h2 className="font-serif text-xl md:text-2xl text-gray-900 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

function Insight({ quote, source, sourceUrl, color = '#1DA1F2' }: { quote: string; source: string; sourceUrl?: string; color?: string }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-[#111] p-6" style={{ borderColor: `${color}30` }}>
      <p className="font-serif text-base md:text-[17px] italic text-gray-800 dark:text-zinc-100 leading-[1.6]">"{quote}"</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-zinc-500">
        {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-zinc-300 hover:underline">{source}</a> : source}
      </p>
    </div>
  )
}

function FindingCard({ number, title, body, color, sources }: {
  number: string; title: string; body: string; color: string; sources?: { label: string; url: string }[]
}) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5 md:p-6 flex gap-5">
      <div className="font-mono text-lg font-bold tabular-nums shrink-0 leading-none mt-0.5" style={{ color }}>{number}</div>
      <div className="flex flex-col gap-2">
        <div className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug">{title}</div>
        <div className="text-[15px] text-gray-500 dark:text-zinc-400 leading-[1.75]">{body}</div>
        {sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {sources.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors">
                {s.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RealPrompt({ prompt, label, onShuffle, loading }: {
  prompt: PromptExample | null
  label?: string
  onShuffle?: () => void
  loading?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  if (!prompt && !loading) return null

  const text = prompt?.extracted_prompt ?? ''
  const isLong = text.length > 280
  const displayText = expanded || !isLong ? text : text.slice(0, 280) + '…'

  return (
    <div className="rounded-xl border-l-[3px] border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#111] overflow-hidden" style={{ borderLeftColor: '#8b5cf680' }}>
      {label && (
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500/70">{label}</span>
          {onShuffle && (
            <button
              onClick={onShuffle}
              disabled={loading}
              className="text-[11px] text-gray-400 dark:text-zinc-500 hover:text-violet-500 transition-colors disabled:opacity-50"
            >
              {loading ? '…' : '↻ shuffle'}
            </button>
          )}
        </div>
      )}
      {loading && !prompt ? (
        <div className="px-4 py-4"><div className="h-16 bg-black/[0.03] dark:bg-white/[0.03] rounded animate-pulse" /></div>
      ) : (
        <>
          <pre className="px-4 py-3 text-[12px] font-mono text-gray-700 dark:text-zinc-200 leading-[1.7] whitespace-pre-wrap">{displayText}</pre>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="px-4 pb-1 text-[11px] text-violet-500 hover:underline">
              {expanded ? 'Show less' : 'Show full prompt'}
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-black/[0.04] dark:border-white/[0.04] bg-black/[0.015] dark:bg-white/[0.015] flex-wrap">
            {prompt?.detected_model && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">{prompt.detected_model}</span>
            )}
            {prompt?.prompt_category && (
              <span className="text-[11px] text-gray-400 dark:text-zinc-500">{CATEGORY_LABELS[prompt.prompt_category] ?? prompt.prompt_category}</span>
            )}
            {prompt?.requires_reference && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">reference</span>
            )}
            {prompt?.is_multi_shot && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">multi-shot</span>
            )}
            <span className="text-[11px] text-gray-300 dark:text-zinc-600 tabular-nums">{text.length} chars</span>
            <a
              href={prompt?.tweet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[11px] text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
            >
              @{prompt?.author_handle} ↗
            </a>
          </div>
        </>
      )}
    </div>
  )
}

export default function StateOfPromptingPage() {
  const [activeId, setActiveId] = useState('')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [prompts, setPrompts] = useState<Record<string, PromptExample | null>>({})
  const [promptLoading, setPromptLoading] = useState<Record<string, boolean>>({})

  const fetchPrompt = (key: string, params: string) => {
    setPromptLoading((p) => ({ ...p, [key]: true }))
    fetch(`/api/prompts/random?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.extracted_prompt) setPrompts((p) => ({ ...p, [key]: d })) })
      .catch(() => {})
      .finally(() => setPromptLoading((p) => ({ ...p, [key]: false })))
  }

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((d) => { if (d.total != null) setStats(d) })
      .catch(() => {})

    // Fetch real prompt examples for each section
    fetchPrompt('reference', 'group=image')
    fetchPrompt('video', 'group=video')
    fetchPrompt('multishot', 'multi_shot=true')
    fetchPrompt('seedance', 'model=Seedance')
    fetchPrompt('featured1', 'category=image_t2i')
    fetchPrompt('featured2', 'group=video')
    fetchPrompt('featured3', 'category=image_r2i')
  }, [])

  const imageCount = useMemo(() =>
    stats?.byCategory?.filter((c) => c.label.startsWith('image_')).reduce((s, c) => s + c.value, 0) ?? 0
  , [stats])
  const videoCount = useMemo(() =>
    stats?.byCategory?.filter((c) => c.label.startsWith('video_')).reduce((s, c) => s + c.value, 0) ?? 0
  , [stats])
  const refPct = stats?.total ? Math.round((stats.withReference / stats.total) * 100) : 0
  const topModels = useMemo(() => stats?.byModel?.slice(0, 5) ?? [], [stats])
  const topThemes = useMemo(() => stats?.byTheme?.slice(0, 5) ?? [], [stats])
  const longPromptPct = useMemo(() => {
    if (!stats?.byPromptLength?.length) return 0
    const total = stats.byPromptLength.reduce((s, d) => s + d.value, 0)
    const long = stats.byPromptLength.filter((d) => d.label === 'long' || d.label === 'very_long').reduce((s, d) => s + d.value, 0)
    return total ? Math.round((long / total) * 100) : 0
  }, [stats])

  // Monthly model share (consumed by the "Model share by month" block)
  const monthlyModelShare = useMemo(() => {
    const rows = stats?.modelTimeline ?? []
    if (!rows.length) return null

    const byMonth = new Map<string, { total: number; models: Map<string, number> }>()
    for (const r of rows) {
      const bucket = byMonth.get(r.month) ?? { total: 0, models: new Map<string, number>() }
      bucket.models.set(r.model, (bucket.models.get(r.model) ?? 0) + r.value)
      bucket.total += r.value
      byMonth.set(r.month, bucket)
    }

    const months = [...byMonth.keys()].sort().slice(-5)
    if (!months.length) return null

    const modelTotals = new Map<string, number>()
    for (const m of months) {
      for (const [model, count] of byMonth.get(m)!.models) {
        modelTotals.set(model, (modelTotals.get(model) ?? 0) + count)
      }
    }
    const topModels = [...modelTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([model]) => model)

    const series = topModels.map((model) => ({
      model,
      total: modelTotals.get(model) ?? 0,
      months: months.map((m) => {
        const b = byMonth.get(m)!
        const count = b.models.get(model) ?? 0
        return { month: m, count, pct: b.total ? (count / b.total) * 100 : 0 }
      }),
    }))

    const seedance = series.find((s) => s.model.toLowerCase() === 'seedance')
    const seedanceArc = seedance ? seedance.months.map((c) => ({ month: c.month, pct: c.pct })) : null
    const seedanceMoM = seedanceArc && seedanceArc.length >= 2
      ? seedanceArc[seedanceArc.length - 1].pct - seedanceArc[seedanceArc.length - 2].pct
      : null

    return { months, series, seedanceArc, seedanceMoM }
  }, [stats])

  // Realness gap analysis: classify themes by how forgiving they are
  const FORGIVING_THEMES = ['abstract', 'fantasy', 'scifi', 'horror']
  const DEMANDING_THEMES = ['person', 'landscape', 'architecture', 'product']
  const NEUTRAL_THEMES = ['cinematic', 'fashion']

  const realnessData = useMemo(() => {
    if (!stats?.byTheme?.length) return null
    const themeMap = Object.fromEntries(stats.byTheme.map((t) => [t.label, t.value]))
    const forgiving = FORGIVING_THEMES.reduce((s, t) => s + (themeMap[t] ?? 0), 0)
    const demanding = DEMANDING_THEMES.reduce((s, t) => s + (themeMap[t] ?? 0), 0)
    const neutral = NEUTRAL_THEMES.reduce((s, t) => s + (themeMap[t] ?? 0), 0)
    const total = forgiving + demanding + neutral
    if (!total) return null
    return {
      forgiving,
      demanding,
      neutral,
      total,
      forgivingPct: Math.round((forgiving / total) * 100),
      demandingPct: Math.round((demanding / total) * 100),
      neutralPct: Math.round((neutral / total) * 100),
      themes: stats.byTheme,
    }
  }, [stats])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
        { rootMargin: '-15% 0px -70% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Hero */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6 md:p-8 flex flex-col gap-5 mb-10">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge color="#10b981">Q2 2026</Badge>
            <Badge color="#8b5cf6">Video & Image AI</Badge>
            <Badge color="#f97316">Prompting Research</Badge>
          </div>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 dark:text-white tracking-tight">Seedance ate the feed</h1>
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400 dark:text-zinc-500">State of Prompting · Apr 2026</p>
            <p className="mt-3 text-[15px] text-gray-500 dark:text-zinc-400 leading-[1.7] max-w-2xl">
              Seedance landed in Runway, CapCut, and Flova inside a single April week. Sora went dark on April 26. Veo 4 arrived with 4K and storyboarding. Here&rsquo;s what changed for practitioners - and what the data says about where prompting is headed.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-3 border-t border-black/[0.06] dark:border-white/6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">Data source</span>
              <Link href="/dataset" className="text-xs font-medium text-gray-600 dark:text-zinc-300 hover:underline">
                prompts.ummerr.com/dataset
              </Link>
              <span className="text-[10px] text-gray-300 dark:text-zinc-600">|</span>
              <Link href="/methodology" className="text-xs text-gray-400 dark:text-zinc-500 hover:underline">
                Methodology
              </Link>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-relaxed">
              All prompt analysis and statistics in this report are drawn from the <Link href="/dataset" className="text-violet-600 dark:text-violet-400 hover:underline">ummerr/prompts dataset</Link> — a classified collection of real-world generative AI prompts.
              Industry data from public research and product announcements. Arena rankings from <a href="https://artificialanalysis.ai" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">Artificial Analysis</a> (Apr 2026).
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-10 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">

            <Section title="April Dispatches" id="april-dispatches">
              <p className="text-[14px] text-gray-500 dark:text-zinc-400 leading-relaxed -mt-2">
                Four things changed the landscape this month. Everything below is downstream.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FindingCard
                  number="01"
                  color="#10b981"
                  title="Seedance 2.0 lands on Runway (Apr 12)"
                  body={"Runway added Seedance 2.0 with an Unlimited plan ($76–95/mo). Combined with CapCut's 100-country rollout and the Flova integration (Apr 5), it put Seedance inside the tools creators already had open. Distribution, not model quality, became the decisive variable."}
                  sources={[
                    { label: 'Runway · Seedance help', url: 'https://help.runwayml.com/hc/en-us/articles/50488490233363-Creating-with-Seedance-2-0' },
                    { label: 'No Film School', url: 'https://nofilmschool.com/runway-seedance-2-0' },
                    { label: 'MindStudio', url: 'https://www.mindstudio.ai/blog/seedance-2-runway-unlimited-plan-review' },
                  ]}
                />
                <FindingCard
                  number="02"
                  color="#ef4444"
                  title="Sora went dark (Apr 26)"
                  body={"OpenAI's Sora consumer app and ChatGPT video generation went offline on April 26. The API follows September 24. The only non-Google model in the T2V top 5 for most of 2026 - and the first major consumer video model to get fully deprecated. See the full post-mortem below."}
                  sources={[
                    { label: 'OpenAI · Sora discontinuation', url: 'https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation' },
                    { label: '/state-of-prompting/sora', url: '/state-of-prompting/sora' },
                  ]}
                />
                <FindingCard
                  number="03"
                  color="#1DA1F2"
                  title="Veo 4 launched"
                  body={"Google's Veo 4 shipped in April - 4K, 30-second clips, storyboarding, and zero-shot avatar creation with dramatically improved character consistency. Not yet in the Arena rankings, but the ceiling on T2V just moved again. Veo 3.1 currently dominates the leaderboard; watch the next cycle."}
                  sources={[
                    { label: 'Veo 4 release notes', url: 'https://www.veo3ai.io/blog/veo-4-release-everything-you-need-to-know-2026' },
                  ]}
                />
                <FindingCard
                  number="04"
                  color="#f59e0b"
                  title="Hollywood vs Seedance"
                  body={"A viral two-line-prompt clip of \"Tom Cruise\" fighting \"Brad Pitt\" hit 1.2M+ views on X. The MPA sent ByteDance a cease-and-desist; Netflix, Warner, Disney, Paramount, and Sony followed individually. The legal cloud is the price of going viral - creators did not slow down."}
                  sources={[
                    { label: 'Variety · MPA response', url: 'https://variety.com/2026/film/news/motion-picture-association-ai-seedance-bytedance-tom-cruise-1236661753/' },
                    { label: 'Hollywood Reporter · cease-and-desist', url: 'https://www.hollywoodreporter.com/business/business-news/mpa-cease-and-desist-bytedance-seedance-2-0-1236510957/' },
                  ]}
                />
              </div>
            </Section>

            <Section title="Key Findings" id="findings">
              <div className="flex flex-col gap-3">
                <FindingCard
                  number="01"
                  color="#ec4899"
                  title="References replaced descriptions"
                  body="Midjourney added --sref and --cref. Runway, Kling, and Veo made image-to-video a core feature. A photo of a face contains more information than any sentence describing one - so creators stopped writing and started uploading."
                  sources={[
                    { label: 'State of AI Video Creation 2026 - Vivideo', url: 'https://vivideo.ai/blog/state-of-ai-video-creation-2026' },
                  ]}
                />
                <FindingCard
                  number="02"
                  color="#8b5cf6"
                  title="Prompt engineering as a discipline is over"
                  body="'Prompt Engineer' ranked second-to-last in new AI roles companies plan to hire. Andrej Karpathy named the successor: context engineering - what information the AI sees matters more than how you phrase the request."
                  sources={[
                    { label: 'Prompt Engineering Is Dead - IEEE Spectrum', url: 'https://spectrum.ieee.org/prompt-engineering-is-dead' },
                    { label: 'Prompt Engineering Jobs Are Obsolete - Salesforce Ben', url: 'https://www.salesforceben.com/prompt-engineering-jobs-are-obsolete-in-2025-heres-why/' },
                  ]}
                />
                <FindingCard
                  number="03"
                  color="#a855f7"
                  title="No single model wins everywhere"
                  body="Veo 3.1 sweeps T2V. Grok leads I2V and Video Edit. Gemini leads T2I. Switching models for different task types produces bigger gains than rewriting the same prompt."
                  sources={[
                    { label: 'Artificial Analysis Arena', url: 'https://artificialanalysis.ai/text-to-video/arena' },
                  ]}
                />
                <FindingCard
                  number="04"
                  color="#f59e0b"
                  title="The best video prompts describe forces, not aesthetics"
                  body="'Gimbal tracking shot, rear suspension compressing on impact' beats 'cinematic car scene' every time. The prompts that work describe physics: camera movement, forces on objects, cause and effect."
                  sources={[
                    { label: 'How to Actually Control Next-Gen Video AI - Medium', url: 'https://medium.com/@creativeaininja/how-to-actually-control-next-gen-video-ai-runway-kling-veo-and-sora-prompting-strategies-92ef0055658b' },
                  ]}
                />
                <FindingCard
                  number="05"
                  color="#10b981"
                  title="Distribution beat model quality in April"
                  body={"Seedance did not top the T2V arena - Veo 3.1 still holds the top four slots. Seedance won April by appearing inside Runway, CapCut, and Flova in the same week. The model creators reach for is the one their tool already supports."}
                  sources={[
                    { label: 'Runway · Seedance', url: 'https://runwayml.com/product/seedance' },
                    { label: 'ByteDance 100-country rollout', url: 'https://the-decoder.com/bytedance-rolls-out-seedance-2-0-to-100-countries-but-keeps-the-us-off-the-list/' },
                  ]}
                />
              </div>
            </Section>

            <Section title="The Shift to References" id="references">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <p>
                  In 2023, the dominant idea was simple: write a better prompt, get a better output. By 2025, that had quietly collapsed - not through debate, but through tooling.
                </p>
                <p>
                  Midjourney introduced <code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">--sref</code> (style reference) and <code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">--cref</code> (character reference). Runway, Kling, and Veo made image-to-video a core feature. Creators stopped describing their characters and started uploading character sheets. Style boards replaced style adjectives.
                </p>
                <p>
                  The reason is obvious once you see it: <span className="font-medium text-gray-900 dark:text-white">a photo of a face contains more information than any sentence describing one.</span> Text descriptions lose detail. Reference images don't.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { label: 'Character reference', desc: 'Consistent faces and identity across every shot - no description needed', color: '#ec4899' },
                    { label: 'Style reference', desc: 'Lock the visual look to an image instead of trying to describe it in words', color: '#8b5cf6' },
                    { label: 'Pose reference', desc: 'Control body position and composition using a skeleton or layout image', color: '#f97316' },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: r.color }}>{r.label}</span>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
                <RealPrompt
                  prompt={prompts.reference}
                  loading={promptLoading.reference}
                  label="A real prompt from the dataset"
                  onShuffle={() => fetchPrompt('reference', 'group=image')}
                />
              </div>
            </Section>

            <Section title="From Prompt Engineering to Context Engineering" id="prompt-engineering">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <Insight
                  quote="The primitive era of prompt engineering - characterized by trial-and-error iteration and artisanal prompt crafting - died somewhere between late 2024 and early 2025."
                  source="Death of Prompt Engineering: AI Orchestration in 2026 - BigBlue Academy"
                  sourceUrl="https://bigblue.academy/en/the-death-of-prompt-engineering-and-its-ruthless-resurrection-navigating-ai-orchestration-in-2026-and-beyond"
                  color="#f97316"
                />
                <p>
                  <a href="https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">Andrej Karpathy named the successor</a> in mid-2025: <span className="font-medium text-gray-900 dark:text-white">context engineering</span> - what information the AI sees matters more than how you phrase the request. For image and video generation, context means the full brief: reference images, audio clips, previous frames, and text. The skill is knowing what to include and what to leave out.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      label: 'One reference per role',
                      desc: "Don't stack five style references hoping the model blends them. Pick one. Competing references produce averaged, muddied results.",
                      color: '#ec4899',
                    },
                    {
                      label: 'Keep the brief scene-specific',
                      desc: "Only include what's relevant to this frame. Don't carry forward every reference from your last five shots.",
                      color: '#f97316',
                    },
                    {
                      label: 'Known vs. unknown',
                      desc: "Models already know cinematic language, lighting, and art movements. Supply what they don't know: your character, your palette, your style.",
                      color: '#8b5cf6',
                    },
                    {
                      label: 'Maintain a style card',
                      desc: 'For multi-scene work, keep a consistent core brief - character, palette, look - rather than re-explaining each time.',
                      color: '#14b8a6',
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: item.color }}>{item.label}</span>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="What to Actually Do About It" id="practitioners">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Start with a reference, add text second',
                    body: 'Upload a face, a style frame, or a composition sketch. Then write directorial notes on top. This inverts the 2023 workflow - and it\'s what the best practitioners in the dataset already do.',
                    color: '#f97316',
                    icon: '📂',
                  },
                  {
                    title: 'Switch models before rewriting the prompt',
                    body: 'Veo leads T2V. Grok leads I2V. Gemini leads T2I. No model wins everywhere. Run the same prompt through two tools before spending time on iteration - the model gap is larger than the prompt gap.',
                    color: '#8b5cf6',
                    icon: '🔬',
                  },
                  {
                    title: 'Describe forces, not aesthetics',
                    body: '"Gimbal tracking shot, rear suspension compressing on impact" gives the model physics to simulate. "Cinematic and dramatic" gives it nothing. The best video prompts in the dataset read like shot lists, not poetry.',
                    color: '#f59e0b',
                    icon: '🎥',
                  },
                  {
                    title: 'Include audio from the start',
                    body: 'Veo 3.1, Kling 3.0, and Grok now generate audio in the same pass as video. If you don\'t describe sound in the brief, it becomes an afterthought. Describe dialogue, ambient noise, and effects alongside the visual.',
                    color: '#a855f7',
                    icon: '🔊',
                  },
                  {
                    title: 'Explore the dataset',
                    body: 'Everything in this report is grounded in real prompts from real practitioners. Browse them, shuffle them, see what actually goes viral - then adapt.',
                    color: '#14b8a6',
                    icon: '✦',
                    href: '/prompts',
                  },
                ].map((item) => {
                  const card = (
                    <div
                      key={item.title}
                      className={`rounded-xl border bg-white dark:bg-[#111] p-5 flex flex-col gap-2 ${'href' in item ? 'hover:border-violet-300 dark:hover:border-violet-700 transition-colors' : ''}`}
                      style={{ borderColor: `${item.color}30` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg" style={{ color: item.color }}>{item.icon}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{item.body}</p>
                    </div>
                  )
                  return 'href' in item ? <Link key={item.title} href={(item as { href: string }).href}>{card}</Link> : card
                })}
              </div>
            </Section>

            <Section title="How Video Prompting Works Now" id="video">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <p>
                  Video prompting is a different skill from image prompting. Each of the major tools has a distinct personality - a prompt that works on one can fail on another.
                </p>
                <Insight
                  quote="Modern prompting requires stopping description of what things look like and instead describing the forces acting on them."
                  source="How to Actually Control Next-Gen Video AI - Medium"
                  sourceUrl="https://medium.com/@creativeaininja/how-to-actually-control-next-gen-video-ai-runway-kling-veo-and-sora-prompting-strategies-92ef0055658b"
                  color="#8b5cf6"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      model: 'Veo 3.1',
                      personality: 'T2V Arena #1',
                      desc: "Google's Veo 3.1 dominates the T2V arena - holding the top 5 spots in various configurations. Native audio generation, 1080p output, and deep integration with Google infrastructure. Works best with structured, ingredient-list prompts and reference images.",
                      strategy: 'Lead with subject and shot type. Upload reference images instead of describing them. Use labelled sections for dialogue and sound effects. Provide a start frame and end frame and it fills in the motion.',
                      color: '#1DA1F2',
                      sourceUrl: 'https://aimlapi.com/blog/google-veo-3-1',
                    },
                    {
                      model: 'Seedance 2.0',
                      personality: 'Reference Prompting King',
                      desc: "ByteDance's breakout model and arguably the most hyped release of Q1 2026. Excels at reference-based generation - feed it character sheets, style boards, or scene photos and it maintains extraordinary fidelity across clips. Native lip-sync, audio generation, and timestamp syntax. The model that made \"upload first, prompt second\" the default workflow for video creators.",
                      strategy: 'Lead with reference images - character sheets, style frames, environment photos. Use [Xs]: timestamp syntax for multi-cut sequences. Describe motion and forces rather than aesthetics. Let the references carry the visual identity.',
                      sourceUrl: 'https://seed.bytedance.com/en/seedance2_0',
                      color: '#10b981',
                    },
                    {
                      model: 'Grok Imagine Video',
                      personality: 'I2V Arena #1',
                      desc: "Built on Aurora's autoregressive architecture. #1 on the I2V arena (ELO 1,404) and #1 on Video Edit (ELO 1,259). Generates up to 15 seconds in ~17 seconds. Supports video extension and iterative chat editing - refine with natural language rather than rewriting.",
                      strategy: 'Use comma-separated ingredient prompts rather than prose. Feed a reference image to anchor style and subject. Use iterative chat refinement rather than rewriting from scratch.',
                      color: '#9333ea',
                      sourceUrl: 'https://artificialanalysis.ai/text-to-video/arena',
                    },
                    {
                      model: 'Kling',
                      personality: 'Multi-Shot Pioneer',
                      desc: 'The model that pioneered storyboard-mode prompting - up to 6 distinct camera cuts from a single prompt. KlingAI holds #2 and #3 on the Video Edit arena (O3 Pro at 1,248, O1 Pro at 1,208). Native lip-sync, speaker attribution, and the most granular shot-by-shot control of any current model.',
                      strategy: 'Use Custom Storyboard mode for full control. Structure each shot as: Scene → Characters → Action → Camera → Audio. Label dialogue per speaker. Give it as many reference files as you have.',
                      color: '#ec4899',
                      sourceUrl: 'https://cybernews.com/ai-tools/kling-ai-review/',
                    },
                    {
                      model: 'Gemini Image',
                      personality: 'T2I & Edit Arena #1',
                      desc: "Google's Gemini models dominate both the T2I arena (#1 at 1,265) and Image Edit (#2–#4). The Flash variant leads T2I; the Pro variant leads editing. Native multimodal understanding means it handles text-in-image and complex compositions better than dedicated image models.",
                      strategy: 'Be explicit about text placement, composition, and style. For edits, describe what to change conversationally - it understands context from the source image.',
                      color: '#f97316',
                      sourceUrl: 'https://artificialanalysis.ai/text-to-image/arena',
                    },
                    {
                      model: '🪦 Sora 2',
                      personality: 'Fully Deprecated Mar 2026',
                      desc: 'OpenAI is shutting down both the Sora consumer app and API. At its peak, Sora 2 was the only non-Google model in the T2V top 5 (ELO 1,367) - but at ~$1.30 per 10-second clip and ~11.3M videos/day, the $5.4B annualized burn rate was never sustainable.',
                      strategy: 'Migrate to Veo 3.1 (T2V #1) or Kling 3.0 for video generation. No Sora endpoint will remain available.',
                      color: '#6b7280',
                      sourceUrl: 'https://www.remio.ai/post/the-real-sora-cost-openai-s-5-billion-ai-video-problem',
                    },
                  ].map((m) => (
                    <div
                      key={m.model}
                      className="rounded-xl border bg-white dark:bg-[#111] p-4 flex flex-col gap-2"
                      style={{ borderColor: `${m.color}30` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.model}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: m.color, background: `${m.color}15` }}>{m.personality}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{m.desc}</p>
                      <div className="pt-1.5 border-t border-black/[0.06] dark:border-white/6">
                        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: m.color }}>What works</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{m.strategy}</p>
                      </div>
                      {m.sourceUrl && (
                        <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors mt-0.5">
                          Source ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/6 p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">A reliable structure for video prompts</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['What the scene is', 'Who or what is in it', 'What happens', 'How the camera moves', 'The overall mood'].map((step, i) => (
                      <div key={step} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-gray-300 dark:text-zinc-600">→</span>}
                        <span className="rounded-md px-2 py-0.5 font-medium bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/8 text-gray-700 dark:text-zinc-300">{step}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    For scenes with multiple actions: use timed segments - <span className="font-mono text-gray-600 dark:text-zinc-300">(0–5s)</span>, <span className="font-mono text-gray-600 dark:text-zinc-300">(5–12s)</span> - rather than describing everything at once. Physics-based tools handle sequential instructions better than simultaneous ones.
                  </p>
                </div>
                <RealPrompt
                  prompt={prompts.video}
                  loading={promptLoading.video}
                  label="A real video prompt from the dataset"
                  onShuffle={() => fetchPrompt('video', 'group=video')}
                />
                <p>
                  The most underrated shift: sound. Kling 3.0 and Veo 3.1 now generate audio - effects, ambient noise, dialogue - in the same pass as the video. Describe it in the brief from the start or it becomes an afterthought.
                </p>
              </div>
            </Section>

            <Section title="Seedance Takeover" id="seedance">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <p>
                  The breakout model of Q1 became the default layer of Q2. Seedance 2.0 launched in February with a unified audio-video architecture; it went viral almost immediately - the <a href="https://variety.com/2026/film/news/motion-picture-association-ai-seedance-bytedance-tom-cruise-1236661753/" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">two-line-prompt clip of &ldquo;Tom Cruise&rdquo; vs &ldquo;Brad Pitt&rdquo; on a rooftop</a> crossed 1.2M views on X within days and triggered an MPA cease-and-desist. What made April different was distribution: <a href="https://help.runwayml.com/hc/en-us/articles/50488490233363-Creating-with-Seedance-2-0" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">Runway added Seedance 2.0 with an Unlimited plan on April 12</a>, Flova shipped its integration April 5, and <a href="https://the-decoder.com/bytedance-rolls-out-seedance-2-0-to-100-countries-but-keeps-the-us-off-the-list/" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">CapCut began rolling it out across 100+ countries</a>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Distribution', desc: 'Runway Unlimited, CapCut global, Flova. The model showed up inside the tools creators already had open.', color: '#10b981' },
                    { label: 'Prompt syntax', desc: 'Native multi-shot via [0s], [5s] timestamp blocks and Shot switch markers - one prompt, an edited sequence out.', color: '#8b5cf6' },
                    { label: 'Legal cloud', desc: 'MPA cease-and-desist; Netflix, Warner, Disney, Paramount, Sony with individual letters. Unresolved, not slowing.', color: '#f59e0b' },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: r.color }}>{r.label}</span>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>

                <Insight
                  quote="Seedance 2.0 is now on Runway as the viral AI model continues its takeover."
                  source="No Film School · Apr 12, 2026"
                  sourceUrl="https://nofilmschool.com/runway-seedance-2-0"
                  color="#10b981"
                />

                <RealPrompt
                  prompt={prompts.seedance}
                  loading={promptLoading.seedance}
                  label="A real Seedance prompt from the dataset"
                  onShuffle={() => fetchPrompt('seedance', 'model=Seedance')}
                />

                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 p-4">
                  <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    <span className="font-semibold">Why it matters for your prompts.</span> If you still write single-shot prose prompts, you&rsquo;re leaving Seedance&rsquo;s best feature on the floor. Structure the prompt as timestamped shots with a shared constants block up top (character, location, color grade), then let each block handle camera, action, and audio. The Multi-Shot section below has the full grammar.
                  </p>
                </div>

                <div className="pt-1">
                  <Link
                    href="/state-of-prompting/seedance"
                    className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Read the full Seedance story &rarr;
                  </Link>
                </div>
              </div>
            </Section>

            <Section title="Multi-Shot Prompting" id="multishot">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <p>
                  Single-shot AI video is B-roll. Multi-shot AI video is an edited scene. <a href="https://blog.fal.ai/kling-3-0-prompting-guide/" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">Kling 3.0's February 2026 launch</a> popularized the technique - and it's now the standard for anything with narrative structure.
                </p>
                <p>
                  Multi-shot prompting describes two or more distinct camera cuts in a single prompt. The model generates them as a coherent sequence - same characters, consistent environment, natural transitions. The underlying research (<a href="https://arxiv.org/html/2512.03041" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">Kuaishou's MultiShotMaster, CVPR 2026</a>) modified how the model handles position embeddings to deliberately break continuity at shot boundaries while keeping character identity stable across them.
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {/* Kling column */}
                    <div className="border-b sm:border-b-0 sm:border-r border-black/[0.06] dark:border-white/6">
                      <div className="px-4 py-2.5 bg-pink-500/5 dark:bg-pink-500/10 border-b border-black/[0.06] dark:border-white/6 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400">Kling 3.0</span>
                        <span className="ml-auto text-[11px] text-gray-400 dark:text-zinc-500">Shot-label format</span>
                      </div>
                      <pre className="text-[11px] text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono p-4 bg-white dark:bg-[#111]">{`Shot 1 (0–4s): Wide - rain-soaked city street,
amber streetlights, slow dolly forward.

Shot 2 (4–8s): Medium - woman in red coat
running through alley, tracking shot.

Shot 3 (8–12s): Close-up - catching breath,
eyes wide. [breathless]: "They found us."`}</pre>
                      <div className="px-4 py-2 border-t border-black/[0.04] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01]">
                        <p className="text-[11px] text-gray-400 dark:text-zinc-500">Up to 6 shots · native lip-sync · speaker attribution</p>
                      </div>
                    </div>
                    {/* Seedance column */}
                    <div>
                      <div className="px-4 py-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-black/[0.06] dark:border-white/6 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Seedance 2.0</span>
                        <span className="ml-auto text-[11px] text-gray-400 dark:text-zinc-500">Timestamp format</span>
                      </div>
                      <pre className="text-[11px] text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono p-4 bg-white dark:bg-[#111]">{`[0s]: Wide shot - character enters a dimly
lit cafe, looking around curiously.

[Shot switch]

[5s]: Medium - sitting down, ordering
coffee with a warm smile.

[Shot switch]

[10s]: Close-up - eyes react as someone
enters. Warm golden lighting.`}</pre>
                      <div className="px-4 py-2 border-t border-black/[0.04] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01]">
                        <p className="text-[11px] text-gray-400 dark:text-zinc-500">Uses <code className="bg-black/[0.05] dark:bg-white/[0.05] px-1 rounded">Shot switch</code> or <code className="bg-black/[0.05] dark:bg-white/[0.05] px-1 rounded">Cut to</code> as scene markers</p>
                      </div>
                    </div>
                  </div>
                </div>
                <RealPrompt
                  prompt={prompts.multishot}
                  loading={promptLoading.multishot}
                  label="A real multi-shot prompt from the dataset"
                  onShuffle={() => fetchPrompt('multishot', 'multi_shot=true')}
                />
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Model</span>
                    <span>Max shots</span>
                    <span>Syntax</span>
                    <span>Lip-sync</span>
                  </div>
                  {[
                    { model: 'Kling 3.0',       shots: '6',  syntax: 'Shot N (Xs): …',            lipsync: true,  color: '#ec4899' },
                    { model: 'Seedance 2.0',    shots: '3–5', syntax: '[Xs]: … / Shot switch',     lipsync: true,  color: '#10b981' },
                    { model: 'Veo 3.1',         shots: '2–3', syntax: 'Start/end frame reference', lipsync: true,  color: '#1DA1F2' },
                    { model: 'Runway Gen-4.5',  shots: '1',  syntax: 'Single shot - assemble in post', lipsync: false, color: '#f97316' },
                    { model: 'Grok Imagine Video', shots: '1', syntax: 'Single shot - chain via Extend from Frame', lipsync: true, color: '#9333ea' },
                  ].map((row, i) => (
                    <div key={row.model} className={`grid grid-cols-4 px-4 py-2.5 text-xs items-center gap-2 ${i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}>
                      <span className="font-semibold" style={{ color: row.color }}>{row.model}</span>
                      <span className="text-gray-600 dark:text-zinc-300 font-medium">{row.shots}</span>
                      <span className="text-gray-500 dark:text-zinc-400">{row.syntax}</span>
                      <span>{row.lipsync ? <span className="text-violet-500 font-medium">✓</span> : <span className="text-gray-300 dark:text-zinc-600">-</span>}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/30 p-4">
                  <p className="text-sm text-pink-700 dark:text-pink-300 leading-relaxed">
                    <span className="font-semibold">The Continuity Lock.</span> Open every multi-shot prompt with a shared constants block - time of day, location, character description, color grade, visual style. This is the "lock sheet" that anchors all shots to the same world. Repeat the same character descriptors verbatim in every shot. Even small wording changes can cause face drift.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    <span className="font-semibold">Where it breaks down.</span> Character consistency degrades past 4–5 shots. Hard cuts between very different environments (outdoor → indoor, day → night) produce visual seams. Timestamps are probabilistic - the model interprets them, not executes them literally. No current model stores character profiles between sessions: if you come back tomorrow, re-anchor with the same reference image.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="Every Major Tool Now Accepts Multiple Input Types" id="multimodal">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <p>
                  A year ago, most AI video tools had one input: a text box. Today every major platform accepts text, images, audio, and video in combination. <span className="text-[11px] text-gray-400 dark:text-zinc-500">(Capabilities verified via <a href="https://vivideo.ai/blog/state-of-ai-video-creation-2026" target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">Vivideo</a>, <a href="https://pxz.ai/blog/veo-31-vs-top-ai-video-generators-2026" target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline">PXZ</a>, and official documentation, Mar 2026)</span>
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Platform</span>
                    <span>Text</span>
                    <span>Image / Video</span>
                    <span>Audio</span>
                  </div>
                  {[
                    { name: 'Seedance 2.0',        text: true,  visual: true,  audio: true,  dead: false },
                    { name: 'Kling 3.0',           text: true,  visual: true,  audio: true,  dead: false },
                    { name: 'Veo 3.1',             text: true,  visual: true,  audio: true,  dead: false },
                    { name: 'Grok Imagine Video',  text: true,  visual: true,  audio: true,  dead: false },
                    { name: 'Runway Gen-4.5',      text: true,  visual: true,  audio: false, dead: false },
                    { name: 'Aurora (image only)', text: true,  visual: true,  audio: false, dead: false },
                    { name: 'Pika 2.5',            text: true,  visual: true,  audio: true,  dead: false },
                    { name: '🪦 RIP Sora 2',       text: true,  visual: true,  audio: true,  dead: true  },
                  ].map((p, i) => (
                    <div
                      key={p.name}
                      className={`grid grid-cols-4 px-4 py-2.5 text-xs items-center ${p.dead ? 'opacity-50' : i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}
                    >
                      <span className={`font-medium ${p.dead ? 'text-gray-400 dark:text-zinc-500' : 'text-gray-800 dark:text-zinc-200'}`}>{p.name}</span>
                      <span className={p.dead ? 'line-through' : ''}>{p.text ? '✓' : '-'}</span>
                      <span className={p.dead ? 'line-through' : ''}>{p.visual ? <span className={p.dead ? 'text-gray-400' : 'text-emerald-500 font-medium'}>✓</span> : '-'}</span>
                      <span className={p.dead ? 'line-through' : ''}>{p.audio ? <span className={p.dead ? 'text-gray-400' : 'text-violet-500 font-medium'}>✓</span> : <span className="text-gray-300 dark:text-zinc-600">-</span>}</span>
                    </div>
                  ))}
                </div>
                <p>
                  Text-only prompts leave most of the available control unused. The tools that accept reference images, audio clips, and video deliver substantially better results when you use those inputs.
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Aurora (xAI)</span> is the outlier - autoregressive (not diffusion), renders named real people (others refuse), and supports iterative chat editing. Prompt with comma-separated ingredients, not prose.
                </p>
              </div>
            </Section>

            <Section title="From the Dataset" id="from-the-data">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <p>
                  The claims above come from industry reports. This section is different - it's what we see in <Link href="/prompts" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">{stats?.total?.toLocaleString() ?? '-'} real prompts</Link> sourced from viral posts on X. Every prompt below is real - click shuffle to see more.
                </p>

                {stats && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { value: stats.total.toLocaleString(), label: 'prompts collected', color: '#1DA1F2' },
                        { value: `${imageCount} / ${videoCount}`, label: 'image / video split', color: '#ec4899' },
                        { value: `${refPct}%`, label: 'use reference images', color: '#f97316' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-3 text-center">
                          <div className="text-xl font-bold leading-tight" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-snug">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Real prompt examples */}
                    <div className="flex flex-col gap-3">
                      <RealPrompt
                        prompt={prompts.featured1}
                        loading={promptLoading.featured1}
                        label="Text → Image"
                        onShuffle={() => fetchPrompt('featured1', 'category=image_t2i')}
                      />
                      <RealPrompt
                        prompt={prompts.featured2}
                        loading={promptLoading.featured2}
                        label="Video generation"
                        onShuffle={() => fetchPrompt('featured2', 'group=video')}
                      />
                      <RealPrompt
                        prompt={prompts.featured3}
                        loading={promptLoading.featured3}
                        label="Reference-guided"
                        onShuffle={() => fetchPrompt('featured3', 'category=image_r2i')}
                      />
                    </div>

                    {/* Model share */}
                    {topModels.length > 0 && (
                      <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Which models go viral</h4>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">Model frequency in high-engagement posts - not benchmark rankings, but what practitioners actually share.</p>
                        <div className="flex flex-col gap-1.5">
                          {topModels.map((m, i) => {
                            const pct = stats.total ? Math.round((m.value / stats.total) * 100) : 0
                            return (
                              <div key={m.label} className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 w-3 text-right">{i + 1}</span>
                                <span className="text-[11px] font-medium w-28 shrink-0 truncate text-gray-700 dark:text-zinc-300">{m.label}</span>
                                <div className="flex-1 h-4 bg-black/[0.03] dark:bg-white/[0.03] rounded overflow-hidden">
                                  <div
                                    className="h-full rounded bg-violet-500/20 border-l-2 border-violet-500"
                                    style={{ width: `${Math.max(5, (m.value / (topModels[0]?.value || 1)) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 w-14 text-right shrink-0">
                                  {m.value} ({pct}%)
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Monthly model share — backs the Seedance thesis with the dataset */}
                    {monthlyModelShare && monthlyModelShare.series.length > 0 && (
                      <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4">
                        <div className="flex items-start justify-between mb-1 gap-3">
                          <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Model share by month</h4>
                          <span className="text-[10px] font-mono text-gray-300 dark:text-zinc-600 shrink-0">last {monthlyModelShare.months.length} months</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">Share of classified prompts each month. This is the dataset backing the Seedance thesis &mdash; the trajectory in the rightmost column is April.</p>
                        <div className="overflow-x-auto -mx-1 px-1">
                          <div className="min-w-[520px]">
                            {/* Header */}
                            <div className="grid gap-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 pb-2 border-b border-black/[0.06] dark:border-white/6" style={{ gridTemplateColumns: `12px 7rem repeat(${monthlyModelShare.months.length}, minmax(0, 1fr))` }}>
                              <span />
                              <span>Model</span>
                              {monthlyModelShare.months.map((m) => (
                                <span key={m} className="text-right font-mono normal-case tracking-normal">{m}</span>
                              ))}
                            </div>
                            {/* Rows */}
                            {monthlyModelShare.series.map((row, i) => {
                              const isSeedance = row.model.toLowerCase() === 'seedance'
                              const rowColor = isSeedance ? '#10b981' : '#8b5cf6'
                              return (
                                <div
                                  key={row.model}
                                  className={`grid gap-2 items-center py-1.5 text-[11px] ${isSeedance ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] -mx-1 px-1 rounded' : ''}`}
                                  style={{ gridTemplateColumns: `12px 7rem repeat(${monthlyModelShare.months.length}, minmax(0, 1fr))` }}
                                >
                                  <span className="font-mono text-gray-400 dark:text-zinc-500 text-right">{i + 1}</span>
                                  <span className={`font-medium truncate ${isSeedance ? 'font-semibold' : ''}`} style={{ color: isSeedance ? rowColor : undefined }}>{row.model}</span>
                                  {row.months.map((cell) => {
                                    const barPct = Math.max(4, Math.min(100, cell.pct * 2.2))
                                    return (
                                      <div key={cell.month} className="flex items-center gap-1.5 justify-end">
                                        <div className="flex-1 h-3 bg-black/[0.03] dark:bg-white/[0.03] rounded overflow-hidden">
                                          <div
                                            className="h-full rounded"
                                            style={{ width: `${barPct}%`, backgroundColor: `${rowColor}25`, borderRight: `2px solid ${rowColor}` }}
                                          />
                                        </div>
                                        <span className="font-mono text-gray-500 dark:text-zinc-400 w-7 text-right tabular-nums shrink-0">
                                          {cell.pct >= 1 ? `${cell.pct.toFixed(0)}%` : cell.pct > 0 ? '<1%' : '—'}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        {monthlyModelShare.seedanceArc && monthlyModelShare.seedanceArc.length >= 2 && (
                          <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/6 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Seedance arc</span>
                            <div className="flex items-center gap-1.5 font-mono text-gray-500 dark:text-zinc-400">
                              {monthlyModelShare.seedanceArc.map((p, idx, arr) => (
                                <span key={p.month} className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-gray-400 dark:text-zinc-500">{p.month.slice(-2)}</span>
                                  <span className="text-[11px] text-gray-700 dark:text-zinc-300 font-semibold">{p.pct >= 1 ? `${p.pct.toFixed(0)}%` : p.pct > 0 ? '<1%' : '0%'}</span>
                                  {idx < arr.length - 1 && <span className="text-gray-300 dark:text-zinc-600">&rarr;</span>}
                                </span>
                              ))}
                            </div>
                            {monthlyModelShare.seedanceMoM != null && (
                              <span
                                className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${monthlyModelShare.seedanceMoM >= 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}
                              >
                                {monthlyModelShare.seedanceMoM >= 0 ? '+' : ''}{monthlyModelShare.seedanceMoM.toFixed(1)}pp MoM
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Synthesis - one-line observations */}
                    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#111] p-4 flex flex-col gap-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-zinc-500">What the numbers say</h4>
                      <div className="flex flex-col gap-1.5 text-xs text-gray-600 dark:text-zinc-300">
                        <p>→ <span className="font-medium">{refPct}% of viral prompts use reference images.</span> {refPct >= 40
                          ? 'Reference is the new text - creators increasingly let images do the talking instead of writing longer descriptions.'
                          : 'Every major tool now accepts image input, but most viral prompts are still text-only. The workflow shift is lagging the capability shift.'}</p>
                        <p>→ <span className="font-medium">{longPromptPct}% exceed 200 characters.</span> {longPromptPct >= 50
                          ? 'Viral prompts tend to be detailed and descriptive - creators invest in specificity to get the output they want.'
                          : 'Short, specific prompts outperform verbose ones. Models fill gaps better than they parse walls of text.'}</p>
                        {topThemes.length >= 3 && (
                          <p>→ <span className="font-medium">Top themes: {topThemes.slice(0, 3).map((t) => t.label).join(', ')}.</span> The aesthetic distribution is heavily skewed - a few styles dominate viral engagement.</p>
                        )}
                        {monthlyModelShare?.seedanceMoM != null && (
                          <p>→ <span className="font-medium">Seedance share moved {monthlyModelShare.seedanceMoM >= 0 ? '+' : ''}{monthlyModelShare.seedanceMoM.toFixed(1)}pp MoM.</span> {monthlyModelShare.seedanceMoM >= 3
                            ? 'The distribution story (Runway, CapCut, Flova) is showing up in the dataset, not just the news cycle.'
                            : monthlyModelShare.seedanceMoM >= 0
                              ? 'Still rising, but less aggressively than the headlines suggest - distribution rolled out late in the month.'
                              : 'Down MoM despite the headlines - either the sample is lagging or the hype outpaced adoption.'}</p>
                        )}
                        <p>→ <span className="font-medium">What tops the arena ≠ what goes viral.</span> Accessibility, speed, and community familiarity drive sharing as much as raw output quality.</p>
                      </div>
                    </div>
                  </>
                )}

                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  Live data from <Link href="/insights" className="text-violet-600 dark:text-violet-400 hover:underline">Insights</Link>. Full methodology on the <Link href="/methodology" className="text-violet-600 dark:text-violet-400 hover:underline">Methodology</Link> page. <Link href="/prompts" className="text-violet-600 dark:text-violet-400 hover:underline">Browse all prompts →</Link>
                </p>
              </div>
            </Section>

            <Section title="The Realness Gap" id="realness-gap">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <p>
                  Look at which themes go viral and a pattern emerges: <span className="font-medium text-gray-800 dark:text-zinc-100">creators disproportionately prompt for styles where realism doesn&rsquo;t matter.</span> Abstract, fantasy, sci-fi, and horror dominate - themes where broken physics and uncanny anatomy are aesthetically acceptable, or even desirable.
                </p>

                <p>
                  T2VEval (Qi et al., 2025) explains why. They decompose video quality into four dimensions - text fidelity, realness, technical quality, and overall impression - and find that <span className="font-medium text-gray-800 dark:text-zinc-100">realness is the hardest dimension for current models.</span> The output can be high-resolution and prompt-faithful, but still look wrong because the physics or anatomy violates cognitive expectations.
                </p>

                <Insight
                  quote="The primary challenge faced by current T2V models lies in accurately understanding and representing the objective laws of the real world, including physical principles and cognitive commonsense knowledge."
                  source="T2VEval — Qi et al., 2025"
                  color="#ef4444"
                />

                <p>
                  Our data shows the community response: <span className="font-medium text-gray-800 dark:text-zinc-100">practitioners unconsciously prompt around model weaknesses.</span> They&rsquo;ve learned to avoid themes where realism is demanded - realistic portraits, architectural renders, product shots - and lean into themes where &ldquo;realness&rdquo; is forgiving.
                </p>

                {realnessData && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-500 leading-tight">{realnessData.forgivingPct}%</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Forgiving themes</div>
                        <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">abstract, fantasy, sci-fi, horror</div>
                      </div>
                      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-4 text-center">
                        <div className="text-2xl font-bold text-red-500 leading-tight">{realnessData.demandingPct}%</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Demanding themes</div>
                        <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">person, landscape, architecture, product</div>
                      </div>
                      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-4 text-center">
                        <div className="text-2xl font-bold text-gray-400 leading-tight">{realnessData.neutralPct}%</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Neutral</div>
                        <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">cinematic, fashion</div>
                      </div>
                    </div>

                    {/* Stacked bar */}
                    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Realness demand distribution</h4>
                      <div className="flex h-8 rounded-lg overflow-hidden">
                        <div
                          className="bg-emerald-400/70 dark:bg-emerald-500/50 flex items-center justify-center text-[11px] font-semibold text-emerald-900 dark:text-emerald-200"
                          style={{ width: `${realnessData.forgivingPct}%` }}
                        >
                          {realnessData.forgivingPct}%
                        </div>
                        <div
                          className="bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-[11px] font-semibold text-gray-600 dark:text-zinc-300"
                          style={{ width: `${realnessData.neutralPct}%` }}
                        >
                          {realnessData.neutralPct > 5 ? `${realnessData.neutralPct}%` : ''}
                        </div>
                        <div
                          className="bg-red-400/70 dark:bg-red-500/50 flex items-center justify-center text-[11px] font-semibold text-red-900 dark:text-red-200"
                          style={{ width: `${realnessData.demandingPct}%` }}
                        >
                          {realnessData.demandingPct}%
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-zinc-500">
                        <span>← Forgiving (low realness demand)</span>
                        <span>Demanding (high realness demand) →</span>
                      </div>
                    </div>

                    {/* Theme-level breakdown */}
                    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">By theme</h4>
                      <div className="flex flex-col gap-1.5">
                        {realnessData.themes.map((t) => {
                          const isForgiving = FORGIVING_THEMES.includes(t.label)
                          const isDemanding = DEMANDING_THEMES.includes(t.label)
                          const pct = realnessData.total ? Math.round((t.value / realnessData.total) * 100) : 0
                          const barColor = isForgiving
                            ? 'bg-emerald-500/20 border-l-2 border-emerald-500'
                            : isDemanding
                              ? 'bg-red-500/20 border-l-2 border-red-500'
                              : 'bg-gray-300/30 dark:bg-zinc-600/30 border-l-2 border-gray-400 dark:border-zinc-500'
                          return (
                            <div key={t.label} className="flex items-center gap-2">
                              <span className="text-[11px] font-medium w-24 shrink-0 truncate text-gray-700 dark:text-zinc-300">{t.label}</span>
                              <div className="flex-1 h-4 bg-black/[0.03] dark:bg-white/[0.03] rounded overflow-hidden">
                                <div
                                  className={`h-full rounded ${barColor}`}
                                  style={{ width: `${Math.max(5, (t.value / (realnessData.themes[0]?.value || 1)) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 w-16 text-right shrink-0">
                                {t.value} ({pct}%)
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    <span className="font-semibold">Watch this number.</span> The forgiving-to-demanding ratio is a proxy for how much the community trusts model realism. As Seedance 2.0, Veo 3.1, and newer Kling versions close the realness gap, expect this distribution to shift. The stylized-first era may be a temporary artifact of model limitations, not creative preference.
                  </p>
                </div>

                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  Live data from <Link href="/dataset" className="text-violet-600 dark:text-violet-400 hover:underline">the dataset</Link>. Realness framework adapted from T2VEval (Qi et al., 2025). &ldquo;Forgiving&rdquo; = themes where unrealistic output is aesthetically acceptable. &ldquo;Demanding&rdquo; = themes where viewers expect physical/anatomical accuracy.
                </p>
              </div>
            </Section>

            <Section title="Why Sora Shut Down" id="sora">
              <div className="flex flex-col gap-4 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
                <p>
                  On April 26, 2026, Sora went dark - the consumer app and ChatGPT video generation both went offline; the API follows September 24. OpenAI had announced the full shutdown on March 24, six months after launch. At its peak Sora 2 was the only non-Google model in the T2V top 5 (ELO 1,367), but the economics were never close to working.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { stat: '$1.30', label: 'Cost per 10-second clip (Cantor Fitzgerald est.)' },
                    { stat: '~11.3M', label: 'Videos generated per day at peak' },
                    { stat: '$15M/day', label: 'Est. daily inference cost (Forbes)' },
                    { stat: '$5.4B/yr', label: 'Annualized burn rate' },
                  ].map(({ stat, label }) => (
                    <div key={stat} className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-3 text-center">
                      <div className="text-xl font-bold text-red-500 dark:text-red-400 leading-tight">{stat}</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-snug">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 md:p-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">How it unraveled</h4>
                  <div className="relative">
                    <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-400 via-red-400 to-red-600 dark:from-amber-500 dark:via-red-500 dark:to-red-700" />
                    <div className="flex flex-col gap-4">
                      {[
                        { date: 'Sep 30, 2025', event: 'Sora launches publicly - 1 million downloads in the first week', severity: 0, sourceUrl: 'https://www.remio.ai/post/the-real-sora-cost-openai-s-5-billion-ai-video-problem' },
                        { date: 'Oct 2025', event: '4 million downloads by Halloween; Bill Peebles admits "the economics are currently completely unsustainable"', severity: 1, sourceUrl: 'https://www.remio.ai/post/the-real-sora-cost-openai-s-5-billion-ai-video-problem' },
                        { date: 'Nov 2025', event: 'Analyst Deepak Mathivanan (Cantor Fitzgerald) estimates $1.30/clip - ~40 min GPU time per video across 4 GPUs at ~$2/hr', severity: 1, sourceUrl: 'https://www.remio.ai/post/the-real-sora-cost-openai-s-5-billion-ai-video-problem' },
                        { date: 'Late 2025', event: 'OpenAI introduces paywall: $4 for 10 generations. Altman concedes "there is no ad model that can support the cost" of meme-making at scale', severity: 2, sourceUrl: 'https://www.remio.ai/post/the-real-sora-cost-openai-s-5-billion-ai-video-problem' },
                        { date: 'Early 2026', event: 'Usage declines as free limits are slashed; competitors (Veo, Kling, Seedance) rapidly close the quality gap', severity: 2 },
                        { date: 'Mar 24, 2026', event: 'OpenAI announces full Sora shutdown - app, API, and ChatGPT video generation. All of it.', severity: 3, sourceUrl: 'https://x.com/soraofficialapp' },
                        { date: 'Apr 26, 2026', event: 'Sora consumer app and ChatGPT video go offline. API follows September 24, 2026.', severity: 3, sourceUrl: 'https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation' },
                      ].map(({ date, event, severity, sourceUrl }) => {
                        const dotColor = severity === 0 ? 'bg-amber-400' : severity === 1 ? 'bg-orange-400' : severity === 2 ? 'bg-red-400' : 'bg-red-600'
                        const isTerminal = severity === 3
                        return (
                          <div key={date} className="flex gap-4 items-start pl-0 relative">
                            <div className={`relative z-10 shrink-0 mt-1.5 rounded-full ${dotColor} ${isTerminal ? 'w-3 h-3 -ml-[1px]' : 'w-[11px] h-[11px]'} ring-2 ring-white dark:ring-zinc-900`} />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-[11px] font-mono font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{date}</span>
                              <span className={`text-xs leading-relaxed ${isTerminal ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-zinc-300'}`}>
                                {event}
                                {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-gray-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400"> ↗</a>}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  Cost estimates sourced from <a href="https://www.remio.ai/post/the-real-sora-cost-openai-s-5-billion-ai-video-problem" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">Remio/Forbes analysis</a> and Cantor Fitzgerald research. Shutdown announcement via <a href="https://x.com/soraofficialapp" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">@soraofficialapp</a>.
                </p>

                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 p-4">
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                    <span className="font-semibold">The lesson.</span> The model did not survive either - OpenAI is deprecating the API alongside the consumer app. Each 10-second clip cost ~$1.30 to generate; at 11.3 million videos a day that's $15M daily, $5.4B annually - against a company already losing twice what it earns. The field consolidated around Google (Veo 3.1), xAI (Grok), and Kling/Seedance/Runway. Unlike other shutdowns, there's no API fallback this time.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="Sources" id="sources">
              <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                {[
                  { label: 'The State of AI Video Creation 2026 - Vivideo', url: 'https://vivideo.ai/blog/state-of-ai-video-creation-2026' },
                  { label: "Prompt Engineering Is Dying - What's Replacing It in 2026 - Medium", url: 'https://medium.com/@shashanky485/prompt-engineering-is-dying-whats-replacing-it-in-2026-f88d821d77ee' },
                  { label: 'Death of Prompt Engineering: AI Orchestration in 2026 - BigBlue Academy', url: 'https://bigblue.academy/en/the-death-of-prompt-engineering-and-its-ruthless-resurrection-navigating-ai-orchestration-in-2026-and-beyond' },
                  { label: 'AI Prompt Engineering Is Dead - IEEE Spectrum', url: 'https://spectrum.ieee.org/prompt-engineering-is-dead' },
                  { label: 'How to Actually Control Next-Gen Video AI - Medium', url: 'https://medium.com/@creativeaininja/how-to-actually-control-next-gen-video-ai-runway-kling-veo-and-sora-prompting-strategies-92ef0055658b' },
                  { label: 'The State of AI Video Generation in February 2026 - Medium / Cliprise', url: 'https://medium.com/@cliprise/the-state-of-ai-video-generation-in-february-2026-every-major-model-analyzed-6dbfedbe3a5c' },
                  { label: 'Veo 3.1 vs Top AI Video Generators: 2026 Comparison - PXZ', url: 'https://pxz.ai/blog/veo-31-vs-top-ai-video-generators-2026' },
                  { label: 'Google Veo 3.1 Overview - AI/ML API Blog', url: 'https://aimlapi.com/blog/google-veo-3-1' },
                  { label: 'Kling AI 3.0 Review 2026 - Cybernews', url: 'https://cybernews.com/ai-tools/kling-ai-review/' },
                  { label: 'Prompt Engineering in 2025: The Latest Best Practices', url: 'https://www.news.aakashg.com/p/prompt-engineering' },
                  { label: 'AI Video Trends: Predictions For 2026 - LTX Studio', url: 'https://ltx.studio/blog/ai-video-trends' },
                  { label: 'Prompt Engineering Jobs Are Obsolete in 2025 - Salesforce Ben', url: 'https://www.salesforceben.com/prompt-engineering-jobs-are-obsolete-in-2025-heres-why/' },
                  { label: 'Context Engineering for Coding Agents - Martin Fowler', url: 'https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html' },
                  { label: 'Seedance 2.0 Official - ByteDance Seed', url: 'https://seed.bytedance.com/en/seedance2_0' },
                  { label: 'Seedance 2.0 vs Veo 3.1: Which Is Best? - SitePoint', url: 'https://www.sitepoint.com/seedance-2-0-vs-veo-3-1-which-is-best-for-ai-video-creators/' },
                  { label: 'Seedance 2.0 Complete Guide - WaveSpeedAI', url: 'https://wavespeed.ai/blog/posts/seedance-2-0-complete-guide-multimodal-video-creation/' },
                  { label: 'Artificial Analysis Text-to-Video Arena', url: 'https://artificialanalysis.ai/text-to-video/arena' },
                  { label: 'Artificial Analysis Image-to-Video Arena', url: 'https://artificialanalysis.ai/text-to-video/arena' },
                  { label: 'Artificial Analysis Text-to-Image Arena', url: 'https://artificialanalysis.ai/text-to-image/arena' },
                  { label: 'Artificial Analysis Image Edit Arena', url: 'https://artificialanalysis.ai/text-to-image/arena' },
                  { label: 'Artificial Analysis Video Edit Arena', url: 'https://artificialanalysis.ai/text-to-video/arena' },
                  { label: 'MultiShotMaster (Kuaishou / Kling Research) - arXiv:2512.03041', url: 'https://arxiv.org/html/2512.03041' },
                  { label: 'VideoGen-of-Thought - arXiv:2503.15138', url: 'https://arxiv.org/abs/2503.15138' },
                  { label: 'Kling 3.0 Multi-Shot Prompting Guide - fal.ai', url: 'https://blog.fal.ai/kling-3-0-prompting-guide/' },
                  { label: 'Timeline Prompting with Seedance 2.0 - MindStudio', url: 'https://www.mindstudio.ai/blog/timeline-prompting-seedance-2-cinematic-ai-video' },
                  { label: 'Timestamp Prompting Guide - Artlist', url: 'https://artlist.io/blog/timestamp-prompting/' },
                  { label: 'Seedance 2.0 on Runway - Runway Help Center (Apr 12, 2026)', url: 'https://help.runwayml.com/hc/en-us/articles/50488490233363-Creating-with-Seedance-2-0' },
                  { label: 'Seedance 2.0 is Now on Runway - No Film School', url: 'https://nofilmschool.com/runway-seedance-2-0' },
                  { label: 'Seedance 2.0 Runway Unlimited Plan Review - MindStudio', url: 'https://www.mindstudio.ai/blog/seedance-2-runway-unlimited-plan-review' },
                  { label: 'ByteDance Rolls Out Seedance 2.0 to 100+ Countries - the-decoder', url: 'https://the-decoder.com/bytedance-rolls-out-seedance-2-0-to-100-countries-but-keeps-the-us-off-the-list/' },
                  { label: 'MPA Denounces Massive Infringement on Seedance 2.0 - Variety', url: 'https://variety.com/2026/film/news/motion-picture-association-ai-seedance-bytedance-tom-cruise-1236661753/' },
                  { label: 'MPA Cease-and-Desist to ByteDance - Hollywood Reporter', url: 'https://www.hollywoodreporter.com/business/business-news/mpa-cease-and-desist-bytedance-seedance-2-0-1236510957/' },
                  { label: 'MPA Pushes ByteDance to Curb Seedance 2.0 Infringement - Variety', url: 'https://variety.com/2026/film/news/motion-picture-association-bytedance-seedance-letter-1236668577/' },
                  { label: 'Veo 4 Release - Everything You Need to Know (April 2026)', url: 'https://www.veo3ai.io/blog/veo-4-release-everything-you-need-to-know-2026' },
                  { label: 'What to Know About the Sora Discontinuation - OpenAI Help', url: 'https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation' },
                ].map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-700 dark:hover:text-zinc-200 transition-colors underline underline-offset-2 decoration-gray-300 dark:decoration-zinc-600"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </Section>

          </div>

          {/* Sticky right-side nav */}
          <aside className="hidden xl:block w-44 shrink-0 sticky top-20 self-start">
            <SectionNav activeId={activeId} />
          </aside>

        </div>
      </div>
    </div>
  )
}
