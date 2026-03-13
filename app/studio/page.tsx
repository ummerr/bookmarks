'use client'

import { useState, useRef, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Segment =
  | { type: 'text'; value: string }
  | { type: 'var'; key: string; label: string; value: string }

// ── Variable chip colors ───────────────────────────────────────────────────────

const KEY_COLORS: Record<string, string> = {
  character: 'bg-violet-500/15 border-violet-400/40 text-violet-700 dark:text-violet-300',
  subject:   'bg-violet-500/15 border-violet-400/40 text-violet-700 dark:text-violet-300',
  person:    'bg-violet-500/15 border-violet-400/40 text-violet-700 dark:text-violet-300',
  action:    'bg-blue-500/15   border-blue-400/40   text-blue-700   dark:text-blue-300',
  movement:  'bg-blue-500/15   border-blue-400/40   text-blue-700   dark:text-blue-300',
  pose:      'bg-blue-500/15   border-blue-400/40   text-blue-700   dark:text-blue-300',
  setting:   'bg-emerald-500/15 border-emerald-400/40 text-emerald-700 dark:text-emerald-300',
  location:  'bg-emerald-500/15 border-emerald-400/40 text-emerald-700 dark:text-emerald-300',
  scene:     'bg-emerald-500/15 border-emerald-400/40 text-emerald-700 dark:text-emerald-300',
  environment: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-700 dark:text-emerald-300',
  style:     'bg-amber-500/15  border-amber-400/40  text-amber-700   dark:text-amber-300',
  aesthetic: 'bg-amber-500/15  border-amber-400/40  text-amber-700   dark:text-amber-300',
  lighting:  'bg-orange-500/15 border-orange-400/40 text-orange-700  dark:text-orange-300',
  mood:      'bg-orange-500/15 border-orange-400/40 text-orange-700  dark:text-orange-300',
  atmosphere:'bg-orange-500/15 border-orange-400/40 text-orange-700  dark:text-orange-300',
  time:      'bg-rose-500/15   border-rose-400/40   text-rose-700    dark:text-rose-300',
  period:    'bg-rose-500/15   border-rose-400/40   text-rose-700    dark:text-rose-300',
  camera:    'bg-sky-500/15    border-sky-400/40    text-sky-700     dark:text-sky-300',
  shot:      'bg-sky-500/15    border-sky-400/40    text-sky-700     dark:text-sky-300',
  color:     'bg-pink-500/15   border-pink-400/40   text-pink-700    dark:text-pink-300',
  effect:    'bg-purple-500/15 border-purple-400/40 text-purple-700  dark:text-purple-300',
}

const FALLBACK_COLORS = [
  'bg-zinc-500/15 border-zinc-400/40 text-zinc-700 dark:text-zinc-300',
  'bg-teal-500/15 border-teal-400/40 text-teal-700 dark:text-teal-300',
  'bg-indigo-500/15 border-indigo-400/40 text-indigo-700 dark:text-indigo-300',
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
  onEdit,
}: {
  varKey: string
  label: string
  value: string
  colorClass: string
  onEdit: (key: string, value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])
  // Keep draft in sync if parent value changes (e.g. another chip of same key was edited)
  useEffect(() => { if (!editing) setDraft(value) }, [value, editing])

  function commit() {
    const trimmed = draft.trim()
    onEdit(varKey, trimmed || value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit() }
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        style={{ width: Math.max(draft.length, label.length, 4) * 8 + 24 }}
        className={`inline rounded-md px-2 py-0.5 text-sm border outline-none font-medium ${colorClass}`}
      />
    )
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true) }}
      title={`${label} — click to edit`}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm border font-medium cursor-text hover:brightness-95 dark:hover:brightness-110 transition-all select-none ${colorClass}`}
    >
      {value}
      <svg className="w-2.5 h-2.5 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2.5 2.5 0 013.536 3.536L12 15H9v-3z" />
      </svg>
    </span>
  )
}

// ── Template display ──────────────────────────────────────────────────────────

function TemplateView({
  segments,
  onEditVar,
}: {
  segments: Segment[]
  onEditVar: (key: string, value: string) => void
}) {
  // Assign a stable color index per unique key
  const keyOrder: string[] = []
  segments.forEach(s => {
    if (s.type === 'var' && !keyOrder.includes(s.key)) keyOrder.push(s.key)
  })

  return (
    <p className="text-base leading-9 text-gray-900 dark:text-white">
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i}>{seg.value}</span>
        const colorClass = chipColor(seg.key, keyOrder.indexOf(seg.key))
        return (
          <VarChip
            key={i}
            varKey={seg.key}
            label={seg.label}
            value={seg.value}
            colorClass={colorClass}
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
      <span className="text-xs font-mono text-gray-400 dark:text-zinc-600 mt-0.5 shrink-0 w-4">{index}</span>
      <p className="flex-1 text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">{prompt}</p>
      <button
        onClick={copy}
        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors self-start ${
          copied
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : 'bg-black/[0.04] dark:bg-white/6 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100'
        }`}
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [input, setInput] = useState('')
  const [segments, setSegments] = useState<Segment[]>([])
  const [variations, setVariations] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const hasTemplate = segments.length > 0
  const hasVars = segments.some(s => s.type === 'var')

  async function parse() {
    if (!input.trim()) return
    setParsing(true)
    setParseError(null)
    setSegments([])
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
    } catch (err) {
      setParseError(String(err))
    } finally {
      setParsing(false)
    }
  }

  function editVar(key: string, value: string) {
    setSegments(segs =>
      segs.map(s => s.type === 'var' && s.key === key ? { ...s, value } : s)
    )
    // Clear stale variations when template changes
    setVariations([])
  }

  function buildTemplateStr(): string {
    return segments.map(s => s.type === 'text' ? s.value : `{${s.key}}`).join('')
  }

  function buildVariables(): Record<string, string> {
    const vars: Record<string, string> = {}
    segments.forEach(s => { if (s.type === 'var') vars[s.key] = s.value })
    return vars
  }

  async function generateVariations() {
    setGenerating(true)
    setVariations([])
    try {
      const res = await fetch('/api/studio/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateStr: buildTemplateStr(),
          variables: buildVariables(),
          count: 5,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setVariations(data.prompts)
    } catch (err) {
      setParseError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  // Detect variable keys for the legend
  const uniqueVarKeys: string[] = []
  const keyOrder: string[] = []
  segments.forEach(s => {
    if (s.type === 'var' && !keyOrder.includes(s.key)) keyOrder.push(s.key)
  })

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Rewriter</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
            Paste any prompt to extract its variables, then generate variations with the same structure.
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setSegments([]); setVariations([]) }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) parse() }}
            placeholder="Paste a prompt here…"
            rows={4}
            className="w-full rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none focus:border-violet-400/60 dark:focus:border-violet-500/40 resize-none transition-colors leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 dark:text-zinc-600">
              {input.trim() ? `${input.trim().length} chars` : 'Tip: ⌘↵ to parse'}
            </span>
            <button
              onClick={parse}
              disabled={!input.trim() || parsing}
              className="flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {parsing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Parsing…
                </>
              ) : 'Parse →'}
            </button>
          </div>
        </div>

        {parseError && (
          <p className="text-sm text-red-500">{parseError}</p>
        )}

        {/* Template */}
        {hasTemplate && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600 mb-3">
                Template — click any chip to edit
              </div>
              <TemplateView segments={segments} onEditVar={editVar} />

              {/* Variable legend */}
              {hasVars && (
                <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/6 flex flex-wrap gap-1.5">
                  {keyOrder.map((key, i) => {
                    const seg = segments.find(s => s.type === 'var' && s.key === key)
                    if (!seg || seg.type !== 'var') return null
                    return (
                      <span key={key} className={`rounded-full px-2 py-0.5 text-[11px] border ${chipColor(key, i)}`}>
                        {seg.label}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Generate */}
            <button
              onClick={generateVariations}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] px-4 py-3 text-sm font-medium text-gray-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating variations…
                </>
              ) : (
                <>
                  <span>✦</span>
                  Generate 5 variations
                </>
              )}
            </button>
          </div>
        )}

        {/* Variations */}
        {variations.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
              Variations
            </div>
            {variations.map((p, i) => (
              <VariationCard key={i} prompt={p} index={i + 1} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
