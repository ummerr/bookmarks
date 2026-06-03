import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'
import type { Metadata } from 'next'
import OmniTOC from './OmniTOC'

// Render at build time only; this is a static, unlisted page.
export const dynamic = 'force-static'

// Unlisted: keep it out of search indexes (also absent from nav + sitemap).
export const metadata: Metadata = {
  title: 'Gemini Omni — Reaction Report',
  description: 'Internal working report: open-web reception of Google Gemini Omni / Omni Flash.',
  robots: { index: false, follow: false },
}

const raw = readFileSync(join(process.cwd(), 'app', 'omni-report', 'report.md'), 'utf8')

// ── Front matter & body split ─────────────────────────────────────────────────
const sep = raw.indexOf('\n---\n')
const front = sep === -1 ? '' : raw.slice(0, sep)
const bodyMd = sep === -1 ? raw : raw.slice(sep + 5)

const titleMatch = front.match(/^#\s+(.+)$/m)
const fullTitle = titleMatch ? titleMatch[1].trim() : 'Gemini Omni — Reaction Report'
// Title in the report uses a colon separator; split for two-line display.
const [titleLineA, titleLineB] = (() => {
  const colon = fullTitle.indexOf(':')
  if (colon === -1) return [fullTitle, '']
  return [fullTitle.slice(0, colon), fullTitle.slice(colon + 1).trim()]
})()

const metaMd = front.replace(/^#\s+.+$/m, '').trim()
const metaHtml = marked.parse(metaMd, { gfm: true, breaks: true, async: false }) as string

// ── Lightweight parsers (build-time, no runtime cost) ────────────────────────
// Robust against ongoing rewrites: every selector is regex-based with fallbacks.

type DayRow = { day: string; n: number; pos: number; neg: number; neu: number; mix: number; net: number; pct: number }

function parseSentimentByDay(md: string): DayRow[] {
  // Locate the "Sentiment by day" header (bold paragraph OR heading) and read the next markdown table.
  const m = md.match(/Sentiment by day[\s\S]*?\n(\|[^\n]+\n\|[\s:|-]+\n[\s\S]*?)(?:\n\n|\n##|\n\*\*[A-Z])/i)
  if (!m) return []
  const tableBlock = m[1]
  const lines = tableBlock.split('\n').filter((l) => l.trim().startsWith('|'))
  const rows: DayRow[] = []
  for (const line of lines.slice(2)) {
    // Skip header + alignment rows; skip Total/summary rows (which use **Total** etc.).
    if (/\*\*total\*\*/i.test(line)) continue
    const cells = line.split('|').map((c) => c.trim()).filter((c) => c.length > 0)
    if (cells.length < 8) continue
    const day = cells[0]
    const n = Number(cells[1])
    const pos = Number(cells[2])
    const neg = Number(cells[3])
    const neu = Number(cells[4])
    const mix = Number(cells[5])
    const netRaw = cells[6].replace(/^\+/, '')
    const net = Number(netRaw)
    const pct = Number(cells[7].replace(/%/g, ''))
    if (!Number.isFinite(n) || !Number.isFinite(pct)) continue
    rows.push({ day, n, pos, neg, neu, mix, net, pct })
  }
  return rows
}

function parseClusterCount(md: string): number | null {
  const m = md.match(/Source clusters[^(]*\((\d+)\)/i)
  return m ? Number(m[1]) : null
}

function parseRevision(text: string): { date: string; rev: string } {
  // Look in the front matter line "Compiled: ... · Revised: <date> (rev. N ...)"
  const m = text.match(/Revised:\*?\*?\s*([0-9]{4}-[0-9]{2}-[0-9]{2})[^()]*\(rev\.\s*(\d+)/i)
  if (m) return { date: m[1], rev: m[2] }
  const m2 = text.match(/Compiled:\*?\*?\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)
  return { date: m2 ? m2[1] : '', rev: '' }
}

const days = parseSentimentByDay(bodyMd)
const clusters = parseClusterCount(bodyMd)
const { date: revisedDate, rev: revisionNum } = parseRevision(front)

// Derive hero stats from the sentiment-by-day table (graceful fallback if empty).
const totalTweets = days.reduce((s, r) => s + r.n, 0)
const totalPos = days.reduce((s, r) => s + r.pos, 0)
const totalNeg = days.reduce((s, r) => s + r.neg, 0)
const netSentiment = totalPos - totalNeg
const pctPositive = totalTweets > 0 ? Math.round((totalPos / totalTweets) * 100) : 0

type StatTile = { value: string; label: string }
const heroStats: StatTile[] = totalTweets > 0
  ? [
      { value: String(totalTweets), label: 'curated tweets' },
      { value: clusters != null ? String(clusters) : '—', label: 'source clusters' },
      { value: (netSentiment >= 0 ? '+' : '') + netSentiment, label: 'net sentiment' },
      { value: `${pctPositive}%`, label: 'positive' },
    ]
  : []

function formatRevisedDate(d: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  const date = new Date(d + 'T00:00:00Z')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

const eyebrowText = [
  'UNLISTED',
  revisedDate ? formatRevisedDate(revisedDate).toUpperCase() : '',
  revisionNum ? `REV. ${revisionNum}` : '',
].filter(Boolean).join(' · ')

// ── Build the sentiment-arc sparkline (server-rendered SVG) ──────────────────
function Sparkline({ rows }: { rows: DayRow[] }) {
  if (rows.length === 0) return null
  const W = 360
  const H = 64
  const padX = 4
  const gap = 4
  const cols = rows.length
  const barW = Math.max(6, (W - padX * 2 - gap * (cols - 1)) / cols)
  const maxN = Math.max(...rows.map((r) => r.n))
  const minBar = 6
  const labelEvery = cols > 8 ? Math.ceil(cols / 6) : 1

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 16}`}
      role="img"
      aria-label="Sentiment by day: bar height shows tweet count, fill height shows positive share"
      className="omni-spark"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgb(124, 58, 237)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {rows.map((r, i) => {
        const fullH = Math.max(minBar, Math.round((r.n / maxN) * H))
        const posH = Math.round((r.pct / 100) * fullH)
        const x = padX + i * (barW + gap)
        const y = H - fullH
        const fillY = H - posH
        const dayShort = r.day.replace(/^2026-0?5-/, '').replace(/^May\s*/, '')
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={fullH} rx="1.5" className="spark-track" />
            <rect x={x} y={fillY} width={barW} height={posH} rx="1.5" fill="url(#spark-fill)" />
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={H + 12} textAnchor="middle" className="spark-tick">
                {dayShort}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Heading metadata + HTML post-processing ──────────────────────────────────
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const headings = [...bodyMd.matchAll(/^##\s+(.+)$/gm)].map((m) => {
  const text = m[1].replace(/[*`]/g, '').trim()
  return { text, id: slugify(text) }
})

let h2Cursor = 0
let processed = marked.parse(bodyMd, { gfm: true, async: false }) as string

// 1. Inject H2 ids + section-eyebrow lines above each H2.
processed = processed.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
  const meta = headings[h2Cursor++]
  if (!meta) return `<h2>${inner}</h2>`
  const num = String(h2Cursor).padStart(2, '0')
  return (
    `<p class="section-eyebrow"><span class="section-num">§ ${num}</span>` +
    `<span class="section-dot">·</span>` +
    `<span class="section-name">${meta.text}</span></p>` +
    `<h2 id="${meta.id}"><span class="h2-rule" aria-hidden="true"></span>${inner}</h2>`
  )
})

// 2. Wrap tables in horizontal-scroll container.
processed = processed
  .replace(/<table>/g, '<div class="omni-table-wrap"><table>')
  .replace(/<\/table>/g, '</table></div>')

// 3. Right-align numeric td cells and inject %-bar fills in the sentiment-by-day table.
// Detect that specific table by the presence of "% Positive" in its thead.
processed = processed.replace(/<div class="omni-table-wrap"><table>([\s\S]*?)<\/table><\/div>/g, (match, tbl) => {
  const isSentimentByDay = /%\s*Positive/i.test(tbl)
  const transformed = tbl.replace(/<td>([\s\S]*?)<\/td>/g, (cell: string, content: string) => {
    const text = content.trim()
    // %-bar treatment (only inside the sentiment-by-day table, on the % column).
    if (isSentimentByDay && /^\d+(?:\.\d+)?%$/.test(text)) {
      const pct = Number(text.replace('%', ''))
      return `<td class="td-num td-pct"><span class="pct-bar" style="--w:${pct}%"></span><span class="pct-text">${text}</span></td>`
    }
    // Right-align cells whose visible text starts with a digit / sign.
    if (/^[+\-]?\d/.test(text)) {
      return `<td class="td-num">${content}</td>`
    }
    return cell
  })
  return `<div class="omni-table-wrap"><table>${transformed}</table></div>`
})

// 4. Wrap Executive Summary's numbered H3s as exec cards.
// Pattern: between #executive-summary h2 and the next h2, group each H3 starting with "N." + the next paragraph.
processed = processed.replace(
  /(<h2 id="executive-summary">[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2 id=)/,
  (_full, h2, inner) => {
    const cards: string[] = []
    let trailing = inner
    const rx = /<h3>\s*(\d+)\.\s*([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g
    let m: RegExpExecArray | null
    while ((m = rx.exec(inner)) !== null) {
      const [, num, title, body] = m
      cards.push(
        `<aside class="exec-card">` +
          `<div class="exec-num"><span>${num.padStart(2, '0')}</span></div>` +
          `<div class="exec-body">` +
            `<h3>${title}</h3>` +
            `<p>${body}</p>` +
          `</div>` +
        `</aside>`,
      )
    }
    if (cards.length === 0) return `${h2}${inner}`
    // Remove the cards' source markup from `inner` to avoid duplication.
    trailing = inner.replace(rx, '').trim()
    return `${h2}<div class="exec-cards">${cards.join('')}</div>${trailing}`
  },
)

// 5. Split blockquote paragraphs at every "— @handle, date" attribution boundary.
// Marked merges consecutive ">" lines into a single <p> with literal "\n" separators;
// we cleave each line into <p>quote</p><footer>— attribution</footer> pairs.
// The attribution may start with a plain "@handle" OR a markdown link rendered to
// "<a href=…>@handle</a>" — in the linked case we tag the handle anchor and append a
// "View on X ↗" permalink so highlighted tweets click through to x.com.
const QUOTE_LINE =
  /^([\s\S]+?)\s+[—–]\s+((?:<a\s+href="[^"]*"[^>]*>)?@[A-Za-z0-9_]+[\s\S]*)$/
processed = processed.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (_, inner) => {
  const transformed = inner.replace(/<p>([\s\S]*?)<\/p>/g, (match: string, paraInner: string) => {
    const lines = paraInner.split(/\n+/).map((l: string) => l.trim()).filter(Boolean)
    const parsed: { body: string; attr: string }[] = []
    for (const line of lines) {
      const m = line.match(QUOTE_LINE)
      if (!m) return match // not a tweet-quote paragraph; leave untouched
      let attr = m[2].trim()
      // If the handle is a link, style the anchor + add an explicit permalink button.
      const hrefMatch = attr.match(/<a\s+href="([^"]+)"[^>]*>/)
      let viewLink = ''
      if (hrefMatch) {
        attr = attr.replace(
          /<a\s+href="([^"]+)"([^>]*)>/,
          '<a href="$1" class="tweet-handle" target="_blank" rel="noopener"$2>',
        )
        viewLink = ` <a class="tweet-link" href="${hrefMatch[1]}" target="_blank" rel="noopener">View on X ↗</a>`
      }
      parsed.push({ body: m[1].trim(), attr: `— ${attr}${viewLink}` })
    }
    if (parsed.length === 0) return match
    return parsed
      .map((p) => `<p>${p.body}</p><footer class="quote-attr">${p.attr}</footer>`)
      .join('')
  })
  return `<blockquote>${transformed}</blockquote>`
})

const bodyHtml = processed

// ── Footer recap text (build-time slice of front matter) ─────────────────────
const stripBold = (s: string) => s.replace(/\*\*/g, '').replace(/\s+·\s+/g, ' · ').trim()
const methodLine = stripBold((front.match(/\*\*Method:\*\*\s*([^\n]+)/) || [])[1] ?? '')
const companionLine = stripBold((front.match(/\*\*Companion:\*\*\s*([^\n]+)/) || [])[1] ?? '')
// Compiled line in the source carries "**Compiled:** D1 · **Revised:** D2 (rev. N …)".
// Keep just the compiled date; revision is already in the eyebrow.
const compiledRaw = (front.match(/\*\*Compiled:\*\*\s*([^\n]+)/) || [])[1] ?? ''
const compiledLine = stripBold(compiledRaw.split(/\s*·\s*\*\*Revised/)[0])

// ─────────────────────────────────────────────────────────────────────────────

export default function OmniReportPage() {
  return (
    <main className="relative">
      {/* Pure-CSS scroll-driven reading progress bar (degrades silently on older browsers). */}
      <div className="omni-progress" aria-hidden="true" />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="omni-hero relative overflow-hidden">
        <div className="omni-hero-mesh" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-16">
          <p className="omni-eyebrow">{eyebrowText}</p>
          <h1 className="omni-title">
            <span className="omni-title-a">{titleLineA}</span>
            {titleLineB && (
              <>
                <span className="omni-title-sep" aria-hidden="true">:</span>{' '}
                <span className="omni-title-b">{titleLineB}</span>
              </>
            )}
          </h1>

          {heroStats.length > 0 && (
            <div className="omni-stats">
              {heroStats.map((s, i) => (
                <div key={i} className="omni-stat">
                  <div className="omni-stat-value">{s.value}</div>
                  <div className="omni-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {days.length > 0 && (
            <div className="omni-spark-wrap">
              <div className="omni-spark-caption">
                <span>Sentiment by day</span>
                <span className="omni-spark-legend">
                  <span className="omni-spark-key omni-spark-key-track" /> total ·{' '}
                  <span className="omni-spark-key omni-spark-key-fill" /> positive
                </span>
              </div>
              <Sparkline rows={days} />
            </div>
          )}

          <div
            className="omni-frontmeta mt-8 text-sm"
            dangerouslySetInnerHTML={{ __html: metaHtml }}
          />
        </div>
      </section>

      {/* ── Two-pane shell ────────────────────────────────────────────── */}
      <div className="omni-shell">
        <aside className="omni-toc-rail" aria-label="Table of contents (sidebar)">
          <div className="omni-toc-rail-inner">
            <p className="omni-toc-label">CONTENTS</p>
            <OmniTOC headings={headings} variant="sidebar" />
          </div>
        </aside>

        <div className="omni-body-col">
          <section className="omni-toc-card-wrap">
            <nav className="omni-toc-card" aria-label="Table of contents">
              <p className="omni-toc-label">On this page</p>
              <OmniTOC headings={headings} variant="inline" />
            </nav>
          </section>

          <article
            className="omni-report"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          <footer className="omni-recap">
            <p className="omni-eyebrow">END · {eyebrowText.replace(/^UNLISTED · /, '')}</p>
            {compiledLine && <p className="omni-recap-line"><strong>Compiled:</strong> {compiledLine}</p>}
            {methodLine && <p className="omni-recap-line"><strong>Method:</strong> {methodLine}</p>}
            {companionLine && <p className="omni-recap-line"><strong>Companion:</strong> {companionLine}</p>}
          </footer>
        </div>
      </div>
    </main>
  )
}
