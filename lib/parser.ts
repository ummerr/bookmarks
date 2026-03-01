import type { BookmarkInsert } from './types'

// ─── Twitter archive format ────────────────────────────────────────────────
// window.YTD.bookmarks.part0 = [ { tweet: { ... } } ]
// Also handles the raw array export that some tools produce.

interface TwitterArchiveTweet {
  id_str?: string
  id?: string
  full_text?: string
  text?: string
  user?: {
    screen_name?: string
    name?: string
  }
  // extended_entities or entities for media
  entities?: { media?: { media_url_https?: string }[] }
  extended_entities?: { media?: { media_url_https?: string }[] }
  created_at?: string
}

interface TwitterArchiveEntry {
  tweet?: TwitterArchiveTweet
  // Some exports wrap at the top level
  [key: string]: unknown
}

function extractTweetId(url: string): string | null {
  const m = url.match(/status\/(\d+)/)
  return m ? m[1] : null
}

function buildTweetUrl(handle: string, tweetId: string): string {
  return `https://x.com/${handle}/status/${tweetId}`
}

function parseArchiveTweet(entry: TwitterArchiveTweet): BookmarkInsert | null {
  const tweet_id = entry.id_str || entry.id
  const tweet_text = entry.full_text || entry.text
  const handle = entry.user?.screen_name
  if (!tweet_id || !tweet_text || !handle) return null

  const media =
    entry.extended_entities?.media || entry.entities?.media || []
  const media_urls = media
    .map((m) => m.media_url_https)
    .filter(Boolean) as string[]

  return {
    tweet_id,
    tweet_text: tweet_text.replace(/https:\/\/t\.co\/\S+/g, '').trim(),
    author_handle: handle,
    author_name: entry.user?.name ?? null,
    tweet_url: buildTweetUrl(handle, tweet_id),
    media_urls,
    bookmarked_at: entry.created_at ? new Date(entry.created_at).toISOString() : null,
  }
}

// ─── JSON parsers ──────────────────────────────────────────────────────────

export function parseTwitterArchiveJson(raw: string): BookmarkInsert[] {
  let data: unknown

  // Twitter archive wraps in JS assignment: window.YTD.bookmarks.part0 = [...]
  const jsMatch = raw.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/)
  if (jsMatch) {
    data = JSON.parse(jsMatch[1])
  } else {
    data = JSON.parse(raw)
  }

  const entries: TwitterArchiveEntry[] = Array.isArray(data) ? data : [data]
  const results: BookmarkInsert[] = []

  for (const entry of entries) {
    // Format: { tweet: { ... } }
    const tweetData =
      (entry.tweet as TwitterArchiveTweet) ||
      (entry as unknown as TwitterArchiveTweet)

    const parsed = parseArchiveTweet(tweetData)
    if (parsed) results.push(parsed)
  }

  return results
}

// ─── CSV parser ────────────────────────────────────────────────────────────
// Expected columns (any order): tweet_id, tweet_text, author_handle,
// author_name, tweet_url, bookmarked_at
// Fallback: detect url column and extract tweet_id from it.

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  fields.push(cur)
  return fields
}

export function parseCsv(raw: string): BookmarkInsert[] {
  const lines = raw.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim())
  const results: BookmarkInsert[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.trim() ?? ''
    })

    // Derive tweet_id from URL if not present
    let tweet_id = row['tweet_id'] || row['id']
    const tweet_url =
      row['tweet_url'] || row['url'] || row['link'] || row['tweet_link'] || ''
    if (!tweet_id && tweet_url) {
      tweet_id = extractTweetId(tweet_url) ?? ''
    }

    const tweet_text =
      row['tweet_text'] || row['text'] || row['content'] || row['body'] || ''
    const author_handle =
      row['author_handle'] || row['handle'] || row['username'] || row['screen_name'] || ''

    if (!tweet_id || !tweet_text || !author_handle) continue

    results.push({
      tweet_id,
      tweet_text,
      author_handle,
      author_name: row['author_name'] || row['name'] || null,
      tweet_url: tweet_url || buildTweetUrl(author_handle, tweet_id),
      media_urls: [],
      bookmarked_at: row['bookmarked_at'] || row['created_at'] || row['date'] || null,
    })
  }

  return results
}

// ─── Entry point ──────────────────────────────────────────────────────────

export function parseUpload(content: string, filename: string): BookmarkInsert[] {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.csv')) return parseCsv(content)
  // JSON — try archive format
  return parseTwitterArchiveJson(content)
}
