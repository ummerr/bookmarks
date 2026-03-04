import { NextRequest, NextResponse } from 'next/server'
import { getUnclassified, updateBookmarkByTweetId, getCounts } from '@/lib/db'
import { classifyBatch } from '@/lib/classifier'

const BATCH_SIZE = 10

export async function POST(_req: NextRequest) {
  const bookmarks = getUnclassified(100)

  if (bookmarks.length === 0) {
    return NextResponse.json({ classified: 0, message: 'Nothing to classify' })
  }

  let totalClassified = 0
  const errors: string[] = []

  for (let i = 0; i < bookmarks.length; i += BATCH_SIZE) {
    const batch = bookmarks.slice(i, i + BATCH_SIZE)
    try {
      const results = await classifyBatch(batch)
      for (const r of results) {
        updateBookmarkByTweetId(r.tweet_id, {
          category: r.category,
          confidence: r.confidence,
          rationale: r.rationale,
        })
      }
      totalClassified += results.length
    } catch (err) {
      const msg = `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${String(err)}`
      console.error('[CLASSIFY]', msg)
      errors.push(msg)
    }
  }

  return NextResponse.json({
    classified: totalClassified,
    total: bookmarks.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}

export async function GET() {
  const counts = getCounts()
  return NextResponse.json({ unclassified: counts.uncategorized })
}
