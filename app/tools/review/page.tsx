'use client'

import { useState, useEffect, useCallback, useRef } from 'react'


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

// Detect special Midjourney/SD tokens in a prompt
function detectTokens(text: string): string[] {
  const tokens: string[] = []
  const patterns = ['--ar', '--v', '--sref', '--style', '--no', '--q', '--s', '--c', '--niji', '--tile', '--iw', '--cref', '--sw', '--cw']
  for (const p of patterns) {
    if (text.toLowerCase().includes(p)) tokens.push(p)
  }
  return tokens
}

// Compute a simple "richness" score 0-5 based on prompt features
function computeRichness(text: string): number {
  let score = 0
  const words = text.split(/\s+/).length
  if (words > 10) score++
  if (words > 30) score++
  if (words > 60) score++
  if (detectTokens(text).length > 0) score++
  if (text.includes(',') && text.split(',').length > 3) score++ // descriptive detail
  return Math.min(5, score)
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const val = Number(confidence)
  const color =
    val < 0.5
      ? 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200/50 dark:border-red-800/30'
      : val < 0.8
        ? 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30'
        : 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30'
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-mono font-semibold border backdrop-blur-sm ${color}`}>
      {val.toFixed(2)}
    </span>
  )
}

// Richness dots indicator
function RichnessDots({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Richness: ${score}/5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
            i <= score
              ? 'bg-violet-500 dark:bg-violet-400'
              : 'bg-black/10 dark:bg-white/10'
          }`}
        />
      ))}
    </span>
  )
}

// Session timer hook
function useSessionTimer() {
  const startTime = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return { elapsed, formatted: `${mins}:${secs.toString().padStart(2, '0')}` }
}

