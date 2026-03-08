'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Bookmark, PromptCategory, PromptTheme } from '@/lib/types'

const MEDIA_TYPES = [
  { value: 'all',   label: 'All' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'text',  label: 'Text' },
] as const
type MediaType = typeof MEDIA_TYPES[number]['value']

const MEDIA_TYPE_CATEGORIES: Record<MediaType, (PromptCategory | 'all')[]> = {
  all:   ['all', 'image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting', 'video_t2v', 'video_i2v', 'video_r2v', 'video_v2v', 'audio', 'threed', 'system_prompt', 'writing', 'coding', 'analysis', 'other'],
  image: ['image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting'],
  video: ['video_t2v', 'video_i2v', 'video_r2v', 'video_v2v'],
  text:  ['system_prompt', 'writing', 'coding', 'analysis', 'audio', 'threed', 'other'],
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
  person:       'bg-blue-900/40 text-blue-300 border-blue-800/40',
  cinematic:    'bg-yellow-900/40 text-yellow-300 border-yellow-800/40',
  landscape:    'bg-green-900/40 text-green-300 border-green-800/40',
  architecture: 'bg-stone-800/60 text-stone-300 border-stone-700/40',
  scifi:        'bg-cyan-900/40 text-cyan-300 border-cyan-800/40',
  fantasy:      'bg-purple-900/40 text-purple-300 border-purple-800/40',
  abstract:     'bg-orange-900/40 text-orange-300 border-orange-800/40',
  fashion:      'bg-pink-900/40 text-pink-300 border-pink-800/40',
  product:      'bg-indigo-900/40 text-indigo-300 border-indigo-800/40',
  horror:       'bg-red-900/40 text-red-300 border-red-800/40',
}

const REFERENCE_TYPE_LABELS: Record<string, string> = {
  face_person:    'Face / Person',
  style_artwork:  'Style / Artwork',
  subject_object: 'Subject / Object',
  pose_structure: 'Pose / Structure',
  scene_background: 'Scene / Background',
}

