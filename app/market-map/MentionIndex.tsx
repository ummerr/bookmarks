'use client'

// Mention index: counts each company's appearances in the rendered essay and,
// on click, lights every mention up via the CSS Custom Highlight API — no DOM
// mutation, so the server-rendered essay is never touched and hydration is
// safe. Counting runs client-side against the real text, so counts can't
// drift from content edits. Browsers without the Highlight API still get the
// index and mention-to-mention navigation, just without the paint.

import { useEffect, useRef, useState } from 'react'
import { Logo } from './Logo'
import type { MentionCompany } from './data'

const ESSAY_ID = 'mm-essay'
const SHOWN_BY_DEFAULT = 18

// Escape a literal alias for RegExp use, word-bounding only the ends that are
// word characters ('Advantage+' can't carry a trailing \b).
function aliasPattern(alias: string): string {
  const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (/^\w/.test(alias) ? '\\b' : '') + esc + (/\w$/.test(alias) ? '\\b' : '')
}

// Case-sensitive on purpose ("Meta" must not match "metadata"); longest alias
// first so "Google Flow"-style phrases beat their prefix.
function companyRegex(c: MentionCompany): RegExp {
  const parts = [...c.aliases].sort((a, b) => b.length - a.length).map(aliasPattern)
  return new RegExp(parts.join('|'), 'g')
}

function essayTextNodes(): Text[] {
  const root = document.getElementById(ESSAY_ID)
  if (!root) return []
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT
      const el = node.parentElement
      if (!el || el.closest('[data-mention-skip],svg,script,style')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  let n: Node | null
  while ((n = walker.nextNode())) nodes.push(n as Text)
  return nodes
}

function findRanges(c: MentionCompany, nodes: Text[]): Range[] {
  const re = companyRegex(c)
  const ranges: Range[] = []
  for (const node of nodes) {
    const text = node.nodeValue ?? ''
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      const r = document.createRange()
      r.setStart(node, m.index)
      r.setEnd(node, m.index + m[0].length)
      ranges.push(r)
      if (re.lastIndex === m.index) re.lastIndex++
    }
  }
  return ranges
}

// The Highlight API isn't in this TS lib version yet — feature-detect and cast.
function highlightApi(): {
  registry: Map<string, unknown>
  Ctor: new (...ranges: Range[]) => unknown
} | null {
  const w = window as unknown as { Highlight?: new (...ranges: Range[]) => unknown }
  const c = CSS as unknown as { highlights?: Map<string, unknown> }
  if (!w.Highlight || !c.highlights) return null
  return { registry: c.highlights, Ctor: w.Highlight }
}

function clearHighlights() {
  const api = highlightApi()
  if (api) {
    api.registry.delete('mm-company')
    api.registry.delete('mm-company-current')
  }
}

function paint(ranges: Range[], idx: number) {
  const api = highlightApi()
  if (!api) return
  api.registry.set('mm-company', new api.Ctor(...ranges))
  api.registry.set('mm-company-current', new api.Ctor(ranges[idx]))
}

function scrollToRange(r: Range | undefined) {
  if (!r) return
  const rect = r.getBoundingClientRect()
  window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight * 0.4, behavior: 'smooth' })
}

// Shipped as a runtime <style> tag because the build's CSS parser doesn't
// accept the ::highlight() pseudo-element yet. mm-company = every mention of
// the selected company; mm-company-current = the one the nav bar points at.
const HIGHLIGHT_CSS = `
::highlight(mm-company) { background-color: rgba(139, 92, 246, 0.22); }
::highlight(mm-company-current) { background-color: rgba(245, 158, 11, 0.6); color: #111827; }
.dark ::highlight(mm-company) { background-color: rgba(167, 139, 250, 0.32); }
.dark ::highlight(mm-company-current) { background-color: rgba(245, 158, 11, 0.75); color: #0a0a0a; }
`

interface Entry {
  company: MentionCompany
  count: number
}

