'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Bookmark, PromptCategory, PromptTheme } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  image_t2i: 'T2I', image_i2i: 'I2I', image_r2i: 'R2I',
  image_character_ref: 'Char Ref', image_inpainting: 'Inpainting',
  video_t2v: 'T2V', video_i2v: 'I2V', video_r2v: 'R2V', video_v2v: 'V2V',
  audio: 'Audio', threed: '3D',
  system_prompt: 'System Prompt', writing: 'Writing',
  coding: 'Coding', analysis: 'Analysis', other: 'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  image_t2i: 'bg-pink-900/50 text-pink-300 border-pink-800/50',
  image_i2i: 'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-800/50',
  image_r2i: 'bg-orange-900/50 text-orange-300 border-orange-800/50',
  image_character_ref: 'bg-rose-900/50 text-rose-300 border-rose-800/50',
  image_inpainting: 'bg-red-900/50 text-red-300 border-red-800/50',
  video_t2v: 'bg-violet-900/50 text-violet-300 border-violet-800/50',
  video_i2v: 'bg-indigo-900/50 text-indigo-300 border-indigo-800/50',
  video_r2v: 'bg-purple-900/50 text-purple-300 border-purple-800/50',
  video_v2v: 'bg-blue-900/50 text-blue-300 border-blue-800/50',
  audio: 'bg-cyan-900/50 text-cyan-300 border-cyan-800/50',
  threed: 'bg-teal-900/50 text-teal-300 border-teal-800/50',
  system_prompt: 'bg-sky-900/50 text-sky-300 border-sky-800/50',
  writing: 'bg-green-900/50 text-green-300 border-green-800/50',
  coding: 'bg-yellow-900/50 text-yellow-300 border-yellow-800/50',
  analysis: 'bg-amber-900/50 text-amber-300 border-amber-800/50',
  other: 'bg-zinc-800 text-zinc-400 border-zinc-700',
}

const THEME_COLORS: Record<PromptTheme, string> = {
  person: 'bg-blue-900/40 text-blue-300 border-blue-800/40',
  cinematic: 'bg-yellow-900/40 text-yellow-300 border-yellow-800/40',
  landscape: 'bg-green-900/40 text-green-300 border-green-800/40',
  architecture: 'bg-stone-800/60 text-stone-300 border-stone-700/40',
  scifi: 'bg-cyan-900/40 text-cyan-300 border-cyan-800/40',
  fantasy: 'bg-purple-900/40 text-purple-300 border-purple-800/40',
  abstract: 'bg-orange-900/40 text-orange-300 border-orange-800/40',
  fashion: 'bg-pink-900/40 text-pink-300 border-pink-800/40',
  product: 'bg-indigo-900/40 text-indigo-300 border-indigo-800/40',
  horror: 'bg-red-900/40 text-red-300 border-red-800/40',
}

const REFERENCE_TYPE_LABELS: Record<string, string> = {
  face_person: 'Face / Person',
  style_artwork: 'Style / Artwork',
  subject_object: 'Subject / Object',
  pose_structure: 'Pose / Structure',
  scene_background: 'Scene / Background',
}

const CATEGORY_OPTIONS: { value: PromptCategory; label: string }[] = [
  { value: 'image_t2i', label: 'T2I' },
  { value: 'image_i2i', label: 'I2I' },
  { value: 'image_r2i', label: 'R2I' },
  { value: 'image_character_ref', label: 'Char Ref' },
  { value: 'image_inpainting', label: 'Inpainting' },
  { value: 'video_t2v', label: 'T2V' },
  { value: 'video_i2v', label: 'I2V' },
  { value: 'video_r2v', label: 'R2V' },
  { value: 'video_v2v', label: 'V2V' },
  { value: 'audio', label: 'Audio' },
  { value: 'threed', label: '3D' },
  { value: 'system_prompt', label: 'System Prompt' },
  { value: 'writing', label: 'Writing' },
  { value: 'coding', label: 'Coding' },
  { value: 'analysis', label: 'Analysis' },
]

