import postgres from 'postgres'
import { randomUUID } from 'crypto'
import type { ArtStyle, Bookmark, BookmarkInsert, Category, CategoryCounts, PromptCategory, PromptTheme, ReferenceType } from './types'

// Lazy init — prevents build-time failure when Next.js collects page data
let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require' }))
}

// ── Row → Bookmark ────────────────────────────────────────────────────────

function detectMultiShot(text: string): boolean {
  const shotCount = (text.match(/\bshot\s*\d+/gi) ?? []).length
  const cutCount = (text.match(/\bcut\s*\d+/gi) ?? []).length
  return shotCount >= 2 || cutCount >= 2
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBookmark(row: Record<string, any>): Bookmark {
  const extracted_prompt = row.extracted_prompt ?? null
  const tweet_text = row.tweet_text ?? ''
  return {
    ...row,
    media_urls: typeof row.media_urls === 'string' ? JSON.parse(row.media_urls) : (row.media_urls ?? []),
    media_alt_texts: typeof row.media_alt_texts === 'string' ? JSON.parse(row.media_alt_texts) : (row.media_alt_texts ?? []),
    thread_tweets: typeof row.thread_tweets === 'string' ? JSON.parse(row.thread_tweets) : (row.thread_tweets ?? []),
    prompt_themes: typeof row.prompt_themes === 'string' ? JSON.parse(row.prompt_themes) : (row.prompt_themes ?? []),
    art_styles: typeof row.art_styles === 'string' ? JSON.parse(row.art_styles) : (row.art_styles ?? []),
    is_thread: Boolean(row.is_thread),
    confidence: Number(row.confidence),
    prompt_category: row.prompt_category ?? null,
    extracted_prompt,
    detected_model: row.detected_model ?? null,
    requires_reference: row.requires_reference ?? null,
    reference_type: row.reference_type ?? null,
    is_multi_shot: detectMultiShot(extracted_prompt ?? tweet_text),
    source: (row.source as 'twitter' | 'manual' | 'reddit') ?? 'twitter',
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

  const rows = await getSql().unsafe(query, params) as Record<string, unknown>[]
  const hasMore = rows.length > limit
  return { bookmarks: rows.slice(0, limit).map(toBookmark), hasMore }
}

export async function getCounts(): Promise<CategoryCounts> {
  const rows = await getSql()<{ category: string; n: string }[]>`
    SELECT category, COUNT(*) as n FROM bookmarks GROUP BY category
  `
  const c: CategoryCounts = { all: 0, tech_ai_product: 0, career_productivity: 0, prompts: 0, uncategorized: 0, pending: 0 }
  for (const row of rows) {
    c[row.category as Category] = Number(row.n)
    c.all += Number(row.n)
  }
  const [{ pending }] = await getSql()<{ pending: string }[]>`
    SELECT COUNT(*) as pending FROM bookmarks WHERE confidence = 0
  `
  c.pending = Number(pending)
  return c
}

export async function insertBookmarks(bookmarks: BookmarkInsert[]): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0

  for (const b of bookmarks) {
    const result = await getSql()`
      INSERT INTO bookmarks
        (id, tweet_id, tweet_text, author_handle, author_name, tweet_url,
         media_urls, media_alt_texts, category, confidence, bookmarked_at, source)
      VALUES (
        ${randomUUID()},
        ${b.tweet_id ?? null},
        ${b.tweet_text ?? ''},
        ${b.author_handle ?? ''},
        ${b.author_name ?? null},
        ${b.tweet_url ?? ''},
        ${JSON.stringify(b.media_urls ?? [])}::jsonb,
        ${JSON.stringify(b.media_alt_texts ?? [])}::jsonb,
        ${b.category ?? 'uncategorized'},
        ${b.confidence ?? 0},
        ${b.bookmarked_at ?? null},
        ${b.source ?? 'twitter'}
      )
      ON CONFLICT (tweet_id) DO NOTHING
    `
    inserted += result.count
  }

  return { inserted, skipped: bookmarks.length - inserted }
}

export async function clearAll(): Promise<void> {
  await getSql()`DELETE FROM bookmarks`
}

export async function insertManualPrompt(data: {
  text: string
  url: string
  source_name: string
}): Promise<Bookmark> {
  const id = randomUUID()
  const tweet_id = randomUUID()
  await getSql()`
    INSERT INTO bookmarks
      (id, tweet_id, tweet_text, author_handle, tweet_url,
       media_urls, category, confidence, source)
    VALUES (
      ${id},
      ${tweet_id},
      ${data.text},
      ${data.source_name},
      ${data.url},
      '[]'::jsonb,
      'prompts',
      1.0,
      'manual'
    )
  `
  const rows = await getSql()<Record<string, unknown>[]>`SELECT * FROM bookmarks WHERE id = ${id}`
  return toBookmark(rows[0])
}

export async function getUnclassified(limit = 100): Promise<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[]> {
  return getSql()<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text'>[]>`
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

  if (params.length === 0) return getBookmarkById(id)

  params.push(id)
  await getSql().unsafe(
    `UPDATE bookmarks SET ${sets.join(', ')} WHERE id = $${params.length}`,
    params
  )
  return getBookmarkById(id)
}

export async function updateBookmarkByTweetId(
  tweet_id: string,
  updates: { category: Category; confidence: number; rationale: string }
): Promise<void> {
  await getSql()`
    UPDATE bookmarks
    SET category = ${updates.category},
        confidence = ${updates.confidence},
        rationale = ${updates.rationale},
        updated_at = NOW()::TEXT
    WHERE tweet_id = ${tweet_id}
  `
}

export async function getBookmarkById(id: string): Promise<Bookmark | null> {
  const rows = await getSql()<Record<string, unknown>[]>`SELECT * FROM bookmarks WHERE id = ${id}`
  return rows.length ? toBookmark(rows[0]) : null
}

export async function getPrompts(promptCategory?: PromptCategory | 'all'): Promise<Bookmark[]> {
  const rows = promptCategory && promptCategory !== 'all'
    ? await getSql()<Record<string, unknown>[]>`
        SELECT * FROM bookmarks
        WHERE category = 'prompts' AND prompt_category = ${promptCategory}
        ORDER BY bookmarked_at DESC NULLS LAST, created_at DESC
      `
    : await getSql()<Record<string, unknown>[]>`
        SELECT * FROM bookmarks
        WHERE category = 'prompts'
        ORDER BY bookmarked_at DESC NULLS LAST, created_at DESC
      `
  return rows.map(toBookmark)
}

export async function getRandomPrompt(opts: {
  prompt_category?: PromptCategory | null
  prompt_theme?: PromptTheme | null
  detected_model?: string | null
  category_group?: 'image' | 'video' | null
  multi_shot?: boolean | null
} = {}): Promise<Bookmark | null> {
  const conditions = ["category = 'prompts'", "prompt_category IS NOT NULL"]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = []

  if (opts.category_group) {
    params.push(`${opts.category_group}_%`)
    conditions.push(`prompt_category LIKE $${params.length}`)
  } else if (opts.prompt_category) {
    params.push(opts.prompt_category)
    conditions.push(`prompt_category = $${params.length}`)
  }
  if (opts.prompt_theme) {
    params.push(JSON.stringify([opts.prompt_theme]))
    conditions.push(`prompt_themes @> $${params.length}::jsonb`)
  }
  if (opts.detected_model) {
    params.push(opts.detected_model)
    conditions.push(`detected_model = $${params.length}`)
  }
  if (opts.multi_shot) {
    conditions.push(`COALESCE(extracted_prompt, tweet_text) ~* 'shot\\s*\\d+.*shot\\s*\\d+|cut\\s*\\d+.*cut\\s*\\d+'`)
  }

  const rows = await getSql().unsafe(
    `SELECT * FROM bookmarks WHERE ${conditions.join(' AND ')} ORDER BY RANDOM() LIMIT 1`,
    params
  ) as Record<string, unknown>[]
  return rows.length ? toBookmark(rows[0]) : null
}

export async function getDistinctModels(): Promise<string[]> {
  const rows = await getSql()<{ detected_model: string }[]>`
    SELECT detected_model, COUNT(*) as n
    FROM bookmarks
    WHERE category = 'prompts' AND detected_model IS NOT NULL AND detected_model != ''
    GROUP BY detected_model
    ORDER BY n DESC
    LIMIT 15
  `
  return rows.map(r => r.detected_model)
}

export async function countUnclassifiedPrompts(): Promise<number> {
  const [{ n }] = await getSql()<{ n: string }[]>`
    SELECT COUNT(*) as n FROM bookmarks
    WHERE category = 'prompts' AND prompt_category IS NULL
  `
  return Number(n)
}

function toPromptRow(r: Record<string, unknown>) {
  return {
    id: r.id as string,
    tweet_id: r.tweet_id as string,
    tweet_text: r.tweet_text as string,
    thread_tweets: typeof r.thread_tweets === 'string' ? JSON.parse(r.thread_tweets) : (r.thread_tweets ?? []),
    media_alt_texts: typeof r.media_alt_texts === 'string' ? JSON.parse(r.media_alt_texts) : (r.media_alt_texts ?? []),
  }
}

export async function countAllPrompts(): Promise<number> {
  const rows = await getSql()<{ n: string }[]>`
    SELECT COUNT(*) as n FROM bookmarks WHERE category = 'prompts'
  `
  return Number(rows[0].n)
}

export async function getAllPromptsForReclassify(limit = 500, offset = 0): Promise<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text' | 'thread_tweets' | 'media_alt_texts'>[]> {
  const rows = await getSql()<Record<string, unknown>[]>`
    SELECT id, tweet_id, tweet_text, thread_tweets, media_alt_texts FROM bookmarks
    WHERE category = 'prompts'
    ORDER BY created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `
  return rows.map(toPromptRow)
}

