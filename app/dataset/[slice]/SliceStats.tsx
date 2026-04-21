'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { modelToFamily } from '@/components/prompts/constants'
import type { DatasetSlice } from '@/lib/datasetSlices'

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

export default function SliceStats({ slice, color }: { slice: DatasetSlice; color: string }) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stats?slice=${slice}`)
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((d) => { if (d.total != null) setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slice])

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

  const modelCount = byModelAggregated.length
  const refPct = stats?.total ? Math.round((stats.withReference / stats.total) * 100) : 0

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
        Slice size
      </h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.03] px-5 py-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatPill value={stats.total} label="prompts in slice" color={color} />
            <StatPill
              value={`${refPct}%`}
              label="use references"
              sub={`${stats.withReference} prompts`}
              color="#f97316"
            />
            <StatPill value={modelCount} label="distinct models" color="#3b82f6" />
            <StatPill
              value={stats.byCategory.length}
              label="fine-grained categories"
              color="#22c55e"
            />
          </div>

          {byModelAggregated.length > 0 && (
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Model distribution</h3>
              <div className="flex flex-col gap-1.5">
                {byModelAggregated.slice(0, 12).map((m) => {
                  const pct = stats.total ? (m.value / stats.total) * 100 : 0
                  const maxModelValue = byModelAggregated[0]?.value || 1
                  return (
                    <Link
                      key={m.label}
                      href={`/prompts?model=${encodeURIComponent(m.label)}`}
                      className="flex items-center gap-3 group"
                    >
                      <span className="text-xs text-gray-600 dark:text-zinc-300 w-28 truncate text-right shrink-0 font-medium group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {m.label}
                      </span>
                      <div className="flex-1 h-5 bg-black/[0.03] dark:bg-white/[0.03] rounded overflow-hidden">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${Math.max(3, (m.value / maxModelValue) * 100)}%`,
                            background: `${color}33`,
                            borderLeft: `2px solid ${color}`,
                          }}
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
          )}

          {stats.byCategory.length > 0 && (
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Fine-grained categories in this slice</h3>
              <div className="flex flex-wrap gap-2">
                {stats.byCategory.map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                    style={{ color, borderColor: `${color}40`, background: `${color}10` }}
                  >
                    <span className="font-medium">{c.label}</span>
                    <span className="opacity-60 tabular-nums">{c.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

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
        <p className="text-sm text-gray-400">Failed to load slice stats.</p>
      )}
    </div>
  )
}
