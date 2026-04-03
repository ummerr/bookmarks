import { NextResponse } from 'next/server'
import { getDistinctModels } from '@/lib/db'

export async function GET() {
  const models = await getDistinctModels()
  return NextResponse.json(models, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