export async function getUnclassifiedPrompts(limit = 50, offset = 0): Promise<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text' | 'thread_tweets' | 'media_alt_texts'>[]> {
  const rows = await getSql()<Record<string, unknown>[]>`
    SELECT id, tweet_id, tweet_text, thread_tweets, media_alt_texts FROM bookmarks
    WHERE category = 'prompts' AND prompt_category IS NULL
    ORDER BY created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `
  return rows.map(toPromptRow)
}

export async function getAllPrompts(limit = 500): Promise<Pick<Bookmark, 'id' | 'tweet_id' | 'tweet_text' | 'thread_tweets' | 'media_alt_texts'>[]> {
  const rows = await getSql()<Record<string, unknown>[]>`
    SELECT id, tweet_id, tweet_text, thread_tweets, media_alt_texts FROM bookmarks
    WHERE category = 'prompts'
    ORDER BY created_at ASC
    LIMIT ${limit}
  `
  return rows.map(toPromptRow)
}

// ── Thread header detection ───────────────────────────────────────────────

export interface ThreadHeaderCandidate {
  id: string
  tweet_id: string
  tweet_text: string
  extracted_prompt: string | null
  author_handle: string
  tweet_url: string
  thread_tweet_count: number
  thread_tweets: { tweet_id: string; tweet_text: string }[]
}

