'use client'

import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Variation = { prompt: string; changes: string[] }

type HistoryEntry = {
  id: string
  input: string
  variations: Variation[]
  timestamp: number
}

const STORAGE_KEY = 'studio_history'
const MAX_HISTORY = 20

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)))
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

// ── Variation card ────────────────────────────────────────────────────────────

function VariationCard({ prompt, changes, index }: { prompt: string; changes: string[]; index: number }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const CLAMP_CHARS = 280
  const isLong = prompt.length > CLAMP_CHARS

  function copy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="group rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 p-4 flex flex-col gap-2.5 hover:border-black/[0.14] dark:hover:border-white/14 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center flex-wrap gap-1.5 min-w-0">
          <span className="text-[11px] font-mono text-gray-300 dark:text-zinc-700 shrink-0 select-none">{index}.</span>
          {changes.map((c, i) => (
            <span
              key={i}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-violet-100 border border-violet-200 text-violet-700 dark:bg-violet-500/15 dark:border-violet-500/25 dark:text-violet-300 whitespace-nowrap"
            >
              {c}
            </span>
          ))}
        </div>
        <button
          onClick={copy}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
            copied
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'opacity-0 group-hover:opacity-100 bg-black/[0.04] dark:bg-white/6 text-gray-500 dark:text-zinc-400 hover:bg-black/[0.08] dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">
        {isLong && !expanded ? `${prompt.slice(0, CLAMP_CHARS)}…` : prompt}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="self-start text-[11px] text-violet-600 dark:text-violet-400 hover:underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

// ── History panel ─────────────────────────────────────────────────────────────

function HistoryPanel({
  entries,
  activeId,
  onSelect,
  onDelete,
  onClear,
}: {
  entries: HistoryEntry[]
  activeId: string | null
  onSelect: (e: HistoryEntry) => void
  onDelete: (id: string) => void
  onClear: () => void
}) {
  if (entries.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
          History
        </p>
        <button
          onClick={onClear}
          className="text-[11px] text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {entries.map(entry => (
          <div
            key={entry.id}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
              activeId === entry.id
                ? 'bg-violet-500/10 border border-violet-500/20'
                : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03] border border-transparent'
            }`}
            onClick={() => onSelect(entry)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-zinc-300 truncate">
                {entry.input.slice(0, 80)}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-zinc-600 mt-0.5">
                {timeAgo(entry.timestamp)} · {entry.variations.length} variations
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(entry.id) }}
              className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-all text-base leading-none"
              aria-label="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [input, setInput] = useState('')
  const [variations, setVariations] = useState<Variation[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  async function generate() {
    if (!input.trim()) return
    setGenerating(true)
    setVariations([])
    setError(null)
    setActiveId(null)
    try {
      const res = await fetch('/api/studio/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.trim(), count: 5 }),
      })
      if (!res.ok) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!Array.isArray(data.variations)) throw new Error('Invalid response')
      setVariations(data.variations)

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        input: input.trim(),
        variations: data.variations,
        timestamp: Date.now(),
      }
      const next = [entry, ...history].slice(0, MAX_HISTORY)
      setHistory(next)
      setActiveId(entry.id)
      saveHistory(next)
    } catch (err) {
      setError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  function loadEntry(entry: HistoryEntry) {
    setInput(entry.input)
    setVariations(entry.variations)
    setActiveId(entry.id)
    setError(null)
  }

  function deleteEntry(id: string) {
    const next = history.filter(e => e.id !== id)
    setHistory(next)
    saveHistory(next)
    if (activeId === id) {
      setActiveId(null)
    }
  }

  function clearHistory() {
    setHistory([])
    saveHistory([])
    setActiveId(null)
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Varietals</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
            Paste a prompt to generate 5 variations. Each highlights what changed significantly.
          </p>
        </div>

        {/* Input */}
        <div className="max-w-2xl flex flex-col gap-2">
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); if (variations.length) { setVariations([]); setActiveId(null) } }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
            placeholder="Paste any AI prompt here…"
            rows={4}
            className="w-full rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none focus:border-violet-400/50 dark:focus:border-violet-500/40 resize-none transition-colors leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 dark:text-zinc-600">
              {input.trim() ? `${input.trim().length} chars` : '⌘↵ to generate'}
            </span>
            <button
              onClick={generate}
              disabled={!input.trim() || generating}
              className="flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {generating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <span>✦</span>
                  Generate variations
                </>
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        {/* Variations */}
        {variations.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
              Variations
            </p>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {variations.map((v, i) => (
                <VariationCard key={i} prompt={v.prompt} changes={v.changes} index={i + 1} />
              ))}
            </div>
          </div>
        )}

        <HistoryPanel
          entries={history}
          activeId={activeId}
          onSelect={loadEntry}
          onDelete={deleteEntry}
          onClear={clearHistory}
        />

      </div>
    </div>
  )
}
