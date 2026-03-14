'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { CategoryCounts } from '@/lib/types'

// Keep in sync with app/api/reddit/ingest/route.ts
const PROMPT_SUBREDDITS = [
  'midjourney',
  'StableDiffusion',
  'dalle',
  'FluxAI',
  'AIArt',
  'PromptEngineering',
  'aipromptprogramming',
]

interface ClassifyResult {
  classified: number
  total: number
  message?: string
  errors?: string[]
}

// ── Shared UI ─────────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h2>
      <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">{description}</p>
      {children}
    </div>
  )
}

function ProgressBar({ pct, indeterminate = false, color = 'bg-[#1DA1F2]' }: {
  pct?: number
  indeterminate?: boolean
  color?: string
}) {
  return (
    <div className="h-1 w-full rounded-full bg-black/[0.06] dark:bg-white/8 overflow-hidden relative">
      {indeterminate ? (
        <div
          className={`absolute h-full w-1/3 rounded-full ${color}`}
          style={{ animation: 'indeterminate 1.6s ease-in-out infinite' }}
        />
      ) : (
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct ?? 0}%` }}
        />
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function ElapsedTimer({ running }: { running: boolean }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!running) { setSecs(0); return }
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])
  if (!running) return null
  return <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums">{secs}s</span>
}

function ResultLine({ result, errors }: { result: string; errors?: string[] }) {
  const hasErrors = (errors?.length ?? 0) > 0
  return (
    <div className="mt-3 text-xs text-gray-500 dark:text-zinc-400 flex flex-col gap-1">
      <span>{result}</span>
      {hasErrors && (
        <details className="mt-0.5">
          <summary className="text-red-400/80 cursor-pointer select-none">
            {errors!.length} error{errors!.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-1 flex flex-col gap-0.5 pl-2 border-l border-red-300/30">
            {errors!.map((e, i) => <span key={i} className="font-mono text-red-400/80">{e}</span>)}
          </div>
        </details>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const [counts, setCounts] = useState<CategoryCounts | null>(null)
  const [unclassifiedPrompts, setUnclassifiedPrompts] = useState<number | null>(null)

  // Classify bookmarks
  const [classifyingMain, setClassifyingMain] = useState(false)
  const [mainResult, setMainResult] = useState<string | null>(null)
  const [mainErrors, setMainErrors] = useState<string[]>([])

  // Classify prompts
  const [classifyingPrompts, setClassifyingPrompts] = useState(false)
  const [promptsResult, setPromptsResult] = useState<string | null>(null)
  const [promptsErrors, setPromptsErrors] = useState<string[]>([])

  // Reddit ingest
  const [selectedSubs, setSelectedSubs] = useState<string[]>(PROMPT_SUBREDDITS)
  const [redditTimeFilter, setRedditTimeFilter] = useState<'week' | 'month' | 'year' | 'all'>('week')
  const [redditLimit, setRedditLimit] = useState(50)
  const [redditMinScore, setRedditMinScore] = useState(10)
  const [redditFetchComments, setRedditFetchComments] = useState(true)
  const [fetchingReddit, setFetchingReddit] = useState(false)
  const [redditProgress, setRedditProgress] = useState<{ done: number; total: number; current: string } | null>(null)
  const [redditResult, setRedditResult] = useState<string | null>(null)
  const [redditErrors, setRedditErrors] = useState<string[]>([])

  // Re-classify
  const [reclassifying, setReclassifying] = useState(false)
  const [reclassifyTotal, setReclassifyTotal] = useState<number | null>(null)
  const [reclassifyDone, setReclassifyDone] = useState(0)
  const [reclassifyResult, setReclassifyResult] = useState<string | null>(null)
  const [reclassifyErrors, setReclassifyErrors] = useState<string[]>([])
  const cancelReclassify = useRef(false)

  const fetchCounts = useCallback(async () => {
    const [countsRes, promptsRes] = await Promise.all([
      fetch('/api/bookmarks/counts'),
      fetch('/api/prompts/classify'),
    ])
    if (countsRes.ok) setCounts(await countsRes.json())
    if (promptsRes.ok) setUnclassifiedPrompts((await promptsRes.json()).unclassified)
  }, [])

  useEffect(() => { fetchCounts() }, [fetchCounts])

  async function runMainClassify() {
    setClassifyingMain(true)
    setMainResult(null)
    setMainErrors([])
    try {
      const res = await fetch('/api/classify', { method: 'POST' })
      const data: ClassifyResult = await res.json()
      setMainResult(data.message ?? `Classified ${data.classified} of ${data.total} bookmarks`)
      setMainErrors(data.errors ?? [])
      fetchCounts()
    } catch (err) {
      setMainResult(`Failed: ${String(err)}`)
    } finally {
      setClassifyingMain(false)
    }
  }

  async function runPromptClassify() {
    setClassifyingPrompts(true)
    setPromptsResult(null)
    setPromptsErrors([])
    try {
      const res = await fetch('/api/prompts/classify', { method: 'POST' })
      const data: ClassifyResult = await res.json()
      setPromptsResult(data.message ?? `Classified ${data.classified} of ${data.total} prompts`)
      setPromptsErrors(data.errors ?? [])
      fetchCounts()
    } catch (err) {
      setPromptsResult(`Failed: ${String(err)}`)
    } finally {
      setClassifyingPrompts(false)
    }
  }

  async function runRedditIngest() {
    setFetchingReddit(true)
    setRedditResult(null)
    setRedditErrors([])
    setRedditProgress({ done: 0, total: selectedSubs.length, current: selectedSubs[0] })

    let totalInserted = 0
    let totalSkipped = 0
    const errors: string[] = []

    for (let i = 0; i < selectedSubs.length; i++) {
      const sub = selectedSubs[i]
      setRedditProgress({ done: i, total: selectedSubs.length, current: sub })
      try {
        const res = await fetch('/api/reddit/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subreddits: [sub],
            timeFilter: redditTimeFilter,
            limit: redditLimit,
            minScore: redditMinScore,
            fetchComments: redditFetchComments,
          }),
        })
        const data = await res.json()
        if (data.error) { errors.push(`r/${sub}: ${data.error}`); continue }
        totalInserted += data.inserted ?? 0
        totalSkipped += data.skipped ?? 0
        const subErrors = (data.subreddits ?? [])
          .filter((s: { error?: string }) => s.error)
          .map((s: { subreddit: string; error: string }) => `r/${s.subreddit}: ${s.error}`)
        errors.push(...subErrors)
      } catch (err) {
        errors.push(`r/${sub}: ${String(err)}`)
      }
      setRedditErrors([...errors])
    }

    setRedditProgress({ done: selectedSubs.length, total: selectedSubs.length, current: '' })
    setRedditResult(`Inserted ${totalInserted} new posts (${totalSkipped} duplicates) across ${selectedSubs.length} subreddits`)
    setRedditErrors([...errors])
    setFetchingReddit(false)
    fetchCounts()
  }

  async function runReclassify() {
    cancelReclassify.current = false
    setReclassifying(true)
    setReclassifyResult(null)
    setReclassifyErrors([])
    setReclassifyDone(0)
    setReclassifyTotal(null)

    try {
      const countRes = await fetch('/api/prompts/reclassify')
      const { total } = await countRes.json()
      setReclassifyTotal(total)

      const BATCH = 5
      let offset = 0
      let totalClassified = 0
      const allErrors: string[] = []

      while (offset < total) {
        if (cancelReclassify.current) {
          setReclassifyResult(`Cancelled after ${totalClassified} of ${total} prompts`)
          break
        }
        const res = await fetch('/api/prompts/reclassify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: BATCH, offset }),
        })
        const text = await res.text()
        let data: { classified: number; batchTotal: number; errors: string[]; error?: string }
        try { data = JSON.parse(text) } catch {
          allErrors.push(`Offset ${offset}: server error ${res.status}`)
          setReclassifyErrors([...allErrors])
          break
        }
        if (data.error) { allErrors.push(`Offset ${offset}: ${data.error}`); break }
        totalClassified += data.classified
        allErrors.push(...data.errors)
        offset += BATCH
        setReclassifyDone(Math.min(offset, total))
        setReclassifyErrors([...allErrors])
        if (data.batchTotal === 0) break
      }

      if (!cancelReclassify.current) {
        setReclassifyResult(`Re-classified ${totalClassified} of ${total} prompts`)
      }
      fetchCounts()
    } catch (err) {
      setReclassifyResult(`Failed: ${String(err)}`)
    } finally {
      setReclassifying(false)
    }
  }

  return (
    <>
      <style>{`@keyframes indeterminate { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }`}</style>
      <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Tools</h1>
            <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">AI classification and data management</p>
          </div>

          {/* Counts */}
          {counts && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total',      value: counts.all },
                { label: 'Pending AI', value: counts.pending },
                { label: 'Prompts',    value: counts.prompts },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-4 text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Classify Bookmarks */}
          <Section
            title="Classify Bookmarks"
            description={`Run Sonnet on all unclassified bookmarks to sort them into Tech / Career / Prompts / Uncategorized. ${counts?.pending ?? '…'} pending.`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={runMainClassify}
                  disabled={classifyingMain}
                  className="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/90 px-4 py-2 text-sm font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-50 transition-colors"
                >
                  {classifyingMain && <Spinner />}
                  {classifyingMain ? 'Classifying…' : 'Run Classifier'}
                </button>
                <ElapsedTimer running={classifyingMain} />
              </div>
              {classifyingMain && <ProgressBar indeterminate />}
              {mainResult && <ResultLine result={mainResult} errors={mainErrors} />}
            </div>
          </Section>

          {/* Classify Prompts */}
          <Section
            title="Classify Prompts"
            description={`Run Sonnet on bookmarks tagged as Prompts to extract categories, themes, models, and reference image requirements. ${unclassifiedPrompts ?? '…'} unclassified.`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={runPromptClassify}
                  disabled={classifyingPrompts}
                  className="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/90 px-4 py-2 text-sm font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-50 transition-colors"
                >
                  {classifyingPrompts && <Spinner />}
                  {classifyingPrompts ? 'Classifying…' : 'Run Prompt Classifier'}
                </button>
                <ElapsedTimer running={classifyingPrompts} />
              </div>
              {classifyingPrompts && <ProgressBar indeterminate />}
              {promptsResult && <ResultLine result={promptsResult} errors={promptsErrors} />}
            </div>
          </Section>

          {/* Reddit Ingest */}
          <Section
            title="Fetch from Reddit"
            description="Pull top posts from AI prompt subreddits using Reddit's public API. Posts are ingested as unclassified bookmarks — run the classifiers afterwards."
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {PROMPT_SUBREDDITS.map((sub) => {
                  const active = selectedSubs.includes(sub)
                  const isCurrent = fetchingReddit && redditProgress?.current === sub
                  return (
                    <button
                      key={sub}
                      onClick={() => !fetchingReddit && setSelectedSubs(active ? selectedSubs.filter((s) => s !== sub) : [...selectedSubs, sub])}
                      className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        isCurrent
                          ? 'bg-orange-500/20 border-orange-500/40 text-orange-600 dark:text-orange-400 animate-pulse'
                          : active
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
                          : 'bg-black/[0.03] dark:bg-white/5 border-black/[0.08] dark:border-white/8 text-gray-400 dark:text-zinc-500'
                      }`}
                    >
                      r/{sub}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 dark:text-zinc-500">Time</label>
                  <select value={redditTimeFilter} onChange={(e) => setRedditTimeFilter(e.target.value as typeof redditTimeFilter)}
                    className="rounded-lg border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/5 px-2 py-1.5 text-xs text-gray-700 dark:text-zinc-300"
                  >
                    <option value="week">Past week</option>
                    <option value="month">Past month</option>
                    <option value="year">Past year</option>
                    <option value="all">All time</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 dark:text-zinc-500">Posts/sub</label>
                  <select value={redditLimit} onChange={(e) => setRedditLimit(Number(e.target.value))}
                    className="rounded-lg border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/5 px-2 py-1.5 text-xs text-gray-700 dark:text-zinc-300"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 dark:text-zinc-500">Min score</label>
                  <select value={redditMinScore} onChange={(e) => setRedditMinScore(Number(e.target.value))}
                    className="rounded-lg border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/5 px-2 py-1.5 text-xs text-gray-700 dark:text-zinc-300"
                  >
                    <option value={0}>Any</option>
                    <option value={10}>10+</option>
                    <option value={50}>50+</option>
                    <option value={100}>100+</option>
                  </select>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={redditFetchComments} onChange={(e) => setRedditFetchComments(e.target.checked)} className="rounded" />
                  <span className="text-xs text-gray-400 dark:text-zinc-500">Fetch comments</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={runRedditIngest}
                  disabled={fetchingReddit || selectedSubs.length === 0}
                  className="flex items-center gap-2 self-start rounded-lg bg-orange-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-50 transition-colors"
                >
                  {fetchingReddit && <Spinner />}
                  {fetchingReddit ? 'Fetching…' : 'Fetch Posts'}
                </button>
                {fetchingReddit && redditProgress && (
                  <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums">
                    {redditProgress.done} / {redditProgress.total} subreddits
                  </span>
                )}
              </div>

              {fetchingReddit && redditProgress && (
                <ProgressBar
                  pct={redditProgress.total > 0 ? (redditProgress.done / redditProgress.total) * 100 : 0}
                  color="bg-orange-500"
                />
              )}

              {redditResult && <ResultLine result={redditResult} errors={redditErrors} />}
            </div>
          </Section>

          {/* Re-classify All */}
          <Section
            title="Re-classify All Prompts"
            description="Force re-run classification on every prompt in batches — useful to backfill themes, art styles, or model data added since the last run."
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={runReclassify}
                  disabled={reclassifying}
                  className="flex items-center gap-2 rounded-lg bg-black/[0.06] dark:bg-white/8 border border-black/[0.1] dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-black/[0.1] dark:hover:bg-white/12 disabled:opacity-50 transition-colors"
                >
                  {reclassifying && <Spinner />}
                  {reclassifying ? 'Re-classifying…' : 'Re-classify All'}
                </button>
                {reclassifying && (
                  <button
                    onClick={() => { cancelReclassify.current = true }}
                    className="rounded-lg border border-red-300/50 dark:border-red-800/50 px-3 py-2 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                {reclassifying && reclassifyTotal !== null && (
                  <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums">
                    {reclassifyDone} / {reclassifyTotal}
                  </span>
                )}
              </div>

              {reclassifying && reclassifyTotal !== null && (
                <ProgressBar pct={(reclassifyDone / reclassifyTotal) * 100} />
              )}
              {reclassifying && reclassifyTotal === null && <ProgressBar indeterminate />}

              {reclassifyResult && <ResultLine result={reclassifyResult} errors={reclassifyErrors} />}
            </div>
          </Section>

        </div>
      </div>
    </>
  )
}
