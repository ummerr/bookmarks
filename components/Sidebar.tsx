'use client'

import Link from 'next/link'
import { useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeLabel = CATEGORIES.find((c) => c.value === activeCategory)?.label ?? 'All Bookmarks'
  const isFiltered = activeCategory !== 'all' || searchQuery.length > 0

  return (
    <aside className="flex flex-col gap-3 md:gap-6 md:w-56 md:shrink-0">
      {/* Logo / brand — hidden on mobile (shown in Nav) */}
      <div className="hidden md:flex items-center gap-2 px-1">
        <span className="text-[#1DA1F2] text-lg">✦</span>
        <span className="font-semibold text-gray-900 dark:text-white text-sm tracking-wide">Bookmarks</span>
      </div>

      {/* Mobile toggle button */}
      <button
        className="md:hidden flex items-center justify-between w-full rounded-lg bg-black/[0.04] dark:bg-white/5 border border-black/[0.08] dark:border-white/8 px-3 py-2 text-sm text-gray-600 dark:text-zinc-300"
        onClick={() => setMobileOpen((o) => !o)}
      >
        <span className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h4" />
          </svg>
          <span>{isFiltered && activeCategory !== 'all' ? activeLabel : 'Filter'}</span>
          {isFiltered && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#1DA1F2]" />
          )}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 dark:text-zinc-500 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Search + Category filters — always visible on desktop, collapsible on mobile */}
      <div className={`flex flex-col gap-3 md:gap-6 ${mobileOpen ? 'flex' : 'hidden'} md:flex`}>
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-zinc-500"
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
            className="w-full rounded-lg bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/8 pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#1DA1F2]/50 focus:ring-1 focus:ring-[#1DA1F2]/30"
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
                onClick={() => { onCategoryChange(cat.value); setMobileOpen(false) }}
                className={`shrink-0 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors justify-between w-full ${
                  active
                    ? 'bg-black/8 dark:bg-white/10 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  {cat.dot && (
                    <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                  )}
                  {cat.label}
                </span>
                <span className="text-xs text-gray-400 dark:text-zinc-600">{count}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Classified status — hidden on mobile */}
      <div className="hidden md:flex items-center justify-between text-xs px-1">
        <span className="text-gray-400 dark:text-zinc-600">
          {counts.all - counts.pending} classified
        </span>
        {counts.pending > 0 && (
          <span className="text-amber-500/80">{counts.pending} pending</span>
        )}
      </div>

      {/* Nav links — hidden on mobile (shown in Nav) */}
      <div className="hidden md:flex mt-auto flex-col gap-0.5 border-t border-black/[0.08] dark:border-white/8 pt-4">
        <Link
          href="/prompts"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === '/prompts'
              ? 'bg-black/8 dark:bg-white/10 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.346.346a5.5 5.5 0 01-1.158 1.258c-.437.337-.688.843-.688 1.396v.346a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.346c0-.553-.251-1.059-.688-1.396a5.5 5.5 0 01-1.158-1.258l-.346-.346z" />
          </svg>
          Prompts
        </Link>
        <Link
          href="/import"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname === '/import'
              ? 'bg-black/8 dark:bg-white/10 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import & Classify
        </Link>
      </div>
    </aside>
  )
}
