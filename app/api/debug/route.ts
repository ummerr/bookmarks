import { NextResponse } from 'next/server'
import { insertBookmarks, getCounts, clearAll } from '@/lib/db'

// GET /api/debug - insert a test row and verify it can be read back
export async function GET() {
  const testTweet = {
    tweet_id: `debug_test_${Date.now()}`,
    tweet_text: 'Debug test tweet',
    author_handle: 'testuser',
    author_name: 'Test User',
    tweet_url: 'https://x.com/testuser/status/123',
    media_urls: [],
    bookmarked_at: new Date().toISOString(),
  }

  const before = await getCounts()
  const result = await insertBookmarks([testTweet])
  const after = await getCounts()

  // clean up
  // (don't wipe real data - just report)
  return NextResponse.json({
    test_tweet_id: testTweet.tweet_id,
    inserted: result.inserted,
    skipped: result.skipped,
    counts_before: before,
    counts_after: after,
    sqlite_working: result.inserted === 1,
  })
}
