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

export default function RandomPage() {
  const [prompt, setPrompt] = useState<Bookmark | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchRandom = useCallback(async () => {
    setLoading(true)
    setCopied(false)
    const res = await fetch('/api/prompts/random')
    if (res.ok) setPrompt(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRandom()
  }, [fetchRandom])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        fetchRandom()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fetchRandom])

  async function copy() {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt.extracted_prompt ?? prompt.tweet_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const text = prompt ? (prompt.extracted_prompt ?? prompt.tweet_text) : ''
  const catColor = CATEGORY_COLORS[prompt?.prompt_category ?? 'other'] ?? CATEGORY_COLORS.other

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 gap-8">

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <svg className="h-6 w-6 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : !prompt ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">No prompts found.</div>
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
              {prompt.requires_reference && prompt.reference_type && (
                <span className="rounded-full border border-amber-800/40 bg-amber-900/30 px-2.5 py-1 text-xs text-amber-300">
                  ref · {REFERENCE_TYPE_LABELS[prompt.reference_type] ?? prompt.reference_type}
                </span>
              )}
              <span className="ml-auto text-xs text-zinc-600">
                {prompt.source === 'manual' ? prompt.author_handle : `@${prompt.author_handle}`}
              </span>
            </div>

            {/* Prompt text — the main event */}
            <pre className="flex-1 whitespace-pre-wrap break-words text-base md:text-lg leading-relaxed text-zinc-100 font-mono bg-white/[0.03] rounded-2xl border border-white/8 p-6 md:p-8 overflow-auto">
              {text}
            </pre>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={copy}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all border ${
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
                    Copy prompt
                  </>
                )}
              </button>

              <button
                onClick={fetchRandom}
                className="flex items-center gap-2 rounded-xl bg-[#1DA1F2]/90 hover:bg-[#1DA1F2] px-5 py-2.5 text-sm font-medium text-white transition-colors"
              >
                Next
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              {prompt.tweet_url && (
                <a
                  href={prompt.tweet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  View source ↗
                </a>
              )}
            </div>

            <p className="text-center text-xs text-zinc-700">Press <kbd className="rounded bg-white/5 border border-white/8 px-1.5 py-0.5">space</kbd> for next</p>
          </>
        )}
      </div>
    </div>
  )
}
