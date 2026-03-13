import { NextRequest, NextResponse } from 'next/server'
import { countUnclassifiedPrompts, getAllPrompts, getUnclassifiedPrompts, updatePromptExtraction } from '@/lib/db'
import { classifyPromptBatch } from '@/lib/classifier'

export const maxDuration = 300 // Vercel Pro: allow up to 5 min for long classification runs

const BATCH_SIZE = 5
const CONCURRENCY = 1

async function runBatches(
  prompts: Awaited<ReturnType<typeof getUnclassifiedPrompts>>
): Promise<{ classified: number; errors: string[] }> {
  // Split into batches
  const batches: (typeof prompts)[] = []
  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    batches.push(prompts.slice(i, i + BATCH_SIZE))
  }

  let classified = 0
  const errors: string[] = []

  // Process batches with limited concurrency
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const window = batches.slice(i, i + CONCURRENCY)
    await Promise.all(
      window.map(async (batch, j) => {
        const batchIndex = i + j + 1
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
          const msg = `Batch ${batchIndex}: ${String(err)}`
          console.error('[PROMPTS/CLASSIFY]', msg)
          errors.push(msg)
        }
      })
    )
  }

  return { classified, errors }
}

export async function GET() {
  return NextResponse.json({ unclassified: await countUnclassifiedPrompts() })
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const force = searchParams.get('force') === 'true'

    const prompts = force ? await getAllPrompts(500) : await getUnclassifiedPrompts(200)

    if (prompts.length === 0) {
      return NextResponse.json({ classified: 0, total: 0, message: 'All prompts already classified' })
    }

    const { classified, errors } = await runBatches(prompts)

    return NextResponse.json({
      classified,
      total: prompts.length,
      force,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('[PROMPTS/CLASSIFY]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
