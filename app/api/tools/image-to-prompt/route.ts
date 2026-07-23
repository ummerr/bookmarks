import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic()

const TARGET_MODELS = ['Nano Banana', 'Midjourney', 'ChatGPT Image', 'Grok Imagine'] as const
type TargetModel = (typeof TARGET_MODELS)[number]

const MODEL_SYNTAX_HINTS: Record<TargetModel, string> = {
  'Nano Banana': `Target: Google Gemini / Imagen 3 ("Nano Banana").

FORMAT: Natural-language paragraph, 2–4 descriptive sentences. No tags, no weighting syntax, no negative prompts. Front-load subject and style.

STRENGTHS TO LEVERAGE:
- Best-in-class photorealism — use specific camera terms ("shot on 85mm f/1.4", "shallow depth of field", "macro photography") for photorealistic images
- Strong text rendering — if text appears in the image, include it in quotes
- Excellent prompt adherence — detailed descriptions are rewarded

STYLE: Name styles explicitly ("watercolor illustration", "3D render", "1970s film photograph"). Reference art movements and media types, not living artists.

LIGHTING: Use photography terms — "golden hour lighting", "soft diffused studio light", "dramatic chiaroscuro", "backlit silhouette".

COLOR: Specify palettes — "warm earth tones", "pastel palette", "monochrome blue", "high contrast".

COMPOSITION: "Wide shot", "close-up", "bird's eye view", "rule of thirds", "centered composition".

DO NOT: Use negative phrasing ("no clouds", "without people") — describe what IS there. Do not name real people. Do not use :: weighting or -- flags.

EXAMPLE (for a moody portrait of a woman in a rain-soaked alley):
"A cinematic 35mm film photograph of a young woman standing in a narrow rain-soaked alley at night, shot on an 85mm f/1.4 lens with shallow depth of field. Neon signs reflect pink and teal light off wet cobblestones, casting long streaks of color. She wears a dark leather jacket, looking back over her shoulder with a guarded expression. The atmosphere is noir-inspired with high contrast, rich shadows, and a cool desaturated palette punctuated by warm neon accents."`,

  'Midjourney': `Target: Midjourney V6/V6.1.

FORMAT: Comma-separated fragments, NOT sentences. Most important terms first — earlier terms carry more weight. Keep under ~60 words. End with parameter flags.

STRUCTURE: [subject], [medium/style], [lighting], [color palette], [composition], [mood] --parameters

KEY PARAMETERS (include where appropriate):
- --ar [ratio] (e.g. 16:9, 3:2, 9:16, 1:1, 21:9) — ALWAYS include based on image aspect ratio
- --v 6.1
- --style raw (for literal/less stylized results; omit for MJ's artistic aesthetic)
- --s [0-1000] (stylize: 0=literal, 100=default, 250-500=artistic)
- --no [terms] (negative prompt: e.g. --no text, watermark, frame — max 3-5 terms)

MULTI-PROMPT WEIGHTING: Use :: to weight segments. "landscape :: sunset::2" gives sunset 2x weight. Range: -0.5 to 5.

EFFECTIVE KEYWORDS:
- Medium: "oil painting", "35mm film photograph", "watercolor illustration", "3D render", "digital matte painting", "cinematic still"
- Lighting: "golden hour", "volumetric lighting", "rembrandt lighting", "backlit", "chiaroscuro"
- Quality: "highly detailed", "intricate", "8k", "photorealistic", "hyperrealistic"
- Composition: "close-up portrait", "wide angle", "bird's eye view", "macro", "shallow depth of field"
- Artist/style references work well: "in the style of [artist]", "Studio Ghibli", "Wes Anderson color palette"
- Mood: "ethereal", "moody", "dystopian", "serene", "dramatic"

TEXT IN IMAGE: Use quoted text — a sign that says "HELLO" — V6 can render short text.

DO NOT: Use full sentences. Use negation words in the prompt body (use --no instead). Mix conflicting styles ("photorealistic, watercolor"). Use generic filler ("beautiful", "amazing").

EXAMPLE (for a moody portrait of a woman in a rain-soaked alley):
"young woman in dark leather jacket, rain-soaked alley at night, looking over shoulder, guarded expression, 35mm film photograph, neon signs reflecting pink and teal on wet cobblestones, noir atmosphere, shallow depth of field, high contrast, desaturated with warm neon accents, volumetric rain, cinematic --ar 2:3 --v 6.1 --s 250 --no text, watermark"`,

  'ChatGPT Image': `Target: ChatGPT / GPT-4o native image generation.

FORMAT: Natural-language paragraph, 2–5 sentences. NOT keyword lists — prose descriptions produce the best results. Be detailed but focused; over-specifying (10+ sentences) causes the model to ignore or conflict.

STRUCTURE: Front-load the style/medium, then describe subject and composition using photography terminology, close with lighting, color palette, and mood.

STRENGTHS TO LEVERAGE:
- Excellent text rendering — if text appears in the image, include it (works well up to ~10-15 words)
- Strong photorealism — especially people, food, products, architecture
- Handles diverse illustration styles well: watercolor, vector, pixel art, anime, editorial illustration, isometric, vintage poster

STYLE: State it first: "A watercolor illustration of..." or "A cinematic photograph of...". Use era/movement references ("Art Deco", "Bauhaus", "90s magazine editorial", "Studio Ghibli aesthetic"). Avoid naming living artists — describe visual qualities instead.

COMPOSITION: Camera/photography language: "wide-angle shot", "close-up portrait", "bird's-eye view", "rule of thirds composition".

LIGHTING: "Golden hour lighting", "soft diffused studio light", "dramatic chiaroscuro", "neon-lit".

COLOR: Name palettes: "muted earth tones", "vibrant saturated primary colors", "monochrome with a single red accent".

MOOD: Evocative adjectives: "serene", "eerie", "whimsical", "nostalgic 1970s Polaroid feel".

ASPECT RATIO: State explicitly: "in landscape orientation", "square format", "16:9 aspect ratio".

DO NOT: Use comma-separated tag lists (SD/MJ style). Use negative prompts ("do NOT include X") — state what you want. Mix contradictory styles ("photorealistic cartoon").

EXAMPLE (for a moody portrait of a woman in a rain-soaked alley):
"A cinematic photograph in portrait orientation of a young woman standing in a narrow rain-soaked alley at night, looking back over her shoulder with a guarded expression. She wears a dark leather jacket, and neon signs cast streaks of pink and teal light across the wet cobblestones. Shot with a shallow depth of field that softens the background into bokeh pools of color. The palette is cool and desaturated with high contrast noir shadows, punctuated by warm neon accents."`,

  'Grok Imagine': `Target: Grok Imagine (xAI Aurora model).

FORMAT: Natural-language, descriptive sentences. No tag syntax, no parameter flags, no weighting. Longer, more detailed prompts yield better results than terse ones.

STRENGTHS TO LEVERAGE:
- Strong photorealism — competitive with MJ v6 and DALL-E 3 for realistic faces and scenes
- Excellent text rendering — signs, logos, memes, labels. If text appears in the image, include it
- Permissive content policy — can name real people, reference specific characters and pop culture directly. If a recognizable person/character is in the image, name them directly rather than using euphemisms
- Good at memes, pop culture references, and satirical content

STYLE: Name styles explicitly — "in the style of a 1970s film photograph", "digital concept art", "Studio Ghibli anime style", "oil painting".

DETAIL: Add specific details about lighting ("golden hour", "neon reflections"), camera angle ("shallow depth of field", "macro lens detail"), and texture.

MOOD: Emotional descriptors work well — "eerie", "serene", "chaotic", "nostalgic".

COMPOSITION: Specify framing — "close-up portrait", "wide establishing shot", "bird's eye view", "centered symmetrical composition".

SUBJECTS: Be concrete ("a tabby cat sitting on a stack of old books") not abstract ("a cat with stuff").

DO NOT: Use -- flags, :: weighting, or tag-based syntax. Use negative phrasing. No aspect ratio parameters exist — just describe the scene.

EXAMPLE (for a moody portrait of a woman in a rain-soaked alley):
"A young woman in a dark leather jacket stands in a narrow, rain-soaked alley at night, glancing back over her shoulder with a guarded expression. Neon signs overhead cast streaks of electric pink and teal across the wet cobblestone ground. The scene is framed as a close portrait shot with shallow depth of field, the background dissolving into soft pools of colored light. The mood is cinematic noir — high contrast, deep shadows, a cool desaturated palette with warm neon accents cutting through the darkness. 35mm film grain texture, atmospheric rain visible in the backlight."`,
}

