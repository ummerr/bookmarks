'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Bookmark, PromptCategory } from '@/lib/types'

const PROMPT_CATEGORIES: { value: PromptCategory | 'all'; label: string; color: string }[] = [
  { value: 'all',                 label: 'All',            color: 'bg-zinc-700 text-zinc-200' },
  // Image
  { value: 'image_t2i',          label: 'T2I',            color: 'bg-pink-900/60 text-pink-300' },
  { value: 'image_i2i',          label: 'I2I',            color: 'bg-fuchsia-900/60 text-fuchsia-300' },
  { value: 'image_character_ref',label: 'Char Ref',       color: 'bg-rose-900/60 text-rose-300' },
  { value: 'image_inpainting',   label: 'Inpainting',     color: 'bg-red-900/60 text-red-300' },
  // Video
  { value: 'video_t2v',          label: 'T2V',            color: 'bg-violet-900/60 text-violet-300' },
  { value: 'video_i2v',          label: 'I2V',            color: 'bg-indigo-900/60 text-indigo-300' },
  { value: 'video_v2v',          label: 'V2V',            color: 'bg-blue-900/60 text-blue-300' },
  // Other media
  { value: 'audio',              label: 'Audio',          color: 'bg-cyan-900/60 text-cyan-300' },
  { value: 'threed',             label: '3D',             color: 'bg-teal-900/60 text-teal-300' },
  // Text
  { value: 'system_prompt',      label: 'System Prompt',  color: 'bg-sky-900/60 text-sky-300' },
  { value: 'writing',            label: 'Writing',        color: 'bg-green-900/60 text-green-300' },
  { value: 'coding',             label: 'Coding',         color: 'bg-yellow-900/60 text-yellow-300' },
  { value: 'analysis',           label: 'Analysis',       color: 'bg-amber-900/60 text-amber-300' },
  { value: 'other',              label: 'Other',          color: 'bg-zinc-700 text-zinc-400' },
]

function categoryMeta(cat: PromptCategory | null) {
  return PROMPT_CATEGORIES.find((c) => c.value === cat) ?? PROMPT_CATEGORIES[0]
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
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? 'bg-green-500/20 text-green-400'
          : 'bg-white/8 text-zinc-400 hover:bg-white/15 hover:text-white'
      }`}
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy prompt
        </>
      )}
    </button>
  )
}

function PromptCard({ bookmark }: { bookmark: Bookmark }) {
  const meta = categoryMeta(bookmark.prompt_category)
  const date = bookmark.bookmarked_at
    ? new Date(bookmark.bookmarked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/3 p-4 hover:border-white/15 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-sm text-zinc-500">@{bookmark.author_handle}</span>
        </div>
        {date && <span className="text-xs text-zinc-600 shrink-0">{date}</span>}
      </div>

      <pre className="whitespace-pre-wrap break-words text-sm text-zinc-200 font-mono leading-relaxed bg-white/3 rounded-lg p-3 overflow-auto max-h-72">
        {bookmark.tweet_text}
      </pre>

      <div className="flex items-center justify-between">
        <CopyButton text={bookmark.tweet_text} />
        <a
          href={bookmark.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-600 hover:text-[#1DA1F2] transition-colors"
        >
          View on X ↗
        </a>
      </div>
    </article>
  )
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Bookmark[]>([])
  const [activeFilter, setActiveFilter] = useState<PromptCategory | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [classifying, setClassifying] = useState(false)
  const [classifyResult, setClassifyResult] = useState<string | null>(null)

  async function fetchPrompts(filter: PromptCategory | 'all') {
    setLoading(true)
    const params = filter !== 'all' ? `?prompt_category=${filter}` : ''
    const res = await fetch(`/api/prompts${params}`)
    if (res.ok) setPrompts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchPrompts(activeFilter) }, [activeFilter])

  async function classifyPrompts() {
    setClassifying(true)
    setClassifyResult(null)
    try {
      const res = await fetch('/api/prompts/classify', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setClassifyResult(`Error: ${data.error}`)
      } else {
        setClassifyResult(data.message ?? `Classified ${data.classified} of ${data.total} prompts`)
      }
      fetchPrompts(activeFilter)
    } catch (err) {
      setClassifyResult(`Failed: ${String(err)}`)
    } finally {
      setClassifying(false)
    }
  }

  const counts = prompts.length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-600 hover:text-white transition-colors text-sm">
              ← Dashboard
            </Link>
            <h1 className="text-lg font-semibold text-white">
              Prompts
              <span className="ml-2 text-sm text-zinc-600 font-normal">{counts}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {classifyResult && (
              <span className="text-xs text-zinc-500">{classifyResult}</span>
            )}
            <button
              onClick={classifyPrompts}
              disabled={classifying}
              className="flex items-center gap-2 rounded-lg bg-[#1DA1F2] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a94da] disabled:opacity-50 transition-colors"
            >
              {classifying ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Classifying…
                </>
              ) : 'Classify with AI'}
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap mb-6">
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === cat.value
                  ? 'bg-white/15 text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Prompt cards */}
        {loading ? (
          <div className="flex justify-center py-24">
            <svg className="h-5 w-5 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-zinc-500 text-sm">No prompts found.</p>
            <p className="text-zinc-600 text-xs mt-2">
              Import bookmarks and run the classifier to populate this view.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {prompts.map((p) => (
              <PromptCard key={p.id} bookmark={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
