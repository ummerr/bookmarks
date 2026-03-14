import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const VARIATIONS_TOOL: Anthropic.Tool = {
  name: 'generate_variations',
  description: 'Generate prompt variations and describe what changed significantly in each',
  input_schema: {
    type: 'object' as const,
    properties: {
      variations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prompt: { type: 'string' },
            changes: {
              type: 'array',
              items: { type: 'string' },
              description: '2–4 short phrases naming the biggest changes from the original (e.g. "neon-lit city", "melancholic mood", "close-up shot")',
            },
          },
          required: ['prompt', 'changes'],
        },
      },
    },
    required: ['variations'],
  },
}

export async function POST(req: Request) {
  const { prompt, count = 5 } = await req.json()
  if (!prompt?.trim()) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    tools: [VARIATIONS_TOOL],
    tool_choice: { type: 'tool', name: 'generate_variations' },
    messages: [{
      role: 'user',
      content: `Generate ${count} creative variations of this AI image/video prompt. Each should feel meaningfully different — vary character, setting, mood, style, or action significantly. Preserve any technical suffixes (e.g. "--ar 16:9") exactly. Also list 2–4 short phrases naming the biggest changes from the original.

Original prompt:
${prompt}

Rules:
- Vary MULTIPLE elements at once, not just one word
- Each variation should be coherent and compelling on its own
- Change list entries should be brief (2–5 words each) and describe what actually shifted`,
    }],
  })

  const toolUse = message.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }

  const { variations } = toolUse.input as { variations: Array<{ prompt: string; changes: string[] }> }
  return NextResponse.json({ variations })
}