// Animated counter for completion screen
function AnimatedCount({ target, color }: { target: number; color: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let frame: number
    const duration = 800
    const start = Date.now()
    const animate = () => {
      const progress = Math.min(1, (Date.now() - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return <span ref={ref} className={`text-4xl md:text-5xl font-bold font-mono tabular-nums ${color}`}>{count}</span>
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
  const [toast, setToast] = useState<{ msg: string; type: 'keep' | 'cull' | 'maybe' | 'undo' } | null>(null)
  const [undoStack, setUndoStack] = useState<{ id: string; index: number }[]>([])
  const [localRatings, setLocalRatings] = useState<Record<string, number>>({})
  const [showShortcuts, setShowShortcuts] = useState(true)
  const [cardKey, setCardKey] = useState(0) // for re-triggering entrance animation
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const animating = useRef(false)
  const sessionTimer = useSessionTimer()

  // Streak tracking
  const [streak, setStreak] = useState({ count: 0, type: '' })

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

  const showToast = useCallback((msg: string, type: 'keep' | 'cull' | 'maybe' | 'undo' = 'undo') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast({ msg, type })
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

    // Update streak
    const label = RATING_LABELS[rating]
    setStreak(prev => {
      if (prev.type === label) return { count: prev.count + 1, type: label }
      return { count: 1, type: label }
    })

    fetch('/api/prompts/review/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prompt.id, rating }),
    }).catch(() => {})

    const toastType = rating === 3 ? 'keep' : rating === 1 ? 'cull' : 'maybe'
    showToast(`${RATING_LABELS[rating]}`, toastType)

    // After animation, advance
    setTimeout(() => {
      setDirection(null)
      setCurrentIndex(i => i + 1)
      setCardKey(k => k + 1)
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
    setCardKey(k => k + 1)
    setStreak({ count: 0, type: '' })

    fetch('/api/prompts/review/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: last.id, rating: null }),
    }).catch(() => {})

    showToast('Undid last rating', 'undo')
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
      } else if (e.key === '?') {
        setShowShortcuts(prev => !prev)
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
  const sessionTotal = cullCount + maybeCount + keepCount

  // Session stats
  const reviewRate = sessionTimer.elapsed > 0 ? ((sessionTotal / sessionTimer.elapsed) * 60).toFixed(1) : '0.0'

  // Progress bar segment widths
  const keepPct = total > 0 ? (keepCount / total) * 100 : 0
  const maybePct = total > 0 ? (maybeCount / total) * 100 : 0
  const cullPct = total > 0 ? (cullCount / total) * 100 : 0
  const reviewedPriorPct = total > 0 ? (Math.max(0, reviewedCount - sessionTotal) / total) * 100 : 0
  const remainingPct = Math.max(0, 100 - keepPct - maybePct - cullPct - reviewedPriorPct)

  // Dataset health score for completion screen
  const healthScore = sessionTotal > 0 ? Math.round((keepCount / sessionTotal) * 100) : 0

  // Avg confidence for author filter display
  const avgConfidence = prompts.length > 0
    ? (prompts.reduce((sum, p) => sum + Number(p.confidence), 0) / prompts.length).toFixed(2)
    : '0.00'

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
      showToast(`Deleted ${data.deleted} prompts`, 'cull')
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

  // Image detection — media_urls may be a string (JSON) or already parsed array
  const getImageUrl = (p: ReviewPrompt): string | null => {
    let urls: string[] = []
    if (Array.isArray(p.media_urls)) {
      urls = p.media_urls
    } else if (typeof p.media_urls === 'string') {
      try { urls = JSON.parse(p.media_urls) } catch { urls = [] }
    }
    const img = urls.find(u =>
      u && (u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.gif') || u.includes('pbs.twimg.com'))
    )
    return img ?? null
  }

  // Prompt analysis
  const promptText = prompt ? (prompt.extracted_prompt ?? prompt.tweet_text ?? '') : ''
  const wordCount = promptText.split(/\s+/).filter(Boolean).length
  const charCount = promptText.length
  const specialTokens = detectTokens(promptText)
  const richness = computeRichness(promptText)

  return (
    <div className="min-h-[calc(100vh-7rem)] text-gray-900 dark:text-white flex flex-col relative overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* CSS for animations */}
      <style>{`
        @keyframes card-enter {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes toast-up {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes float-dot {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes count-pop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .card-enter-anim {
          animation: card-enter 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .toast-anim {
          animation: toast-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .undo-pulse {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        .count-pop {
          animation: count-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .gradient-border {
          background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2), rgba(139,92,246,0.1), rgba(236,72,153,0.2));
          background-size: 300% 300%;
          animation: gradient-shift 8s ease infinite;
        }
        .celebration-bg {
          background: linear-gradient(135deg, rgba(139,92,246,0.05), rgba(16,185,129,0.05), rgba(245,158,11,0.05));
          background-size: 400% 400%;
          animation: gradient-shift 6s ease infinite;
        }
      `}</style>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 md:px-8 py-5 md:py-8 gap-4 relative z-10">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Prompt Review
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Interactive Dataset Curation Tool
          </p>
        </div>

        {/* Author filter — command palette style */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#111] px-3 py-2 focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-300 dark:focus-within:border-violet-700 transition-all">
              <svg className="w-4 h-4 text-gray-400 dark:text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={authorInput}
                onChange={e => setAuthorInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setAuthor(authorInput.trim()) }}
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-600"
                placeholder="Filter by author handle..."
              />
            </div>
            <button
              onClick={() => setAuthor(authorInput.trim())}
              className="rounded-lg bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 text-xs font-semibold transition-all active:scale-95 shadow-sm shadow-violet-500/20"
            >
              Filter
            </button>
            <button
              onClick={() => { setAuthorInput(''); setAuthor('') }}
              className="rounded-lg border border-black/[0.08] dark:border-white/[0.08] px-3 py-2 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all"
            >
              All
            </button>
          </div>
          {author && !loading && prompts.length > 0 && (
            <div className="flex items-center gap-3 px-1 text-[11px] text-gray-400 dark:text-zinc-500 font-mono">
              <span>{prompts.length} prompts</span>
              <span className="w-px h-3 bg-gray-200 dark:bg-zinc-700" />
              <span>{total > 0 ? ((prompts.length / total) * 100).toFixed(1) : '0'}% of dataset</span>
              <span className="w-px h-3 bg-gray-200 dark:bg-zinc-700" />
              <span>avg conf {avgConfidence}</span>
            </div>
          )}
        </div>

        {/* Session stats bar */}
        {!loading && prompts.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {/* Cards reviewed */}
            <div className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-3 py-2.5 text-center">
              <div className="text-lg font-bold font-mono tabular-nums text-gray-900 dark:text-white">{sessionTotal}</div>
              <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">reviewed</div>
              <div className="text-[10px] font-mono text-violet-500 dark:text-violet-400">{reviewRate}/min</div>
            </div>

            {/* Mini split bar */}
            <div className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-3 py-2.5 flex flex-col items-center justify-center">
              {sessionTotal > 0 ? (
                <>
                  <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-black/[0.05] dark:bg-white/[0.05]">
                    {keepCount > 0 && (
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(keepCount / sessionTotal) * 100}%` }} />
                    )}
                    {maybeCount > 0 && (
                      <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${(maybeCount / sessionTotal) * 100}%` }} />
                    )}
                    {cullCount > 0 && (
                      <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${(cullCount / sessionTotal) * 100}%` }} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400">{keepCount}</span>
                    <span className="text-amber-600 dark:text-amber-400">{maybeCount}</span>
                    <span className="text-rose-600 dark:text-rose-400">{cullCount}</span>
                  </div>
                </>
              ) : (
                <div className="text-[10px] text-gray-300 dark:text-zinc-600">no ratings yet</div>
              )}
            </div>

            {/* Session timer */}
            <div className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-3 py-2.5 text-center">
              <div className="text-lg font-bold font-mono tabular-nums text-gray-900 dark:text-white">{sessionTimer.formatted}</div>
              <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">session</div>
            </div>

            {/* Streak */}
            <div className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-3 py-2.5 text-center">
              <div className={`text-lg font-bold font-mono tabular-nums ${
                streak.count >= 3
                  ? streak.type === 'keep' ? 'text-emerald-500' : streak.type === 'cull' ? 'text-rose-500' : 'text-amber-500'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {streak.count > 0 ? streak.count : '-'}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">streak</div>
              {streak.count > 0 && (
                <div className="text-[10px] font-mono text-gray-400 dark:text-zinc-500">{streak.type}</div>
              )}
            </div>
          </div>
        )}

        {/* Segmented progress bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400 mb-1.5 font-mono tabular-nums">
            <span>{reviewedCount} / {total} reviewed</span>
            <span>{progressPct.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 bg-black/[0.04] dark:bg-white/[0.04] rounded-full overflow-hidden flex">
            {keepPct > 0 && (
              <div className="h-full bg-emerald-500 transition-all duration-500 first:rounded-l-full" style={{ width: `${keepPct}%` }} />
            )}
            {maybePct > 0 && (
              <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${maybePct}%` }} />
            )}
            {cullPct > 0 && (
              <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${cullPct}%` }} />
            )}
            {reviewedPriorPct > 0 && (
              <div className="h-full bg-violet-400/40 transition-all duration-500" style={{ width: `${reviewedPriorPct}%` }} />
            )}
            {remainingPct > 0 && (
              <div className="h-full transition-all duration-500 last:rounded-r-full" style={{ width: `${remainingPct}%` }} />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 dark:text-zinc-500">
            {keepCount > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{keepCount} keep</span>}
            {maybeCount > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{maybeCount} maybe</span>}
            {cullCount > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" />{cullCount} cull</span>}
            <span className="ml-auto font-mono tabular-nums">{total - reviewedCount} remaining</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <svg className="h-8 w-8 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm text-gray-400 dark:text-zinc-500">Loading prompts...</span>
            </div>
          </div>
        )}

        {/* All done — completion screen */}
        {allDone && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12 celebration-bg rounded-2xl relative overflow-hidden">
            {/* Floating celebration dots */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${4 + (i % 3) * 3}px`,
                  height: `${4 + (i % 3) * 3}px`,
                  background: ['#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'][i],
                  left: `${10 + i * 15}%`,
                  top: `${15 + (i % 3) * 25}%`,
                  opacity: 0.4,
                  animation: `float-dot ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}

            <div className="text-center relative z-10">
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Session Complete</div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                {sessionTotal} prompts curated in {sessionTimer.formatted}
              </p>
            </div>

            {/* Stats grid */}
            <div className="flex items-end gap-8 md:gap-12 relative z-10 count-pop">
              <div className="text-center">
                <AnimatedCount target={keepCount} color="text-emerald-500" />
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">Keep</div>
              </div>
              <div className="text-center">
                <AnimatedCount target={maybeCount} color="text-amber-500" />
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">Maybe</div>
              </div>
              <div className="text-center">
                <AnimatedCount target={cullCount} color="text-rose-500" />
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">Cull</div>
              </div>
            </div>

            {/* Dataset health score */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-zinc-500 font-semibold">Dataset Health</div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      healthScore >= 70 ? 'bg-emerald-500' : healthScore >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
                <span className={`text-sm font-bold font-mono ${
                  healthScore >= 70 ? 'text-emerald-500' : healthScore >= 40 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {healthScore}%
                </span>
              </div>
              <div className="text-[10px] text-gray-400 dark:text-zinc-500">
                {healthScore >= 70 ? 'Excellent quality dataset' : healthScore >= 40 ? 'Moderate — consider tighter curation' : 'Needs significant curation'}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 w-full max-w-xs relative z-10">
              {cullCount > 0 && (
                <button
                  onClick={doBulkCull}
                  className="w-full rounded-xl font-semibold py-3.5 px-6 transition-all active:scale-[0.97] text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
                >
                  Cull {cullCount} prompts
                </button>
              )}
              {maybeCount > 0 && (
                <button
                  onClick={reviewMaybes}
                  className="w-full rounded-xl border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 font-semibold py-3.5 px-6 transition-all hover:bg-amber-100 dark:hover:bg-amber-950/40 active:scale-[0.97]"
                >
                  Re-review {maybeCount} maybes
                </button>
              )}
              <button
                onClick={() => fetchPrompts(author)}
                className="w-full rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-zinc-400 font-medium py-3.5 px-6 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.05] active:scale-[0.97]"
              >
                Start new session
              </button>
            </div>
          </div>
        )}

        {/* The Card */}
        {!loading && prompt && (
          <div className="flex-1 flex flex-col gap-4">
            {/* Card with gradient border */}
            <div className="rounded-2xl p-px gradient-border shadow-xl shadow-black/[0.04] dark:shadow-black/40">
              <div
                key={cardKey}
                className={`rounded-2xl bg-white dark:bg-[#111] overflow-hidden transition-all duration-200 card-enter-anim ${
                  direction === 'left'
                    ? '-translate-x-full opacity-0'
                    : direction === 'right'
                      ? 'translate-x-full opacity-0'
                      : direction === 'down'
                        ? 'translate-y-24 opacity-0'
                        : 'translate-x-0 opacity-100'
                }`}
              >
                {/* Media preview with overlay gradient */}
                {getImageUrl(prompt) && (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(prompt)!}
                      alt=""
                      className="w-full max-h-96 object-contain bg-black/[0.02] dark:bg-white/[0.02]"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-[#111] to-transparent" />
                  </div>
                )}

                <div className="p-5 md:p-7 flex flex-col gap-4">
                  {/* Prompt text — prominent */}
                  <pre className="whitespace-pre-wrap break-words text-base md:text-lg leading-relaxed text-gray-800 dark:text-zinc-100 font-mono max-h-72 overflow-y-auto tracking-tight">
                    {promptText || '(no prompt)'}
                  </pre>

                  {/* Quality signals */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500">{wordCount}w</span>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500">{charCount}c</span>
                    {specialTokens.length > 0 && (
                      <div className="flex items-center gap-1">
                        {specialTokens.map(t => (
                          <span key={t} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-violet-100/80 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800/30">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">richness</span>
                      <RichnessDots score={richness} />
                    </span>
                  </div>

                  {/* Metadata pills — glassmorphic */}
                  <div className="flex flex-wrap items-center gap-2">
                    {prompt.detected_model && (
                      <span className="rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-600 dark:text-zinc-300">
                        {prompt.detected_model}
                      </span>
                    )}
                    {prompt.prompt_category && (
                      <span className="rounded-full border border-violet-200/60 dark:border-violet-800/30 bg-violet-50/80 dark:bg-violet-900/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                        {prompt.prompt_category}
                      </span>
                    )}
                    <ConfidenceBadge confidence={prompt.confidence} />
                    <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto font-mono">
                      @{prompt.author_handle}
                    </span>
                    {prompt.tweet_url && (
                      <a
                        href={prompt.tweet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 dark:text-zinc-500 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
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
            </div>

            {/* Rating buttons — physical, with depth */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => ratePrompt(1)}
                className="group flex flex-col items-center gap-1.5 rounded-xl py-5 px-3 font-semibold text-sm transition-all active:scale-[0.95] active:shadow-sm text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/30 shadow-md shadow-rose-500/[0.06] hover:shadow-lg hover:shadow-rose-500/[0.12] hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(to bottom, rgba(255,241,242,0.9), rgba(254,226,226,0.6))' }}
                title="Mark as low quality — will be deleted on bulk cull"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">&#x1F5D1;</span>
                <span>Cull</span>
                <kbd className="inline-flex items-center justify-center min-w-[20px] rounded-md bg-rose-900/10 dark:bg-rose-400/10 border border-rose-300/50 dark:border-rose-700/30 px-1.5 py-0.5 text-[10px] font-mono text-rose-500/70 dark:text-rose-400/60">1</kbd>
              </button>
              <button
                onClick={() => ratePrompt(2)}
                className="group flex flex-col items-center gap-1.5 rounded-xl py-5 px-3 font-semibold text-sm transition-all active:scale-[0.95] active:shadow-sm text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/30 shadow-md shadow-amber-500/[0.06] hover:shadow-lg hover:shadow-amber-500/[0.12] hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(to bottom, rgba(255,251,235,0.9), rgba(254,243,199,0.6))' }}
                title="Uncertain — can re-review later"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">&#x1F914;</span>
                <span>Maybe</span>
                <kbd className="inline-flex items-center justify-center min-w-[20px] rounded-md bg-amber-900/10 dark:bg-amber-400/10 border border-amber-300/50 dark:border-amber-700/30 px-1.5 py-0.5 text-[10px] font-mono text-amber-500/70 dark:text-amber-400/60">2</kbd>
              </button>
              <button
                onClick={() => ratePrompt(3)}
                className="group flex flex-col items-center gap-1.5 rounded-xl py-5 px-3 font-semibold text-sm transition-all active:scale-[0.95] active:shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/30 shadow-md shadow-emerald-500/[0.06] hover:shadow-lg hover:shadow-emerald-500/[0.12] hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(to bottom, rgba(236,253,245,0.9), rgba(209,250,229,0.6))' }}
                title="High quality — keep in dataset"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">&#x2705;</span>
                <span>Keep</span>
                <kbd className="inline-flex items-center justify-center min-w-[20px] rounded-md bg-emerald-900/10 dark:bg-emerald-400/10 border border-emerald-300/50 dark:border-emerald-700/30 px-1.5 py-0.5 text-[10px] font-mono text-emerald-500/70 dark:text-emerald-400/60">3</kbd>
              </button>
            </div>

            {/* Dark mode button overrides */}
            <style>{`
              .dark button[title="Mark as low quality — will be deleted on bulk cull"] {
                background: linear-gradient(to bottom, rgba(136,19,55,0.2), rgba(136,19,55,0.1)) !important;
              }
              .dark button[title="Uncertain — can re-review later"] {
                background: linear-gradient(to bottom, rgba(146,64,14,0.2), rgba(146,64,14,0.1)) !important;
              }
              .dark button[title="High quality — keep in dataset"] {
                background: linear-gradient(to bottom, rgba(6,78,59,0.2), rgba(6,78,59,0.1)) !important;
              }
            `}</style>

            {/* Undo + position */}
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
              <button
                onClick={undoLast}
                disabled={undoStack.length === 0}
                className={`flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  undoStack.length > 0 ? 'undo-pulse' : ''
                }`}
              >
                <kbd className="inline-flex items-center justify-center rounded-md bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] px-2 py-1 text-[10px] font-mono">U</kbd>
                <span>Undo</span>
              </button>
              <span className="font-mono tabular-nums text-[11px]">
                {currentIndex + 1} of {prompts.length}
              </span>
            </div>
          </div>
        )}

        {/* No prompts found */}
        {!loading && !prompt && !allDone && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <span className="text-sm text-gray-400 dark:text-zinc-500">
              No unreviewed prompts found{author ? ` for @${author}` : ''}.
            </span>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts panel */}
      {showShortcuts && !loading && prompts.length > 0 && !allDone && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-xl shadow-black/[0.08] dark:shadow-black/40 p-3 text-xs min-w-[160px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700 dark:text-zinc-300 text-[11px] uppercase tracking-wide">Shortcuts</span>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { keys: ['1', String.fromCharCode(8592)], label: 'Cull' },
                { keys: ['2', String.fromCharCode(8595)], label: 'Maybe' },
                { keys: ['3', String.fromCharCode(8594)], label: 'Keep' },
                { keys: ['U'], label: 'Undo' },
                { keys: ['?'], label: 'Toggle help' },
              ].map(({ keys, label }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 dark:text-zinc-400">{label}</span>
                  <div className="flex items-center gap-1">
                    {keys.map(k => (
                      <kbd key={k} className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-1.5 text-[10px] font-mono text-gray-600 dark:text-zinc-300 shadow-sm">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Re-show shortcuts button */}
      {!showShortcuts && !loading && prompts.length > 0 && !allDone && (
        <button
          onClick={() => setShowShortcuts(true)}
          className="fixed bottom-6 right-6 z-40 w-9 h-9 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
          title="Show keyboard shortcuts (?)"
        >
          <kbd className="text-xs font-mono">?</kbd>
        </button>
      )}

      {/* Toast — colored accent */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 z-50 toast-anim rounded-xl px-5 py-2.5 text-sm font-semibold shadow-xl border ${
          toast.type === 'keep'
            ? 'bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-500/20'
            : toast.type === 'cull'
              ? 'bg-rose-500 text-white border-rose-400/50 shadow-rose-500/20'
              : toast.type === 'maybe'
                ? 'bg-amber-400 text-amber-900 border-amber-300/50 shadow-amber-400/20'
                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-700 dark:border-gray-200 shadow-black/10'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
