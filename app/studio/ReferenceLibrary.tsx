'use client'

import { useState, useMemo } from 'react'
import type { StudioRef } from './PromptEditor'

const FILTERS = [
  { label: 'All',     value: null },
  { label: 'Face',    value: 'face_person' },
  { label: 'Style',   value: 'style_artwork' },
  { label: 'Subject', value: 'subject_object' },
  { label: 'Pose',    value: 'pose_structure' },
  { label: 'Scene',   value: 'scene_background' },
]

interface Props {
  references: StudioRef[]
  onInsert?: (ref: StudioRef) => void
}

export default function ReferenceLibrary({ references, onInsert }: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() =>
    references.filter(r => {
      if (filter && r.refType !== filter) return false
      if (search) {
        const q = search.toLowerCase()
        return r.handle.toLowerCase().includes(q) || (r.extractedPrompt ?? '').toLowerCase().includes(q)
      }
      return true
    }),
    [references, filter, search]
  )

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-black/[0.08] dark:border-white/8 bg-[#f7f6f3] dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-3 border-b border-black/[0.08] dark:border-white/8 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
            References
          </span>
          <span className="text-[10px] text-gray-400 dark:text-zinc-600">
            {filtered.length}
          </span>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-lg text-xs px-2.5 py-1.5 bg-black/5 dark:bg-white/5 border border-black/[0.08] dark:border-white/8 outline-none placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-gray-900 dark:text-white focus:border-violet-400/60 dark:focus:border-violet-500/40 transition-colors"
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors ${
                filter === f.value
                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-700 dark:text-violet-300'
                  : 'bg-transparent border-black/[0.08] dark:border-white/8 text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400 dark:text-zinc-600">No references</div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map(ref => (
              <div
                key={ref.id}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData('text/ref-id', ref.id)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                onClick={() => setExpanded(expanded === ref.id ? null : ref.id)}
                className="group relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border border-black/[0.06] dark:border-white/6 hover:border-violet-400/40 dark:hover:border-violet-500/30 transition-all"
                title={`@${ref.handle}${ref.refType ? ` · ${ref.refType.replace(/_/g, ' ')}` : ''} — drag to compose or click`}
              >
                <img
                  src={ref.thumbnail}
                  alt={`@${ref.handle}`}
                  className="w-full aspect-square object-cover"
                  draggable={false}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-[10px] font-medium truncate leading-tight">@{ref.handle}</div>
                  {ref.refType && (
                    <div className="text-white/60 text-[9px] truncate leading-tight">{ref.refType.replace(/_/g, ' ')}</div>
                  )}
                </div>
                {/* Insert button on hover */}
                {onInsert && (
                  <button
                    onPointerDown={e => { e.stopPropagation(); onInsert(ref) }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-md bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-400"
                    title="Insert at cursor"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (() => {
        const ref = references.find(r => r.id === expanded)
        if (!ref) return null
        return (
          <div className="border-t border-black/[0.08] dark:border-white/8 p-3 bg-black/[0.02] dark:bg-white/[0.01]">
            <div className="flex items-center gap-2 mb-2">
              <img src={ref.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-gray-900 dark:text-white truncate">@{ref.handle}</div>
                {ref.refType && (
                  <div className="text-[10px] text-gray-400 dark:text-zinc-600 truncate">{ref.refType.replace(/_/g, ' ')}</div>
                )}
              </div>
            </div>
            {ref.extractedPrompt && (
              <p className="text-[10px] text-gray-500 dark:text-zinc-500 leading-relaxed line-clamp-3">
                {ref.extractedPrompt}
              </p>
            )}
            {ref.artStyles && ref.artStyles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {ref.artStyles.map(s => (
                  <span key={s} className="rounded-full bg-black/5 dark:bg-white/5 px-1.5 py-0.5 text-[9px] text-gray-500 dark:text-zinc-500">
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })()}
    </aside>
  )
}
