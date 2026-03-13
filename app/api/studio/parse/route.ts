import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

type Segment =
  | { type: 'text'; value: string }
  | { type: 'var'; key: string; label: string; value: string }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const PARSE_TOOL: Anthropic.Tool = {
  name: 'parse_prompt',
  description: 'Break a prompt into text segments and named variable slots',
  input_schema: {
    type: 'object' as const,
    properties: {
      segments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type:  { type: 'string', enum: ['text', 'var'] },
            value: { type: 'string' },
            key:   { type: 'string' },
            label: { type: 'string' },
          },
          required: ['type', 'value'],
        },
      },
    },
    required: ['segments'],
  },
}

export async function POST(req: Request) {
  const { prompt } = await req.json()
  if (!prompt?.trim()) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: [PARSE_TOOL],
    tool_choice: { type: 'tool', name: 'parse_prompt' },
    messages: [{
      role: 'user',
      content: `Parse this AI image/video prompt into semantic variable segments.

Identify these variable types when present:
- character / subject / person
- action / movement / pose
- setting / location / environment
- style / aesthetic
- lighting / mood / atmosphere
- time (time of day, era, period)
- camera (shot type, angle, lens)
- color / palette
- effect / vfx
- any other distinct semantic element

Rules:
- Split the prompt into alternating text and var segments
- Variable "key" should be a short snake_case word (character, action, setting, style, etc.)
- Variable "label" is a human-readable title (Character, Action, Setting, Style, etc.)
- Keep small connectors ("in", "at", "with", commas) as text segments
- Technical params like "--ar 16:9 --v 6" stay as a text segment at the end
- If the same concept appears twice, use the same key both times

Prompt: ${prompt}`,
    }],
  })

  const toolUse = message.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return NextResponse.json({ error: 'Parse failed' }, { status: 500 })
  }

  const { segments } = toolUse.input as { segments: Segment[] }
  return NextResponse.json({ segments })
}
