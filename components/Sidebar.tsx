'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category, CategoryCounts } from '@/lib/types'

interface Props {
  counts: CategoryCounts
  activeCategory: Category | 'all'
  onCategoryChange: (cat: Category | 'all') => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

const CATEGORIES: { value: Category | 'all'; label: string; dot?: string }[] = [
  { value: 'all', label: 'All Bookmarks' },
  { value: 'tech_ai_product', label: 'Tech / AI / Product', dot: 'bg-blue-500' },
  { value: 'career_productivity', label: 'Career / Productivity', dot: 'bg-green-500' },
  { value: 'prompts', label: 'Prompts', dot: 'bg-purple-500' },
  { value: 'uncategorized', label: 'Uncategorized', dot: 'bg-zinc-500' },
]

export default function Sidebar({
  counts,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col gap-6 w-56 shrink-0">
      {/* Logo / brand */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[#1DA1F2] text-lg">✦</span>
        <span className="font-semibold text-white text-sm tracking-wide">Bookmarks</span>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/8 pl-8 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#1DA1F2]/50 focus:ring-1 focus:ring-[#1DA1F2]/30"
        />
      </div>

      {/* Category filters */}
      <nav className="flex flex-col gap-0.5">
        {CATEGORIES.map((cat) => {
          const count = counts[cat.value as keyof CategoryCounts] ?? 0
          const active = activeCategory === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                {cat.dot && (
                  <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                )}
                {cat.label}
              </span>
              <span className="text-xs text-zinc-600">{count}</span>
            </button>
          )
        })}
      </nav>

      {/* Nav links */}
      <div className="mt-auto flex flex-col gap-0.5 border-t border-white/8 pt-4">
        <Link
          href="/import"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === '/import'
              ? 'bg-white/10 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import
        </Link>
      </div>
    </aside>
  )
}
