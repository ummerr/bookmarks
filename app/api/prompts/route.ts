import { NextRequest, NextResponse } from 'next/server'
import { getPrompts } from '@/lib/db'
import type { PromptCategory } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const promptCategory = (searchParams.get('prompt_category') ?? 'all') as PromptCategory | 'all'
  const prompts = await getPrompts(promptCategory)
  return NextResponse.json(prompts)
}
