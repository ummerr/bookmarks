import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

const VALID_FLAGS = [
  'not_a_prompt',
  'wrong_category',
  'low_quality',
  'duplicate',
  'inappropriate',
  'other',
] as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, flag, note } = body as { id?: string; flag?: string; note?: string }

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing bookmark id' }, { status: 400 })
    }
    if (!flag || !VALID_FLAGS.includes(flag as typeof VALID_FLAGS[number])) {
      return NextResponse.json({ error: `Invalid flag. Must be one of: ${VALID_FLAGS.join(', ')}` }, { status: 400 })
    }

    const sql = getSql()
    const trimmedNote = note?.trim().slice(0, 500) || null

    const result = await sql`
      UPDATE bookmarks
      SET user_flag = ${flag}, user_flag_note = ${trimmedNote}, updated_at = NOW()::TEXT
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/prompts/flag]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
