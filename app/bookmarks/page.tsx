'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Bookmark, Category, CategoryCounts } from '@/lib/types'
import Sidebar from '@/components/Sidebar'
import BookmarkCard from '@/components/BookmarkCard'

type SortOption = 'newest' | 'oldest' | 'confidence' | 'author'
const PAGE_SIZE = 30

const EMPTY_COUNTS: CategoryCounts = {
  all: 0, tech_ai_product: 0, career_productivity: 0, prompts: 0, uncategorized: 0, pending: 0,
}

function DashboardInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [counts, setCounts] = useState<CategoryCounts>(EMPTY_COUNTS)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>(
    (searchParams.get('category') as Category | 'all') || 'all'
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  )
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCategory !== 'all') params.set('category', activeCategory)
    if (searchQuery) params.set('q', searchQuery)
    if (sort !== 'newest') params.set('sort', sort)
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [activeCategory, searchQuery, sort]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCounts() {
    const res = await fetch('/api/bookmarks/counts')
    if (res.ok) setCounts(await res.json())
  }

  const fetchBookmarks = useCallback(
    async (pageNum: number, reset = false) => {
      setLoading(true)
      const params = new URLSearchParams({
        category: activeCategory,
        search: searchQuery,
        sort,
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      })

      let res: Response
      try {
        res = await fetch(`/api/bookmarks?${params}`)
      } catch {
        setLoading(false); return
      }
      if (!res.ok) { setLoading(false); return }

      const { bookmarks: results = [], hasMore: more = false } = await res.json()
      setHasMore(more)

      if (reset || pageNum === 0) {
        setBookmarks(results)
      } else {
        setBookmarks((prev) => [...prev, ...results])
      }
      setLoading(false)
    },
    [activeCategory, searchQuery, sort]
  )

  useEffect(() => {
    setPage(0)
    fetchBookmarks(0, true)
    fetchCounts()
  }, [activeCategory, searchQuery, sort]) // eslint-disable-line react-hooks/exhaustive-deps

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchBookmarks(next)
  }

  function handleBookmarkUpdate(updated: Bookmark) {
    setBookmarks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    fetchCounts()
  }

  const categoryLabel: Record<Category | 'all', string> = {
    all: 'All Bookmarks',
    tech_ai_product: 'Tech / AI / Product',
    career_productivity: 'Career / Productivity',
    prompts: 'Prompts',
    uncategorized: 'Uncategorized',
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:gap-8 max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <Sidebar
          counts={counts}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 md:mb-6">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {categoryLabel[activeCategory]}
              <span className="ml-2 text-sm text-gray-400 dark:text-zinc-600 font-normal">
                {counts[activeCategory === 'all' ? 'all' : activeCategory]}
              </span>
            </h1>

            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/8 rounded-lg px-3 py-1.5 text-sm text-gray-600 dark:text-zinc-300 focus:outline-none focus:border-[#1DA1F2]/50"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="confidence">By confidence</option>
                <option value="author">By author</option>
              </select>
            </div>
          </div>

          {loading && bookmarks.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <svg className="h-5 w-5 animate-spin text-gray-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-gray-400 dark:text-zinc-500 text-sm">No bookmarks yet.</p>
              {activeCategory === 'all' && !searchQuery && (
                <p className="text-gray-300 dark:text-zinc-600 text-xs mt-2">
                  <a href="/import" className="text-[#1DA1F2] hover:underline">Import bookmarks</a> to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {bookmarks.map((b) => (
                <BookmarkCard key={b.id} bookmark={b} onUpdate={handleBookmarkUpdate} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="rounded-lg border border-black/[0.1] dark:border-white/10 px-6 py-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:border-black/[0.2] dark:hover:border-white/20 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  )
}
