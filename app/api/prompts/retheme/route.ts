import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import postgres from 'postgres'

export const maxDuration = 300

let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require' }))
}

const VALID_THEMES = new Set([
  'person', 'cinematic', 'landscape', 'architecture', 'scifi',
  'fantasy', 'abstract', 'fashion', 'product', 'horror',
])

const THEME_TOOL: Anthropic.Tool = {
  name: 'tag_themes',
  description: 'Return theme tags for each prompt',
  input_schema: {
    type: 'object' as const,
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id:            { type: 'string', description: 'Copy the id field from the input item exactly' },
            prompt_themes: { type: 'array', items: { type: 'string' } },
          },
          required: ['id', 'prompt_themes'],
        },
      },
    },
    required: ['results'],
  },
}

const client = new Anthropic()

export async function GET() {
  const sql = getSql()
  const rows = await sql<{ n: string }[]>`
    SELECT COUNT(*) as n FROM bookmarks
    WHERE category = 'prompts'
    AND (prompt_themes IS NULL OR prompt_themes = '[]'::jsonb)
  `
  return NextResponse.json({ total: Number(rows[0].n) })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const limit: number = body.limit ?? 10

    const sql = getSql()
    // Always fetch from the top — filter advances naturally as rows are updated
    const rows = await sql<{ id: string; tweet_text: string }[]>`
      SELECT id, tweet_text FROM bookmarks
      WHERE category = 'prompts'
      AND (prompt_themes IS NULL OR prompt_themes = '[]'::jsonb)
      ORDER BY created_at ASC
      LIMIT ${limit}
    `

    if (rows.length === 0) return NextResponse.json({ tagged: 0, batchTotal: 0, errors: [] })

    const input = rows.map((r) => ({ id: r.id, text: r.tweet_text.slice(0, 600) }))

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [THEME_TOOL],
      tool_choice: { type: 'any' },
      messages: [{
        role: 'user',
        content: `Tag visual themes for each prompt. Return 0-3 themes per item from this list only: person, cinematic, landscape, architecture, scifi, fantasy, abstract, fashion, product, horror. Return [] for text/audio/3D/coding prompts.\n\n${JSON.stringify(input)}`,
      }],
    })

    const toolUse = msg.content.find((b) => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ tagged: 0, batchTotal: rows.length, errors: ['No tool use in response'] })
    }

    const results = ((toolUse.input as { results?: { id: string; prompt_themes: string[] }[] }).results ?? [])

    let tagged = 0
    const errors: string[] = []

    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      // Match by id, fall back to positional
      const row = rows.find((b) => b.id === String(r.id)) ?? rows[i]
      if (!row) continue
      const themes = (r.prompt_themes ?? []).filter((t) => VALID_THEMES.has(t))
      try {
        await sql`
          UPDATE bookmarks
          SET prompt_themes = ${JSON.stringify(themes)}::jsonb, updated_at = NOW()::TEXT
          WHERE id = ${row.id}
        `
        tagged++
      } catch (err) {
        errors.push(`id ${row.id}: ${String(err)}`)
      }
    }

    // Any rows not covered by results — mark with empty array so they don't loop forever
    if (results.length < rows.length) {
      for (const row of rows.slice(results.length)) {
        await sql`UPDATE bookmarks SET prompt_themes = '[]'::jsonb, updated_at = NOW()::TEXT WHERE id = ${row.id}`
        tagged++
      }
    }

    return NextResponse.json({ tagged, batchTotal: rows.length, errors })
  } catch (err) {
    console.error('[PROMPTS/RETHEME]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
