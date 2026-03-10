'use client'

import { useState } from 'react'
import type { Bookmark, Category } from '@/lib/types'
import CategoryBadge from './CategoryBadge'
import MediaThumbnail from './MediaThumbnail'

interface Props {
  bookmark: Bookmark
  onUpdate?: (updated: Bookmark) => void
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'tech_ai_product', label: 'Tech / AI / Product' },
  { value: 'career_productivity', label: 'Career / Productivity' },
  { value: 'prompts', label: 'Prompts' },
  { value: 'uncategorized', label: 'Uncategorized' },
]

export default function BookmarkCard({ bookmark, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  const isLong = bookmark.tweet_text.length > 280
  const displayText =
    expanded || !isLong ? bookmark.tweet_text : bookmark.tweet_text.slice(0, 280) + '…'

  async function recategorize(category: Category) {
    setUpdating(true)
    const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    })
    setUpdating(false)
    if (res.ok && onUpdate) onUpdate(await res.json())
  }

  const date = bookmark.bookmarked_at
    ? new Date(bookmark.bookmarked_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-white/8 bg-white/3 p-4 transition-colors hover:border-white/15 hover:bg-white/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-white truncate">@{bookmark.author_handle}</span>
          {bookmark.author_name && (
            <span className="text-zinc-500 text-sm truncate">{bookmark.author_name}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {date && <span className="text-xs text-zinc-600">{date}</span>}
          <CategoryBadge category={bookmark.category} />
        </div>
      </div>

      {/* Tweet text */}
      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
        {displayText}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-[#1DA1F2] hover:underline text-xs"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </p>

      {/* Media thumbnails */}
      {bookmark.media_urls.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {bookmark.media_urls.slice(0, 4).map((url) => (
            <MediaThumbnail key={url} url={url} size={20} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-3">
          <select
            disabled={updating}
            value={bookmark.category}
            onChange={(e) => recategorize(e.target.value as Category)}
            className="appearance-none bg-transparent text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer focus:outline-none disabled:opacity-50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-zinc-900 text-white">
                {c.label}
              </option>
            ))}
          </select>

          {bookmark.confidence > 0 && (
            <span className="text-xs text-zinc-600" title={bookmark.rationale ?? undefined}>
              {Math.round(bookmark.confidence * 100)}% confidence
            </span>
          )}
        </div>

        <a href={bookmark.tweet_url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-zinc-600 hover:text-[#1DA1F2] transition-colors">
          View on X ↗
        </a>
      </div>
    </article>
  )
}
