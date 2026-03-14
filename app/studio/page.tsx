'use client'

import { useState, useRef, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Segment =
  | { type: 'text'; value: string }
  | { type: 'var'; key: string; label: string; value: string }

// ── Chip colors ───────────────────────────────────────────────────────────────
// Light mode: solid 100-series bg, 300-series border, 700 text
// Dark mode: opacity-based bg, lighter text

const KEY_COLORS: Record<string, string> = {
  character:   'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-500/20 dark:border-violet-500/35 dark:text-violet-300',
  subject:     'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-500/20 dark:border-violet-500/35 dark:text-violet-300',
  person:      'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-500/20 dark:border-violet-500/35 dark:text-violet-300',
  action:      'bg-blue-100   border-blue-300   text-blue-800   dark:bg-blue-500/20   dark:border-blue-500/35   dark:text-blue-300',
  movement:    'bg-blue-100   border-blue-300   text-blue-800   dark:bg-blue-500/20   dark:border-blue-500/35   dark:text-blue-300',
  pose:        'bg-blue-100   border-blue-300   text-blue-800   dark:bg-blue-500/20   dark:border-blue-500/35   dark:text-blue-300',
  setting:     'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/35 dark:text-emerald-300',
  location:    'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/35 dark:text-emerald-300',
  scene:       'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/35 dark:text-emerald-300',
  environment: 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/35 dark:text-emerald-300',
  style:       'bg-amber-100  border-amber-300  text-amber-800   dark:bg-amber-500/20  dark:border-amber-500/35  dark:text-amber-300',
  aesthetic:   'bg-amber-100  border-amber-300  text-amber-800   dark:bg-amber-500/20  dark:border-amber-500/35  dark:text-amber-300',
  lighting:    'bg-orange-100 border-orange-300 text-orange-800  dark:bg-orange-500/20 dark:border-orange-500/35 dark:text-orange-300',
  mood:        'bg-orange-100 border-orange-300 text-orange-800  dark:bg-orange-500/20 dark:border-orange-500/35 dark:text-orange-300',
  atmosphere:  'bg-orange-100 border-orange-300 text-orange-800  dark:bg-orange-500/20 dark:border-orange-500/35 dark:text-orange-300',
  time:        'bg-rose-100   border-rose-300   text-rose-800    dark:bg-rose-500/20   dark:border-rose-500/35   dark:text-rose-300',
  period:      'bg-rose-100   border-rose-300   text-rose-800    dark:bg-rose-500/20   dark:border-rose-500/35   dark:text-rose-300',
  camera:      'bg-sky-100    border-sky-300    text-sky-800     dark:bg-sky-500/20    dark:border-sky-500/35    dark:text-sky-300',
  shot:        'bg-sky-100    border-sky-300    text-sky-800     dark:bg-sky-500/20    dark:border-sky-500/35    dark:text-sky-300',
  color:       'bg-pink-100   border-pink-300   text-pink-800    dark:bg-pink-500/20   dark:border-pink-500/35   dark:text-pink-300',
  effect:      'bg-purple-100 border-purple-300 text-purple-800  dark:bg-purple-500/20 dark:border-purple-500/35 dark:text-purple-300',
}

const FALLBACK_COLORS = [
  'bg-zinc-100   border-zinc-300   text-zinc-800   dark:bg-zinc-500/20   dark:border-zinc-500/35   dark:text-zinc-300',
  'bg-teal-100   border-teal-300   text-teal-800   dark:bg-teal-500/20   dark:border-teal-500/35   dark:text-teal-300',
  'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-500/20 dark:border-indigo-500/35 dark:text-indigo-300',
]

function chipColor(key: string, index: number): string {
  return KEY_COLORS[key] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

// ── VarChip ───────────────────────────────────────────────────────────────────

function VarChip({
  varKey,
  label,
  value,
  colorClass,
  suggestions,
  onEdit,
}: {
  varKey: string
  label: string
  value: string
  colorClass: string
  suggestions: string[]
  onEdit: (key: string, value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])
  useEffect(() => { if (!editing) setDraft(value) }, [value, editing])

  function commit(newVal?: string) {
    const val = (newVal ?? draft).trim()
    onEdit(varKey, val || value)
    setEditing(false)
  }

  const inputWidth = Math.max(draft.length, value.length, label.length, 6) * 8 + 20

  return (
    <span ref={wrapperRef} className="relative inline-block align-baseline">
      {editing ? (
        <>
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => commit()}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') { setDraft(value); setEditing(false) }
            }}
            style={{ width: inputWidth }}
            className={`rounded-md px-2 py-0.5 text-sm font-medium border-2 outline-none ${colorClass}`}
          />
          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <span className="absolute top-full left-0 mt-1.5 z-50 flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-black/10 dark:border-white/10 shadow-xl overflow-hidden min-w-max">
              <span className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600 border-b border-black/[0.06] dark:border-white/6">
                Alternatives
              </span>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={e => { e.preventDefault(); commit(s) }}
                  className="px-3 py-2 text-left text-sm text-gray-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </span>
          )}
        </>
      ) : (
        <span
          onClick={() => { setDraft(value); setEditing(true) }}
          title={`${label} — click to edit`}
          className={`
            inline-block rounded-md px-2 py-0.5 text-sm font-medium border
            cursor-pointer select-none transition-all duration-100
            hover:shadow-sm hover:scale-[1.02]
            ${colorClass}
          `}
        >
          {value}
        </span>
      )}
    </span>
  )
}

