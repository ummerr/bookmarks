import { NextResponse } from 'next/server'
import { getBookmarkById } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bookmark = await getBookmarkById(id)
  if (!bookmark) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(bookmark)
}
