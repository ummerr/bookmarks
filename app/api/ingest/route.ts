import { NextRequest, NextResponse } from 'next/server'
import { insertBookmarks } from '@/lib/db'
import type { BookmarkInsert } from '@/lib/types'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  let bookmarks: BookmarkInsert[]

  try {
    bookmarks = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS })
  }

  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    return NextResponse.json(
      { error: 'Expected non-empty array of bookmarks' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  // Deduplicate within the batch
  const seen = new Set<string>()
  const unique = bookmarks.filter((b) => {
    if (!b.tweet_id || seen.has(b.tweet_id)) return false
    seen.add(b.tweet_id)
    return true
  })

  console.log('[INGEST] received:', bookmarks.length, '| unique:', unique.length, '| filtered out:', bookmarks.length - unique.length)
  if (bookmarks.length > 0) console.log('[INGEST] sample tweet_id:', bookmarks[0].tweet_id, '| author:', bookmarks[0].author_handle)

  let result: { inserted: number; skipped: number }
  try {
    result = insertBookmarks(unique)
  } catch (err) {
    console.error('[INGEST] insertBookmarks threw:', err)
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS_HEADERS })
  }
  console.log('[INGEST] inserted:', result.inserted, '| skipped:', result.skipped)

  return NextResponse.json(
    { ...result, total: bookmarks.length },
    { headers: CORS_HEADERS }
  )
}
