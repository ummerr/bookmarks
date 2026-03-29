'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { modelToFamily, modelFamilyMediaType } from '@/components/prompts/constants'

// ── Types ───────────────────────────────────────────────────────────────────

interface LabelValue { label: string; value: number }
interface TimelinePoint { month: string; value: number }
interface ModelTimelinePoint { month: string; model: string; value: number }

interface StatsData {
  total: number
  withReference: number
  byCategory: LabelValue[]
  byModel: LabelValue[]
  byReferenceType: LabelValue[]
  byPromptLength: LabelValue[]
  timeline: TimelinePoint[]
  modelTimeline: ModelTimelinePoint[]
}

// ── Chart components ────────────────────────────────────────────────────────

// Muted analogous palette — violet / indigo / slate tones
const PALETTE = [
  '#7c3aed', '#818cf8', '#a78bfa', '#6366f1', '#9ca3af',
  '#a5b4fc', '#c4b5fd', '#94a3b8', '#7dd3fc', '#67e8f9',
  '#c084fc', '#d8b4fe', '#cbd5e1', '#93c5fd', '#b4bcd0',
]

// ── Tooltip ────────────────────────────────────────────────────────────────

interface TooltipData { label: string; value: string; x: number; y: number }

function useTooltip() {
  const [tip, setTip] = useState<TooltipData | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const show = useCallback((label: string, value: string, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({ label, value, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const hide = useCallback(() => setTip(null), [])

  return { tip, show, hide, containerRef }
}

function ChartTooltip({ tip }: { tip: TooltipData | null }) {
  if (!tip) return null
  return (
    <div
      className="absolute z-50 pointer-events-none px-2.5 py-1.5 rounded-lg bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs shadow-lg whitespace-nowrap transition-opacity duration-100"
      style={{ left: tip.x, top: tip.y - 40, transform: 'translateX(-50%)' }}
    >
      <span className="font-medium">{tip.label}</span>
      <span className="ml-1.5 opacity-70">{tip.value}</span>
    </div>
  )
}

function HorizontalBarChart({ data, max: maxOverride }: { data: LabelValue[]; max?: number }) {
  const max = maxOverride ?? data[0]?.value ?? 1
  const total = data.reduce((s, d) => s + d.value, 0)
  const { tip, show, hide, containerRef } = useTooltip()
  return (
    <div className="relative" ref={containerRef}>
      <ChartTooltip tip={tip} />
      <div className="flex flex-col gap-1.5">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex items-center gap-3 cursor-default"
            onMouseMove={(e) => show(formatLabel(d.label), `${d.value} (${Math.round((d.value / total) * 100)}%)`, e)}
            onMouseLeave={hide}
          >
            <span className="text-xs text-gray-600 dark:text-zinc-300 w-36 truncate text-right shrink-0 font-medium">
              {formatLabel(d.label)}
            </span>
            <div className="flex-1 h-6 bg-black/[0.03] dark:bg-white/[0.03] rounded-md overflow-hidden">
              <div
                className="h-full rounded-md transition-all duration-500 bg-violet-500/15 dark:bg-violet-400/15 border-l-[3px] border-violet-500 dark:border-violet-400"
                style={{ width: `${Math.max(3, (d.value / max) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 w-10 text-right shrink-0">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ data, size = 180 }: { data: LabelValue[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const { tip, show, hide, containerRef } = useTooltip()
  if (total === 0) return null

  const r = size / 2 - 12
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="relative" ref={containerRef}>
      <ChartTooltip tip={tip} />
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <svg width={size} height={size} className="shrink-0">
          {data.map((d, i) => {
            const pct = d.value / total
            const dashLength = pct * circumference
            const currentOffset = offset
            offset += dashLength
            return (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={20}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-currentOffset}
                className="transition-all duration-500 cursor-default"
                style={{ opacity: 0.65 }}
                onMouseMove={(e) => show(formatLabel(d.label), `${d.value} (${Math.round(pct * 100)}%)`, e)}
                onMouseLeave={hide}
              />
            )
          })}
          <text
            x={size / 2}
            y={size / 2 - 6}
            textAnchor="middle"
            className="fill-gray-900 dark:fill-white text-2xl font-bold"
            style={{ fontSize: '24px', fontWeight: 700 }}
          >
            {total}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            className="fill-gray-400 dark:fill-zinc-500"
            style={{ fontSize: '11px' }}
          >
            total
          </text>
        </svg>
        <div className="flex flex-col gap-1.5">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              <span className="text-gray-600 dark:text-zinc-300 font-medium">{formatLabel(d.label)}</span>
              <span className="text-gray-400 dark:text-zinc-500">
                {d.value} ({Math.round((d.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-5">
      <div className="text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 dark:text-zinc-600 mt-0.5">{sub}</div>}
    </div>
  )
}

function PromptLengthChart({ data }: { data: LabelValue[] }) {
  const order = ['short', 'medium', 'long', 'very_long']
  const labels: Record<string, string> = {
    short: '< 50 chars',
    medium: '50–200',
    long: '200–500',
    very_long: '500+',
  }
  const sorted = order
    .map((key) => data.find((d) => d.label === key))
    .filter((d): d is LabelValue => d != null)
  const max = Math.max(...sorted.map((d) => d.value), 1)
  const total = sorted.reduce((s, d) => s + d.value, 0)
  const { tip, show, hide, containerRef } = useTooltip()

  return (
    <div className="relative" ref={containerRef}>
      <ChartTooltip tip={tip} />
      <div className="flex items-end gap-3 h-40">
        {sorted.map((d) => {
          const pct = (d.value / max) * 100
          const label = labels[d.label] ?? d.label
          return (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-default"
              onMouseMove={(e) => show(label, `${d.value} (${Math.round((d.value / total) * 100)}%)`, e)}
              onMouseLeave={hide}
            >
              <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500">
                {Math.round((d.value / total) * 100)}%
              </span>
              <div className="w-full bg-black/[0.03] dark:bg-white/[0.03] rounded-t-md relative" style={{ height: '100px' }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-md transition-all duration-500 bg-violet-500/50 dark:bg-violet-400/40"
                  style={{ height: `${Math.max(4, pct)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 text-center leading-tight">
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TimelineChart({ data, priorCount }: { data: TimelinePoint[]; priorCount?: number }) {
  const { tip, show, hide, containerRef } = useTooltip()
  if (data.length < 2) return null
  const max = Math.max(...data.map((d) => d.value), 1)
  const total = data.reduce((s, d) => s + d.value, 0)

  const W = 700, H = 200, PX = 48, PY = 24, PB = 32
  const plotW = W - PX * 2
  const plotH = H - PY - PB

  const points = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * plotW,
    y: PY + plotH - (d.value / max) * plotH,
    ...d,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaD = `${pathD} L${points[points.length - 1].x},${PY + plotH} L${points[0].x},${PY + plotH} Z`

  // Y-axis gridlines
  const gridLines = 4
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const val = Math.round((max / gridLines) * i)
    const y = PY + plotH - (val / max) * plotH
    return { val, y }
  })

  return (
    <div className="w-full overflow-x-auto relative" ref={containerRef}>
      <ChartTooltip tip={tip} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[700px]" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {yTicks.map((t) => (
          <g key={t.val}>
            <line x1={PX} y1={t.y} x2={W - PX} y2={t.y} stroke="currentColor" className="text-black/[0.06] dark:text-white/[0.06]" />
            <text x={PX - 8} y={t.y + 3} textAnchor="end" className="fill-gray-400 dark:fill-zinc-500" style={{ fontSize: '10px' }}>{t.val}</text>
          </g>
        ))}
        {/* Area fill */}
        <path d={areaD} fill="url(#timelineGrad)" opacity={0.3} />
        <defs>
          <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Line */}
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth={2.5} strokeLinejoin="round" />
        {/* Dots + labels */}
        {points.map((p) => (
          <g key={p.month}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#8b5cf6" />
            {/* Larger invisible hit area for hover */}
            <circle
              cx={p.x} cy={p.y} r={14} fill="transparent" className="cursor-default"
              onMouseMove={(e) => show(formatMonth(p.month), `${p.value} prompts`, e)}
              onMouseLeave={hide}
            />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-gray-600 dark:fill-zinc-300 pointer-events-none" style={{ fontSize: '9px', fontWeight: 600 }}>
              {p.value}
            </text>
            <text
              x={p.x} y={H - 6} textAnchor="middle"
              className="fill-gray-400 dark:fill-zinc-500 pointer-events-none" style={{ fontSize: '9px' }}
              transform={data.length > 6 ? `rotate(-45, ${p.x}, ${H - 6})` : undefined}
            >
              {formatMonth(p.month)}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
        {total.toLocaleString()} prompts across {data.length} months
        {priorCount != null && priorCount > 0 && (
          <span> &middot; {priorCount.toLocaleString()} earlier</span>
        )}
      </div>
    </div>
  )
}

function ModelShareTimelineChart({ data, modelFamilyFn, priorCount }: { data: ModelTimelinePoint[]; modelFamilyFn: (m: string) => string; priorCount?: number }) {
  const { tip, show, hide, containerRef } = useTooltip()
  if (data.length === 0) return null

  // Aggregate by month + family
  const byMonthFamily = new Map<string, Map<string, number>>()
  for (const d of data) {
    const family = modelFamilyFn(d.model)
    if (!byMonthFamily.has(d.month)) byMonthFamily.set(d.month, new Map())
    const monthMap = byMonthFamily.get(d.month)!
    monthMap.set(family, (monthMap.get(family) ?? 0) + d.value)
  }

  const months = Array.from(byMonthFamily.keys()).sort()
  if (months.length < 2) return null

  // Find top families by total count
  const familyTotals = new Map<string, number>()
  for (const monthMap of byMonthFamily.values()) {
    for (const [f, v] of monthMap) familyTotals.set(f, (familyTotals.get(f) ?? 0) + v)
  }
  const topFamilies = Array.from(familyTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([f]) => f)

  // Build stacked data
  const stacked = months.map((month) => {
    const monthMap = byMonthFamily.get(month)!
    const values: Record<string, number> = {}
    let total = 0
    for (const f of topFamilies) {
      const v = monthMap.get(f) ?? 0
      values[f] = v
      total += v
    }
    // "Other"
    let otherTotal = 0
    for (const [f, v] of monthMap) {
      if (!topFamilies.includes(f)) otherTotal += v
    }
    if (otherTotal > 0) { values['Other'] = otherTotal; total += otherTotal }
    return { month, values, total }
  })

  const allFamilies = otherTotal(stacked) ? [...topFamilies, 'Other'] : topFamilies

  const W = 700, H = 240, PX = 48, PY = 16, PB = 36
  const plotW = W - PX * 2
  const plotH = H - PY - PB
  const barW = Math.min(50, (plotW / months.length) * 0.7)
  const gap = (plotW - barW * months.length) / Math.max(months.length - 1, 1)

  // Y-axis percentage labels
  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="w-full overflow-x-auto relative" ref={containerRef}>
      <ChartTooltip tip={tip} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[700px]" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yTicks.map((pct) => {
          const y = PY + plotH - (pct / 100) * plotH
          return (
            <g key={pct}>
              <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="currentColor" className="text-black/[0.06] dark:text-white/[0.06]" />
              <text x={PX - 8} y={y + 3} textAnchor="end" className="fill-gray-400 dark:fill-zinc-500" style={{ fontSize: '10px' }}>{pct}%</text>
            </g>
          )
        })}
        {stacked.map((s, mi) => {
          const barX = PX + mi * (barW + gap)
          let yOffset = PY + plotH
          return (
            <g key={s.month}>
              {allFamilies.map((f, fi) => {
                const v = s.values[f] ?? 0
                if (v === 0 || s.total === 0) return null
                const segH = (v / s.total) * plotH
                yOffset -= segH
                return (
                  <rect
                    key={f}
                    x={barX}
                    y={yOffset}
                    width={barW}
                    height={segH}
                    rx={fi === allFamilies.length - 1 || (allFamilies.slice(fi + 1).every(fam => (s.values[fam] ?? 0) === 0)) ? 3 : 0}
                    fill={PALETTE[fi % PALETTE.length]}
                    opacity={0.65}
                    className="cursor-default"
                    onMouseMove={(e) => show(`${f} · ${formatMonth(s.month)}`, `${v} (${Math.round((v / s.total) * 100)}%)`, e)}
                    onMouseLeave={hide}
                  />
                )
              })}
              <text
                x={barX + barW / 2} y={H - 8} textAnchor="middle"
                className="fill-gray-400 dark:fill-zinc-500 pointer-events-none" style={{ fontSize: '9px' }}
                transform={months.length > 6 ? `rotate(-45, ${barX + barW / 2}, ${H - 8})` : undefined}
              >
                {formatMonth(s.month)}
              </text>
            </g>
          )
        })}
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {allFamilies.map((f, i) => (
          <div key={f} className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span className="text-gray-600 dark:text-zinc-300">{f}</span>
          </div>
        ))}
      </div>
      {priorCount != null && priorCount > 0 && (
        <div className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
          {priorCount.toLocaleString()} earlier prompts not shown
        </div>
      )}
    </div>
  )
}

function otherTotal(stacked: { values: Record<string, number> }[]): boolean {
  return stacked.some((s) => (s.values['Other'] ?? 0) > 0)
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[Number(m) - 1]} ${y.slice(2)}`
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  image_t2i: 'Text to Image',
  image_i2i: 'Image to Image',
  image_r2i: 'Reference to Image',
  image_character_ref: 'Character Ref',
  image_person: 'Person / Portrait',
  image_advertisement: 'Ad / Product',
  image_collage: 'Collage / Grid',
  image_inpainting: 'Inpainting',
  video_t2v: 'Text to Video',
  video_i2v: 'Image to Video',
  video_r2v: 'Reference to Video',
  video_v2v: 'Video to Video',
}

const REF_TYPE_LABELS: Record<string, string> = {
  face_person: 'Face / Person',
  style_artwork: 'Style / Artwork',
  subject_object: 'Subject / Object',
  pose_structure: 'Pose / Structure',
  scene_background: 'Scene / Background',
}

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

function formatLabel(key: string): string {
  return CATEGORY_LABELS[key] ?? REF_TYPE_LABELS[key] ?? THEME_LABELS[key] ?? key.replace(/_/g, ' ')
}

// ── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
        <h2 className="font-serif text-xl md:text-2xl text-gray-900 dark:text-white">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400 leading-[1.65]">{description}</p>}
      </div>
      {children}
    </section>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((d) => { if (d.total != null) setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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

  // Window temporal data to last 6 months
  const sixMonthCutoff = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 5) // current month + 5 prior = 6 months
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const { recentTimeline, timelinePriorCount } = useMemo(() => {
    if (!stats?.timeline) return { recentTimeline: [], timelinePriorCount: 0 }
    const recent = stats.timeline.filter((d) => d.month >= sixMonthCutoff)
    const prior = stats.timeline.filter((d) => d.month < sixMonthCutoff)
    return {
      recentTimeline: recent,
      timelinePriorCount: prior.reduce((s, d) => s + d.value, 0),
    }
  }, [stats, sixMonthCutoff])

  const { recentModelTimeline, modelTimelinePriorCount } = useMemo(() => {
    if (!stats?.modelTimeline) return { recentModelTimeline: [], modelTimelinePriorCount: 0 }
    const recent = stats.modelTimeline.filter((d) => d.month >= sixMonthCutoff)
    const prior = stats.modelTimeline.filter((d) => d.month < sixMonthCutoff)
    return {
      recentModelTimeline: recent,
      modelTimelinePriorCount: prior.reduce((s, d) => s + d.value, 0),
    }
  }, [stats, sixMonthCutoff])

  // Split models by media type
  const { imageModels, videoModels } = useMemo(() => {
    if (!byModelAggregated.length) return { imageModels: [], videoModels: [] }
    return {
      imageModels: byModelAggregated.filter((m) => modelFamilyMediaType(m.label) === 'image'),
      videoModels: byModelAggregated.filter((m) => modelFamilyMediaType(m.label) === 'video'),
    }
  }, [byModelAggregated])

  // Split model timeline by media type
  const { imageModelTimeline, videoModelTimeline } = useMemo(() => {
    if (!recentModelTimeline.length) return { imageModelTimeline: [], videoModelTimeline: [] }
    return {
      imageModelTimeline: recentModelTimeline.filter((d) => modelFamilyMediaType(modelToFamily(d.model)) === 'image'),
      videoModelTimeline: recentModelTimeline.filter((d) => modelFamilyMediaType(modelToFamily(d.model)) === 'video'),
    }
  }, [recentModelTimeline])

  // Split categories by media type
  const imageCategories = useMemo(() =>
    stats?.byCategory?.filter((c) => c.label.startsWith('image_')) ?? []
  , [stats])
  const videoCategories = useMemo(() =>
    stats?.byCategory?.filter((c) => c.label.startsWith('video_')) ?? []
  , [stats])

  const imageCount = useMemo(() =>
    imageCategories.reduce((s, c) => s + c.value, 0)
  , [imageCategories])
  const videoCount = useMemo(() =>
    videoCategories.reduce((s, c) => s + c.value, 0)
  , [videoCategories])
  const refPct = stats?.total ? Math.round(((stats.withReference ?? 0) / stats.total) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="h-5 w-5 animate-spin text-gray-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 dark:text-zinc-500 text-sm">
        Failed to load stats.
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-10 md:py-16 flex flex-col gap-14">

        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-gray-900 dark:text-white tracking-tight">
            Dataset Insights
          </h1>
          <p className="mt-3 text-gray-500 dark:text-zinc-400 max-w-2xl">
            Live statistics from the ummerr/prompts dataset - {stats.total.toLocaleString()} image and video generation
            prompts sourced from viral posts on X.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/prompts" className="text-sm text-violet-600 dark:text-violet-400 hover:underline">Browse prompts &rarr;</Link>
            <Link href="/datacard" className="text-sm text-gray-400 dark:text-zinc-500 hover:underline">Datacard</Link>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <StatCard value={stats.total} label="Total prompts" />
          <StatCard value={imageCount} label="Image prompts" />
          <StatCard value={videoCount} label="Video prompts" />
          <StatCard value={`${refPct}%`} label="Use references" sub={`${stats.withReference ?? 0} prompts`} />
          <StatCard value={byModelAggregated.length} label="Distinct models" />
        </div>

        {/* Prompts over time */}
        {recentTimeline.length >= 2 && (
          <Section title="Prompts Over Time" description="Prompts by tweet publish date — how the dataset is growing over the last 6 months.">
            <TimelineChart data={recentTimeline} priorCount={timelinePriorCount} />
          </Section>
        )}

        {/* Image model share over time */}
        {imageModelTimeline.length > 0 && (
          <Section title="Image Model Share by Month" description="How image model preferences are shifting month to month.">
            <ModelShareTimelineChart data={imageModelTimeline} modelFamilyFn={modelToFamily} priorCount={modelTimelinePriorCount} />
          </Section>
        )}

        {/* Video model share over time */}
        {videoModelTimeline.length > 0 && (
          <Section title="Video Model Share by Month" description="How video model preferences are shifting month to month.">
            <ModelShareTimelineChart data={videoModelTimeline} modelFamilyFn={modelToFamily} />
          </Section>
        )}

        {/* Image techniques */}
        {imageCategories.length > 0 && (
          <Section title="Image Techniques" description="Prompt count by image generation technique.">
            <DonutChart data={imageCategories} />
          </Section>
        )}

        {/* Video techniques */}
        {videoCategories.length > 0 && (
          <Section title="Video Techniques" description="Prompt count by video generation technique.">
            <DonutChart data={videoCategories} />
          </Section>
        )}

        {/* Image model share */}
        {imageModels.length > 0 && (
          <Section title="Image Models" description="Which image models appear most often in viral prompts.">
            <HorizontalBarChart data={imageModels.slice(0, 12)} />
          </Section>
        )}

        {/* Video model share */}
        {videoModels.length > 0 && (
          <Section title="Video Models" description="Which video models appear most often in viral prompts.">
            <HorizontalBarChart data={videoModels.slice(0, 12)} />
          </Section>
        )}

        {/* Reference usage */}
        {stats.byReferenceType?.length > 0 && (
          <Section title="Reference Types" description={`${refPct}% of prompts require a reference image. Here's how they break down.`}>
            <DonutChart data={stats.byReferenceType} size={160} />
          </Section>
        )}

        {/* Prompt length */}
        {stats.byPromptLength?.length > 0 && (
          <Section title="Prompt Length" description="Distribution of extracted prompt lengths across the dataset.">
            <PromptLengthChart data={stats.byPromptLength} />
          </Section>
        )}

      </div>
    </div>
  )
}