const THEME_OPTIONS: PromptTheme[] = [
  'person', 'cinematic', 'landscape', 'architecture',
  'scifi', 'fantasy', 'abstract', 'fashion', 'product', 'horror',
]

type Filters = { category: PromptCategory | null; theme: PromptTheme | null; model: string | null }

function FilterRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-600 shrink-0 w-12">{label}</span>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {children}
      </div>
    </div>
  )
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition-all ${
        active
          ? color ?? 'bg-white/12 text-white border-white/25 font-medium'
          : 'border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/15'
      }`}
    >
      {children}
    </button>
  )
}

export default function RandomPage() {
  const [prompt, setPrompt] = useState<Bookmark | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const [models, setModels] = useState<string[]>([])

  const [activeCategory, setActiveCategory] = useState<PromptCategory | null>(null)
  const [activeTheme, setActiveTheme] = useState<PromptTheme | null>(null)
  const [activeModel, setActiveModel] = useState<string | null>(null)

  // Ref so spacebar handler always sees current filters without re-registering
  const filtersRef = useRef<Filters>({ category: null, theme: null, model: null })

  const doFetch = useCallback(async (
    category: PromptCategory | null,
    theme: PromptTheme | null,
    model: string | null,
  ) => {
    setLoading(true)
    setCopied(false)
    setNoResults(false)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (theme) params.set('theme', theme)
    if (model) params.set('model', model)
    const res = await fetch(`/api/prompts/random?${params}`)
    if (res.ok) {
      setPrompt(await res.json())
    } else {
      setPrompt(null)
      setNoResults(true)
    }
    setLoading(false)
  }, [])

  const shuffle = useCallback(() => {
    const { category, theme, model } = filtersRef.current
    doFetch(category, theme, model)
  }, [doFetch])

  // Initial load + models
  useEffect(() => { shuffle() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetch('/api/prompts/models').then(r => r.json()).then(setModels).catch(() => {})
  }, [])

  // Spacebar → shuffle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        shuffle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shuffle])

  function setCategory(cat: PromptCategory | null) {
    setActiveCategory(cat)
    filtersRef.current.category = cat
    doFetch(cat, filtersRef.current.theme, filtersRef.current.model)
  }
  function setTheme(theme: PromptTheme | null) {
    setActiveTheme(theme)
    filtersRef.current.theme = theme
    doFetch(filtersRef.current.category, theme, filtersRef.current.model)
  }
  function setModel(model: string | null) {
    setActiveModel(model)
    filtersRef.current.model = model
    doFetch(filtersRef.current.category, filtersRef.current.theme, model)
  }
  function clearFilters() {
    setActiveCategory(null)
    setActiveTheme(null)
    setActiveModel(null)
    filtersRef.current = { category: null, theme: null, model: null }
    doFetch(null, null, null)
  }

  async function copy() {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt.extracted_prompt ?? prompt.tweet_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const text = prompt ? (prompt.extracted_prompt ?? prompt.tweet_text) : ''
  const catColor = CATEGORY_COLORS[prompt?.prompt_category ?? 'other'] ?? CATEGORY_COLORS.other
  const images = (prompt?.media_urls ?? []).filter(u => u?.startsWith('http'))
  const hasFilters = !!(activeCategory || activeTheme || activeModel)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 md:px-8 py-8 gap-5">

        {/* Filter rows */}
        <div className="flex flex-col gap-2 border border-white/6 rounded-2xl bg-white/[0.02] px-4 py-3">
          <FilterRow label="Type">
            <Chip active={!activeCategory} onClick={() => setCategory(null)}>All</Chip>
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <Chip
                key={value}
                active={activeCategory === value}
                color={`${CATEGORY_COLORS[value]} font-medium`}
                onClick={() => setCategory(activeCategory === value ? null : value)}
              >
                {label}
              </Chip>
            ))}
          </FilterRow>

          <FilterRow label="Theme">
            <Chip active={!activeTheme} onClick={() => setTheme(null)}>All</Chip>
            {THEME_OPTIONS.map((theme) => (
              <Chip
                key={theme}
                active={activeTheme === theme}
                color={`${THEME_COLORS[theme]} font-medium`}
                onClick={() => setTheme(activeTheme === theme ? null : theme)}
              >
                {theme}
              </Chip>
            ))}
          </FilterRow>

          {models.length > 0 && (
            <FilterRow label="Model">
              <Chip active={!activeModel} onClick={() => setModel(null)}>All</Chip>
              {models.map((m) => (
                <Chip
                  key={m}
                  active={activeModel === m}
                  onClick={() => setModel(activeModel === m ? null : m)}
                >
                  {m}
                </Chip>
              ))}
            </FilterRow>
          )}
        </div>

        {/* Main content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <svg className="h-6 w-6 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : noResults ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-zinc-500">
            <p className="text-sm">No prompts match these filters.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : !prompt ? (
          <div className="flex-1 flex items-center justify-center py-20 text-zinc-500 text-sm">
            No prompts found.
          </div>
        ) : (
          <>
            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-2">
              {prompt.prompt_category && (
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${catColor}`}>
                  {CATEGORY_LABELS[prompt.prompt_category] ?? prompt.prompt_category}
                </span>
              )}
              {prompt.detected_model && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                  {prompt.detected_model}
                </span>
              )}
              {prompt.prompt_themes?.map((theme) => (
                <span key={theme} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${THEME_COLORS[theme]}`}>
                  {theme}
                </span>
              ))}
              {prompt.art_styles?.map((style) => (
                <span key={style} className="rounded-full border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-400">
                  {style.replace(/_/g, ' ')}
                </span>
              ))}
              {prompt.requires_reference && prompt.reference_type && (
                <span className="rounded-full border border-amber-800/40 bg-amber-900/30 px-2.5 py-1 text-xs text-amber-300">
                  ref · {REFERENCE_TYPE_LABELS[prompt.reference_type] ?? prompt.reference_type}
                </span>
              )}
              <span className="ml-auto text-xs text-zinc-600">
                {prompt.source === 'manual' ? prompt.author_handle : `@${prompt.author_handle}`}
              </span>
            </div>

            {/* Prompt text */}
            <pre className="whitespace-pre-wrap break-words text-base md:text-lg leading-relaxed text-zinc-100 font-mono bg-white/[0.03] rounded-2xl border border-white/8 p-6 md:p-8 overflow-auto">
              {text}
            </pre>

            {/* Media images */}
            {images.length > 0 && (
              <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {images.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl border border-white/8 hover:border-white/20 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full object-cover max-h-72" loading="lazy" />
                  </a>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={copy}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border ${
                  copied
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-white/8 text-white border-white/10 hover:bg-white/12 hover:border-white/20'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>

              {prompt.tweet_url && (
                <a
                  href={prompt.tweet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  View source ↗
                </a>
              )}

              <button
                onClick={shuffle}
                disabled={loading}
                className="ml-auto flex items-center gap-2.5 rounded-xl bg-[#1DA1F2]/90 hover:bg-[#1DA1F2] disabled:opacity-50 px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-[#1DA1F2]/10 hover:shadow-[#1DA1F2]/20"
              >
                {/* Dice-5 icon */}
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="17" height="17" rx="3.5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="6.5" cy="6.5" r="1.25" fill="currentColor"/>
                  <circle cx="13.5" cy="6.5" r="1.25" fill="currentColor"/>
                  <circle cx="10" cy="10" r="1.25" fill="currentColor"/>
                  <circle cx="6.5" cy="13.5" r="1.25" fill="currentColor"/>
                  <circle cx="13.5" cy="13.5" r="1.25" fill="currentColor"/>
                </svg>
                Shuffle
              </button>
            </div>

            <p className="text-center text-xs text-zinc-700">
              Press <kbd className="rounded bg-white/5 border border-white/8 px-1.5 py-0.5">space</kbd> to shuffle
            </p>
          </>
        )}
      </div>
    </div>
  )
}