export async function getThreadHeaderCandidates(): Promise<ThreadHeaderCandidate[]> {
  const SHORT_THRESHOLD = 200
  const rows = await getSql()<Record<string, unknown>[]>`
    SELECT
      id, tweet_id, tweet_text, extracted_prompt, author_handle, tweet_url, thread_tweets,
      jsonb_array_length(thread_tweets) AS thread_tweet_count
    FROM bookmarks
    WHERE category = 'prompts'
      AND (
        (
          char_length(tweet_text) < ${SHORT_THRESHOLD}
          AND (
            lower(tweet_text) LIKE '%prompt%'
            OR lower(tweet_text) LIKE '%below%'
            OR lower(tweet_text) LIKE '%here are%'
            OR lower(tweet_text) LIKE ${'%here\'s%'}
            OR lower(tweet_text) LIKE '%thread%'
            OR tweet_text LIKE '%👇%'
            OR tweet_text LIKE '%⬇%'
          )
        )
        OR (
          extracted_prompt IS NOT NULL
          AND char_length(extracted_prompt) < 60
          AND (
            lower(extracted_prompt) LIKE '%prompt%'
            OR lower(extracted_prompt) LIKE '%below%'
            OR lower(extracted_prompt) LIKE '%see thread%'
            OR extracted_prompt LIKE '%👇%'
          )
        )
      )
    ORDER BY thread_tweet_count DESC, created_at DESC
  `
  return rows.map((r) => ({
    id: r.id as string,
    tweet_id: r.tweet_id as string,
    tweet_text: r.tweet_text as string,
    extracted_prompt: r.extracted_prompt as string | null,
    author_handle: r.author_handle as string,
    tweet_url: r.tweet_url as string,
    thread_tweet_count: Number(r.thread_tweet_count ?? 0),
    thread_tweets: typeof r.thread_tweets === 'string'
      ? JSON.parse(r.thread_tweets)
      : (r.thread_tweets as { tweet_id: string; tweet_text: string }[]) ?? [],
  }))
}

