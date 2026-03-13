'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { ArtStyle, Bookmark, PromptCategory, PromptTheme } from '@/lib/types'
import MediaThumbnail from '@/components/MediaThumbnail'

const MEDIA_TYPES = [
  { value: 'all',   label: 'All' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'llm',   label: 'LLM' },
] as const
type MediaType = typeof MEDIA_TYPES[number]['value']

const MEDIA_TYPE_CATEGORIES: Record<MediaType, (PromptCategory | 'all')[]> = {
  all:   ['all', 'image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting', 'video_t2v', 'video_i2v', 'video_r2v', 'video_v2v', 'audio', 'threed', 'system_prompt', 'writing', 'coding', 'analysis', 'other'],
  image: ['image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting'],
  video: ['video_t2v', 'video_i2v', 'video_r2v', 'video_v2v'],
  llm:   ['system_prompt', 'writing', 'coding', 'analysis', 'audio', 'threed', 'other'],
}

// Model families — order matters (more specific first)
const MODEL_FAMILIES: { label: string; patterns: string[] }[] = [
  { label: 'Midjourney',       patterns: ['midjourney', 'mj'] },
  { label: 'Flux',             patterns: ['flux'] },
  { label: 'Stable Diffusion', patterns: ['stable diffusion', 'sdxl', 'sd3', 'sd '] },
  { label: 'DALL-E',           patterns: ['dall-e', 'dalle'] },
  { label: 'Firefly',          patterns: ['firefly'] },
  { label: 'Ideogram',         patterns: ['ideogram'] },
  { label: 'Leonardo',         patterns: ['leonardo'] },
  { label: 'Kling',            patterns: ['kling'] },
  { label: 'Runway',           patterns: ['runway', 'gen-2', 'gen-3', 'gen 2', 'gen 3'] },
  { label: 'Sora',             patterns: ['sora'] },
  { label: 'Pika',             patterns: ['pika'] },
  { label: 'Hailuo',           patterns: ['hailuo', 'minimax'] },
  { label: 'Luma',             patterns: ['luma', 'dream machine'] },
  { label: 'Veo',              patterns: ['veo'] },
  { label: 'Wan',              patterns: ['wan'] },
  { label: 'Seedance',        patterns: ['seedance'] },
  { label: 'Nano Banana',     patterns: ['nano banana'] },
  { label: 'Higgsfield',      patterns: ['higgsfield'] },
  { label: 'ElevenLabs',       patterns: ['elevenlabs'] },
  { label: 'Suno',             patterns: ['suno'] },
  { label: 'Udio',             patterns: ['udio'] },
  { label: 'ChatGPT',          patterns: ['chatgpt', 'gpt-4', 'gpt4'] },
  { label: 'Claude',           patterns: ['claude'] },
  { label: 'Gemini',           patterns: ['gemini'] },
  { label: 'Meshy',            patterns: ['meshy'] },
]

function modelToFamily(model: string): string {
  const lower = model.toLowerCase()
  return MODEL_FAMILIES.find((f) => f.patterns.some((p) => lower.includes(p)))?.label ?? model
}

const CATEGORIES: { value: PromptCategory | 'all'; label: string }[] = [
  { value: 'all',                  label: 'All' },
  { value: 'image_t2i',           label: 'T2I' },
  { value: 'image_i2i',           label: 'I2I' },
  { value: 'image_r2i',           label: 'R2I' },
  { value: 'image_character_ref', label: 'Char Ref' },
  { value: 'image_inpainting',    label: 'Inpainting' },
  { value: 'video_t2v',           label: 'T2V' },
  { value: 'video_i2v',           label: 'I2V' },
  { value: 'video_r2v',           label: 'R2V' },
  { value: 'video_v2v',           label: 'V2V' },
  { value: 'audio',               label: 'Audio' },
  { value: 'threed',              label: '3D' },
  { value: 'system_prompt',       label: 'System Prompt' },
  { value: 'writing',             label: 'Writing' },
  { value: 'coding',              label: 'Coding' },
  { value: 'analysis',            label: 'Analysis' },
  { value: 'other',               label: 'Other' },
]

const THEMES: { value: PromptTheme; label: string }[] = [
  { value: 'person',       label: 'Person' },
  { value: 'cinematic',    label: 'Cinematic' },
  { value: 'landscape',    label: 'Landscape' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'scifi',        label: 'Sci-fi' },
  { value: 'fantasy',      label: 'Fantasy' },
  { value: 'abstract',     label: 'Abstract' },
  { value: 'fashion',      label: 'Fashion' },
  { value: 'product',      label: 'Product' },
  { value: 'horror',       label: 'Horror' },
]

