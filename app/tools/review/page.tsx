'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

interface ReviewPrompt {
  id: string
  tweet_id: string
  extracted_prompt: string | null
  tweet_text: string
  detected_model: string | null
  prompt_category: string | null
  confidence: number
  tweet_url: string | null
  media_urls: string[] | null
  quality_rating: number | null
  author_handle: string
}

type Direction = 'left' | 'right' | 'down' | null

const RATING_LABELS: Record<number, string> = { 1: 'cull', 2: 'maybe', 3: 'keep' }

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const val = Number(confidence)
  const color =
    val < 0.5
      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
      : val < 0.8
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-mono font-medium ${color}`}>
      {val.toFixed(2)}
    </span>
  )
}

export default function ReviewPage() {
  const [author, setAuthor] = useState('LudovicCreator')
  const [authorInput, setAuthorInput] = useState('LudovicCreator')
  const [prompts, setPrompts] = useState<ReviewPrompt[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [reviewed, setReviewed] = useState(0)
  const [direction, setDirection] = useState<Direction>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [undoStack, setUndoStack] = useState<{ id: string; index: number }[]>([])
  const [localRatings, setLocalRatings] = useState<Record<string, number>>({})
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const animating = useRef(false)

  const fetchPrompts = useCallback(async (handle: string) => {
    setLoading(true)
    setCurrentIndex(0)
    setUndoStack([])
    setLocalRatings({})
    try {
      const res = await fetch(`/api/prompts/review?author=${encodeURIComponent(handle)}`)
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setPrompts(data.prompts)
      setTotal(data.total)
      setReviewed(data.reviewed)
    } catch {
      setPrompts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrompts(author)
  }, [author, fetchPrompts])

  const showToast = useCallback((msg: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast(msg)
    toastTimeout.current = setTimeout(() => setToast(null), 1500)
  }, [])

  const ratePrompt = useCallback(async (rating: 1 | 2 | 3) => {
    if (animating.current) return
    if (currentIndex >= prompts.length) return

    const prompt = prompts[currentIndex]
    animating.current = true

    // Set direction for animation
    const dir: Direction = rating === 1 ? 'left' : rating === 3 ? 'right' : 'down'
    setDirection(dir)

    // Save rating
    setLocalRatings(prev => ({ ...prev, [prompt.id]: rating }))
    setUndoStack(prev => [...prev, { id: prompt.id, index: currentIndex }])
    setReviewed(prev => prev + 1)

    fetch('/api/prompts/review/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prompt.id, rating }),
    }).catch(() => {})

    showToast(`+1 ${RATING_LABELS[rating]}`)

    // After animation, advance
    setTimeout(() => {
      setDirection(null)
      setCurrentIndex(i => i + 1)
      animating.current = false
    }, 250)
  }, [currentIndex, prompts, showToast])

  const undoLast = useCallback(async () => {
    if (animating.current) return
    if (undoStack.length === 0) return

    const last = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    setLocalRatings(prev => {
      const next = { ...prev }
      delete next[last.id]
      return next
    })
    setReviewed(prev => prev - 1)
    setCurrentIndex(last.index)

    fetch('/api/prompts/review/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: last.id, rating: null }),
    }).catch(() => {})

    showToast('Undid last rating')
  }, [undoStack, showToast])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return
      if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault()
        ratePrompt(1)
      } else if (e.key === '2' || e.key === 'ArrowDown') {
        e.preventDefault()
        ratePrompt(2)
      } else if (e.key === '3' || e.key === 'ArrowRight') {
        e.preventDefault()
        ratePrompt(3)
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault()
        undoLast()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ratePrompt, undoLast])

  const prompt = currentIndex < prompts.length ? prompts[currentIndex] : null
  const allDone = !loading && currentIndex >= prompts.length
  const reviewedCount = reviewed
  const progressPct = total > 0 ? Math.min(100, (reviewedCount / total) * 100) : 0

  // Summary counts from local ratings
  const cullCount = Object.values(localRatings).filter(r => r === 1).length
  const maybeCount = Object.values(localRatings).filter(r => r === 2).length
  const keepCount = Object.values(localRatings).filter(r => r === 3).length

  const doBulkCull = async () => {
    if (!window.confirm(`Permanently delete ALL ${cullCount} cull-rated prompts from the database? This cannot be undone.`)) return
    try {
      const res = await fetch('/api/prompts/review/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cull' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      showToast(`Deleted ${data.deleted} prompts`)
      // Refresh
      fetchPrompts(author)
    } catch (err) {
      alert(`Error: ${err}`)
    }
  }

  const reviewMaybes = () => {
    // Refetch will get items where quality_rating IS NULL (already reviewed ones won't show)
    // We need to re-rate maybes: set them to NULL first
    const maybeIds = Object.entries(localRatings).filter(([, r]) => r === 2).map(([id]) => id)
    Promise.all(
      maybeIds.map(id =>
        fetch('/api/prompts/review/rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, rating: null }),
        })
      )
    ).then(() => fetchPrompts(author))
  }

  // Image detection
  const getImageUrl = (p: ReviewPrompt): string | null => {
    const urls = p.media_urls ?? []
    const img = urls.find(u =>
      u && (u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.gif') || u.includes('pbs.twimg.com'))
    )
    return img ?? null
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 gap-5">

        {/* Header */}
        <div>
          <Link href="/tools" className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
            &larr; Tools
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-2">Prompt Review</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Swipe through prompts. Keep the good, cull the bad.
          </p>
        </div>

        {/* Author filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-zinc-400 shrink-0">Author:</label>
          <input
            type="text"
            value={authorInput}
            onChange={e => setAuthorInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setAuthor(authorInput.trim()) }}
            className="flex-1 rounded-lg border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            placeholder="e.g. LudovicCreator"
          />
          <button
            onClick={() => setAuthor(authorInput.trim())}
            className="rounded-lg border border-black/[0.08] dark:border-white/8 px-3 py-1.5 text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors"
          >
            Filter
          </button>
          <button
            onClick={() => { setAuthorInput(''); setAuthor('') }}
            className="rounded-lg border border-black/[0.08] dark:border-white/8 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/5 transition-colors"
          >
            All
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mb-1">
            <span className="font-mono tabular-nums">{reviewedCount}/{total} reviewed</span>
            <span className="font-mono tabular-nums">{progressPct.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <svg className="h-6 w-6 animate-spin text-gray-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}

        {/* All done summary */}
        {allDone && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16">
            <div className="text-4xl">Done!</div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-3xl font-bold font-mono text-green-500">{keepCount}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">keep</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono text-amber-500">{maybeCount}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">maybe</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono text-red-500">{cullCount}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">cull</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              {cullCount > 0 && (
                <button
                  onClick={doBulkCull}
                  className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 transition-colors active:scale-95"
                >
                  Cull {cullCount} prompts
                </button>
              )}
              {maybeCount > 0 && (
                <button
                  onClick={reviewMaybes}
                  className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-semibold py-3 px-6 transition-colors hover:bg-amber-100 dark:hover:bg-amber-950/50 active:scale-95"
                >
                  Re-review {maybeCount} maybes
                </button>
              )}
              <button
                onClick={() => fetchPrompts(author)}
                className="w-full rounded-xl border border-black/[0.08] dark:border-white/8 text-gray-500 dark:text-zinc-400 font-medium py-3 px-6 transition-colors hover:bg-black/[0.04] dark:hover:bg-white/5 active:scale-95"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {/* The Card */}
        {!loading && prompt && (
          <div className="flex-1 flex flex-col gap-5">
            <div
              className={`rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] shadow-lg overflow-hidden transition-all duration-200 ${
                direction === 'left'
                  ? '-translate-x-full opacity-0'
                  : direction === 'right'
                    ? 'translate-x-full opacity-0'
                    : direction === 'down'
                      ? 'translate-y-24 opacity-0'
                      : 'translate-x-0 opacity-100'
              }`}
            >
              {/* Media preview */}
              {getImageUrl(prompt) && (
                <div className="border-b border-black/[0.06] dark:border-white/6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(prompt)!}
                    alt=""
                    className="w-full max-h-80 object-contain bg-black/[0.02] dark:bg-white/[0.02]"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="p-5 md:p-6 flex flex-col gap-4">
                {/* Prompt text */}
                <pre className="whitespace-pre-wrap break-words text-sm md:text-base leading-relaxed text-gray-700 dark:text-zinc-200 font-mono max-h-64 overflow-y-auto">
                  {prompt.extracted_prompt ?? prompt.tweet_text ?? '(no prompt)'}
                </pre>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-2">
                  {prompt.detected_model && (
                    <span className="rounded-full border border-black/[0.1] dark:border-white/10 bg-black/[0.04] dark:bg-white/5 px-2.5 py-1 text-xs text-gray-600 dark:text-zinc-300">
                      {prompt.detected_model}
                    </span>
                  )}
                  {prompt.prompt_category && (
                    <span className="rounded-full border border-violet-200 dark:border-violet-800/40 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 text-xs text-violet-700 dark:text-violet-300">
                      {prompt.prompt_category}
                    </span>
                  )}
                  <ConfidenceBadge confidence={prompt.confidence} />
                  <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto">
                    @{prompt.author_handle}
                  </span>
                  {prompt.tweet_url && (
                    <a
                      href={prompt.tweet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 dark:text-zinc-500 hover:text-[#1DA1F2] transition-colors"
                      title="View source"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Rating buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => ratePrompt(1)}
                className="flex flex-col items-center gap-1 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 py-4 px-3 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-950/50 transition-all active:scale-95"
              >
                <span className="text-2xl">&#x1F5D1;</span>
                <span>Cull</span>
                <kbd className="text-[10px] font-mono opacity-50">1 / &larr;</kbd>
              </button>
              <button
                onClick={() => ratePrompt(2)}
                className="flex flex-col items-center gap-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 py-4 px-3 font-semibold text-sm hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all active:scale-95"
              >
                <span className="text-2xl">&#x1F914;</span>
                <span>Maybe</span>
                <kbd className="text-[10px] font-mono opacity-50">2 / &darr;</kbd>
              </button>
              <button
                onClick={() => ratePrompt(3)}
                className="flex flex-col items-center gap-1 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 text-green-600 dark:text-green-400 py-4 px-3 font-semibold text-sm hover:bg-green-100 dark:hover:bg-green-950/50 transition-all active:scale-95"
              >
                <span className="text-2xl">&#x2705;</span>
                <span>Keep</span>
                <kbd className="text-[10px] font-mono opacity-50">3 / &rarr;</kbd>
              </button>
            </div>

            {/* Undo + keyboard legend */}
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
              <button
                onClick={undoLast}
                disabled={undoStack.length === 0}
                className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <kbd className="rounded bg-black/[0.04] dark:bg-white/5 border border-black/[0.08] dark:border-white/8 px-1.5 py-0.5 mr-1">U</kbd>
                Undo
              </button>
              <span className="font-mono tabular-nums">
                {currentIndex + 1} / {prompts.length}
              </span>
            </div>
          </div>
        )}

        {/* No prompts found */}
        {!loading && !prompt && !allDone && (
          <div className="flex-1 flex items-center justify-center py-20 text-gray-400 dark:text-zinc-500 text-sm">
            No unreviewed prompts found{author ? ` for @${author}` : ''}.
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 text-sm font-medium shadow-xl animate-bounce-in z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