// ── Studio ────────────────────────────────────────────────────────────────

export interface StudioReference {
  id: string
  author_handle: string
  author_name: string | null
  tweet_url: string
  media_urls: string[]
  reference_type: ReferenceType | null
  prompt_category: PromptCategory | null
  art_styles: ArtStyle[]
  extracted_prompt: string | null
}

export async function getReferences(): Promise<StudioReference[]> {
  const rows = await getSql()<Record<string, unknown>[]>`
    SELECT id, author_handle, author_name, tweet_url, media_urls,
           reference_type, prompt_category, art_styles, extracted_prompt
    FROM bookmarks
    WHERE category = 'prompts'
      AND jsonb_array_length(media_urls) > 0
    ORDER BY bookmarked_at DESC NULLS LAST, created_at DESC
  `
  return rows.map(r => ({
    id: r.id as string,
    author_handle: r.author_handle as string,
    author_name: (r.author_name as string | null) ?? null,
    tweet_url: r.tweet_url as string,
    media_urls: typeof r.media_urls === 'string' ? JSON.parse(r.media_urls) : (r.media_urls ?? []),
    reference_type: (r.reference_type as ReferenceType | null) ?? null,
    prompt_category: (r.prompt_category as PromptCategory | null) ?? null,
    art_styles: typeof r.art_styles === 'string' ? JSON.parse(r.art_styles) : (r.art_styles ?? []),
    extracted_prompt: (r.extracted_prompt as string | null) ?? null,
  }))
}

export async function updatePromptExtraction(
  id: string,
  data: {
    prompt_category: PromptCategory
    extracted_prompt: string | null
    detected_model: string | null
    prompt_themes: PromptTheme[]
    requires_reference: boolean | null
    reference_type: ReferenceType | null
    art_styles: ArtStyle[]
  }
): Promise<void> {
  await getSql()`
    UPDATE bookmarks
    SET prompt_category = ${data.prompt_category ?? 'other'},
        extracted_prompt = ${data.extracted_prompt ?? null},
        detected_model = ${data.detected_model ?? null},
        prompt_themes = ${JSON.stringify(data.prompt_themes ?? [])}::jsonb,
        requires_reference = ${data.requires_reference ?? null},
        reference_type = ${data.reference_type ?? null},
        art_styles = ${JSON.stringify(data.art_styles ?? [])}::jsonb,
        updated_at = NOW()::TEXT
    WHERE id = ${id}
  `
}
