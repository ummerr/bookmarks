import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'
import type { Metadata } from 'next'
import CopyMarkdownButton from './CopyMarkdownButton'

// Render at build time only; this is a static, unlisted page.
export const dynamic = 'force-static'

// Unlisted: keep it out of search indexes (also absent from nav + sitemap).
export const metadata: Metadata = {
  title: 'Flow + Omni — Exec Brief',
  description: 'Internal one-page brief: Google Flow + Gemini Omni reception, wins, wounds, and product asks.',
  robots: { index: false, follow: false },
}

const raw = readFileSync(join(process.cwd(), 'app', 'flow-brief', 'brief.md'), 'utf8')

// ── Front matter & body split ─────────────────────────────────────────────────
const sep = raw.indexOf('\n---\n')
const front = sep === -1 ? '' : raw.slice(0, sep)
const bodyMd = sep === -1 ? raw : raw.slice(sep + 5)

const titleMatch = front.match(/^#\s+(.+)$/m)
const fullTitle = titleMatch ? titleMatch[1].trim() : 'Flow + Omni — Exec Brief'

const metaMd = front.replace(/^#\s+.+$/m, '').trim()
const metaHtml = marked.parse(metaMd, { gfm: true, breaks: true, async: false }) as string

// Hero stat tiles — derived from the June-3 refreshed corpus (132 relevant posts).
const heroStats = [
  { value: '132', label: 'curated posts' },
  { value: '69%', label: 'positive' },
  { value: '+81', label: 'net sentiment' },
  { value: '75%', label: 'positive on Flow' },
]

const eyebrowText = 'UNLISTED · JUN 3, 2026 · INTERNAL BRIEF'

// ── Heading metadata + HTML post-processing ──────────────────────────────────
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const headings = [...bodyMd.matchAll(/^##\s+(.+)$/gm)].map((m) => {
  const text = m[1].replace(/[*`]/g, '').trim()
  return { text, id: slugify(text) }
})

let h2Cursor = 0
let processed = marked.parse(bodyMd, { gfm: true, async: false }) as string

// 1. Inject H2 ids + section-eyebrow lines above each H2 (reuses omni-report styling).
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

const bodyHtml = processed

// ─────────────────────────────────────────────────────────────────────────────

export default function FlowBriefPage() {
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
            <span className="omni-title-a">{fullTitle}</span>
          </h1>

          <div className="omni-stats">
            {heroStats.map((s, i) => (
              <div key={i} className="omni-stat">
                <div className="omni-stat-value">{s.value}</div>
                <div className="omni-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="omni-copy-row">
            <CopyMarkdownButton markdown={raw} />
            <span className="omni-copy-hint">Paste straight into a Google Doc, Slack, or email</span>
          </div>

          <div
            className="omni-frontmeta mt-8 text-sm"
            dangerouslySetInnerHTML={{ __html: metaHtml }}
          />
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto w-full px-5">
        <article
          className="omni-report"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <footer className="omni-recap">
          <p className="omni-eyebrow">END · JUN 3, 2026 · INTERNAL BRIEF</p>
          <p className="omni-recap-line"><strong>Companion:</strong> full Omni reaction report at /omni-report</p>
        </footer>
      </div>
    </main>
  )
}
