import { NextResponse } from 'next/server'
import { getAllPromptsForReclassify, updatePromptExtraction, countAllPrompts } from '@/lib/db'
import { classifyPromptBatch } from '@/lib/classifier'

export const maxDuration = 60

const BATCH_SIZE = 5

export async function GET() {
  try {
    const total = await countAllPrompts()
    return NextResponse.json({ total })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const limit: number = body.limit ?? 50
    const offset: number = body.offset ?? 0

    const prompts = await getAllPromptsForReclassify(limit, offset)

    if (prompts.length === 0) {
      return NextResponse.json({ classified: 0, batchTotal: 0, errors: [] })
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
            art_styles: r.art_styles,
            requires_reference: r.requires_reference,
            reference_type: r.reference_type,
          })
          classified++
        }
      } catch (err) {
        const msg = `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${String(err)}`
        console.error('[PROMPTS/RECLASSIFY]', msg)
        errors.push(msg)
      }
    }

    return NextResponse.json({ classified, batchTotal: prompts.length, errors })
  } catch (err) {
    console.error('[PROMPTS/RECLASSIFY]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
