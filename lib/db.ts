import postgres from 'postgres'
import { randomUUID } from 'crypto'
import type { Bookmark, BookmarkInsert, Category, CategoryCounts, PromptCategory } from './types'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

// ── Row → Bookmark ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBookmark(row: Record<string, any>): Bookmark {
  return {
    ...row,
    // Postgres returns JSONB as objects already; handle TEXT fallback just in case
    media_urls: typeof row.media_urls === 'string' ? JSON.parse(row.media_urls) : (row.media_urls ?? []),
    thread_tweets: typeof row.thread_tweets === 'string' ? JSON.parse(row.thread_tweets) : (row.thread_tweets ?? []),
    is_thread: Boolean(row.is_thread),
    confidence: Number(row.confidence),
    prompt_category: row.prompt_category ?? null,
    extracted_prompt: row.extracted_prompt ?? null,
    detected_model: row.detected_model ?? null,
  } as Bookmark
}

// ── Queries ───────────────────────────────────────────────────────────────

export interface QueryOptions {
  category?: Category | 'all'
  search?: string
  sort?: 'newest' | 'oldest' | 'confidence' | 'author'
  page?: number
  limit?: number
}

export async function queryBookmarks(opts: QueryOptions = {}): Promise<{
  bookmarks: Bookmark[]
  hasMore: boolean
}> {
  const { category = 'all', search = '', sort = 'newest', page = 0, limit = 30 } = opts

  const conditions: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = []

  if (category !== 'all') {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }

  if (search.trim()) {
    const term = `%${search.trim()}%`
    params.push(term, term)
    conditions.push(`(tweet_text ILIKE $${params.length - 1} OR author_handle ILIKE $${params.length})`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const orderMap = {
    newest: 'bookmarked_at DESC NULLS LAST, created_at DESC',
    oldest: 'bookmarked_at ASC NULLS FIRST, created_at ASC',
    confidence: 'confidence DESC',
    author: 'author_handle ASC',
  }

  params.push(limit + 1, page * limit)
  const query = `
    SELECT * FROM bookmarks
    ${where}
    ORDER BY ${orderMap[sort]}
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `

  // postgres.js doesn't support positional params with raw query strings easily;
  // use the tagged template approach via unsafe for dynamic queries
  const rows = await sql.unsafe(query, params) as Record<string, unknown>[]
  const hasMore = rows.length > limit
  return { bookmarks: rows.slice(0, limit).map(toBookmark), hasMore }
}

export async function getCounts(): Promise<CategoryCounts> {
  const rows = await sql<{ category: string; n: string }[]>`
    SELECT category, COUNT(*) as n FROM bookmarks GROUP BY category
  `
  const c: CategoryCounts = { all: 0, tech_ai_product: 0, career_productivity: 0, prompts: 0, uncategorized: 0, pending: 0 }
  for (const row of rows) {
    c[row.category as Category] = Number(row.n)
    c.all += Number(row.n)
  }
  const [{ pending }] = await sql<{ pending: string }[]>`
    SELECT COUNT(*) as pending FROM bookmarks WHERE confidence = 0
  `
  c.pending = Number(pending)
  return c
}

export async function insertBookmarks(bookmarks: BookmarkInsert[]): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0

  for (const b of bookmarks) {
    const result = await sql`
      INSERT INTO bookmarks
        (id, tweet_id, tweet_text, author_handle, author_name, tweet_url,
         media_urls, category, confidence, bookmarked_at)
      VALUES (
        ${randomUUID()},
        ${b.tweet_id ?? null},
        ${b.tweet_text ?? ''},
        ${b.author_handle ?? ''},
        ${b.author_name ?? null},
        ${b.tweet_url ?? ''},
        ${JSON.stringify(b.media_urls ?? [])}::jsonb,
        ${b.category ?? 'uncategorized'},
        ${b.confidence ?? 0},
        ${b.bookmarked_at ?? null}
      )
      ON CONFLICT (tweet_id) DO NOTHING
    `
    inserted += result.count
  }

  return { inserted, skipped: bookmarks.length - inserted }
}

export async function clearAll(): Promise<void> {
  await sql`DELETE FROM bookmarks`
}

export async function getUnclassified(limit = 100): Promise<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[]> {
  return sql<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[]>`
    SELECT id, tweet_id, tweet_text FROM bookmarks
    WHERE confidence = 0
    ORDER BY created_at ASC
    LIMIT ${limit}
  `
}

export async function updateBookmark(
  id: string,
  updates: Partial<Pick<Bookmark, 'category' | 'confidence' | 'rationale' | 'user_notes'>>
): Promise<Bookmark | null> {
  const sets: string[] = [`updated_at = NOW()::TEXT`]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = []

  if (updates.category !== undefined) { params.push(updates.category); sets.push(`category = $${params.length}`) }
  if (updates.confidence !== undefined) { params.push(updates.confidence); sets.push(`confidence = $${params.length}`) }
  if (updates.rationale !== undefined) { params.push(updates.rationale); sets.push(`rationale = $${params.length}`) }
  if (updates.user_notes !== undefined) { params.push(updates.user_notes); sets.push(`user_notes = $${params.length}`) }

  if (params.length === 0) return getBookmarkById(id) // nothing to update

  params.push(id)
  await sql.unsafe(
    `UPDATE bookmarks SET ${sets.join(', ')} WHERE id = $${params.length}`,
    params
  )
  return getBookmarkById(id)
}

export async function updateBookmarkByTweetId(
  tweet_id: string,
  updates: { category: Category; confidence: number; rationale: string }
): Promise<void> {
  await sql`
    UPDATE bookmarks
    SET category = ${updates.category},
        confidence = ${updates.confidence},
        rationale = ${updates.rationale},
        updated_at = NOW()::TEXT
    WHERE tweet_id = ${tweet_id}
  `
}

async function getBookmarkById(id: string): Promise<Bookmark | null> {
  const rows = await sql<Record<string, unknown>[]>`SELECT * FROM bookmarks WHERE id = ${id}`
  return rows.length ? toBookmark(rows[0]) : null
}

export async function getPrompts(promptCategory?: PromptCategory | 'all'): Promise<Bookmark[]> {
  const rows = promptCategory && promptCategory !== 'all'
    ? await sql<Record<string, unknown>[]>`
        SELECT * FROM bookmarks
        WHERE category = 'prompts' AND prompt_category = ${promptCategory}
        ORDER BY bookmarked_at DESC NULLS LAST, created_at DESC
      `
    : await sql<Record<string, unknown>[]>`
        SELECT * FROM bookmarks
        WHERE category = 'prompts'
        ORDER BY bookmarked_at DESC NULLS LAST, created_at DESC
      `
  return rows.map(toBookmark)
}

export async function countUnclassifiedPrompts(): Promise<number> {
  const [{ n }] = await sql<{ n: string }[]>`
    SELECT COUNT(*) as n FROM bookmarks
    WHERE category = 'prompts' AND (prompt_category IS NULL OR extracted_prompt IS NULL)
  `
  return Number(n)
}

export async function getUnclassifiedPrompts(limit = 50): Promise<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[]> {
  return sql<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[]>`
    SELECT id, tweet_id, tweet_text FROM bookmarks
    WHERE category = 'prompts' AND (prompt_category IS NULL OR extracted_prompt IS NULL)
    ORDER BY created_at ASC
    LIMIT ${limit}
  `
}

export async function updatePromptExtraction(
  id: string,
  data: { prompt_category: PromptCategory; extracted_prompt: string | null; detected_model: string | null }
): Promise<void> {
  await sql`
    UPDATE bookmarks
    SET prompt_category = ${data.prompt_category},
        extracted_prompt = ${data.extracted_prompt},
        detected_model = ${data.detected_model},
        updated_at = NOW()::TEXT
    WHERE id = ${id}
  `
}
