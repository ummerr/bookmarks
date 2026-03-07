import { NextRequest, NextResponse } from 'next/server'
import { updateBookmark } from '@/lib/db'
import type { Category } from '@/lib/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const allowed = ['category', 'confidence', 'rationale', 'user_notes'] as const
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if ('category' in updates) {
    const valid: Category[] = ['tech_ai_product', 'career_productivity', 'prompts', 'uncategorized']
    if (!valid.includes(updates.category as Category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
  }

  const updated = await updateBookmark(id, updates)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}
