'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Bookmark } from '@/lib/types'

type Status = 'idle' | 'saving' | 'done' | 'error'

const CATEGORY_LABELS: Record<string, string> = {
  image_t2i: 'T2I', image_i2i: 'I2I', image_r2i: 'R2I',
  image_character_ref: 'Char Ref', image_inpainting: 'Inpainting',
  video_t2v: 'T2V', video_i2v: 'I2V', video_r2v: 'R2V', video_v2v: 'V2V',
  audio: 'Audio', threed: '3D',
  system_prompt: 'System Prompt', writing: 'Writing',
  coding: 'Coding', analysis: 'Analysis', other: 'Other',
}

export default function AddPage() {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<Bookmark | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setStatus('saving')
    setResult(null)
    setError(null)

    const res = await fetch('/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, url, source_name: sourceName }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setStatus('error')
      return
    }

    setResult(data)
    setStatus('done')
    setText('')
    setUrl('')
    setSourceName('')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors mb-8 inline-flex items-center gap-1">
          ← Prompts
        </Link>

        <h1 className="text-2xl font-semibold mt-4 mb-1">Add Prompt</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Paste a prompt from anywhere — Reddit, Discord, blogs, your own notes. It will be classified and added to your library.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Prompt text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Prompt text *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the prompt here…"
              rows={8}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 font-mono leading-relaxed outline-none focus:border-white/20 focus:bg-white/5 transition-colors resize-y"
            />
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Source URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-white/5 transition-colors"
            />
          </div>

          {/* Source name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Source name <span className="text-zinc-600">(optional — defaults to URL domain)</span></label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. reddit, discord, personal"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-white/5 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!text.trim() || status === 'saving'}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2]/90 px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-40 transition-colors"
          >
            {status === 'saving' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving &amp; classifying…
              </>
            ) : 'Add to library'}
          </button>
        </form>

        {/* Success */}
        {status === 'done' && result && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex flex-col gap-2">
            <p className="text-sm font-medium text-green-400">Added to library</p>
            <div className="flex flex-wrap gap-1.5">
              {result.prompt_category && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
                  {CATEGORY_LABELS[result.prompt_category] ?? result.prompt_category}
                </span>
              )}
              {result.detected_model && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
                  {result.detected_model}
                </span>
              )}
              {result.requires_reference && (
                <span className="rounded-full border border-amber-800/40 bg-amber-900/30 px-2 py-0.5 text-[11px] text-amber-300">
                  ref · {result.reference_type}
                </span>
              )}
            </div>
            <Link href="/" className="text-xs text-zinc-500 hover:text-white transition-colors">
              View in Prompts →
            </Link>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-medium text-red-400">Failed</p>
            <p className="text-sm text-zinc-400 mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
