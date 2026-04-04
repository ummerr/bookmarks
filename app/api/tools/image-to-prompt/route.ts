import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic()

const TARGET_MODELS = ['Midjourney', 'DALL-E', 'Imagen', 'Flux', 'Stable Diffusion'] as const
type TargetModel = (typeof TARGET_MODELS)[number]

const MODEL_SYNTAX_HINTS: Record<TargetModel, string> = {
  'Midjourney': 'Use Midjourney-style syntax: comma-separated descriptors, end with --ar, --v, --style flags where appropriate. No sentence structure — fragment-based.',
  'DALL-E': 'Write as a natural-language paragraph. Be explicit about composition, style, and mood. DALL-E responds well to detailed prose descriptions.',
  'Imagen': 'Write as a clear, descriptive paragraph. Imagen excels with natural language — be specific about visual details, lighting, and atmosphere.',
  'Flux': 'Write as a dense, comma-separated prompt. Flux handles natural language well but benefits from specific style keywords and quality tags.',
  'Stable Diffusion': 'Use SD-style syntax: comma-separated tags, most important terms first. Include quality boosters (masterpiece, best quality, highly detailed) and negative prompt guidance in parentheses for emphasis weighting.',
}

const SYSTEM_PROMPT = `You are an expert prompt engineer specializing in generative image models. Given an image, you produce a prompt that would recreate its look, feel, composition, and artistic qualities.

You MUST return valid JSON matching this exact schema — no markdown fences, no explanation outside the JSON:

{
  "prompt_fragment": "<single dense paragraph, no line breaks — written like a top prompt engineer would write it. Specific, evocative, no filler. This is the main output users copy.>",
  "breakdown": {
    "subject": "<what is depicted: subject, framing, pose, expression, key objects>",
    "environment": "<setting, background, depth, atmosphere, spatial context>",
    "lighting": "<direction, color temperature, quality, contrast, time of day feel>",
    "color_palette": "<dominant colors, accent colors, saturation level, temperature>",
    "texture_material": "<surface quality, render style, grain, detail level, material feel>",
    "composition": "<framing, rule of thirds, leading lines, symmetry, perspective>",
    "artistic_style": "<movement, medium, realism level, influences, aesthetic>",
    "mood_tone": "<emotional register, energy, narrative feeling, vibe>",
    "camera_feel": "<lens type, depth of field, focal length, film stock vibe, bokeh>"
  }
}`

function buildUserPrompt(targetModel: TargetModel): string {
  const syntaxHint = MODEL_SYNTAX_HINTS[targetModel]
  return `Analyze this image and produce a prompt that would recreate it in ${targetModel}.

${syntaxHint}

Return ONLY the JSON object. No markdown, no code fences, no extra text.`
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    const targetModel = (formData.get('targetModel') as TargetModel) || 'Midjourney'

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!TARGET_MODELS.includes(targetModel)) {
      return NextResponse.json({ error: 'Invalid target model' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported image type. Use JPEG, PNG, GIF, or WebP.' }, { status: 400 })
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 10MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: buildUserPrompt(targetModel),
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON from response — strip markdown fences if model adds them
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('image-to-prompt error:', message)

    if (message.includes('JSON')) {
      return NextResponse.json({ error: 'Failed to parse AI response. Try again.' }, { status: 502 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
