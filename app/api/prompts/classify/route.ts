import { NextResponse } from 'next/server'
import { getUnclassifiedPrompts, updatePromptCategory } from '@/lib/db'
import { classifyPromptBatch } from '@/lib/classifier'

const BATCH_SIZE = 15

export async function GET() {
  const unclassified = getUnclassifiedPrompts(0)
  return NextResponse.json({ unclassified: unclassified.length })
}

export async function POST() {
  try {
    const prompts = getUnclassifiedPrompts(200)

    if (prompts.length === 0) {
      return NextResponse.json({ classified: 0, total: 0, message: 'All prompts already classified' })
    }

    let classified = 0
    const errors: string[] = []

    for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
      const batch = prompts.slice(i, i + BATCH_SIZE)
      try {
        const results = await classifyPromptBatch(batch)
        for (const r of results) {
          updatePromptCategory(r.id, r.prompt_category)
          classified++
        }
      } catch (err) {
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${String(err)}`)
      }
    }

    return NextResponse.json({ classified, total: prompts.length, errors })
  } catch (err) {
    console.error('[PROMPTS/CLASSIFY]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
