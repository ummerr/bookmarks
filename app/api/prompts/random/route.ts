import { NextRequest, NextResponse } from 'next/server'
import { getRandomPrompt, getBookmarkById } from '@/lib/db'
import type { PromptCategory, PromptTheme } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  // Permalink: fetch a specific prompt by id
  const id = searchParams.get('id')
  if (id) {
    const prompt = await getBookmarkById(id)
    if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(prompt)
  }

  const group = searchParams.get('group') as 'image' | 'video' | null
  const prompt = await getRandomPrompt({
    prompt_category: (searchParams.get('category') as PromptCategory) || null,
    prompt_theme: (searchParams.get('theme') as PromptTheme) || null,
    detected_model: searchParams.get('model') || null,
    category_group: group || null,
    multi_shot: searchParams.get('multi_shot') === 'true' || null,
  })
  if (!prompt) return NextResponse.json({ error: 'No prompts found' }, { status: 404 })
  return NextResponse.json(prompt)
}
