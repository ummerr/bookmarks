'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Bookmark, PromptTheme } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  image_t2i: 'T2I', image_i2i: 'I2I', image_r2i: 'R2I',
  image_character_ref: 'Char Ref', image_inpainting: 'Inpainting',
  video_t2v: 'T2V', video_i2v: 'I2V', video_r2v: 'R2V', video_v2v: 'V2V',
  audio: 'Audio', threed: '3D',
  system_prompt: 'System Prompt', writing: 'Writing',
  coding: 'Coding', analysis: 'Analysis', other: 'Other',
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
  face_person: 'Face / Person',
  style_artwork: 'Style / Artwork',
  subject_object: 'Subject / Object',
  pose_structure: 'Pose / Structure',
  scene_background: 'Scene / Background',
}

export default function RandomPage() {
  const [prompt, setPrompt] = useState<Bookmark | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const shuffle = useCallback(async () => {
    setLoading(true)
    setCopied(false)
    const res = await fetch('/api/prompts/random')
    setPrompt(res.ok ? await res.json() : null)
    setLoading(false)
  }, [])

  useEffect(() => { shuffle() }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  async function copy() {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt.extracted_prompt ?? prompt.tweet_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const text = prompt ? (prompt.extracted_prompt ?? prompt.tweet_text) : ''
  const catColor = CATEGORY_COLORS[prompt?.prompt_category ?? 'other'] ?? CATEGORY_COLORS.other
  const images = (prompt?.media_urls ?? []).filter(u => u?.startsWith('http'))

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 md:px-8 py-8 gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Random</h1>
            <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">
              Press <kbd className="rounded bg-black/[0.04] dark:bg-white/5 border border-black/[0.08] dark:border-white/8 px-1 py-0.5">space</kbd> to shuffle
            </p>
          </div>
          <button
            onClick={shuffle}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#1DA1F2]/90 hover:bg-[#1DA1F2] disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-all shadow-lg shadow-[#1DA1F2]/10 hover:shadow-[#1DA1F2]/20"
          >
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

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <svg className="h-6 w-6 animate-spin text-gray-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : !prompt ? (
          <div className="flex-1 flex items-center justify-center py-20 text-gray-400 dark:text-zinc-500 text-sm">
            No prompts found.
          </div>
        ) : (
          <>
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {prompt.prompt_category && (
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${catColor}`}>
                  {CATEGORY_LABELS[prompt.prompt_category] ?? prompt.prompt_category}
                </span>
              )}
              {prompt.detected_model && (
                <span className="rounded-full border border-black/[0.1] dark:border-white/10 bg-black/[0.04] dark:bg-white/5 px-2.5 py-1 text-xs text-gray-600 dark:text-zinc-300">
                  {prompt.detected_model}
                </span>
              )}
              {prompt.prompt_themes?.map((theme) => (
                <span key={theme} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${THEME_COLORS[theme]}`}>
                  {theme}
                </span>
              ))}
              {prompt.art_styles?.map((style) => (
                <span key={style} className="rounded-full border border-gray-200 dark:border-zinc-700/60 bg-gray-100 dark:bg-zinc-800/60 px-2.5 py-1 text-xs text-gray-500 dark:text-zinc-400">
                  {style.replace(/_/g, ' ')}
                </span>
              ))}
              {prompt.requires_reference && prompt.reference_type && (
                <span className="rounded-full border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300">
                  ref · {REFERENCE_TYPE_LABELS[prompt.reference_type] ?? prompt.reference_type}
                </span>
              )}
              <span className="ml-auto text-xs text-gray-400 dark:text-zinc-600">
                {prompt.source === 'manual' ? prompt.author_handle : `@${prompt.author_handle}`}
              </span>
            </div>

            {/* Images */}
            {images.length > 0 && (
              images.length === 1 ? (
                <a href={images[0]} target="_blank" rel="noopener noreferrer"
                  className="block self-start overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/8 hover:border-black/[0.2] dark:hover:border-white/20 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[0]} alt="" className="w-full h-auto block" loading="lazy" />
                </a>
              ) : (
                <div className={`grid gap-2 ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {images.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="block overflow-hidden rounded-xl border border-black/[0.08] dark:border-white/8 hover:border-black/[0.2] dark:hover:border-white/20 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-auto block" loading="lazy" />
                    </a>
                  ))}
                </div>
              )
            )}

            {/* Copy + source */}
            <div className="flex items-center gap-3">
              <button
                onClick={copy}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border ${
                  copied
                    ? 'bg-green-500/15 text-green-600 border-green-500/30'
                    : 'bg-black/[0.04] dark:bg-white/8 text-gray-700 dark:text-white border-black/[0.1] dark:border-white/10 hover:bg-black/[0.08] dark:hover:bg-white/12 hover:border-black/[0.15] dark:hover:border-white/20'
                }`}
              >
                {copied ? (
                  <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied</>
                ) : (
                  <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                )}
              </button>
              {prompt.tweet_url && (
                <a href={prompt.tweet_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
                >
                  View source ↗
                </a>
              )}
            </div>

            {/* Prompt text */}
            <pre className="whitespace-pre-wrap break-words text-sm md:text-base leading-relaxed text-gray-700 dark:text-zinc-200 font-mono bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl border border-black/[0.08] dark:border-white/8 p-6 overflow-auto">
              {text}
            </pre>
          </>
        )}
      </div>
    </div>
  )
}
