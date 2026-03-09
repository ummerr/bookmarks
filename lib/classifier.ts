import Anthropic from '@anthropic-ai/sdk'
import type { ArtStyle, Bookmark, Category, ClassificationResult, PromptCategory, PromptTheme, ReferenceType } from './types'

const SYSTEM_PROMPT = `You are a tweet classifier. Classify each tweet into exactly one category:

- tech_ai_product: Technology, AI, ML, product management, startups, developer tools, shipping updates, tech industry news
- career_productivity: Career growth, job searching, workplace advice, productivity systems, professional development, networking
- prompts: ANY tweet that contains a prompt or prompt text for ANY AI tool — image generation (Midjourney, DALL-E, Flux, Stable Diffusion, Firefly, Ideogram, Leonardo, or ANY unfamiliar/unknown image gen tool), video generation (Sora, Runway, Kling, Pika, Luma, Hailuo, Wan, or any unfamiliar video tool), audio generation (Suno, Udio, ElevenLabs), 3D generation, LLM prompts (ChatGPT, Claude, Gemini), system prompts, prompt engineering. KEY RULE: if the tweet body contains descriptive visual text that reads like an image or video prompt — even if the tool name is unfamiliar or made-up — classify it as "prompts".

For each tweet, return JSON:
{"tweet_id": "...", "category": "...", "confidence": 0.0-1.0, "rationale": "one line explanation"}

If confidence < 0.7, set category to "uncategorized".
Return a JSON array of all classifications. Return ONLY the JSON array, no markdown, no extra text.`

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in .env.local')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

async function withRetry<T>(fn: () => Promise<T>, retries = 1, delayMs = 2000): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise((r) => setTimeout(r, delayMs))
    return withRetry(fn, retries - 1, delayMs)
  }
}

const PROMPT_SYSTEM = `You are an AI prompt classifier and extractor. For each tweet that contains an AI prompt, classify it, detect the tool used, extract the clean prompt text, tag its visual themes, and identify if a reference image is required.

CATEGORIES:

Image Generation:
- image_t2i: Text-to-image — prompt only, no input image (Midjourney, DALL-E, Flux, Stable Diffusion, Firefly, Ideogram, Leonardo)
- image_i2i: Image-to-image — structural/style transfer, img2img, ControlNet depth/pose/canny
- image_r2i: Reference-to-image — an uploaded or reference image guides the OUTPUT subject, object, or scene (IP-Adapter subject reference, style reference from an uploaded image, "generate something like this image")
- image_character_ref: Character / face / person consistency across generations (InstantID, face swap, consistent character LoRA)
- image_inpainting: Inpainting, outpainting, masking, regional editing

Video Generation:
- video_t2v: Text-to-video — prompt only, no input image (Sora, Kling, Runway Gen3, Pika, Hailuo, Luma, Wan)
- video_i2v: Image-to-video — directly animating or extending a specific still image
- video_r2v: Reference-to-video — an uploaded or reference image guides the video output (subject/character/scene consistency, not direct animation of that image)
- video_v2v: Video-to-video — restyle, motion transfer, lip sync

Other Media:
- audio: Music, voice, sound effects (Suno, Udio, ElevenLabs, voice cloning)
- threed: 3D model / scene / texture (Meshy, Tripo3D, Shap-E, Luma 3D)

Text:
- system_prompt: System prompts, persona definitions, custom instructions for LLMs
- writing: Creative writing, copywriting, storytelling prompts
- coding: Code generation, debugging, architecture prompts
- analysis: Analysis, research, summarisation, reasoning prompts
- other: Anything else

THEMES (for image/video prompts only — return [] for text/audio/3D):
Pick 1-3 that apply from: person, cinematic, landscape, architecture, scifi, fantasy, abstract, fashion, product, horror

ART STYLES (for image/video prompts only — return [] for text/audio/3D):
Pick 0-3 that apply from: photorealistic, anime, illustration, oil_painting, watercolor, digital_art, sketch, pixel_art, 3d_render, concept_art, comic_book, minimalist, surrealist, impressionist, cinematic_photo, neon_noir, vintage, flat_design
Return [] if the prompt doesn't specify or imply a visual style.

REFERENCE IMAGE:
- requires_reference: true if the prompt explicitly needs the user to supply an input image to work (e.g. img2img, IP-Adapter, ControlNet, face swap, image-to-video). false if it's purely text-driven. null for non-image/video categories.
- reference_type: if requires_reference is true, pick one: face_person, style_artwork, subject_object, pose_structure, scene_background. Otherwise null.
- STRONG SIGNAL: if the tweet contains placeholder tokens like [SUBJECT], [REFERENCE], [YOUR SUBJECT], [YOUR REFERENCE], or similar bracketed placeholders, the prompt almost certainly requires a reference image — set requires_reference: true and pick the appropriate reference_type.

For each item return:
- id: the item id
- prompt_category: one category from above
- detected_model: the AI tool name if identifiable — use null if unclear
- extracted_prompt: ONLY the clean prompt text — strip social framing, hashtags, engagement bait. Keep model syntax (--ar, --v, negative prompts, cfg, etc.). Return null only if no clear prompt text exists.
- prompt_themes: array of 0-3 theme strings ([] for text/audio/3D prompts)
- art_styles: array of 0-3 art style strings ([] for text/audio/3D prompts or if no style is implied)
- requires_reference: true | false | null
- reference_type: one of the reference types or null

Classify all items provided.`

