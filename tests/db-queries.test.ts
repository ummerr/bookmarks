import { describe, it, expect, vi, beforeEach } from 'vitest'

// Build a mock sql tagged-template function + .unsafe method
const mockRows: Record<string, unknown>[][] = []
let unsafeCaptures: { query: string; params: unknown[] }[] = []
let taggedCaptures: string[] = []

function mockSql(strings: TemplateStringsArray, ...values: unknown[]) {
  taggedCaptures.push(strings.join('$'))
  return Promise.resolve(mockRows.shift() ?? [])
}
mockSql.unsafe = vi.fn((query: string, params: unknown[]) => {
  unsafeCaptures.push({ query, params })
  return Promise.resolve(mockRows.shift() ?? [])
})

vi.mock('postgres', () => ({
  default: () => mockSql,
}))

// Must import after mock
import { queryBookmarks, getCounts, insertBookmarks } from '../lib/db'

beforeEach(() => {
  mockRows.length = 0
  unsafeCaptures = []
  taggedCaptures = []
  mockSql.unsafe.mockClear()
})

// Helper to make a minimal valid row for toBookmark
function fakeRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'id-1',
    tweet_id: 'tw-1',
    tweet_text: 'hello',
    author_handle: 'alice',
    author_name: null,
    tweet_url: 'https://x.com/alice/status/1',
    media_urls: [],
    media_alt_texts: [],
    thread_tweets: [],
    prompt_themes: [],
    art_styles: [],
    category: 'uncategorized',
    confidence: 0,
    rationale: null,
    is_thread: false,
    user_notes: null,
    prompt_category: null,
    extracted_prompt: null,
    detected_model: null,
    requires_reference: null,
    reference_type: null,
    source: 'twitter',
    bookmarked_at: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  }
}

// ─── queryBookmarks ──────────────────────────────────────────────────────────

describe('queryBookmarks', () => {
  it('default options: no WHERE, ORDER BY newest, correct LIMIT/OFFSET', async () => {
    mockRows.push([fakeRow()])

    const result = await queryBookmarks()

    expect(unsafeCaptures).toHaveLength(1)
    const { query, params } = unsafeCaptures[0]
    expect(query).not.toContain('WHERE')
    expect(query).toContain('ORDER BY bookmarked_at DESC')
    // Default: limit=30, so LIMIT=31, OFFSET=0
    expect(params).toContain(31)
    expect(params).toContain(0)
    expect(result.bookmarks).toHaveLength(1)
    expect(result.hasMore).toBe(false)
  })

  it('category filter adds WHERE clause', async () => {
    mockRows.push([])

    await queryBookmarks({ category: 'prompts' })

    const { query, params } = unsafeCaptures[0]
    expect(query).toContain('WHERE')
    expect(query).toContain('category = $1')
    expect(params[0]).toBe('prompts')
  })

  it('search filter adds ILIKE conditions', async () => {
    mockRows.push([])

    await queryBookmarks({ search: 'test' })

    const { query, params } = unsafeCaptures[0]
    expect(query).toContain('ILIKE')
    expect(params[0]).toBe('%test%')
    expect(params[1]).toBe('%test%')
  })

  it('hasMore is true when rows exceed limit', async () => {
    // Return limit+1 rows (default limit=30, so 31 rows)
    const rows = Array.from({ length: 31 }, (_, i) => fakeRow({ id: `id-${i}` }))
    mockRows.push(rows)

    const result = await queryBookmarks()

    expect(result.hasMore).toBe(true)
    expect(result.bookmarks).toHaveLength(30)
  })

  it('sort options map to correct ORDER BY', async () => {
    for (const sort of ['newest', 'oldest', 'confidence', 'author'] as const) {
      mockRows.push([])
      unsafeCaptures = []

      await queryBookmarks({ sort })

      const { query } = unsafeCaptures[0]
      if (sort === 'newest') expect(query).toContain('bookmarked_at DESC')
      if (sort === 'oldest') expect(query).toContain('bookmarked_at ASC')
      if (sort === 'confidence') expect(query).toContain('confidence DESC')
      if (sort === 'author') expect(query).toContain('author_handle ASC')
    }
  })

  it('pagination: page 2 with limit 10 → OFFSET 20', async () => {
    mockRows.push([])

    await queryBookmarks({ page: 2, limit: 10 })

    const { params } = unsafeCaptures[0]
    expect(params).toContain(11)  // limit + 1
    expect(params).toContain(20)  // page * limit
  })

  it('category "all" does not add WHERE', async () => {
    mockRows.push([])

    await queryBookmarks({ category: 'all' })

    const { query } = unsafeCaptures[0]
    expect(query).not.toContain('WHERE')
  })

  it('combined category + search adds both conditions', async () => {
    mockRows.push([])

    await queryBookmarks({ category: 'prompts', search: 'flux' })

    const { query, params } = unsafeCaptures[0]
    expect(query).toContain('category = $1')
    expect(query).toContain('ILIKE')
    expect(params[0]).toBe('prompts')
    expect(params[1]).toBe('%flux%')
  })
})

// ─── getCounts ───────────────────────────────────────────────────────────────

describe('getCounts', () => {
  it('aggregates category counts correctly', async () => {
    // First query: category counts
    mockRows.push([
      { category: 'prompts', n: '50' },
      { category: 'tech_ai_product', n: '30' },
      { category: 'uncategorized', n: '10' },
    ])
    // Second query: pending count
    mockRows.push([{ pending: '5' }])

    const counts = await getCounts()

    expect(counts.prompts).toBe(50)
    expect(counts.tech_ai_product).toBe(30)
    expect(counts.uncategorized).toBe(10)
    expect(counts.career_productivity).toBe(0)
    expect(counts.all).toBe(90) // 50 + 30 + 10
    expect(counts.pending).toBe(5)
  })
})

// ─── insertBookmarks ─────────────────────────────────────────────────────────

describe('insertBookmarks', () => {
  it('returns correct inserted and skipped counts', async () => {
    // First insert: succeeds (count=1)
    mockRows.push(Object.assign([], { count: 1 }))
    // Second insert: conflict (count=0)
    mockRows.push(Object.assign([], { count: 0 }))

    const result = await insertBookmarks([
      { tweet_id: 't1', tweet_text: 'first', author_handle: 'a', tweet_url: 'u1' },
      { tweet_id: 't2', tweet_text: 'second', author_handle: 'b', tweet_url: 'u2' },
    ])

    expect(result.inserted).toBe(1)
    expect(result.skipped).toBe(1)
  })

  it('handles empty array', async () => {
    const result = await insertBookmarks([])
    expect(result).toEqual({ inserted: 0, skipped: 0 })
  })
})
