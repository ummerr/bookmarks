import { NextResponse } from 'next/server'
import { getCounts, clearAll } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await getCounts())
}

export async function DELETE() {
  await clearAll()
  return NextResponse.json({ message: 'All bookmarks deleted' })
}
