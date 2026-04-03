import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Bulk cull: delete all quality_rating=1 bookmarks
  if (body.action === 'cull') {
    const result = await getSql()`
      DELETE FROM bookmarks WHERE quality_rating = 1
    `
    return NextResponse.json({ deleted: result.count })
  }

  // Single rating update
  const { id, rating } = body as { id: string; rating: number | null }

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  if (rating !== null && ![1, 2, 3].includes(rating)) {
    return NextResponse.json({ error: 'Rating must be 1, 2, 3, or null' }, { status: 400 })
  }

  if (rating === null) {
    // Undo: set back to NULL
    await getSql()`
      UPDATE bookmarks SET quality_rating = NULL WHERE id = ${id}
    `
  } else {
    await getSql()`
      UPDATE bookmarks SET quality_rating = ${rating} WHERE id = ${id}
    `
  }

  return NextResponse.json({ ok: true })
}
