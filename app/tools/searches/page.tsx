'use client'

import { useState } from 'react'
import {
  SEARCHES,
  SEARCH_CATEGORIES,
  EXTERNAL_SOURCES,
  SOURCE_CATEGORIES,
  buildTwitterSearchUrl,
  addDateRange,
  type SearchQuery,
  type ExternalSource,
} from '@/lib/searches'

const COLOR_STYLES: Record<string, { badge: string }> = {
  violet: { badge: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800/50' },
  pink: { badge: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800/50' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800/50' },
  amber: { badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800/50' },
  sky: { badge: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800/50' },
}

// ── Search card (Twitter) ─────────────────────────────────────────────────

function SearchCard({ search, fresh }: { search: SearchQuery; fresh: boolean }) {
  const query = fresh ? addDateRange(search.query) : search.query

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.02] p-4 hover:border-black/[0.15] dark:hover:border-white/15 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {search.label}
          </span>
          {search.hot && (
            <span className="shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800/40 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-300 uppercase tracking-wide">
              hot
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed mb-2">
          {search.description}
        </p>
        <code className="block text-[11px] text-gray-400 dark:text-zinc-600 bg-black/[0.03] dark:bg-white/[0.03] rounded-lg px-2.5 py-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {query}
        </code>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <a
          href={buildTwitterSearchUrl(query, 'top')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-black/[0.04] dark:bg-white/8 border border-black/[0.08] dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-black/[0.08] dark:hover:bg-white/12 hover:border-black/[0.15] dark:hover:border-white/20 transition-all"
        >
          Top
          <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <a
          href={buildTwitterSearchUrl(query, 'latest')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-black/[0.04] dark:bg-white/8 border border-black/[0.08] dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-black/[0.08] dark:hover:bg-white/12 hover:border-black/[0.15] dark:hover:border-white/20 transition-all"
        >
          Latest
          <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}

// ── External source card ──────────────────────────────────────────────────

function SourceCard({ source }: { source: ExternalSource }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.02] p-4 hover:border-black/[0.15] dark:hover:border-white/15 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {source.label}
          </span>
          <svg className="h-3 w-3 text-gray-300 dark:text-zinc-600 group-hover:text-gray-500 dark:group-hover:text-zinc-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
          {source.description}
        </p>
      </div>
    </a>
  )
}

// ── Sub-tab type ─────────────────────────────────────────────────────────

type SubTab = 'sources' | 'twitter'

// ── Page ──────────────────────────────────────────────────────────────────

export default function SearchesPage() {
  const [tab, setTab] = useState<SubTab>('twitter')
  const [fresh, setFresh] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  const twitterGrouped = SEARCH_CATEGORIES.map((cat) => ({
    ...cat,
    searches: SEARCHES.filter((s) => s.category === cat.key),
  })).filter((g) => !filter || g.key === filter)

  const sourceGrouped = SOURCE_CATEGORIES.map((cat) => ({
    ...cat,
    sources: EXTERNAL_SOURCES.filter((s) => s.category === cat.key),
  }))

  return (
    <div className="text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Discovery</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">
            High-signal Twitter/X searches for finding viral prompts. Open with extension active to capture.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-black/[0.08] dark:border-white/8 pb-px">
          <button
            onClick={() => setTab('twitter')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'twitter'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
            }`}
          >
            Twitter/X Searches
          </button>
          <button
            onClick={() => setTab('sources')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'sources'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
            }`}
          >
            Reference Databases
          </button>
        </div>

        {/* ── Prompt Databases tab ─────────────────────────────────────── */}
        {tab === 'sources' && (
          <div className="flex flex-col gap-8">
            {sourceGrouped.map((group) => {
              const style = COLOR_STYLES[group.color]
              return (
                <section key={group.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}>
                      {group.label}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-zinc-600">
                      {group.sources.length} {group.sources.length === 1 ? 'source' : 'sources'}
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {group.sources.map((source, i) => (
                      <SourceCard key={i} source={source} />
                    ))}
                  </div>
                </section>
              )
            })}

            {/* Why these sources */}
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">When to use these</h2>
              <ul className="text-xs text-gray-400 dark:text-zinc-500 space-y-1.5 leading-relaxed">
                <li><strong className="text-gray-500 dark:text-zinc-400">Twitter is the primary source</strong> — viral prompts are validated by real audience reaction and you see the actual output. These databases are supplementary.</li>
                <li><strong className="text-gray-500 dark:text-zinc-400">Civitai / PromptHero</strong> are useful for learning parameter patterns (CFG, steps, negative prompts) that creators on Twitter rarely include.</li>
                <li><strong className="text-gray-500 dark:text-zinc-400">UlazAI / video databases</strong> are template references — good for learning prompt structure, but not engagement-validated like Twitter.</li>
                <li><strong className="text-gray-500 dark:text-zinc-400">Reddit</strong> has full metadata but lower signal-to-noise than engagement-filtered Twitter searches.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── Twitter/X Searches tab ───────────────────────────────────── */}
        {tab === 'twitter' && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {SEARCH_CATEGORIES.map((cat) => {
                const style = COLOR_STYLES[cat.color]
                const active = filter === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => setFilter(active ? null : cat.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? style.badge
                        : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
              <div className="ml-auto">
                <button
                  onClick={() => setFresh(!fresh)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    fresh
                      ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800/50'
                      : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                  }`}
                >
                  This week only
                </button>
              </div>
            </div>

            {/* Search groups */}
            <div className="flex flex-col gap-8">
              {twitterGrouped.map((group) => {
                const style = COLOR_STYLES[group.color]
                return (
                  <section key={group.key}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}>
                        {group.label}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-zinc-600">
                        {group.searches.length} {group.searches.length === 1 ? 'query' : 'queries'}
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {group.searches.map((search, i) => (
                        <SearchCard key={i} search={search} fresh={fresh} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>

            {/* Tips */}
            <div className="mt-10 rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Search tips</h2>
              <ul className="text-xs text-gray-400 dark:text-zinc-500 space-y-1.5 leading-relaxed">
                <li><strong className="text-gray-500 dark:text-zinc-400">Extension workflow:</strong> Open a search link, browse results with your extension active, and capture as you scroll.</li>
                <li><strong className="text-gray-500 dark:text-zinc-400">Create a Twitter List</strong> of prolific prompt sharers, then browse the list with the extension for bulk capture.</li>
                <li><strong className="text-gray-500 dark:text-zinc-400">Add operators:</strong> <code className="bg-black/[0.04] dark:bg-white/5 px-1 rounded">lang:en</code> for English only, <code className="bg-black/[0.04] dark:bg-white/5 px-1 rounded">-filter:replies</code> to skip replies, <code className="bg-black/[0.04] dark:bg-white/5 px-1 rounded">-filter:retweets</code> to skip RTs.</li>
                <li><strong className="text-gray-500 dark:text-zinc-400">&quot;This week only&quot;</strong> adds a date range and drops min_faves to 3 to catch fresh posts before they go viral.</li>
                <li><strong className="text-gray-500 dark:text-zinc-400">Twitter search limitation:</strong> Older tweets (7+ days) may not appear unless from high-engagement accounts. Use &quot;Latest&quot; tab for freshest results.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
