'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { modelToFamily } from '@/components/prompts/constants'

// ── Types ───────────────────────────────────────────────────────────────────

interface LabelValue { label: string; value: number }

interface StatsData {
  total: number
  withReference: number
  byCategory: LabelValue[]
  byModel: LabelValue[]
  byReferenceType: LabelValue[]
  byPromptLength: LabelValue[]
}

// ── Chart components ────────────────────────────────────────────────────────

const PALETTE = [
  '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#3b82f6',
  '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#10b981',
  '#6366f1', '#d946ef', '#f43f5e', '#22c55e', '#0ea5e9',
]

function HorizontalBarChart({ data, max: maxOverride }: { data: LabelValue[]; max?: number }) {
  const max = maxOverride ?? data[0]?.value ?? 1
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 dark:text-zinc-300 w-36 truncate text-right shrink-0 font-medium">
            {formatLabel(d.label)}
          </span>
          <div className="flex-1 h-6 bg-black/[0.03] dark:bg-white/[0.03] rounded-md overflow-hidden">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{
                width: `${Math.max(3, (d.value / max) * 100)}%`,
                backgroundColor: `${PALETTE[i % PALETTE.length]}30`,
                borderLeft: `3px solid ${PALETTE[i % PALETTE.length]}`,
              }}
            />
          </div>
          <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 w-10 text-right shrink-0">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data, size = 180 }: { data: LabelValue[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  const r = size / 2 - 12
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
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
              strokeWidth={22}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-currentOffset}
              className="transition-all duration-500"
              style={{ opacity: 0.8 }}
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
  )
}

function StatCard({ value, label, sub, color }: { value: string | number; label: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-5">
      <div className="text-2xl font-bold font-mono tabular-nums" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs font-medium text-gray-700 dark:text-zinc-300 mt-0.5">{label}</div>
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

  return (
    <div className="flex items-end gap-3 h-40">
      {sorted.map((d, i) => {
        const pct = (d.value / max) * 100
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500">
              {Math.round((d.value / total) * 100)}%
            </span>
            <div className="w-full bg-black/[0.03] dark:bg-white/[0.03] rounded-t-md relative" style={{ height: '100px' }}>
              <div
                className="absolute bottom-0 w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max(4, pct)}%`,
                  backgroundColor: PALETTE[i],
                  opacity: 0.7,
                }}
              />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 text-center leading-tight">
              {labels[d.label] ?? d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
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

  const imageCount = useMemo(() =>
    stats?.byCategory?.filter((c) => c.label.startsWith('image_')).reduce((s, c) => s + c.value, 0) ?? 0
  , [stats])
  const videoCount = useMemo(() =>
    stats?.byCategory?.filter((c) => c.label.startsWith('video_')).reduce((s, c) => s + c.value, 0) ?? 0
  , [stats])
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
          <StatCard value={stats.total} label="Total prompts" color="#8b5cf6" />
          <StatCard value={imageCount} label="Image prompts" color="#ec4899" />
          <StatCard value={videoCount} label="Video prompts" color="#6366f1" />
          <StatCard value={`${refPct}%`} label="Use references" sub={`${stats.withReference ?? 0} prompts`} color="#f97316" />
          <StatCard value={byModelAggregated.length} label="Distinct models" color="#3b82f6" />
        </div>

        {/* Technique distribution */}
        {(stats.byCategory?.length ?? 0) > 0 && (
          <Section title="Techniques" description="Prompt count by generation technique.">
            <DonutChart
              data={stats.byCategory.filter((c) => c.label.startsWith('image_') || c.label.startsWith('video_'))}
            />
          </Section>
        )}

        {/* Model share */}
        {byModelAggregated.length > 0 && (
          <Section title="Model Share" description="Which AI models appear most often in viral prompts.">
            <HorizontalBarChart data={byModelAggregated.slice(0, 15)} />
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