export default function MentionIndex({ companies }: { companies: MentionCompany[] }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [expanded, setExpanded] = useState(false)
  const [active, setActive] = useState<MentionCompany | null>(null)
  const [current, setCurrent] = useState(0)
  const rangesRef = useRef<Range[]>([])

  useEffect(() => {
    const nodes = essayTextNodes()
    if (!nodes.length) return
    const counted = companies
      .map((company) => ({ company, count: findRanges(company, nodes).length }))
      .filter((e) => e.count >= 2)
      .sort((a, b) => b.count - a.count || a.company.name.localeCompare(b.company.name))
    setEntries(counted)
  }, [companies])

  const deactivate = () => {
    clearHighlights()
    rangesRef.current = []
    setActive(null)
    setCurrent(0)
  }

  const activate = (company: MentionCompany) => {
    if (active?.name === company.name) {
      deactivate()
      return
    }
    const ranges = findRanges(company, essayTextNodes())
    if (!ranges.length) return
    rangesRef.current = ranges
    setActive(company)
    setCurrent(0)
    paint(ranges, 0)
    scrollToRange(ranges[0])
  }

  const step = (dir: 1 | -1) => {
    const ranges = rangesRef.current
    if (!ranges.length) return
    const next = (current + dir + ranges.length) % ranges.length
    setCurrent(next)
    paint(ranges, next)
    scrollToRange(ranges[next])
  }

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') deactivate()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => clearHighlights, [])

  if (entries.length === 0) return null

  const shown = expanded ? entries : entries.slice(0, SHOWN_BY_DEFAULT)
  const navBtn =
    'h-7 w-7 inline-flex items-center justify-center rounded-full text-[13px] text-gray-500 dark:text-zinc-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] cursor-pointer'

  return (
    <div
      data-mention-skip
      className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] p-4 md:p-5"
    >
      <style>{HIGHLIGHT_CSS}</style>
      <div className="flex items-baseline justify-between flex-wrap gap-x-4 gap-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500/70">
          Mention index
        </p>
        <p className="text-[12px] text-gray-400 dark:text-zinc-500">
          Counted from the rendered essay, product names included — click a company to light up
          every mention. Esc clears.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {shown.map(({ company, count }) => {
          const isActive = active?.name === company.name
          return (
            <button
              key={company.name}
              type="button"
              onClick={() => activate(company)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'border-violet-400 dark:border-violet-500/60 bg-violet-100 dark:bg-violet-950/50 text-violet-900 dark:text-violet-200'
                  : 'border-black/[0.08] dark:border-white/[0.1] text-gray-700 dark:text-zinc-300 hover:border-violet-300 dark:hover:border-violet-700/60 hover:bg-violet-50 dark:hover:bg-violet-950/30'
              }`}
            >
              <Logo domain={company.domain} name={company.name} size={13} />
              <span>{company.name}</span>
              <span
                className={`font-mono text-[10px] tabular-nums ${
                  isActive ? 'text-violet-500 dark:text-violet-300' : 'text-gray-400 dark:text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
        {entries.length > SHOWN_BY_DEFAULT && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center rounded-full border border-dashed border-black/[0.12] dark:border-white/[0.15] px-2.5 py-1 text-[12px] text-gray-400 dark:text-zinc-500 hover:text-violet-500 hover:border-violet-300 dark:hover:border-violet-700/60 transition-colors cursor-pointer"
          >
            {expanded ? 'fewer' : `+${entries.length - SHOWN_BY_DEFAULT} more`}
          </button>
        )}
      </div>

      {active && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1a1a1a] shadow-lg shadow-black/10 pl-3 pr-1.5 py-1.5">
          <Logo domain={active.domain} name={active.name} size={14} />
          <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{active.name}</span>
          <span className="font-mono text-[11px] tabular-nums text-gray-400 dark:text-zinc-500 mx-1.5">
            {current + 1} / {rangesRef.current.length}
          </span>
          <button type="button" onClick={() => step(-1)} aria-label="Previous mention" className={navBtn}>
            ↑
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next mention" className={navBtn}>
            ↓
          </button>
          <button type="button" onClick={deactivate} aria-label="Clear highlights" className={navBtn}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
