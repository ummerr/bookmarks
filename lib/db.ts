import Database from 'better-sqlite3'
import path from 'path'
import { randomUUID } from 'crypto'
import type { Bookmark, BookmarkInsert, Category, CategoryCounts, PromptCategory } from './types'

const DB_PATH = path.join(process.cwd(), 'bookmarks.db')

// Singleton — survives Next.js hot reloads in dev
const g = global as typeof globalThis & { _bmDb?: Database.Database }

function getDb(): Database.Database {
  if (!g._bmDb) {
    g._bmDb = new Database(DB_PATH)
    g._bmDb.pragma('journal_mode = WAL')
    initSchema(g._bmDb)
  }
  return g._bmDb
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id          TEXT PRIMARY KEY,
      tweet_id    TEXT UNIQUE NOT NULL,
      tweet_text  TEXT NOT NULL,
      author_handle TEXT NOT NULL,
      author_name TEXT,
      tweet_url   TEXT NOT NULL,
      media_urls  TEXT NOT NULL DEFAULT '[]',
      category    TEXT NOT NULL DEFAULT 'uncategorized',
      confidence  REAL NOT NULL DEFAULT 0,
      rationale   TEXT,
      is_thread   INTEGER NOT NULL DEFAULT 0,
      thread_tweets TEXT NOT NULL DEFAULT '[]',
      user_notes  TEXT,
      bookmarked_at TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_bm_category      ON bookmarks(category);
    CREATE INDEX IF NOT EXISTS idx_bm_author        ON bookmarks(author_handle);
    CREATE INDEX IF NOT EXISTS idx_bm_bookmarked_at ON bookmarks(bookmarked_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bm_confidence    ON bookmarks(confidence DESC);
  `)
  // Migrations
  try { db.exec(`ALTER TABLE bookmarks ADD COLUMN prompt_category TEXT`) } catch {}
}

// ── Row → Bookmark ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBookmark(row: Record<string, any>): Bookmark {
  return {
    ...row,
    media_urls: JSON.parse(row.media_urls ?? '[]'),
    thread_tweets: JSON.parse(row.thread_tweets ?? '[]'),
    is_thread: Boolean(row.is_thread),
    confidence: Number(row.confidence),
    prompt_category: row.prompt_category ?? null,
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

export function queryBookmarks(opts: QueryOptions = {}): {
  bookmarks: Bookmark[]
  hasMore: boolean
} {
  const db = getDb()
  const { category = 'all', search = '', sort = 'newest', page = 0, limit = 30 } = opts

  const conditions: string[] = []
  const params: unknown[] = []

  if (category !== 'all') {
    conditions.push('category = ?')
    params.push(category)
  }

  if (search.trim()) {
    conditions.push('(tweet_text LIKE ? OR author_handle LIKE ?)')
    const term = `%${search.trim()}%`
    params.push(term, term)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const orderMap = {
    newest: 'bookmarked_at DESC NULLS LAST, created_at DESC',
    oldest: 'bookmarked_at ASC NULLS FIRST, created_at ASC',
    confidence: 'confidence DESC',
    author: 'author_handle ASC',
  }

  const sql = `
    SELECT * FROM bookmarks
    ${where}
    ORDER BY ${orderMap[sort]}
    LIMIT ? OFFSET ?
  `
  params.push(limit + 1, page * limit)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = db.prepare(sql).all(...params) as Record<string, any>[]
  const hasMore = rows.length > limit
  return { bookmarks: rows.slice(0, limit).map(toBookmark), hasMore }
}

export function getCounts(): CategoryCounts {
  const db = getDb()
  const rows = db
    .prepare(`SELECT category, COUNT(*) as n FROM bookmarks GROUP BY category`)
    .all() as { category: string; n: number }[]

  const c: CategoryCounts = { all: 0, tech_ai_product: 0, career_productivity: 0, prompts: 0, uncategorized: 0 }
  for (const row of rows) {
    c[row.category as Category] = row.n
    c.all += row.n
  }
  return c
}

export function insertBookmarks(bookmarks: BookmarkInsert[]): { inserted: number; skipped: number } {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO bookmarks
      (id, tweet_id, tweet_text, author_handle, author_name, tweet_url,
       media_urls, category, confidence, bookmarked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let inserted = 0
  const insert = db.transaction((rows: BookmarkInsert[]) => {
    for (const b of rows) {
      const res = stmt.run(
        randomUUID(),
        b.tweet_id ?? null,
        b.tweet_text ?? '',
        b.author_handle ?? '',   // empty string prevents NOT NULL violation
        b.author_name ?? null,
        b.tweet_url ?? '',       // same for tweet_url
        JSON.stringify(b.media_urls ?? []),
        b.category ?? 'uncategorized',
        b.confidence ?? 0,
        b.bookmarked_at ?? null,
      )
      inserted += Number(res.changes)
    }
  })

  insert(bookmarks)
  return { inserted, skipped: bookmarks.length - inserted }
}

export function clearAll() {
  getDb().exec('DELETE FROM bookmarks')
}

export function getUnclassified(limit = 100): Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[] {
  const db = getDb()
  return db
    .prepare(`SELECT id, tweet_id, tweet_text FROM bookmarks WHERE confidence = 0 ORDER BY created_at ASC LIMIT ?`)
    .all(limit) as Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[]
}

export function updateBookmark(id: string, updates: Partial<Pick<Bookmark, 'category' | 'confidence' | 'rationale' | 'user_notes'>>): Bookmark | null {
  const db = getDb()
  const sets: string[] = ['updated_at = datetime(\'now\')']
  const params: unknown[] = []

  if (updates.category !== undefined) { sets.push('category = ?'); params.push(updates.category) }
  if (updates.confidence !== undefined) { sets.push('confidence = ?'); params.push(updates.confidence) }
  if (updates.rationale !== undefined) { sets.push('rationale = ?'); params.push(updates.rationale) }
  if (updates.user_notes !== undefined) { sets.push('user_notes = ?'); params.push(updates.user_notes) }

  if (sets.length === 1) return getBookmarkById(id) // nothing to update

  params.push(id)
  db.prepare(`UPDATE bookmarks SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  return getBookmarkById(id)
}

export function updateBookmarkByTweetId(
  tweet_id: string,
  updates: { category: Category; confidence: number; rationale: string }
) {
  const db = getDb()
  db.prepare(`
    UPDATE bookmarks
    SET category = ?, confidence = ?, rationale = ?, updated_at = datetime('now')
    WHERE tweet_id = ?
  `).run(updates.category, updates.confidence, updates.rationale, tweet_id)
}

function getBookmarkById(id: string): Bookmark | null {
  const db = getDb()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = db.prepare(`SELECT * FROM bookmarks WHERE id = ?`).get(id) as Record<string, any> | undefined
  return row ? toBookmark(row) : null
}

export function getPrompts(promptCategory?: PromptCategory | 'all'): Bookmark[] {
  const db = getDb()
  const where = promptCategory && promptCategory !== 'all'
    ? `WHERE category = 'prompts' AND prompt_category = ?`
    : `WHERE category = 'prompts'`
  const params = promptCategory && promptCategory !== 'all' ? [promptCategory] : []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = db.prepare(`SELECT * FROM bookmarks ${where} ORDER BY bookmarked_at DESC NULLS LAST, created_at DESC`).all(...params) as Record<string, any>[]
  return rows.map(toBookmark)
}

export function getUnclassifiedPrompts(limit = 50): Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[] {
  const db = getDb()
  return db
    .prepare(`SELECT id, tweet_id, tweet_text FROM bookmarks WHERE category = 'prompts' AND prompt_category IS NULL ORDER BY created_at ASC LIMIT ?`)
    .all(limit) as Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[]
}

export function updatePromptCategory(id: string, prompt_category: PromptCategory) {
  getDb()
    .prepare(`UPDATE bookmarks SET prompt_category = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(prompt_category, id)
}
