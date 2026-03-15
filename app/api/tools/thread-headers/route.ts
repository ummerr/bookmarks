import { NextResponse } from 'next/server'
import { getThreadHeaderCandidates } from '@/lib/db'

export async function GET() {
  const candidates = await getThreadHeaderCandidates()
  return NextResponse.json({ candidates, total: candidates.length })
}
