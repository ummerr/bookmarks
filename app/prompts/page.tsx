'use client'

import { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Bookmark, PromptCategory, PromptTheme } from '@/lib/types'
import PromptCard from '@/components/prompts/PromptCard'
import { useDebounce } from '@/components/prompts/useDebounce'
import {
  MEDIA_TYPE_CATEGORIES,
  MODEL_FAMILIES,
  CATEGORIES,
  THEMES,
  THEME_COLORS,
  CATEGORY_COLORS,
  categoryLabel,
  modelToFamily,
  type MediaType,
} from '@/components/prompts/constants'

function CopyLinkButton() {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 text-xs transition-colors ${
        copied ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400'
      }`}
    >
      {copied ? (
        <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Link copied</>
      ) : (
        <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>Share view</>
      )}
    </button>
  )
}

function PromptsPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const resultsRef = useRef<HTMLDivElement>(null)

  const [allPrompts, setAllPrompts] = useState<Bookmark[]>([])
  const [activeMediaType, setActiveMediaType] = useState<MediaType>(() => {
    const m = searchParams.get('media')
    return (m === 'image' || m === 'video') ? m : 'all'
  })
  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'all' | 'uncategorized'>(
    (searchParams.get('type') as PromptCategory | 'all' | 'uncategorized') || 'all'
  )
  const [activeTheme, setActiveTheme] = useState<PromptTheme | 'all'>(
    (searchParams.get('theme') as PromptTheme | 'all') || 'all'
  )
  const [activeModel, setActiveModel] = useState<string>(searchParams.get('model') || 'all')
  const [activeMultiShot, setActiveMultiShot] = useState(searchParams.get('multi_shot') === 'true')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const debouncedSearch = useDebounce(search, 300)
  const [sortBy, setSortBy] = useState<'date' | 'model' | 'length'>(
    (searchParams.get('sort') as 'date' | 'model' | 'length') || 'date'
  )
  const [loading, setLoading] = useState(true)
  const [showAllModels, setShowAllModels] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(
    (!!searchParams.get('theme') && searchParams.get('theme') !== 'all') ||
    (!!searchParams.get('model') && searchParams.get('model') !== 'all')
  )

  // Scroll to top when filters change (not search — that would be jarring while typing)
  useEffect(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeMediaType, activeCategory, activeTheme, activeModel, activeMultiShot, sortBy])

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (activeMediaType !== 'all') params.set('media', activeMediaType)
    if (activeCategory !== 'all') params.set('type', activeCategory)
    if (activeTheme !== 'all') params.set('theme', activeTheme)
    if (activeModel !== 'all') params.set('model', activeModel)
    if (activeMultiShot) params.set('multi_shot', 'true')
    if (sortBy !== 'date') params.set('sort', sortBy)
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [debouncedSearch, activeMediaType, activeCategory, activeTheme, activeModel, activeMultiShot, sortBy]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPrompts(cat: PromptCategory | 'all' | 'uncategorized') {
    setLoading(true)
    try {
      const params = cat !== 'all' && cat !== 'uncategorized' ? `?prompt_category=${cat}` : ''
      const res = await fetch(`/api/prompts${params}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setAllPrompts(data)
      }
    } catch {
      // Network error — keep existing data
    }
    setLoading(false)
  }

  useEffect(() => { fetchPrompts(activeCategory) }, [activeCategory])

  // Counts by prompt category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of allPrompts) {
      if (p.prompt_category) counts[p.prompt_category] = (counts[p.prompt_category] ?? 0) + 1
    }
    return counts
  }, [allPrompts])

  // Counts by theme
  const themeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of allPrompts) {
      for (const t of p.prompt_themes ?? []) counts[t] = (counts[t] ?? 0) + 1
    }
    return counts
  }, [allPrompts])

  // Compute distinct model families with counts from fetched data
  const availableModels = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of allPrompts) {
      if (!p.detected_model) continue
      const family = modelToFamily(p.detected_model)
      counts[family] = (counts[family] ?? 0) + 1
    }
    return Object.entries(counts)
      .filter(([, count]) => count >= 10)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({ label, count }))
  }, [allPrompts])

  const uncategorizedCount = useMemo(() =>
    allPrompts.filter((p) => !p.prompt_category).length
  , [allPrompts])

  const multiShotVideoCount = useMemo(() =>
    allPrompts.filter((p) => p.is_multi_shot && p.prompt_category?.startsWith('video_')).length
  , [allPrompts])

  // Client-side filter by media type, theme, model, debounced search
  const filtered = useMemo(() => {
    let result = allPrompts
    if (activeCategory === 'uncategorized') {
      result = result.filter((p) => !p.prompt_category)
    } else {
      if (activeMediaType !== 'all') {
        const allowed = new Set(MEDIA_TYPE_CATEGORIES[activeMediaType])
        result = result.filter((p) => p.prompt_category && allowed.has(p.prompt_category))
      }
      if (activeCategory !== 'all') {
        result = result.filter((p) => p.prompt_category === activeCategory)
      }
    }
    if (activeTheme !== 'all') {
      result = result.filter((p) => p.prompt_themes?.includes(activeTheme))
    }
    if (activeModel !== 'all') {
      result = result.filter((p) => p.detected_model && modelToFamily(p.detected_model) === activeModel)
    }
    if (activeMultiShot) {
      result = result.filter((p) => p.is_multi_shot)
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (p) =>
          (p.extracted_prompt ?? p.tweet_text).toLowerCase().includes(q) ||
          (p.detected_model ?? '').toLowerCase().includes(q) ||
          p.author_handle.toLowerCase().includes(q)
      )
    }
    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'model') {
        const aModel = (a.detected_model ?? '').toLowerCase()
        const bModel = (b.detected_model ?? '').toLowerCase()
        if (aModel !== bModel) return aModel.localeCompare(bModel)
      }
      if (sortBy === 'length') {
        const aLen = (a.extracted_prompt ?? a.tweet_text).length
        const bLen = (b.extracted_prompt ?? b.tweet_text).length
        return bLen - aLen
      }
      // Default: by date (most recent first), items with no date sink
      const aDate = a.bookmarked_at ?? a.created_at ?? ''
      const bDate = b.bookmarked_at ?? b.created_at ?? ''
      return bDate.localeCompare(aDate)
    })
    return result
  }, [allPrompts, activeMediaType, activeCategory, activeTheme, activeModel, activeMultiShot, debouncedSearch, sortBy])

  function clearAllFilters() {
    setActiveMediaType('all')
    setActiveCategory('all')
    setActiveTheme('all')
    setActiveModel('all')
    setActiveMultiShot(false)
    setSearch('')
    setSortBy('date')
  }

  const activeChips = [
    ...(debouncedSearch.trim() ? [{ label: `"${debouncedSearch}"`, onRemove: () => setSearch('') }] : []),
    ...(activeMediaType !== 'all' ? [{ label: activeMediaType.charAt(0).toUpperCase() + activeMediaType.slice(1), onRemove: () => { setActiveMediaType('all'); setActiveCategory('all') } }] : []),
    ...(activeCategory !== 'all' && activeCategory !== 'uncategorized' ? [{ label: categoryLabel(activeCategory), onRemove: () => setActiveCategory('all') }] : []),
    ...(activeCategory === 'uncategorized' ? [{ label: 'Untagged', onRemove: () => setActiveCategory('all') }] : []),
    ...(activeTheme !== 'all' ? [{ label: THEMES.find((t) => t.value === activeTheme)?.label ?? activeTheme, onRemove: () => setActiveTheme('all') }] : []),
    ...(activeModel !== 'all' ? [{ label: activeModel, onRemove: () => setActiveModel('all') }] : []),
    ...(activeMultiShot ? [{ label: 'Multishot', onRemove: () => setActiveMultiShot(false) }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 flex gap-6 items-start">

        {/* Sidebar — dataset card, sticky */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <div className="sticky top-14 rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c0c] border border-black/[0.08] dark:border-white/[0.06]">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] tracking-[0.2em] text-gray-400 dark:text-white/25 uppercase">Dataset</span>
                <span className="text-black/10 dark:text-white/10">·</span>
                <span className="font-mono text-[10px] text-gray-600 dark:text-white/60 font-medium">ummerr/prompts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-gray-400 dark:text-white/25">v1.0</span>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-medium tracking-wide">OPEN</span>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 pt-4 pb-5 flex flex-col gap-4">
              {/* Title + description */}
              <div className="flex flex-col gap-2">
                <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight tracking-tight">
                  The Most Shared AI Prompts on X
                </h1>
                <p className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed">
                  A corpus of organic, in-the-wild generative AI prompts sourced from high-engagement posts on X/Twitter — covering image and video generation. Unlike synthetic benchmarks, every entry reflects a real practitioner decision: what to generate, how to phrase it, and which model to use.
                </p>
                <div className="flex flex-wrap gap-1">
                  {['CC BY 4.0', 'Multi-Modal', 'In-the-Wild', 'Engagement-Filtered'].map((tag) => (
                    <span key={tag} className="rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15 px-1.5 py-0.5 text-[9px] font-mono font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Task categories */}
              <div className="flex flex-col gap-2">
                {(
                  [
                    { label: 'Image', cats: ['image_t2i', 'image_r2i', 'image_i2i', 'image_character_ref'] },
                    { label: 'Video', cats: ['video_t2v', 'video_r2v', 'video_i2v', 'video_v2v'] },
                  ] as { label: string; cats: (keyof typeof CATEGORY_COLORS)[] }[]
                ).map(({ label, cats }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="font-mono text-[9px] tracking-[0.15em] text-gray-400 dark:text-white/25 uppercase">{label}</span>
                    <div className="flex flex-wrap gap-1">
                      {cats.map((cat) => (
                        <a
                          key={cat}
                          href={`/prompts?type=${cat}`}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-75 ${CATEGORY_COLORS[cat]}`}
                        >
                          {categoryLabel(cat)}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: loading ? '—' : allPrompts.length.toLocaleString(), label: 'Prompts', sub: 'sourced from X' },
                  { value: loading ? '—' : Object.keys(categoryCounts).length.toString(), label: 'Techniques', sub: 'image + video' },
                  { value: loading ? '—' : availableModels.length.toString() + '+', label: 'AI models', sub: 'every major one' },
                  { value: '0%', label: 'Synthetic', sub: 'hand curated' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] px-3 py-2.5">
                    <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white leading-none">{s.value}</span>
                    <span className="text-[10px] text-gray-600 dark:text-white/50 font-medium mt-0.5">{s.label}</span>
                    <span className="text-[9px] text-gray-400 dark:text-white/20">{s.sub}</span>
                  </div>
                ))}
              </div>

              {/* Feature flags */}
              <div className="flex flex-col gap-1.5">
                {[
                  'Sourced from viral AI generation posts on X/Twitter',
                  'Filter to any model, style, or technique',
                  'Updated as high-engagement posts surface new prompts',
                ].map((f) => (
                  <span key={f} className="flex items-start gap-1.5 text-[10px] text-gray-400 dark:text-white/30 leading-relaxed">
                    <svg className="h-2.5 w-2.5 text-emerald-500 dark:text-emerald-400/70 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </span>
                ))}
              </div>

              {/* Topic tags */}
              <div className="flex flex-wrap gap-1">
                {['image-generation', 'video-generation', 'in-the-wild-prompts', 'practitioner-behavior', 'engagement-filtered'].map((tag) => (
                  <span key={tag} className="rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] px-1.5 py-0.5 text-[9px] font-mono text-gray-400 dark:text-zinc-500">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Download + license */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5">
                  {[
                    { format: 'jsonl', label: 'JSONL' },
                    { format: 'csv',   label: 'CSV' },
                    { format: 'json',  label: 'JSON' },
                  ].map(({ format, label }) => (
                    <a
                      key={format}
                      href={`/api/prompts/download?format=${format}`}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-black/[0.08] dark:border-white/8 bg-black/[0.03] dark:bg-white/[0.04] px-2 py-2 text-[11px] font-medium text-gray-600 dark:text-zinc-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
                    >
                      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {label}
                    </a>
                  ))}
                </div>
                <span className="text-[9px] text-gray-400 dark:text-white/20 text-center">
                  CC BY 4.0 — cite as <span className="font-mono">ummerr/prompts</span>
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts…"
            className="w-full rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 outline-none focus:border-black/[0.15] dark:focus:border-white/20 focus:bg-gray-50 dark:focus:bg-white/5 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 border border-black/[0.06] dark:border-white/6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3">

          {/* Row: Modality — Image / Video */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0 w-14">Modality</span>
            <div className="flex items-center gap-1.5">
              {(['image', 'video'] as const).map((mt) => (
                <button
                  key={mt}
                  onClick={() => {
                    const next = activeMediaType === mt ? 'all' : mt
                    setActiveMediaType(next)
                    setActiveCategory('all')
                    setActiveMultiShot(false)
                  }}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                    activeMediaType === mt
                      ? 'bg-black/8 text-gray-900 border-black/[0.2] font-medium dark:bg-white/12 dark:text-white dark:border-white/25'
                      : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                  }`}
                >
                  {mt === 'image' ? '🖼️ Image' : '🎬 Video'}
                </button>
              ))}
            </div>
          </div>

          {/* Row: Image subcategories */}
          {activeMediaType === 'image' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0 w-14">Type</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                    activeCategory === 'all'
                      ? 'bg-black/8 text-gray-900 border-black/[0.2] font-medium dark:bg-white/12 dark:text-white dark:border-white/25'
                      : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                  }`}
                >
                  All
                </button>
                {(['image_person', 'image_advertisement', 'image_collage'] as const).filter((c) => (categoryCounts[c] ?? 0) >= 10).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                      activeCategory === cat
                        ? `${CATEGORY_COLORS[cat]} font-medium`
                        : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                    }`}
                  >
                    {categoryLabel(cat)}<span className="opacity-50"> {categoryCounts[cat]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Row: Video subcategories */}
          {activeMediaType === 'video' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0 w-14">Type</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setActiveCategory('all'); setActiveMultiShot(false) }}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                    activeCategory === 'all' && !activeMultiShot
                      ? 'bg-black/8 text-gray-900 border-black/[0.2] font-medium dark:bg-white/12 dark:text-white dark:border-white/25'
                      : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                  }`}
                >
                  All
                </button>
                {(['video_t2v', 'video_i2v', 'video_r2v'] as const).filter((c) => (categoryCounts[c] ?? 0) >= 10).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setActiveMultiShot(false) }}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                      activeCategory === cat && !activeMultiShot
                        ? `${CATEGORY_COLORS[cat]} font-medium`
                        : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                    }`}
                  >
                    {categoryLabel(cat)}<span className="opacity-50"> {categoryCounts[cat]}</span>
                  </button>
                ))}
                {multiShotVideoCount >= 10 && (
                  <button
                    onClick={() => {
                      const next = !activeMultiShot
                      setActiveMultiShot(next)
                      if (next) setActiveCategory('all')
                    }}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                      activeMultiShot
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 font-medium dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800/50'
                        : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                    }`}
                  >
                    Multishot<span className="opacity-50"> {multiShotVideoCount}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="self-start text-[11px] text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
          >
            Advanced {showAdvanced ? '↑' : '↓'}
          </button>

          {/* Advanced section */}
          {showAdvanced && (
            <div className="flex flex-col gap-2 pt-2 border-t border-black/[0.06] dark:border-white/6">

              {/* Extra image types */}
              {activeMediaType === 'image' && (['image_t2i', 'image_i2i', 'image_character_ref', 'image_inpainting'] as const).some((c) => (categoryCounts[c] ?? 0) >= 10) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0 w-14">More</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['image_t2i', 'image_i2i', 'image_character_ref', 'image_inpainting'] as const).filter((c) => (categoryCounts[c] ?? 0) >= 10).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                          activeCategory === cat
                            ? `${CATEGORY_COLORS[cat]} font-medium`
                            : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                        }`}
                      >
                        {categoryLabel(cat)}<span className="opacity-50"> {categoryCounts[cat]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra video types */}
              {activeMediaType === 'video' && (categoryCounts['video_v2v'] ?? 0) >= 10 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0 w-14">More</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setActiveCategory('video_v2v'); setActiveMultiShot(false) }}
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                        activeCategory === 'video_v2v' && !activeMultiShot
                          ? `${CATEGORY_COLORS['video_v2v']} font-medium`
                          : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                      }`}
                    >
                      {categoryLabel('video_v2v')}<span className="opacity-50"> {categoryCounts['video_v2v']}</span>
                    </button>
                  </div>
                </div>
              )}


              {/* Theme */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0 w-14">Theme</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  <button
                    onClick={() => setActiveTheme('all')}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                      activeTheme === 'all'
                        ? 'bg-black/8 text-gray-900 border-black/[0.2] font-medium dark:bg-white/12 dark:text-white dark:border-white/25'
                        : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                    }`}
                  >
                    All
                  </button>
                  {[...THEMES]
                    .filter((t) => (themeCounts[t.value] ?? 0) >= 10)
                    .sort((a, b) => (themeCounts[b.value] ?? 0) - (themeCounts[a.value] ?? 0))
                    .map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setActiveTheme(t.value)}
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                          activeTheme === t.value
                            ? `${THEME_COLORS[t.value]} font-medium`
                            : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                        }`}
                      >
                        {t.label}<span className="opacity-50"> {themeCounts[t.value]}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Model */}
              {availableModels.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0 w-14">Model</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                    <button
                      onClick={() => setActiveModel('all')}
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                        activeModel === 'all'
                          ? 'bg-black/8 text-gray-900 border-black/[0.2] font-medium dark:bg-white/12 dark:text-white dark:border-white/25'
                          : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                      }`}
                    >
                      All
                    </button>
                    {(showAllModels ? availableModels : availableModels.slice(0, 8)).map(({ label, count }) => (
                      <button
                        key={label}
                        onClick={() => setActiveModel(label)}
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
                          activeModel === label
                            ? 'bg-black/8 text-gray-900 border-black/[0.2] font-medium dark:bg-white/12 dark:text-white dark:border-white/25'
                            : 'border-black/[0.08] text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:border-white/8 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15'
                        }`}
                      >
                        {label}<span className="opacity-50"> {count}</span>
                      </button>
                    ))}
                    {availableModels.length > 8 && (
                      <button
                        onClick={() => setShowAllModels((v) => !v)}
                        className="shrink-0 rounded-full border border-black/[0.08] dark:border-white/8 px-2.5 py-1 text-xs text-gray-400 hover:text-gray-700 hover:border-black/[0.15] dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-white/15 transition-all"
                      >
                        {showAllModels ? 'less ↑' : `+${availableModels.length - 8} more`}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap -mt-2">
            {activeChips.map((chip, i) => (
              <span key={i} className="flex items-center gap-1 rounded-full border border-black/[0.1] dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.04] pl-2.5 pr-1.5 py-1 text-xs text-gray-600 dark:text-zinc-300">
                {chip.label}
                <button onClick={chip.onRemove} className="flex items-center justify-center h-3.5 w-3.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-black/[0.08] dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-white/10 transition-colors">
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
            {activeChips.length > 1 && (
              <button onClick={clearAllFilters} className="text-xs text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors">
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Results count + sort + share */}
        {!loading && (
          <div ref={resultsRef} className="flex items-center justify-between -mb-2">
            <span className="text-xs text-gray-400 dark:text-zinc-600 font-mono">
              {filtered.length.toLocaleString()} prompts
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 dark:text-zinc-600">Sort</span>
                {([
                  { value: 'date', label: 'Date' },
                  { value: 'model', label: 'Model' },
                  { value: 'length', label: 'Length' },
                ] as const).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSortBy(s.value)}
                    className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${
                      sortBy === s.value
                        ? 'bg-black/[0.06] dark:bg-white/[0.08] text-gray-700 dark:text-zinc-200 font-medium'
                        : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <CopyLinkButton />
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-24">
            <svg className="h-5 w-5 animate-spin text-gray-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 dark:text-zinc-500 text-sm">
              {allPrompts.length === 0 ? 'No prompts found.' : 'No matches for your filters.'}
            </p>
            {allPrompts.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-gray-400 dark:text-zinc-600 text-xs mt-2 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
              >
                Clear all filters
              </button>
            )}
            {allPrompts.length === 0 && (
              <p className="text-gray-300 dark:text-zinc-600 text-xs mt-2">
                Run "Classify with AI" to extract and categorize your prompts.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filtered.map((p) => (
              <PromptCard key={p.id} bookmark={p} />
            ))}
          </div>
        )}
        </div>{/* end main content */}
      </div>
    </div>
  )
}

export default function PromptsPage() {
  return (
    <Suspense>
      <PromptsPageInner />
    </Suspense>
  )
}
