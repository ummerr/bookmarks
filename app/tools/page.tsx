'use client'

import { useState, useEffect, useRef } from 'react'
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

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h2>
      <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">{description}</p>
      {children}
    </div>
  )
}

function ResultLine({ result, errors }: { result: string; errors?: string[] }) {
  return (
    <div className="mt-3 text-xs text-gray-500 dark:text-zinc-400 flex flex-col gap-1">
      <span>{result}</span>
      {errors?.map((e, i) => (
        <span key={i} className="text-red-400/80 font-mono">{e}</span>
      ))}
    </div>
  )
}

export default function ToolsPage() {
  const [counts, setCounts] = useState<CategoryCounts | null>(null)
  const [unclassifiedPrompts, setUnclassifiedPrompts] = useState<number | null>(null)

  const [classifyingMain, setClassifyingMain] = useState(false)
  const [mainResult, setMainResult] = useState<string | null>(null)
  const [mainErrors, setMainErrors] = useState<string[]>([])

  const [classifyingPrompts, setClassifyingPrompts] = useState(false)
  const [promptsResult, setPromptsResult] = useState<string | null>(null)
  const [promptsErrors, setPromptsErrors] = useState<string[]>([])

  const [reclassifying, setReclassifying] = useState(false)
  const [reclassifyTotal, setReclassifyTotal] = useState<number | null>(null)
  const [reclassifyDone, setReclassifyDone] = useState(0)
  const [reclassifyResult, setReclassifyResult] = useState<string | null>(null)
  const [reclassifyErrors, setReclassifyErrors] = useState<string[]>([])
  const cancelReclassify = useRef(false)

  // Reddit ingest
  const [selectedSubs, setSelectedSubs] = useState<string[]>(PROMPT_SUBREDDITS)
  const [redditTimeFilter, setRedditTimeFilter] = useState<'week' | 'month' | 'year' | 'all'>('week')
  const [redditLimit, setRedditLimit] = useState(50)
  const [redditMinScore, setRedditMinScore] = useState(10)
  const [redditFetchComments, setRedditFetchComments] = useState(true)
  const [fetchingReddit, setFetchingReddit] = useState(false)
  const [redditResult, setRedditResult] = useState<string | null>(null)
  const [redditErrors, setRedditErrors] = useState<string[]>([])

  async function fetchCounts() {
    const [countsRes, promptsRes] = await Promise.all([
      fetch('/api/bookmarks/counts'),
      fetch('/api/prompts/classify'),
    ])
    if (countsRes.ok) setCounts(await countsRes.json())
    if (promptsRes.ok) {
      const d = await promptsRes.json()
      setUnclassifiedPrompts(d.unclassified)
    }
  }

  useEffect(() => { fetchCounts() }, [])

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
      const base = data.message ?? `Classified ${data.classified} of ${data.total} prompts`
      setPromptsResult(base)
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
    try {
      const res = await fetch('/api/reddit/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subreddits: selectedSubs, timeFilter: redditTimeFilter, limit: redditLimit, minScore: redditMinScore, fetchComments: redditFetchComments }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRedditResult(`Inserted ${data.inserted} new posts (${data.skipped} duplicates) across ${selectedSubs.length} subreddits`)
      const subErrors = (data.subreddits ?? []).filter((s: { error?: string }) => s.error).map((s: { subreddit: string; error: string }) => `r/${s.subreddit}: ${s.error}`)
      setRedditErrors(subErrors)
      fetchCounts()
    } catch (err) {
      setRedditResult(`Failed: ${String(err)}`)
    } finally {
      setFetchingReddit(false)
    }
  }

  async function runReclassify() {
    cancelReclassify.current = false
    setReclassifying(true)
    setReclassifyResult(null)
    setReclassifyErrors([])
    setReclassifyDone(0)
    setReclassifyTotal(null)

    try {
      // Get total count first
      const countRes = await fetch('/api/prompts/reclassify')
      const { total } = await countRes.json()
      setReclassifyTotal(total)

      const BATCH = 50
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
        try {
          data = JSON.parse(text)
        } catch {
          allErrors.push(`Offset ${offset}: Server error ${res.status}: ${text.slice(0, 150)}`)
          setReclassifyErrors([...allErrors])
          break
        }
        if (data.error) {
          allErrors.push(`Offset ${offset}: ${data.error}`)
          setReclassifyErrors([...allErrors])
          break
        }

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
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Tools</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">AI classification and data management</p>
        </div>

        {/* Counts summary */}
        {counts && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total',        value: counts.all },
              { label: 'Pending AI',   value: counts.pending },
              { label: 'Prompts',      value: counts.prompts },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main classifier */}
        <Section
          title="Classify Bookmarks"
          description={`Run Sonnet on all unclassified bookmarks to sort them into Tech / Career / Prompts / Uncategorized. ${counts?.pending ?? '…'} pending.`}
        >
          <button
            onClick={runMainClassify}
            disabled={classifyingMain}
            className="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/90 px-4 py-2 text-sm font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-50 transition-colors"
          >
            {classifyingMain ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Classifying…
              </>
            ) : 'Run Classifier'}
          </button>
          {mainResult && <ResultLine result={mainResult} errors={mainErrors} />}
        </Section>

        {/* Prompt sub-classifier */}
        <Section
          title="Classify Prompts"
          description={`Run Sonnet on bookmarks tagged as Prompts to extract categories, themes, models, and reference image requirements. ${unclassifiedPrompts ?? '…'} unclassified.`}
        >
          <button
            onClick={runPromptClassify}
            disabled={classifyingPrompts}
            className="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/90 px-4 py-2 text-sm font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-50 transition-colors"
          >
            {classifyingPrompts ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Classifying…
              </>
            ) : 'Run Prompt Classifier'}
          </button>
          {promptsResult && <ResultLine result={promptsResult} errors={promptsErrors} />}
        </Section>

        {/* Reddit ingest */}
        <Section
          title="Fetch from Reddit"
          description="Pull top posts from AI prompt subreddits using Reddit's public API. Posts are ingested as unclassified bookmarks — run the classifiers afterwards."
        >
          <div className="flex flex-col gap-3">
            {/* Subreddit toggles */}
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUBREDDITS.map((sub) => {
                const active = selectedSubs.includes(sub)
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubs(active ? selectedSubs.filter((s) => s !== sub) : [...selectedSubs, sub])}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
                        : 'bg-black/[0.03] dark:bg-white/5 border-black/[0.08] dark:border-white/8 text-gray-400 dark:text-zinc-500'
                    }`}
                  >
                    r/{sub}
                  </button>
                )
              })}
            </div>

            {/* Controls */}
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 dark:text-zinc-500">Time</label>
                <select
                  value={redditTimeFilter}
                  onChange={(e) => setRedditTimeFilter(e.target.value as typeof redditTimeFilter)}
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
                <select
                  value={redditLimit}
                  onChange={(e) => setRedditLimit(Number(e.target.value))}
                  className="rounded-lg border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/5 px-2 py-1.5 text-xs text-gray-700 dark:text-zinc-300"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 dark:text-zinc-500">Min score</label>
                <select
                  value={redditMinScore}
                  onChange={(e) => setRedditMinScore(Number(e.target.value))}
                  className="rounded-lg border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/5 px-2 py-1.5 text-xs text-gray-700 dark:text-zinc-300"
                >
                  <option value={0}>Any</option>
                  <option value={10}>10+</option>
                  <option value={50}>50+</option>
                  <option value={100}>100+</option>
                </select>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={redditFetchComments}
                  onChange={(e) => setRedditFetchComments(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-gray-400 dark:text-zinc-500">Fetch comments</span>
              </label>
            </div>

            <button
              onClick={runRedditIngest}
              disabled={fetchingReddit || selectedSubs.length === 0}
              className="flex items-center gap-2 self-start rounded-lg bg-orange-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-50 transition-colors"
            >
              {fetchingReddit ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Fetching…
                </>
              ) : 'Fetch Posts'}
            </button>
          </div>
          {redditResult && <ResultLine result={redditResult} errors={redditErrors} />}
        </Section>

        {/* Re-classify all */}
        <Section
          title="Re-classify All Prompts"
          description="Force re-run classification on every prompt in batches of 50 — useful to backfill themes, art styles, or model data added since the last run."
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={runReclassify}
                disabled={reclassifying}
                className="flex items-center gap-2 rounded-lg bg-black/[0.06] dark:bg-white/8 border border-black/[0.1] dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-black/[0.1] dark:hover:bg-white/12 disabled:opacity-50 transition-colors"
              >
                {reclassifying ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Re-classifying…
                  </>
                ) : 'Re-classify All'}
              </button>
              {reclassifying && (
                <button
                  onClick={() => { cancelReclassify.current = true }}
                  className="rounded-lg border border-red-300/50 dark:border-red-800/50 px-3 py-2 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Progress bar */}
            {reclassifying && reclassifyTotal !== null && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500">
                  <span>Processing…</span>
                  <span>{reclassifyDone} / {reclassifyTotal}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/[0.06] dark:bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1DA1F2] transition-all duration-500"
                    style={{ width: reclassifyTotal > 0 ? `${Math.round((reclassifyDone / reclassifyTotal) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            )}

            {reclassifyResult && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 dark:text-zinc-400">{reclassifyResult}</span>
                {reclassifyErrors.length > 0 && (
                  <details className="mt-1">
                    <summary className="text-xs text-red-400/80 cursor-pointer select-none">
                      {reclassifyErrors.length} error{reclassifyErrors.length !== 1 ? 's' : ''}
                    </summary>
                    <div className="mt-1 flex flex-col gap-0.5 pl-2 border-l border-red-300/30">
                      {reclassifyErrors.map((e, i) => (
                        <span key={i} className="text-xs text-red-400/80 font-mono">{e}</span>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </Section>

      </div>
    </div>
  )
}
