'use client'

import { useState, useEffect } from 'react'


interface Strategy {
  label: string
  count?: number
  unique_prompts_with_dupes?: number
  removable_rows?: number
  examples?: Record<string, unknown>[]
  distribution?: { bucket: string; count: number }[]
}

interface QualityData {
  total: number
  strategies: Record<string, Strategy>
  distributions: { prompt_length: { bucket: string; count: number }[] }
  overlap: {
    by_flag_count: { flags: number; count: number }[]
    any_flag: number
  }
  sources: {
    unique_count: number
    total: number
    top: { handle: string; count: number; avg_confidence: number; categories: number }[]
  }
}

function Bar({ value, max, color = '#8b5cf6' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <div className="flex-1 h-5 bg-black/[0.03] dark:bg-white/[0.03] rounded overflow-hidden">
      <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: `${color}30`, borderLeft: `2px solid ${color}` }} />
    </div>
  )
}

function StrategyCard({ id, strategy, total, onRefresh }: { id: string; strategy: Strategy; total: number; onRefresh: () => void }) {
  const [showExamples, setShowExamples] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const count = strategy.count ?? strategy.removable_rows ?? 0
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
  const examples = strategy.examples ?? []

  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{strategy.label}</h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{id}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold font-mono tabular-nums text-red-500">{count.toLocaleString()}</div>
          <div className="text-[11px] text-gray-400 dark:text-zinc-500">{pct}% of dataset</div>
        </div>
      </div>

      <Bar value={count} max={total} color="#ef4444" />

      {/* Delete button */}
      {count > 0 && (
        <button
          disabled={deleting}
          onClick={async () => {
            if (!window.confirm(`Delete ${count.toLocaleString()} rows matched by "${strategy.label}"? This cannot be undone.`)) return
            setDeleting(true)
            try {
              const res = await fetch('/api/prompts/quality/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy: id }),
              })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || 'Delete failed')
              alert(`Deleted ${data.deleted} rows.`)
              onRefresh()
            } catch (err) {
              alert(`Error: ${err}`)
            } finally {
              setDeleting(false)
            }
          }}
          className="mt-3 w-full text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? 'Deleting...' : 'Cull these rows'}
        </button>
      )}

      {/* Duplicates: special display */}
      {strategy.unique_prompts_with_dupes != null && (
        <div className="mt-3 text-xs text-gray-500 dark:text-zinc-400">
          <span className="font-mono font-semibold">{strategy.unique_prompts_with_dupes}</span> unique prompts duplicated,{' '}
          <span className="font-mono font-semibold text-red-500">{strategy.removable_rows}</span> excess rows removable
        </div>
      )}

      {/* Confidence distribution */}
      {strategy.distribution && (
        <div className="mt-3 flex flex-col gap-1">
          {strategy.distribution.map((b) => (
            <div key={b.bucket} className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 w-16 text-right shrink-0">{b.bucket}</span>
              <Bar value={b.count} max={Math.max(...strategy.distribution!.map((d) => d.count))} color="#8b5cf6" />
              <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 w-10 text-right">{b.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Example toggle */}
      {examples.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowExamples((v) => !v)}
            className="text-[11px] text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            {showExamples ? 'Hide examples ↑' : `Show ${examples.length} examples ↓`}
          </button>

          {showExamples && (
            <div className="mt-2 flex flex-col gap-1.5 max-h-80 overflow-y-auto">
              {examples.map((ex, i) => {
                // Duplicate format
                if ('prompt' in ex && 'count' in ex) {
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-mono text-red-400 shrink-0 w-6 text-right">×{String(ex.count)}</span>
                      <span className="text-gray-600 dark:text-zinc-300 font-mono break-all">{String(ex.prompt)}</span>
                    </div>
                  )
                }
                // Normal format
                const prompt = (ex.extracted_prompt ?? ex.tweet_text ?? '') as string
                const truncated = prompt.length > 100 ? prompt.slice(0, 100) + '…' : prompt
                return (
                  <div key={i} className="flex items-start gap-2 text-xs border-b border-black/[0.04] dark:border-white/4 pb-1.5 last:border-0">
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-600 dark:text-zinc-300 font-mono break-all">{truncated || '(empty)'}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {ex.detected_model ? <span className="text-gray-400 dark:text-zinc-500">{String(ex.detected_model)}</span> : null}
                        {ex.prompt_category ? <span className="text-gray-400 dark:text-zinc-500">{String(ex.prompt_category)}</span> : null}
                        {'prompt_length' in ex ? <span className="text-gray-400 dark:text-zinc-500 font-mono">{String(ex.prompt_length)} chars</span> : null}
                        {'confidence' in ex ? <span className="text-gray-400 dark:text-zinc-500 font-mono">conf {Number(ex.confidence).toFixed(2)}</span> : null}
                        {'flag_reason' in ex ? <span className="text-red-400 dark:text-red-400 font-medium">{String(ex.flag_reason).replace(/_/g, ' ')}</span> : null}
                        {'flag_note' in ex && ex.flag_note ? <span className="text-gray-400 dark:text-zinc-500 italic">&quot;{String(ex.flag_note)}&quot;</span> : null}
                      </div>
                    </div>
                    {ex.tweet_url ? (
                      <a href={String(ex.tweet_url)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2] shrink-0">↗</a>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function QualityPage() {
  const [data, setData] = useState<QualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch('/api/prompts/quality')
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch((e) => { setError(String(e)); setLoading(false) })
  }, [fetchKey])

  const handleRefresh = () => setFetchKey((k) => k + 1)

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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] flex items-center justify-center text-red-500 text-sm">
        Failed to load: {error}
      </div>
    )
  }

  const strategyOrder = [
    'user_reported',
    'too_short', 'no_extraction', 'no_category', 'no_model',
    'duplicates', 'same_as_tweet', 'low_confidence', 'no_media', 'foreign_language',
  ]

  const maxLen = Math.max(...data.distributions.prompt_length.map((b) => b.count))

  return (
    <div className="text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dataset Quality Audit</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            <span className="font-mono font-semibold">{data.total.toLocaleString()}</span> total prompts - flagged by {strategyOrder.length} heuristics
          </p>
        </div>

        {/* Summary banner */}
        <div className="rounded-xl border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                {data.overlap.any_flag.toLocaleString()} rows flagged by at least 1 heuristic
              </div>
              <div className="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5">
                {((data.overlap.any_flag / data.total) * 100).toFixed(1)}% of dataset
              </div>
            </div>
            <div className="flex items-center gap-3">
              {data.overlap.by_flag_count.map((o) => (
                <div key={o.flags} className="text-center">
                  <div className="text-lg font-bold font-mono tabular-nums text-red-500">{o.count}</div>
                  <div className="text-[10px] text-red-400">{o.flags} flag{o.flags > 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategyOrder.map((id) => {
            const strategy = data.strategies[id]
            if (!strategy) return null
            return <StrategyCard key={id} id={id} strategy={strategy} total={data.total} onRefresh={handleRefresh} />
          })}
        </div>

        {/* Source Diversity */}
        {data.sources && data.sources.top.length > 0 && (() => {
          const top5Count = data.sources.top.slice(0, 5).reduce((s, r) => s + r.count, 0)
          const top5Pct = data.sources.total > 0 ? ((top5Count / data.sources.total) * 100).toFixed(1) : '0'
          const topSourcePct = data.sources.total > 0 ? ((data.sources.top[0].count / data.sources.total) * 100).toFixed(1) : '0'
          const maxCount = data.sources.top[0]?.count ?? 0

          return (
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Source Diversity</h3>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                    <span className="font-mono font-semibold">{data.sources.unique_count}</span> unique sources across{' '}
                    <span className="font-mono font-semibold">{data.sources.total.toLocaleString()}</span> prompts
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    Top 5 concentration
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-amber-500">{top5Pct}%</div>
                </div>
              </div>

              {Number(topSourcePct) > 15 && (
                <div className="mt-3 mb-4 rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  Top source <span className="font-mono font-semibold">@{data.sources.top[0].handle}</span> contributes{' '}
                  <span className="font-mono font-semibold">{topSourcePct}%</span> of all prompts — potential bias risk
                </div>
              )}

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                      <th className="text-left pb-2 pr-2 w-8">#</th>
                      <th className="text-left pb-2 pr-2">Handle</th>
                      <th className="text-right pb-2 pr-2 w-16">Prompts</th>
                      <th className="text-right pb-2 pr-2 w-16">% Total</th>
                      <th className="pb-2 pr-2 w-32"></th>
                      <th className="text-right pb-2 pr-2 w-16">Avg Conf</th>
                      <th className="text-right pb-2 w-12">Cats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sources.top.map((row, i) => {
                      const rowPct = data.sources.total > 0 ? ((row.count / data.sources.total) * 100).toFixed(1) : '0'
                      return (
                        <tr key={row.handle} className={i % 2 === 1 ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''}>
                          <td className="py-1.5 pr-2 text-xs text-gray-400 dark:text-zinc-500 font-mono">{i + 1}</td>
                          <td className="py-1.5 pr-2 text-xs text-violet-600 dark:text-violet-400 font-medium">@{row.handle}</td>
                          <td className="py-1.5 pr-2 text-xs font-mono tabular-nums text-right text-gray-700 dark:text-zinc-300">{row.count.toLocaleString()}</td>
                          <td className="py-1.5 pr-2 text-xs font-mono tabular-nums text-right text-gray-400 dark:text-zinc-500">{rowPct}%</td>
                          <td className="py-1.5 pr-2">
                            <Bar value={row.count} max={maxCount} color="#8b5cf6" />
                          </td>
                          <td className="py-1.5 pr-2 text-xs font-mono tabular-nums text-right text-gray-500 dark:text-zinc-400">{row.avg_confidence.toFixed(2)}</td>
                          <td className="py-1.5 text-xs font-mono tabular-nums text-right text-gray-500 dark:text-zinc-400">{row.categories}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}

        {/* Length distribution */}
        <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Prompt length distribution</h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">Character count of extracted_prompt - helps calibrate the &quot;too short&quot; threshold</p>
          <div className="flex flex-col gap-1.5">
            {data.distributions.prompt_length.map((b) => (
              <div key={b.bucket} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-500 dark:text-zinc-400 w-20 text-right shrink-0">{b.bucket}</span>
                <Bar value={b.count} max={maxLen} color="#8b5cf6" />
                <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 w-12 text-right shrink-0">{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation guide */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/6 bg-black/[0.02] dark:bg-white/[0.02] p-5 text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
          <p className="font-semibold text-gray-700 dark:text-zinc-300 mb-2">How to read this</p>
          <ul className="list-disc pl-4 flex flex-col gap-1">
            <li><strong>Safe to cull:</strong> exact duplicates (keep 1, drop extras), no extraction + no category (classifier failed)</li>
            <li><strong>Review first:</strong> too short (some are valid e.g. &quot;a dog in a spacesuit, 4k&quot;), same-as-tweet (some tweets ARE the prompt)</li>
            <li><strong>Context-dependent:</strong> no model (prompt is still useful), no media (text-only prompts like system prompts)</li>
            <li><strong>Overlap column:</strong> rows hitting 3+ flags are almost certainly garbage</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
