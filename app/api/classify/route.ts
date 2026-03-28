import { NextRequest, NextResponse } from 'next/server'
import { getUnclassified, updateBookmarkByTweetId, getCounts } from '@/lib/db'
import { classifyBatch } from '@/lib/classifier'

// Single batch per request - stays under Vercel Hobby 10s timeout.
// Client loops until remaining === 0.
const BATCH_SIZE = 15

export async function POST(_req: NextRequest) {
  const bookmarks = await getUnclassified(BATCH_SIZE)

  if (bookmarks.length === 0) {
    return NextResponse.json({ classified: 0, remaining: 0, message: 'Nothing to classify' })
  }

  const errors: string[] = []
  let classified = 0

  try {
    const results = await classifyBatch(bookmarks)
    for (const r of results) {
      await updateBookmarkByTweetId(r.tweet_id, {
        category: r.category,
        confidence: r.confidence,
        rationale: r.rationale,
      })
    }
    classified = results.length
  } catch (err) {
    const msg = `Batch: ${String(err)}`
    console.error('[CLASSIFY]', msg)
    errors.push(msg)
  }

  // Return remaining count so client knows whether to loop
  const counts = await getCounts()

  return NextResponse.json({
    classified,
    remaining: counts.uncategorized,
    errors: errors.length > 0 ? errors : undefined,
  })
}

export async function GET() {
  const counts = await getCounts()
  return NextResponse.json({ unclassified: counts.uncategorized })
}