const CATEGORY_COLORS: Record<string, string> = {
  image_t2i:           'bg-pink-900/50 text-pink-300 border-pink-800/50',
  image_i2i:           'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-800/50',
  image_r2i:           'bg-orange-900/50 text-orange-300 border-orange-800/50',
  image_character_ref: 'bg-rose-900/50 text-rose-300 border-rose-800/50',
  image_inpainting:    'bg-red-900/50 text-red-300 border-red-800/50',
  video_t2v:           'bg-violet-900/50 text-violet-300 border-violet-800/50',
  video_i2v:           'bg-indigo-900/50 text-indigo-300 border-indigo-800/50',
  video_r2v:           'bg-purple-900/50 text-purple-300 border-purple-800/50',
  video_v2v:           'bg-blue-900/50 text-blue-300 border-blue-800/50',
  audio:               'bg-cyan-900/50 text-cyan-300 border-cyan-800/50',
  threed:              'bg-teal-900/50 text-teal-300 border-teal-800/50',
  system_prompt:       'bg-sky-900/50 text-sky-300 border-sky-800/50',
  writing:             'bg-green-900/50 text-green-300 border-green-800/50',
  coding:              'bg-yellow-900/50 text-yellow-300 border-yellow-800/50',
  analysis:            'bg-amber-900/50 text-amber-300 border-amber-800/50',
  other:               'bg-zinc-800 text-zinc-400 border-zinc-700',
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
          : 'bg-white/6 text-zinc-400 border border-white/8 hover:bg-white/12 hover:text-white hover:border-white/15'
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
    <article className="flex flex-col gap-3 rounded-xl border border-white/8 bg-[#111] p-4 hover:border-white/14 transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {bookmark.prompt_category && (
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${catColor}`}>
              {categoryLabel(bookmark.prompt_category)}
            </span>
          )}
          {bookmark.detected_model && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
              {bookmark.detected_model}
            </span>
          )}
          {bookmark.prompt_themes?.map((theme) => (
            <span key={theme} className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${THEME_COLORS[theme]}`}>
              {THEMES.find((t) => t.value === theme)?.label ?? theme}
            </span>
          ))}
          {bookmark.requires_reference && bookmark.reference_type && (
            <span className="rounded-full border border-amber-800/40 bg-amber-900/30 px-2 py-0.5 text-[11px] text-amber-300">
              ref · {REFERENCE_TYPE_LABELS[bookmark.reference_type] ?? bookmark.reference_type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {date && <span className="text-[11px] text-zinc-600">{date}</span>}
          <a
            href={bookmark.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-600 hover:text-[#1DA1F2] transition-colors"
          >
            @{bookmark.author_handle} ↗
          </a>
        </div>
      </div>

      {/* Prompt text */}
      <pre className="whitespace-pre-wrap break-words text-sm text-zinc-100 font-mono leading-relaxed bg-white/[0.03] rounded-lg p-3 border border-white/5 overflow-auto max-h-64">
        {prompt}
      </pre>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <CopyButton text={prompt} />
        {hasRawTweet && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {expanded ? 'Hide tweet ↑' : 'Show full tweet ↓'}
          </button>
        )}
      </div>

      {/* Expanded raw tweet */}
      {expanded && hasRawTweet && (
        <pre className="whitespace-pre-wrap break-words text-xs text-zinc-500 font-mono leading-relaxed bg-white/[0.02] rounded-lg p-3 border border-white/5 overflow-auto max-h-48">
          {bookmark.tweet_text}
        </pre>
      )}
    </article>
  )
}

export default function PromptsPage() {
  const [allPrompts, setAllPrompts] = useState<Bookmark[]>([])
  const [activeMediaType, setActiveMediaType] = useState<MediaType>('all')
  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'all'>('all')
  const [activeTheme, setActiveTheme] = useState<PromptTheme | 'all'>('all')
  const [activeModel, setActiveModel] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [classifying, setClassifying] = useState(false)
  const [classifyResult, setClassifyResult] = useState<string | null>(null)

  async function fetchPrompts(cat: PromptCategory | 'all') {
    setLoading(true)
    const params = cat !== 'all' ? `?prompt_category=${cat}` : ''
    const res = await fetch(`/api/prompts${params}`)
    if (res.ok) setAllPrompts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchPrompts(activeCategory) }, [activeCategory])

  // Compute distinct models from fetched data
  const availableModels = useMemo(() => {
    const models = Array.from(new Set(allPrompts.map((p) => p.detected_model).filter(Boolean))) as string[]
    return models.sort()
  }, [allPrompts])

  // Client-side filter by media type, theme, model, search
  const filtered = useMemo(() => {
    let result = allPrompts
    if (activeMediaType !== 'all') {
      const allowed = new Set(MEDIA_TYPE_CATEGORIES[activeMediaType])
      result = result.filter((p) => p.prompt_category && allowed.has(p.prompt_category))
    }
    if (activeTheme !== 'all') {
      result = result.filter((p) => p.prompt_themes?.includes(activeTheme))
    }
    if (activeModel !== 'all') {
      result = result.filter((p) => p.detected_model === activeModel)
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
    return result
  }, [allPrompts, activeMediaType, activeTheme, activeModel, search])

  async function classifyPrompts() {
    setClassifying(true)
    setClassifyResult(null)
    try {
      // Step 1: run the main classifier to promote any pending bookmarks into categories
      await fetch('/api/classify', { method: 'POST' })
      // Step 2: sub-classify anything now tagged as 'prompts'
      const res = await fetch('/api/prompts/classify', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setClassifyResult(`Error: ${data.error}`)
      } else {
        setClassifyResult(data.message ?? `Classified ${data.classified} of ${data.total}`)
      }
      fetchPrompts(activeCategory)
    } catch (err) {
      setClassifyResult(`Failed: ${String(err)}`)
    } finally {
      setClassifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">
            Prompts
            <span className="ml-2 text-sm text-zinc-600 font-normal">
              {loading ? '…' : `${filtered.length}${filtered.length !== allPrompts.length ? ` of ${allPrompts.length}` : ''}`}
            </span>
          </h1>
          <div className="flex items-center gap-3">
            {classifyResult && <span className="text-xs text-zinc-500">{classifyResult}</span>}
            <button
              onClick={classifyPrompts}
              disabled={classifying}
              className="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-50 transition-colors"
            >
              {classifying ? (
                <>
                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Classifying…
                </>
              ) : 'Classify with AI'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts…"
            className="w-full rounded-xl border border-white/8 bg-white/3 pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-white/5 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] divide-y divide-white/6">

          {/* Row: Media type — primary control */}
          <div className="flex items-center gap-4 px-4 py-3">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-16 shrink-0">Media</span>
            <div className="flex gap-1 p-0.5 bg-white/5 rounded-lg">
              {MEDIA_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => { setActiveMediaType(mt.value); setActiveCategory('all'); setActiveTheme('all'); setActiveModel('all') }}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    activeMediaType === mt.value
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row: Technique sub-category */}
          <div className="flex items-start gap-4 px-4 py-3">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-16 shrink-0 pt-1">Type</span>
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.filter((cat) =>
                cat.value === 'all' || MEDIA_TYPE_CATEGORIES[activeMediaType].includes(cat.value)
              ).map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setActiveCategory(cat.value); setActiveModel('all') }}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                    activeCategory === cat.value
                      ? 'bg-white/15 text-white border-white/20'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row: Theme — colored badges matching card badges */}
          <div className="flex items-start gap-4 px-4 py-3">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-16 shrink-0 pt-1">Theme</span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setActiveTheme('all')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                  activeTheme === 'all'
                    ? 'bg-white/15 text-white border-white/20'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                All
              </button>
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveTheme(t.value)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all border ${
                    activeTheme === t.value
                      ? `${THEME_COLORS[t.value]} opacity-100`
                      : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row: Model — only when models are present */}
          {availableModels.length > 0 && (
            <div className="flex items-start gap-4 px-4 py-3">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-16 shrink-0 pt-1">Model</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setActiveModel('all')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                    activeModel === 'all'
                      ? 'bg-white/15 text-white border-white/20'
                      : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  All
                </button>
                {availableModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => setActiveModel(model)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                      activeModel === model
                        ? 'bg-white/15 text-white border-white/20'
                        : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-24">
            <svg className="h-5 w-5 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-zinc-500 text-sm">
              {allPrompts.length === 0 ? 'No prompts found.' : 'No matches for your search.'}
            </p>
            {allPrompts.length === 0 && (
              <p className="text-zinc-600 text-xs mt-2">
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