const THEME_COLORS: Record<PromptTheme, string> = {
  person:       'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/40',
  cinematic:    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800/40',
  landscape:    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/40',
  architecture: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/60 dark:text-stone-300 dark:border-stone-700/40',
  scifi:        'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800/40',
  fantasy:      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/40',
  abstract:     'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800/40',
  fashion:      'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800/40',
  product:      'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800/40',
  horror:       'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/40',
}

const REFERENCE_TYPE_LABELS: Record<string, string> = {
  face_person:    'Face / Person',
  style_artwork:  'Style / Artwork',
  subject_object: 'Subject / Object',
  pose_structure: 'Pose / Structure',
  scene_background: 'Scene / Background',
}

const CATEGORY_COLORS: Record<string, string> = {
  image_t2i:           'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800/50',
  image_i2i:           'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 dark:border-fuchsia-800/50',
  image_r2i:           'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800/50',
  image_character_ref: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800/50',
  image_inpainting:    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800/50',
  video_t2v:           'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800/50',
  video_i2v:           'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800/50',
  video_r2v:           'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800/50',
  video_v2v:           'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800/50',
  audio:               'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800/50',
  threed:              'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800/50',
  system_prompt:       'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800/50',
  writing:             'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800/50',
  coding:              'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800/50',
  analysis:            'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800/50',
  other:               'bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
}

