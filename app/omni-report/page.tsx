import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { marked } from 'marked'
import type { Metadata } from 'next'

// Render at build time only; this is a static, unlisted page.
export const dynamic = 'force-static'

// Unlisted: keep it out of search indexes (also absent from nav + sitemap).
export const metadata: Metadata = {
  title: 'Gemini Omni — Reaction Report',
  description: 'Internal working report: open-web reception of Google Gemini Omni / Omni Flash.',
  robots: { index: false, follow: false },
}

const raw = readFileSync(join(process.cwd(), 'app', 'omni-report', 'report.md'), 'utf8')

// Split the front matter (title + meta block) from the body (Executive Summary onward).
const sep = raw.indexOf('\n---\n')
const front = sep === -1 ? '' : raw.slice(0, sep)
const bodyMd = sep === -1 ? raw : raw.slice(sep + 5)

const titleMatch = front.match(/^#\s+(.+)$/m)
const title = titleMatch ? titleMatch[1].trim() : 'Gemini Omni — Reaction Report'
const metaMd = front.replace(/^#\s+.+$/m, '').trim()
const metaHtml = marked.parse(metaMd, { gfm: true, breaks: true, async: false }) as string

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Table of contents from the body's H2 headings; inject matching ids for anchors.
const headings = [...bodyMd.matchAll(/^##\s+(.+)$/gm)].map((m) => {
  const text = m[1].replace(/[*`]/g, '').trim()
  return { text, id: slugify(text) }
})
let h = 0
const bodyHtml = (marked.parse(bodyMd, { gfm: true, async: false }) as string)
  .replace(/<h2>/g, () => `<h2 id="${headings[h++]?.id ?? ''}">`)
  // Wrap tables in a horizontally-scrollable container so the table itself can
  // keep its native table formatting context (proper column sizing, borders).
  .replace(/<table>/g, '<div class="omni-table-wrap"><table>')
  .replace(/<\/table>/g, '</table></div>')

const META_CHIPS = ['79 curated tweets', '13 web-research reads', '9 source clusters', 'May 25, 2026']

export default function OmniReportPage() {
  return (
    <main className="relative">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[680px] rounded-full bg-gradient-to-br from-violet-400/20 via-pink-300/10 to-transparent blur-3xl dark:from-violet-600/10 dark:via-pink-500/5" />
        <div className="relative max-w-4xl mx-auto px-5 pt-14 pb-10 md:pt-20">
          <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-zinc-500">
            Unlisted working report
          </p>
          <h1 className="mt-3 font-serif text-3xl md:text-5xl font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2">
            {META_CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-full bg-black/[0.05] dark:bg-white/[0.06] px-3 py-1 text-xs font-medium text-gray-600 dark:text-zinc-300"
              >
                {c}
              </span>
            ))}
          </div>
          <div
            className="omni-frontmeta mt-6 text-sm"
            dangerouslySetInnerHTML={{ __html: metaHtml }}
          />
        </div>
      </section>

      {/* ── Contents ──────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pt-10">
        <nav className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">
            On this page
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
            {headings.map((hd, i) => (
              <li key={hd.id} className="flex gap-2.5">
                <span className="text-gray-300 dark:text-zinc-600 tabular-nums shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <a
                  href={`#${hd.id}`}
                  className="text-gray-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  {hd.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {/* ── Report body ───────────────────────────────────────────────── */}
      <article
        className="omni-report max-w-4xl mx-auto px-5 py-10 md:py-12"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </main>
  )
}
