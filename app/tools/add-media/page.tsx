'use client'

import { useState, useEffect, useCallback } from 'react'

interface PromptRow {
  id: string
  tweet_text: string
  extracted_prompt: string | null
  author_handle: string
  tweet_url: string
  detected_model: string | null
  prompt_category: string | null
}

export default function AddMediaPage() {
  const [prompts, setPrompts] = useState<PromptRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const PAGE_SIZE = 20

  const fetchPrompts = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tools/add-media?limit=${PAGE_SIZE}&offset=${p * PAGE_SIZE}`)
      if (res.ok) {
        const data = await res.json()
        setPrompts(data.prompts)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPrompts(page) }, [page, fetchPrompts])

  async function addMedia(id: string) {
    const url = urlInputs[id]?.trim()
    if (!url) return

    setSaving(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch('/api/tools/add-media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, url }),
      })
      if (res.ok) {
        setSaved(prev => new Set(prev).add(id))
        setUrlInputs(prev => { const next = { ...prev }; delete next[id]; return next })
      }
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }))
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addMedia(id)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">Add Media to Prompts</h1>
            <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
              {total} prompt{total !== 1 ? 's' : ''} missing media. Paste image/video URLs to attach them.
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-black/[0.08] dark:border-white/8 px-3 py-1.5 text-xs font-medium disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Prev
              </button>
              <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-black/[0.08] dark:border-white/8 px-3 py-1.5 text-xs font-medium disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-zinc-500 py-12 justify-center">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading...
          </div>
        )}

        {/* Prompt list */}
        {!loading && prompts.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-zinc-500 text-sm">
            All prompts have media attached.
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3">
            {prompts.map((p) => {
              const isSaved = saved.has(p.id)
              const displayText = p.extracted_prompt || p.tweet_text
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isSaved
                      ? 'border-emerald-300/50 dark:border-emerald-700/40 bg-emerald-50/50 dark:bg-emerald-900/10'
                      : 'border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.02]'
                  }`}
                >
                  {/* Top row: meta */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">@{p.author_handle}</span>
                    {p.prompt_category && (
                      <span className="rounded-full bg-blue-100/80 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                        {p.prompt_category}
                      </span>
                    )}
                    {p.detected_model && (
                      <span className="rounded-full bg-purple-100/80 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300">
                        {p.detected_model}
                      </span>
                    )}
                    <span className="flex-1" />
                  </div>

                  {/* Prompt text */}
                  <p className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap break-words leading-relaxed line-clamp-4 mb-3">
                    {displayText}
                  </p>

                  {/* URL input */}
                  {isSaved ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Media added
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {p.tweet_url && (
                        <a
                          href={p.tweet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg border border-black/[0.08] dark:border-white/10 px-3 py-2 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
                        >
                          Source
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      )}
                      <input
                        type="text"
                        placeholder="Paste image or video URL..."
                        value={urlInputs[p.id] ?? ''}
                        onChange={(e) => setUrlInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                        onKeyDown={(e) => handleKeyDown(e, p.id)}
                        className="flex-1 rounded-lg border border-black/[0.08] dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-300 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-colors"
                      />
                      <button
                        onClick={() => addMedia(p.id)}
                        disabled={!urlInputs[p.id]?.trim() || saving[p.id]}
                        className="shrink-0 rounded-lg bg-[#1DA1F2]/90 px-4 py-2 text-sm font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-40 transition-colors"
                      >
                        {saving[p.id] ? 'Saving...' : 'Add'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
