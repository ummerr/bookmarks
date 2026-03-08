import { NextResponse } from 'next/server'
import { countUnclassifiedPrompts, getUnclassifiedPrompts, updatePromptExtraction } from '@/lib/db'
import { classifyPromptBatch } from '@/lib/classifier'

const BATCH_SIZE = 10

export async function GET() {
  return NextResponse.json({ unclassified: await countUnclassifiedPrompts() })
}

export async function POST() {
  try {
    const prompts = await getUnclassifiedPrompts(200)

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
          await updatePromptExtraction(r.id, {
            prompt_category: r.prompt_category,
            extracted_prompt: r.extracted_prompt,
            detected_model: r.detected_model,
            prompt_themes: r.prompt_themes,
            requires_reference: r.requires_reference,
            reference_type: r.reference_type,
          })
          classified++
        }
      } catch (err) {
        const msg = `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${String(err)}`
        console.error('[PROMPTS/CLASSIFY]', msg)
        errors.push(msg)
      }
    }

    return NextResponse.json({ classified, total: prompts.length, errors: errors.length > 0 ? errors : undefined })
  } catch (err) {
    console.error('[PROMPTS/CLASSIFY]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
