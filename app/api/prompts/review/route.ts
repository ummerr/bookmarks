import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const author = searchParams.get('author')
  const rated = searchParams.get('rated') // 'true' to include rated, default unreviewed only

  const conditions: string[] = ["category = 'prompts'"]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = []

  if (author) {
    params.push(author)
    conditions.push(`author_handle = $${params.length}`)
  }

  if (rated !== 'true') {
    conditions.push('quality_rating IS NULL')
  }

  const where = conditions.join(' AND ')

  // Get prompts
  const rows = await getSql().unsafe(
    `SELECT id, tweet_id, extracted_prompt, tweet_text, detected_model,
            prompt_category, confidence, tweet_url, media_urls,
            quality_rating, author_handle
     FROM bookmarks
     WHERE ${where}
     ORDER BY confidence ASC
     LIMIT 500`,
    params
  )

  // Get counts for progress tracking
  const countConditions: string[] = ["category = 'prompts'"]
  const countParams: typeof params = []
  if (author) {
    countParams.push(author)
    countConditions.push(`author_handle = $${countParams.length}`)
  }

  const [{ total }] = await getSql().unsafe(
    `SELECT COUNT(*) as total FROM bookmarks WHERE ${countConditions.join(' AND ')}`,
    countParams
  ) as { total: string }[]

  const [{ reviewed }] = await getSql().unsafe(
    `SELECT COUNT(*) as reviewed FROM bookmarks WHERE ${countConditions.join(' AND ')} AND quality_rating IS NOT NULL`,
    countParams
  ) as { reviewed: string }[]

  return NextResponse.json({
    prompts: rows,
    total: Number(total),
    reviewed: Number(reviewed),
  })
}
