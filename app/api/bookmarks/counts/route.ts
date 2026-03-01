import { NextResponse } from 'next/server'
import { getCounts, clearAll } from '@/lib/db'

export async function GET() {
  return NextResponse.json(getCounts())
}

export async function DELETE() {
  clearAll()
  return NextResponse.json({ message: 'All bookmarks deleted' })
}
