import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const VARIATIONS_TOOL: Anthropic.Tool = {
  name: 'generate_variations',
  description: 'Generate prompt variations using the same template structure',
  input_schema: {
    type: 'object' as const,
    properties: {
      prompts: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['prompts'],
  },
}

export async function POST(req: Request) {
  const { templateStr, variables, count = 5 } = await req.json()
  if (!templateStr) return NextResponse.json({ error: 'No template' }, { status: 400 })

  const varList = Object.entries(variables as Record<string, string>)
    .map(([k, v]) => `  ${k}: "${v}"`)
    .join('\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    tools: [VARIATIONS_TOOL],
    tool_choice: { type: 'tool', name: 'generate_variations' },
    messages: [{
      role: 'user',
      content: `Generate ${count} variations of this prompt. Keep the same grammatical structure and connecting words, but vary the semantic content to create fresh, distinct scenes.

Template structure (variables in {braces}):
${templateStr}

Current values:
${varList}

Rules:
- Each variation should feel meaningfully different — different character, world, mood
- Vary MULTIPLE variables at once, not just one
- Stay coherent — character, action, setting, and style should feel like they belong together
- Preserve technical suffixes like "--ar 16:9" exactly as-is
- Make each variation compelling on its own`,
    }],
  })

  const toolUse = message.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }

  const { prompts } = toolUse.input as { prompts: string[] }
  return NextResponse.json({ prompts })
}
