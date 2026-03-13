'use client'

import { useState, useEffect, useMemo } from 'react'

const MODEL_FAMILIES: { label: string; patterns: string[] }[] = [
  { label: 'Midjourney',       patterns: ['midjourney', 'mj'] },
  { label: 'Flux',             patterns: ['flux'] },
  { label: 'Stable Diffusion', patterns: ['stable diffusion', 'sdxl', 'sd3', 'sd '] },
  { label: 'DALL-E',           patterns: ['dall-e', 'dalle'] },
  { label: 'Firefly',          patterns: ['firefly'] },
  { label: 'Ideogram',         patterns: ['ideogram'] },
  { label: 'Leonardo',         patterns: ['leonardo'] },
  { label: 'Kling',            patterns: ['kling'] },
  { label: 'Runway',           patterns: ['runway', 'gen-2', 'gen-3', 'gen 2', 'gen 3'] },
  { label: 'Sora',             patterns: ['sora'] },
  { label: 'Pika',             patterns: ['pika'] },
  { label: 'Hailuo',           patterns: ['hailuo', 'minimax'] },
  { label: 'Luma',             patterns: ['luma', 'dream machine'] },
  { label: 'Veo',              patterns: ['veo'] },
  { label: 'Wan',              patterns: ['wan'] },
  { label: 'Seedance',        patterns: ['seedance'] },
  { label: 'Nano Banana',     patterns: ['nano banana'] },
  { label: 'Higgsfield',      patterns: ['higgsfield'] },
  { label: 'ElevenLabs',       patterns: ['elevenlabs'] },
  { label: 'Suno',             patterns: ['suno'] },
  { label: 'Udio',             patterns: ['udio'] },
  { label: 'ChatGPT',          patterns: ['chatgpt', 'gpt-4', 'gpt4'] },
  { label: 'Claude',           patterns: ['claude'] },
  { label: 'Gemini',           patterns: ['gemini'] },
  { label: 'Meshy',            patterns: ['meshy'] },
]

function modelToFamily(model: string): string {
  const lower = model.toLowerCase()
  return MODEL_FAMILIES.find((f) => f.patterns.some((p) => lower.includes(p)))?.label ?? model
}

const CATEGORY_COLORS: Record<string, string> = {
  image_t2i:           '#ec4899',
  image_i2i:           '#d946ef',
  image_r2i:           '#f97316',
  image_character_ref: '#f43f5e',
  image_inpainting:    '#ef4444',
  video_t2v:           '#8b5cf6',
  video_i2v:           '#6366f1',
  video_r2v:           '#a855f7',
  video_v2v:           '#3b82f6',
  audio:               '#06b6d4',
  threed:              '#14b8a6',
  system_prompt:       '#0ea5e9',
  writing:             '#22c55e',
  coding:              '#eab308',
  analysis:            '#f59e0b',
  other:               '#71717a',
}

const THEME_COLORS: Record<string, string> = {
  person:       '#3b82f6',
  cinematic:    '#eab308',
  landscape:    '#22c55e',
  architecture: '#a8a29e',
  scifi:        '#06b6d4',
  fantasy:      '#a855f7',
  abstract:     '#f97316',
  fashion:      '#ec4899',
  product:      '#6366f1',
  horror:       '#ef4444',
}

const MEDIA_TYPE_COLORS: Record<string, string> = {
  Image: '#ec4899',
  Video: '#8b5cf6',
  Text:  '#22c55e',
  Other: '#71717a',
}

const MODEL_PALETTE = [
  '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4',
  '#10b981', '#eab308', '#f97316', '#ef4444', '#f43f5e',
  '#8b5cf6', '#14b8a6', '#84cc16', '#f59e0b', '#0ea5e9',
  '#d946ef', '#22c55e', '#64748b', '#a8a29e', '#fb923c',
]

const CATEGORY_LABELS: Record<string, string> = {
  image_t2i:           'Text → Image',
  image_i2i:           'Image → Image',
  image_r2i:           'Reference → Image',
  image_character_ref: 'Character Ref',
  image_inpainting:    'Inpainting',
  video_t2v:           'Text → Video',
  video_i2v:           'Image → Video',
  video_r2v:           'Reference → Video',
  video_v2v:           'Video → Video',
  audio:               'Audio',
  threed:              '3D',
  system_prompt:       'System Prompt',
  writing:             'Writing',
  coding:              'Coding',
  analysis:            'Analysis',
  other:               'Other',
}

const THEME_LABELS: Record<string, string> = {
  person:       'Person',
  cinematic:    'Cinematic',
  landscape:    'Landscape',
  architecture: 'Architecture',
  scifi:        'Sci-fi',
  fantasy:      'Fantasy',
  abstract:     'Abstract',
  fashion:      'Fashion',
  product:      'Product',
  horror:       'Horror',
}

