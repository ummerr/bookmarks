'use client'

import { useState, memo } from 'react'
import type { Bookmark } from '@/lib/types'
import MediaThumbnail from '@/components/MediaThumbnail'
import { THEMES, THEME_COLORS, CATEGORY_COLORS, REFERENCE_TYPE_LABELS, categoryLabel } from './constants'

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

const FLAG_REASONS = [
  { value: 'not_a_prompt', label: 'Not a prompt' },
  { value: 'wrong_category', label: 'Wrong category' },
  { value: 'low_quality', label: 'Low quality / not useful' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
] as const

function ReportButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!selected) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/prompts/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, flag: selected, note: note.trim() || undefined }),
      })
      if (!res.ok) throw new Error('Failed')
      setDone(true)
      setTimeout(() => { setDone(false); setOpen(false); setSelected(''); setNote('') }, 2000)
    } catch {
      alert('Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-500">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Reported
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        title="Report this prompt"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4.5L9 7.5l6-3 6 3V21l-6-3-6 3-6-3z" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-6 right-0 z-50 w-64 rounded-xl border border-black/[0.1] dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-3 shadow-lg flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">Report this prompt</p>
          <div className="flex flex-col gap-1">
            {FLAG_REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                <input
                  type="radio"
                  name={`flag-${id}`}
                  value={r.value}
                  checked={selected === r.value}
                  onChange={() => setSelected(r.value)}
                  className="accent-red-500"
                />
                {r.label}
              </label>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note..."
            maxLength={500}
            rows={2}
            className="w-full rounded-lg border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] px-2 py-1.5 text-xs text-gray-700 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/30"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => { setOpen(false); setSelected(''); setNote('') }}
              className="text-[11px] text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!selected || submitting}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ShareButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    const url = `${window.location.origin}/prompts/${id}`
    await navigator.clipboard.writeText(url)
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
        <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>Share</>
      )}
    </button>
  )
}

export default memo(function PromptCard({ bookmark }: { bookmark: Bookmark }) {
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
          {bookmark.is_multi_shot && bookmark.prompt_category?.startsWith('video_') && (
            <span className="rounded-full border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              Multi-shot
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
      <pre className="whitespace-pre-wrap break-words text-[13.5px] text-gray-700 dark:text-zinc-100 font-mono leading-[1.7] bg-black/[0.03] dark:bg-white/[0.03] rounded-lg p-3 border border-black/[0.05] dark:border-white/5 overflow-auto max-h-64">
        {prompt}
      </pre>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CopyButton text={prompt} />
          <ShareButton id={bookmark.id} />
          <ReportButton id={bookmark.id} />
        </div>
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
})