const VALID_CATEGORIES = new Set<PromptCategory>([
  'image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting',
  'video_t2v', 'video_i2v', 'video_r2v', 'video_v2v',
  'audio', 'threed',
  'system_prompt', 'writing', 'coding', 'analysis', 'other',
])
const VALID_THEMES = new Set<PromptTheme>([
  'person', 'cinematic', 'landscape', 'architecture', 'scifi',
  'fantasy', 'abstract', 'fashion', 'product', 'horror',
])
const VALID_ART_STYLES = new Set<ArtStyle>([
  'photorealistic', 'anime', 'illustration', 'oil_painting', 'watercolor',
  'digital_art', 'sketch', 'pixel_art', '3d_render', 'concept_art',
  'comic_book', 'minimalist', 'surrealist', 'impressionist',
  'cinematic_photo', 'neon_noir', 'vintage', 'flat_design',
])
const VALID_REF_TYPES = new Set<ReferenceType>([
  'face_person', 'style_artwork', 'subject_object', 'pose_structure', 'scene_background',
])

// Tool use schema — guarantees valid structured output, no JSON parsing errors
const CLASSIFY_TOOL: Anthropic.Tool = {
  name: 'classify_prompts',
  description: 'Return classifications for all provided prompts',
  input_schema: {
    type: 'object' as const,
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id:                 { type: 'string' },
            prompt_category:    { type: 'string' },
            detected_model:     { type: ['string', 'null'] },
            extracted_prompt:   { type: ['string', 'null'] },
            prompt_themes:      { type: 'array', items: { type: 'string' } },
            art_styles:         { type: 'array', items: { type: 'string' } },
            requires_reference: { type: ['boolean', 'null'] },
            reference_type:     { type: ['string', 'null'] },
          },
          required: ['id', 'prompt_category', 'detected_model', 'extracted_prompt', 'prompt_themes', 'art_styles', 'requires_reference', 'reference_type'],
        },
      },
    },
    required: ['results'],
  },
}

export async function classifyPromptBatch(
  prompts: Pick<Bookmark, 'id' | 'tweet_text'>[]
): Promise<{
  id: string
  prompt_category: PromptCategory
  extracted_prompt: string | null
  detected_model: string | null
  prompt_themes: PromptTheme[]
  art_styles: ArtStyle[]
  requires_reference: boolean | null
  reference_type: ReferenceType | null
}[]> {
  const client = getClient()
  const input = prompts.map((p) => ({ id: p.id, text: p.tweet_text.slice(0, 3000) }))

  const message = await withRetry(() =>
    client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: PROMPT_SYSTEM,
      tools: [CLASSIFY_TOOL],
      tool_choice: { type: 'tool', name: 'classify_prompts' },
      messages: [{ role: 'user', content: `Classify and extract these prompts:\n${JSON.stringify(input, null, 2)}` }],
    })
  )

  const toolUse = message.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`No tool_use block in response. stop_reason=${message.stop_reason}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (toolUse.input as { results: any }).results
  const results: any[] = Array.isArray(raw) ? raw : raw ? [raw] : []

  const validIds = new Set(prompts.map((p) => p.id))

  return results
    .filter((r) => r.id && validIds.has(r.id))
    .map((r) => ({
      id: r.id as string,
      prompt_category: VALID_CATEGORIES.has(r.prompt_category) ? r.prompt_category : 'other',
      extracted_prompt: r.extracted_prompt ?? null,
      detected_model: r.detected_model ?? null,
      prompt_themes: Array.isArray(r.prompt_themes)
        ? r.prompt_themes.filter((t: string) => VALID_THEMES.has(t as PromptTheme))
        : [],
      art_styles: Array.isArray(r.art_styles)
        ? r.art_styles.filter((s: string) => VALID_ART_STYLES.has(s as ArtStyle))
        : [],
      requires_reference: typeof r.requires_reference === 'boolean' ? r.requires_reference : null,
      reference_type: VALID_REF_TYPES.has(r.reference_type) ? r.reference_type : null,
    }))
}

export async function classifyBatch(
  bookmarks: Pick<Bookmark, 'tweet_id' | 'tweet_text'>[]
): Promise<ClassificationResult[]> {
  const client = getClient()
  const input = bookmarks.map((b) => ({ tweet_id: b.tweet_id, text: b.tweet_text.slice(0, 800) }))

  const message = await withRetry(() =>
    client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Classify these tweets:\n${JSON.stringify(input, null, 2)}`,
        },
      ],
    })
  )

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  let results: ClassificationResult[]
  try {
    results = JSON.parse(raw)
  } catch {
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) throw new Error(`Failed to parse classification response. stop_reason=${message.stop_reason} raw=${raw.slice(0, 200)}`)
    results = JSON.parse(match[0])
  }

  return results.map((r) => ({
    ...r,
    category: (r.confidence >= 0.7 ? r.category : 'uncategorized') as Category,
  }))
}
