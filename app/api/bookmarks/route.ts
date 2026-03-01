import { NextRequest, NextResponse } from 'next/server'
import { queryBookmarks } from '@/lib/db'
import type { Category } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = (searchParams.get('category') ?? 'all') as Category | 'all'
  const search = searchParams.get('search') ?? ''
  const sort = (searchParams.get('sort') ?? 'newest') as 'newest' | 'oldest' | 'confidence' | 'author'
  const page = parseInt(searchParams.get('page') ?? '0', 10)
  const limit = parseInt(searchParams.get('limit') ?? '30', 10)

  const result = queryBookmarks({ category, search, sort, page, limit })
  return NextResponse.json(result)
}
