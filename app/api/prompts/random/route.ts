import { NextResponse } from 'next/server'
import { getRandomPrompt } from '@/lib/db'

export async function GET() {
  const prompt = await getRandomPrompt()
  if (!prompt) return NextResponse.json({ error: 'No prompts found' }, { status: 404 })
  return NextResponse.json(prompt)
}
