import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const PARSE_TOOL: Anthropic.Tool = {
  name: 'parse_prompt',
  description: 'Break a prompt into text segments and named variable slots, and generate alternatives for each variable',
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
      suggestions: {
        type: 'object',
        description: 'For each variable key, 4 creative alternative values that fit the same slot',
        additionalProperties: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    required: ['segments', 'suggestions'],
  },
}

export async function POST(req: Request) {
  const { prompt } = await req.json()
  if (!prompt?.trim()) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    tools: [PARSE_TOOL],
    tool_choice: { type: 'tool', name: 'parse_prompt' },
    messages: [{
      role: 'user',
      content: `Parse this AI image/video prompt into semantic variable segments, then generate 4 creative alternatives for each variable.

Variable types to identify: character/subject/person, action/movement/pose, setting/location/environment, style/aesthetic, lighting/mood/atmosphere, time (era, time of day), camera/shot, color/palette, effect/vfx.

Rules for segments:
- Alternate between text and var segments
- Variable key: short snake_case (character, action, setting, style…)
- Variable label: human-readable (Character, Action, Setting, Style…)
- Keep small connectors ("in", "at", ",") as text segments
- Technical suffixes like "--ar 16:9" stay as text

Rules for suggestions:
- 4 alternatives per variable, each meaningfully different from the original
- Same grammatical form as the original value (noun phrase for character, verb phrase for action, etc.)
- Creative range: vary mood, genre, specificity

Prompt: ${prompt}`,
    }],
  })

  const toolUse = message.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return NextResponse.json({ error: 'Parse failed' }, { status: 500 })
  }

  const { segments, suggestions } = toolUse.input as {
    segments: unknown[]
    suggestions: Record<string, string[]>
  }
  return NextResponse.json({ segments, suggestions })
}