function BarChart({
  data,
  colorMap,
  fallbackPalette = MODEL_PALETTE,
  title,
  labelFn,
}: {
  data: ChartItem[]
  colorMap?: Record<string, string>
  fallbackPalette?: string[]
  title: string
  labelFn?: (key: string) => string
}) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h2>
        <p className="text-sm text-gray-400 dark:text-zinc-600 py-8 text-center">No data yet</p>
      </div>
    )
  }
  const total = data.reduce((s, d) => s + d.value, 0)
  const max = data[0].value

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h2>
      <div className="flex flex-col gap-1.5">
        {data.map((item, i) => {
          const color = colorMap?.[item.label] ?? fallbackPalette[i % fallbackPalette.length]
          const pct = ((item.value / total) * 100).toFixed(1)
          const barW = ((item.value / max) * 100).toFixed(1)
          const label = labelFn ? labelFn(item.label) : item.label
          return (
            <div key={item.label} className="flex items-center gap-3 group">
              <span className="w-32 text-xs text-gray-400 dark:text-zinc-400 text-right truncate shrink-0 group-hover:text-gray-700 dark:group-hover:text-zinc-200 transition-colors">
                {label}
              </span>
              <div className="flex-1 h-5 bg-black/5 dark:bg-white/5 rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md transition-all"
                  style={{ width: `${barW}%`, background: color }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-white tabular-nums w-8 text-right shrink-0">{item.value}</span>
              <span className="text-xs text-gray-400 dark:text-zinc-600 tabular-nums w-10 text-right shrink-0">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSegmentPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startAngle: number, endAngle: number,
): string {
  const sweep = endAngle - startAngle
  if (sweep >= 359.99) {
    const mid = startAngle + 180
    const p1o = polarToCartesian(cx, cy, outerR, startAngle)
    const p2o = polarToCartesian(cx, cy, outerR, mid)
    const p1i = polarToCartesian(cx, cy, innerR, startAngle)
    const p2i = polarToCartesian(cx, cy, innerR, mid)
    return [
      `M ${p1o.x} ${p1o.y}`,
      `A ${outerR} ${outerR} 0 1 1 ${p2o.x} ${p2o.y}`,
      `A ${outerR} ${outerR} 0 1 1 ${p1o.x} ${p1o.y}`,
      `L ${p1i.x} ${p1i.y}`,
      `A ${innerR} ${innerR} 0 1 0 ${p2i.x} ${p2i.y}`,
      `A ${innerR} ${innerR} 0 1 0 ${p1i.x} ${p1i.y}`,
      'Z',
    ].join(' ')
  }
  const largeArc = sweep > 180 ? 1 : 0
  const os = polarToCartesian(cx, cy, outerR, startAngle)
  const oe = polarToCartesian(cx, cy, outerR, endAngle)
  const is = polarToCartesian(cx, cy, innerR, startAngle)
  const ie = polarToCartesian(cx, cy, innerR, endAngle)
  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${is.x} ${is.y}`,
    'Z',
  ].join(' ')
}

interface ChartItem { label: string; value: number }

function DonutChart({
  data,
  colorMap,
  fallbackPalette = MODEL_PALETTE,
  title,
  centerLabel,
  size = 300,
  innerRatio = 0.55,
  labelFn,
}: {
  data: ChartItem[]
  colorMap?: Record<string, string>
  fallbackPalette?: string[]
  title: string
  centerLabel?: string
  size?: number
  innerRatio?: number
  labelFn?: (key: string) => string
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  const cx = size / 2
  const cy = size / 2
  const outerR = size / 2 - 8
  const innerR = outerR * innerRatio
  const total = data.reduce((s, d) => s + d.value, 0)

  const segments = useMemo(() => {
    let cumulative = 0
    return data.map((item, i) => {
      const startAngle = (cumulative / total) * 360
      cumulative += item.value
      const endAngle = (cumulative / total) * 360
      const color = colorMap?.[item.label] ?? fallbackPalette[i % fallbackPalette.length]
      return { ...item, startAngle, endAngle, color, index: i }
    })
  }, [data, total, colorMap, fallbackPalette])

  if (total === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-sm text-gray-400 dark:text-zinc-600 py-8 text-center">No data yet</p>
      </div>
    )
  }

  const hoveredItem = hovered !== null ? segments[hovered] : null

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h2>
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            {segments.map((seg) => (
              <path
                key={seg.index}
                d={donutSegmentPath(cx, cy, outerR, innerR, seg.startAngle, seg.endAngle)}
                fill={seg.color}
                stroke="var(--background)"
                strokeWidth="2"
                opacity={hovered === null || hovered === seg.index ? 1 : 0.35}
                style={{ transition: 'opacity 0.15s' }}
                onMouseEnter={() => setHovered(seg.index)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              />
            ))}
            {hoveredItem ? (
              <>
                <text x={cx} y={cy - 10} textAnchor="middle" fill="currentColor" fontSize={26} fontWeight={700} fontFamily="inherit">
                  {hoveredItem.value}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#a1a1aa" fontSize={11} fontFamily="inherit">
                  {((hoveredItem.value / total) * 100).toFixed(1)}%
                </text>
              </>
            ) : (
              <>
                <text x={cx} y={cy - 10} textAnchor="middle" fill="currentColor" fontSize={30} fontWeight={700} fontFamily="inherit">
                  {total}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#71717a" fontSize={11} fontFamily="inherit">
                  {centerLabel ?? 'total'}
                </text>
              </>
            )}
          </svg>
        </div>

        <div className="flex flex-col gap-2 flex-1 w-full min-w-0">
          {segments.map((seg) => {
            const pct = ((seg.value / total) * 100).toFixed(1)
            const displayLabel = labelFn ? labelFn(seg.label) : seg.label
            return (
              <div
                key={seg.index}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors cursor-default"
                style={{ background: hovered === seg.index ? `${seg.color}18` : undefined }}
                onMouseEnter={() => setHovered(seg.index)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
                <span className="text-sm text-gray-600 dark:text-zinc-300 flex-1 truncate">{displayLabel}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">{seg.value}</span>
                <span className="text-xs text-gray-400 dark:text-zinc-600 w-12 text-right tabular-nums">{pct}%</span>
                <div className="w-16 h-1.5 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden shrink-0">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: seg.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface StatsData {
  total: number
  byCategory: ChartItem[]
  byModel: ChartItem[]
  byTheme: ChartItem[]
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`)
        return d
      })
      .then((d) => { setStats(d); setLoading(false) })
      .catch((e) => { setError(String(e)); setLoading(false) })
  }, [])

  const byMediaType: ChartItem[] = useMemo(() => {
    if (!stats) return []
    const IMAGE_CATS = new Set(['image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting'])
    const VIDEO_CATS = new Set(['video_t2v', 'video_i2v', 'video_r2v', 'video_v2v'])
    const TEXT_CATS  = new Set(['system_prompt', 'writing', 'coding', 'analysis'])
    const groups: Record<string, number> = { Image: 0, Video: 0, Text: 0, Other: 0 }
    for (const { label, value } of stats.byCategory) {
      if (IMAGE_CATS.has(label)) groups.Image += value
      else if (VIDEO_CATS.has(label)) groups.Video += value
      else if (TEXT_CATS.has(label)) groups.Text += value
      else groups.Other += value
    }
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([label, value]) => ({ label, value }))
  }, [stats])

  const byModelFamily: ChartItem[] = useMemo(() => {
    if (!stats) return []
    const families: Record<string, number> = {}
    for (const { label, value } of stats.byModel) {
      const family = modelToFamily(label)
      families[family] = (families[family] ?? 0) + value
    }
    return Object.entries(families)
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value }))
  }, [stats])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] flex items-center justify-center">
        <svg className="h-6 w-6 animate-spin text-gray-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-2">
        <p className="text-gray-400 dark:text-zinc-500 text-sm">Failed to load stats.</p>
        {error && <p className="text-red-400 text-xs max-w-lg text-center">{error}</p>}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-12">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Stats</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
            {stats.total.toLocaleString()} prompt{stats.total !== 1 ? 's' : ''} classified
          </p>
        </div>

        {/* About the collection */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-gradient-to-br from-gray-50 to-white dark:from-[#111] dark:to-[#0e0e0e] p-6 md:p-8 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#1DA1F2] text-lg">✦</span>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">About this collection</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
              A hand-curated library of AI prompts sourced from the people actually pushing these tools to their limits —
              practitioners, artists, and researchers sharing their best work on X. Not scraped. Not synthetic.
              Real prompts that produced real results, bookmarked because they were worth keeping.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Full-spectrum taxonomy',
                body: 'Spans every AI media type — text-to-image, image-to-video, reference workflows, audio, 3D, and LLM prompts — under a single unified taxonomy. Most libraries only cover one.',
              },
              {
                title: 'Structurally rich',
                body: 'Every prompt is tagged with technique type, visual themes, art style, detected model, and whether a reference image is required. Metadata that actually means something.',
              },
              {
                title: 'Reference-aware',
                body: 'One of the few collections that distinguishes reference-based workflows (IP-Adapter, face swap, img2img) from pure text prompts — critical for knowing what you can actually run.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-black/[0.06] dark:border-white/6 bg-black/[0.02] dark:bg-white/[0.02] p-4 flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">{f.title}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 1: By Category */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6 md:p-8">
          <BarChart
            data={stats.byCategory}
            colorMap={CATEGORY_COLORS}
            title="By Category"
            labelFn={(k) => CATEGORY_LABELS[k] ?? k}
          />
        </div>

        {/* Chart 2 + 3 side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6">
            <BarChart
              data={byMediaType}
              colorMap={MEDIA_TYPE_COLORS}
              title="By Media Type"
            />
          </div>
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6">
            <DonutChart
              data={stats.byTheme ?? []}
              colorMap={THEME_COLORS}
              title="By Theme"
              centerLabel="tagged"
              size={260}
              labelFn={(k) => THEME_LABELS[k] ?? k}
            />
          </div>
        </div>

        {/* Chart 4: By Model */}
        {byModelFamily.length > 0 && (
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6 md:p-8">
            <DonutChart
              data={byModelFamily}
              fallbackPalette={MODEL_PALETTE}
              title="By Model / Tool"
              centerLabel="prompts"
              size={300}
            />
          </div>
        )}
      </div>
    </div>
  )
}