// ── Template display ──────────────────────────────────────────────────────────

function TemplateView({
  segments,
  suggestions,
  onEditVar,
}: {
  segments: Segment[]
  suggestions: Record<string, string[]>
  onEditVar: (key: string, value: string) => void
}) {
  const keyOrder: string[] = []
  segments.forEach(s => {
    if (s.type === 'var' && !keyOrder.includes(s.key)) keyOrder.push(s.key)
  })

  return (
    <p className="text-[15px] leading-10 text-gray-900 dark:text-white">
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i} className="text-gray-700 dark:text-zinc-300">{seg.value}</span>
        const colorClass = chipColor(seg.key, keyOrder.indexOf(seg.key))
        return (
          <VarChip
            key={i}
            varKey={seg.key}
            label={seg.label}
            value={seg.value}
            colorClass={colorClass}
            suggestions={suggestions[seg.key] ?? []}
            onEdit={onEditVar}
          />
        )
      })}
    </p>
  )
}

// ── Variation card ────────────────────────────────────────────────────────────

function VariationCard({ prompt, index }: { prompt: string; index: number }) {
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
      <p className="flex-1 text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">{prompt}</p>
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
  const [segments, setSegments] = useState<Segment[]>([])
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({})
  const [variations, setVariations] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasTemplate = segments.length > 0
  const hasVars = segments.some(s => s.type === 'var')

  async function parse() {
    if (!input.trim()) return
    setParsing(true)
    setError(null)
    setSegments([])
    setSuggestions({})
    setVariations([])
    try {
      const res = await fetch('/api/studio/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSegments(data.segments)
      setSuggestions(data.suggestions ?? {})
    } catch (err) {
      setError(String(err))
    } finally {
      setParsing(false)
    }
  }

  function editVar(key: string, value: string) {
    setSegments(segs => segs.map(s => s.type === 'var' && s.key === key ? { ...s, value } : s))
    setVariations([])
  }

  function buildTemplateStr() {
    return segments.map(s => s.type === 'text' ? s.value : `{${s.key}}`).join('')
  }

  function buildVariables() {
    const vars: Record<string, string> = {}
    segments.forEach(s => { if (s.type === 'var') vars[s.key] = s.value })
    return vars
  }

  async function generateVariations() {
    setGenerating(true)
    setVariations([])
    setError(null)
    try {
      const res = await fetch('/api/studio/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateStr: buildTemplateStr(), variables: buildVariables(), count: 5 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setVariations(data.prompts)
    } catch (err) {
      setError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  // Unique var keys in order of appearance
  const keyOrder: string[] = []
  segments.forEach(s => { if (s.type === 'var' && !keyOrder.includes(s.key)) keyOrder.push(s.key) })

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Rewriter</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
            Paste a prompt to extract its variables as editable chips, then generate fresh variations.
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); if (segments.length) { setSegments([]); setVariations([]) } }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) parse() }}
            placeholder="Paste any AI prompt here…"
            rows={4}
            className="w-full rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none focus:border-violet-400/50 dark:focus:border-violet-500/40 resize-none transition-colors leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 dark:text-zinc-600">
              {input.trim() ? `${input.trim().length} chars` : '⌘↵ to parse'}
            </span>
            <button
              onClick={parse}
              disabled={!input.trim() || parsing}
              className="flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {parsing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Parsing…
                </>
              ) : 'Parse →'}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        {/* Template */}
        {hasTemplate && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 px-5 py-4">

              {/* Variable type legend */}
              {hasVars && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {keyOrder.map((key, i) => {
                    const seg = segments.find(s => s.type === 'var' && s.key === key)
                    if (!seg || seg.type !== 'var') return null
                    return (
                      <span key={key} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${chipColor(key, i)}`}>
                        {seg.label}
                      </span>
                    )
                  })}
                  <span className="ml-auto text-[11px] text-gray-400 dark:text-zinc-600 self-center">
                    click chips to edit
                  </span>
                </div>
              )}

              <TemplateView segments={segments} suggestions={suggestions} onEditVar={editVar} />
            </div>

            {/* Generate button */}
            <button
              onClick={generateVariations}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 transition-colors disabled:opacity-50 group"
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
                  <span className="text-violet-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">✦</span>
                  Generate 5 variations
                </>
              )}
            </button>
          </div>
        )}

        {/* Variations */}
        {variations.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
              Variations
            </p>
            {variations.map((p, i) => (
              <VariationCard key={i} prompt={p} index={i + 1} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
