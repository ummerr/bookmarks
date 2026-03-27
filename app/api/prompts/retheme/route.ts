import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import postgres from 'postgres'
import { withRetry } from '@/lib/classifier'

let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require' }))
}

const VALID_THEMES = [
  'person', 'cinematic', 'landscape', 'architecture', 'scifi',
  'fantasy', 'abstract', 'fashion', 'product', 'horror',
] as const
const VALID_THEMES_SET = new Set<string>(VALID_THEMES)

const THEME_SYSTEM = `Tag visual themes for AI image/video prompts. Pick 1-3 themes per item. Return [] for text/audio/3D/coding prompts.`

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
            prompt_themes: { type: 'array', items: { type: 'string', enum: [...VALID_THEMES] }, maxItems: 3 },
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
    SELECT COUNT(*) as n FROM bookmarks WHERE category = 'prompts'
  `
  return NextResponse.json({ total: Number(rows[0].n) })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const limit: number = body.limit ?? 20
    const offset: number = body.offset ?? 0

    const sql = getSql()
    const rows = await sql<{ id: string; tweet_text: string }[]>`
      SELECT id, tweet_text FROM bookmarks
      WHERE category = 'prompts'
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    if (rows.length === 0) return NextResponse.json({ tagged: 0, batchTotal: 0, errors: [] })

    const input = rows.map((r) => ({ id: r.id, text: r.tweet_text.slice(0, 600) }))

    const msg = await withRetry(() =>
      client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: THEME_SYSTEM,
        tools: [THEME_TOOL],
        tool_choice: { type: 'tool', name: 'tag_themes' },
        messages: [{
          role: 'user',
          content: `Tag themes:\n${JSON.stringify(input)}`,
        }],
      })
    )

    const toolUse = msg.content.find((b) => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ tagged: 0, batchTotal: rows.length, errors: ['No tool use in response'] })
    }

    const results = ((toolUse.input as { results?: { id: string; prompt_themes: string[] }[] }).results ?? [])

    let tagged = 0
    const errors: string[] = []

    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      const row = rows.find((b) => b.id === String(r.id)) ?? rows[i]
      if (!row) continue
      const themes = (r.prompt_themes ?? []).filter((t) => VALID_THEMES_SET.has(t))
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

    return NextResponse.json({ tagged, batchTotal: rows.length, errors })
  } catch (err) {
    console.error('[PROMPTS/RETHEME]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