const SYSTEM_PROMPT = `You are an expert prompt engineer specializing in generative image models. Given an image, you produce a prompt that would faithfully recreate its look, feel, composition, and artistic qualities.

## Process (follow this order internally)

1. **Observe** — Study the image carefully. Identify every visual element: subject, pose, expression, objects, setting, background, spatial depth.
2. **Analyze technically** — Determine lighting direction and quality, color palette and temperature, texture/material/medium, composition and framing, artistic style and influences, mood and emotional tone, camera/lens characteristics.
3. **Fill the breakdown** — Write each breakdown field based ONLY on what you actually observe. Do not invent elements that aren't visible. Be specific: "warm amber side-lighting from the left" not "nice lighting."
4. **Compose the prompt** — Synthesize the breakdown into a single prompt_fragment tailored to the target model's syntax and strengths. Every claim in the prompt must trace back to something in the breakdown. Do not add decorative filler or details you didn't observe.

## Accuracy rules

- Describe ONLY what is visible. If you can't tell the lighting direction, say "ambient" not "golden hour."
- Count objects precisely — "three apples" not "several apples."
- If text appears in the image, transcribe it exactly.
- Name specific colors ("burnt sienna", "cerulean blue") not vague ones ("warm colors").
- For photography, match the apparent focal length and depth of field to real camera terms.

## Output format

Return valid JSON matching this exact schema — no markdown fences, no explanation outside the JSON:

{
  "prompt_fragment": "<the prompt, formatted per the target model's conventions>",
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

function computeAspectRatio(w: number, h: number): string {
  const common: [number, number, string][] = [
    [1, 1, '1:1'], [4, 3, '4:3'], [3, 4, '3:4'], [3, 2, '3:2'], [2, 3, '2:3'],
    [16, 9, '16:9'], [9, 16, '9:16'], [21, 9, '21:9'], [9, 21, '9:21'],
  ]
  const ratio = w / h
  let best = common[0]
  let bestDiff = Infinity
  for (const [rw, rh, label] of common) {
    const diff = Math.abs(ratio - rw / rh)
    if (diff < bestDiff) { bestDiff = diff; best = [rw, rh, label] }
  }
  return best[2]
}

function buildUserPrompt(targetModel: TargetModel, imageWidth?: number, imageHeight?: number): string {
  const syntaxHint = MODEL_SYNTAX_HINTS[targetModel]
  const arInfo = imageWidth && imageHeight
    ? `\n\nIMAGE DIMENSIONS: ${imageWidth}×${imageHeight}px (aspect ratio ≈ ${computeAspectRatio(imageWidth, imageHeight)}). Use this for any aspect ratio parameters or orientation language.`
    : ''
  return `Analyze this image and produce a prompt that would recreate it in ${targetModel}.

${syntaxHint}${arInfo}

Return ONLY the JSON object. No markdown, no code fences, no extra text.`
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    const targetModel = (formData.get('targetModel') as TargetModel) || 'Nano Banana'
    const imageWidth = parseInt(formData.get('imageWidth') as string) || undefined
    const imageHeight = parseInt(formData.get('imageHeight') as string) || undefined

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
      temperature: 0.7,
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
              text: buildUserPrompt(targetModel, imageWidth, imageHeight),
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
