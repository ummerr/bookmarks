'use client'

import { useState } from 'react'

// ── Variation card ────────────────────────────────────────────────────────────

function VariationCard({
  prompt,
  changes,
  index,
}: {
  prompt: string
  changes: string[]
  index: number
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="group rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 p-4 flex gap-3 hover:border-black/[0.14] dark:hover:border-white/14 transition-colors">
      <span className="text-xs font-mono text-gray-300 dark:text-zinc-700 mt-0.5 shrink-0 select-none">{index}.</span>
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {changes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {changes.map((c, i) => (
              <span
                key={i}
                className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-violet-100 border border-violet-200 text-violet-700 dark:bg-violet-500/15 dark:border-violet-500/25 dark:text-violet-300"
              >
                {c}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">{prompt}</p>
      </div>
      <button
        onClick={copy}
        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all self-start ${
          copied
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
            : 'opacity-0 group-hover:opacity-100 bg-black/[0.04] dark:bg-white/6 text-gray-500 dark:text-zinc-400 hover:bg-black/[0.08] dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'
        }`}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [input, setInput] = useState('')
  const [variations, setVariations] = useState<Array<{ prompt: string; changes: string[] }>>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (!input.trim()) return
    setGenerating(true)
    setVariations([])
    setError(null)
    try {
      const res = await fetch('/api/studio/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.trim(), count: 5 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setVariations(data.variations)
    } catch (err) {
      setError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Rewriter</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
            Paste a prompt to generate 5 variations. Each highlights what changed significantly.
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); if (variations.length) setVariations([]) }}
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
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
              Variations
            </p>
            {variations.map((v, i) => (
              <VariationCard key={i} prompt={v.prompt} changes={v.changes} index={i + 1} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