function categoryLabel(val: string | null) {
  return CATEGORIES.find((c) => c.value === val)?.label ?? val ?? '—'
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
        copied
          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
          : 'bg-black/[0.04] text-gray-500 border border-black/[0.08] hover:bg-black/[0.08] hover:text-gray-900 hover:border-black/[0.15] dark:bg-white/6 dark:text-zinc-400 dark:border-white/8 dark:hover:bg-white/12 dark:hover:text-white dark:hover:border-white/15'
      }`}
    >
      {copied ? (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

function PromptCard({ bookmark }: { bookmark: Bookmark }) {
  const [expanded, setExpanded] = useState(false)
  const prompt = bookmark.extracted_prompt ?? bookmark.tweet_text
  const hasRawTweet = bookmark.extracted_prompt && bookmark.extracted_prompt !== bookmark.tweet_text
  const catColor = CATEGORY_COLORS[bookmark.prompt_category ?? 'other'] ?? CATEGORY_COLORS.other
  const date = bookmark.bookmarked_at
    ? new Date(bookmark.bookmarked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 hover:border-black/[0.14] dark:hover:border-white/14 transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {bookmark.prompt_category && (
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${catColor}`}>
              {categoryLabel(bookmark.prompt_category)}
            </span>
          )}
          {bookmark.detected_model && (
            <span className="rounded-full border border-black/[0.1] dark:border-white/10 bg-black/[0.04] dark:bg-white/5 px-2 py-0.5 text-[11px] text-gray-600 dark:text-zinc-300">
              {bookmark.detected_model}
            </span>
          )}
          {bookmark.prompt_themes?.map((theme) => (
            <span key={theme} className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${THEME_COLORS[theme]}`}>
              {THEMES.find((t) => t.value === theme)?.label ?? theme}
            </span>
          ))}
          {bookmark.art_styles?.map((style) => (
            <span key={style} className="rounded-full border border-gray-200 dark:border-zinc-700/60 bg-gray-100 dark:bg-zinc-800/60 px-2 py-0.5 text-[11px] text-gray-500 dark:text-zinc-400">
              {style.replace(/_/g, ' ')}
            </span>
          ))}
          {bookmark.requires_reference && bookmark.reference_type && (
            <span className="rounded-full border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-300">
              ref · {REFERENCE_TYPE_LABELS[bookmark.reference_type] ?? bookmark.reference_type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {date && <span className="text-[11px] text-gray-400 dark:text-zinc-600">{date}</span>}
          {bookmark.source === 'manual' ? (
            <a
              href={bookmark.tweet_url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              <span className="rounded-sm bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 text-[10px] text-gray-500 dark:text-zinc-400 font-medium">manual</span>
              {bookmark.author_handle} {bookmark.tweet_url ? '↗' : ''}
            </a>
          ) : (
            <a
              href={bookmark.tweet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-400 dark:text-zinc-600 hover:text-[#1DA1F2] transition-colors"
            >
              @{bookmark.author_handle} ↗
            </a>
          )}
        </div>
      </div>

      {/* Media thumbnails */}
      {bookmark.media_urls.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {bookmark.media_urls.slice(0, 4).map((url) => (
            <MediaThumbnail key={url} url={url} size={24} />
          ))}
        </div>
      )}

      {/* Prompt text */}
      <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-zinc-100 font-mono leading-relaxed bg-black/[0.03] dark:bg-white/[0.03] rounded-lg p-3 border border-black/[0.05] dark:border-white/5 overflow-auto max-h-64">
        {prompt}
      </pre>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <CopyButton text={prompt} />
        {hasRawTweet && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
          >
            {expanded ? 'Hide tweet ↑' : 'Show full tweet ↓'}
          </button>
        )}
      </div>

      {/* Expanded raw tweet */}
      {expanded && hasRawTweet && (
        <pre className="whitespace-pre-wrap break-words text-xs text-gray-500 dark:text-zinc-500 font-mono leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] rounded-lg p-3 border border-black/[0.05] dark:border-white/5 overflow-auto max-h-48">
          {bookmark.tweet_text}
        </pre>
      )}
    </article>
  )
}

function PromptsPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [allPrompts, setAllPrompts] = useState<Bookmark[]>([])
  const [activeMediaType, setActiveMediaType] = useState<MediaType>(
    (searchParams.get('media') as MediaType) || 'all'
  )
  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'all' | 'uncategorized'>(
    (searchParams.get('type') as PromptCategory | 'all' | 'uncategorized') || 'all'
  )
  const [activeTheme, setActiveTheme] = useState<PromptTheme | 'all'>(
    (searchParams.get('theme') as PromptTheme | 'all') || 'all'
  )
  const [activeModel, setActiveModel] = useState<string>(searchParams.get('model') || 'all')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [loading, setLoading] = useState(true)
  const [showAllModels, setShowAllModels] = useState(false)

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (activeMediaType !== 'all') params.set('media', activeMediaType)
    if (activeCategory !== 'all') params.set('type', activeCategory)
    if (activeTheme !== 'all') params.set('theme', activeTheme)
    if (activeModel !== 'all') params.set('model', activeModel)
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [search, activeMediaType, activeCategory, activeTheme, activeModel]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPrompts(cat: PromptCategory | 'all' | 'uncategorized') {
    setLoading(true)
    const params = cat !== 'all' && cat !== 'uncategorized' ? `?prompt_category=${cat}` : ''
    const res = await fetch(`/api/prompts${params}`)
    if (res.ok) setAllPrompts(await res.json())
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
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({ label, count }))
  }, [allPrompts])

  const uncategorizedCount = useMemo(() =>
    allPrompts.filter((p) => !p.prompt_category).length
  , [allPrompts])

  // Client-side filter by media type, theme, model, search
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
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          (p.extracted_prompt ?? p.tweet_text).toLowerCase().includes(q) ||
          (p.detected_model ?? '').toLowerCase().includes(q) ||
          p.author_handle.toLowerCase().includes(q)
      )
    }
    // Items with no theme tags sink to the bottom
    result = [...result].sort((a, b) => {
      const aHas = (a.prompt_themes?.length ?? 0) > 0
      const bHas = (b.prompt_themes?.length ?? 0) > 0
      if (aHas === bHas) return 0
      return aHas ? -1 : 1
    })
    return result
  }, [allPrompts, activeMediaType, activeTheme, activeModel, search])

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Prompts
            <span className="ml-2 text-sm text-gray-400 dark:text-zinc-600 font-normal">
              {loading ? '…' : `${filtered.length}${filtered.length !== allPrompts.length ? ` of ${allPrompts.length}` : ''}`}
            </span>
          </h1>
        </div>

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
        <div className="flex flex-col gap-3">

          {/* Row: Media type — primary control */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider w-12 shrink-0">Media</span>
            <div className="flex gap-1 p-0.5 bg-black/[0.04] dark:bg-white/5 rounded-lg">
              {MEDIA_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => { setActiveMediaType(mt.value); setActiveCategory('all'); setActiveTheme('all'); setActiveModel('all') }}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    activeMediaType === mt.value
                      ? 'bg-black/[0.12] text-gray-900 dark:bg-white/20 dark:text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                  }`}
                >
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row: Technique sub-category */}
          <div className="flex items-start gap-3">
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider w-12 shrink-0 pt-1">Type</span>
            <div className="flex gap-1 flex-wrap">
              {[
                CATEGORIES.find((c) => c.value === 'all')!,
                ...CATEGORIES
                  .filter((cat) => cat.value !== 'all' && MEDIA_TYPE_CATEGORIES[activeMediaType]?.includes(cat.value) && (categoryCounts[cat.value] ?? 0) > 0)
                  .sort((a, b) => (categoryCounts[b.value] ?? 0) - (categoryCounts[a.value] ?? 0)),
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setActiveCategory(cat.value); setActiveModel('all') }}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                    activeCategory === cat.value
                      ? 'bg-black/[0.08] text-gray-900 border-black/[0.15] dark:bg-white/15 dark:text-white dark:border-white/20'
                      : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-black/[0.05] dark:text-zinc-500 dark:border-transparent dark:hover:text-zinc-300 dark:hover:bg-white/5'
                  }`}
                >
                  {cat.label}{cat.value !== 'all' && categoryCounts[cat.value] ? <span className="opacity-50"> ({categoryCounts[cat.value]})</span> : null}
                </button>
              ))}
              {uncategorizedCount > 0 && (
                <button
                  onClick={() => { setActiveCategory('uncategorized'); setActiveModel('all') }}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                    activeCategory === 'uncategorized'
                      ? 'bg-black/[0.08] text-gray-900 border-black/[0.15] dark:bg-white/15 dark:text-white dark:border-white/20'
                      : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-black/[0.05] dark:text-zinc-500 dark:border-transparent dark:hover:text-zinc-300 dark:hover:bg-white/5'
                  }`}
                >
                  Uncategorized <span className="opacity-50">({uncategorizedCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Row: Theme */}
          <div className="flex items-start gap-3">
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider w-12 shrink-0 pt-1">Theme</span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setActiveTheme('all')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                  activeTheme === 'all'
                    ? 'bg-black/[0.08] text-gray-900 border-black/[0.15] dark:bg-white/15 dark:text-white dark:border-white/20'
                    : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-black/[0.05] dark:text-zinc-500 dark:border-transparent dark:hover:text-zinc-300 dark:hover:bg-white/5'
                }`}
              >
                All
              </button>
              {[...THEMES]
                .filter((t) => themeCounts[t.value] > 0)
                .sort((a, b) => (themeCounts[b.value] ?? 0) - (themeCounts[a.value] ?? 0))
                .map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveTheme(t.value)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all border ${
                    activeTheme === t.value
                      ? `${THEME_COLORS[t.value]} opacity-100`
                      : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-black/[0.05] dark:text-zinc-500 dark:border-transparent dark:hover:text-zinc-300 dark:hover:bg-white/5'
                  }`}
                >
                  {t.label} <span className="opacity-50">({themeCounts[t.value]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row: Model — capped at 8, expandable */}
          {availableModels.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider w-12 shrink-0 pt-1">Model</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setActiveModel('all')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                    activeModel === 'all'
                      ? 'bg-black/[0.08] text-gray-900 border-black/[0.15] dark:bg-white/15 dark:text-white dark:border-white/20'
                      : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-black/[0.05] dark:text-zinc-500 dark:border-transparent dark:hover:text-zinc-300 dark:hover:bg-white/5'
                  }`}
                >
                  All
                </button>
                {(showAllModels ? availableModels : availableModels.slice(0, 8)).map(({ label, count }) => (
                  <button
                    key={label}
                    onClick={() => setActiveModel(label)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                      activeModel === label
                        ? 'bg-black/[0.08] text-gray-900 border-black/[0.15] dark:bg-white/15 dark:text-white dark:border-white/20'
                        : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-black/[0.05] dark:text-zinc-500 dark:border-transparent dark:hover:text-zinc-300 dark:hover:bg-white/5'
                    }`}
                  >
                    {label} <span className="opacity-50">({count})</span>
                  </button>
                ))}
                {availableModels.length > 8 && (
                  <button
                    onClick={() => setShowAllModels((v) => !v)}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border border-transparent text-gray-400 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    {showAllModels ? 'less ↑' : `+${availableModels.length - 8} more`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

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
              {allPrompts.length === 0 ? 'No prompts found.' : 'No matches for your search.'}
            </p>
            {allPrompts.length === 0 && (
              <p className="text-gray-300 dark:text-zinc-600 text-xs mt-2">
                Run "Classify with AI" to extract and categorize your prompts.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((p) => (
              <PromptCard key={p.id} bookmark={p} />
            ))}
          </div>
        )}
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
