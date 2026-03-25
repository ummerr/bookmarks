import Anthropic from '@anthropic-ai/sdk'
import type { ArtStyle, Bookmark, Category, ClassificationResult, PromptCategory, PromptTheme, ReferenceType } from './types'

// ── Model name normalisation map ──────────────────────────────────────────
// Maps common variants/aliases → canonical slug used in the DB.
const MODEL_ALIASES: Record<string, string> = {
  // Midjourney
  'midjourney':        'Midjourney',
  'mj':                'Midjourney',
  'mid journey':       'Midjourney',
  // DALL-E
  'dall-e':            'DALL-E',
  'dalle':             'DALL-E',
  'dall e':            'DALL-E',
  'dall-e 3':          'DALL-E',
  'dall-e3':           'DALL-E',
  // Flux
  'flux':              'Flux',
  'flux.1':            'Flux',
  'flux1':             'Flux',
  // Stable Diffusion
  'stable diffusion':  'Stable Diffusion',
  'sd':                'Stable Diffusion',
  'sdxl':              'Stable Diffusion',
  'sd xl':             'Stable Diffusion',
  'sd 1.5':            'Stable Diffusion',
  // Firefly
  'adobe firefly':     'Firefly',
  'firefly':           'Firefly',
  // Ideogram
  'ideogram':          'Ideogram',
  // Leonardo
  'leonardo':          'Leonardo',
  'leonardo.ai':       'Leonardo',
  // Runway
  'runway':            'Runway',
  'runway gen3':       'Runway',
  'runway gen-3':      'Runway',
  'runwayml':          'Runway',
  // Kling
  'kling':             'Kling',
  // Pika
  'pika':              'Pika',
  'pika labs':         'Pika',
  // Luma
  'luma':              'Luma',
  'luma dream machine': 'Luma',
  'luma ai':           'Luma',
  // Hailuo
  'hailuo':            'Hailuo',
  // Sora
  'sora':              'Sora',
  // Wan
  'wan':               'Wan',
  // Suno
  'suno':              'Suno',
  // Udio
  'udio':              'Udio',
  // ElevenLabs
  'elevenlabs':        'ElevenLabs',
  'eleven labs':       'ElevenLabs',
  // ChatGPT / OpenAI
  'chatgpt':           'ChatGPT',
  'gpt-4':             'ChatGPT',
  'gpt4':              'ChatGPT',
  'openai':            'ChatGPT',
  // Claude
  'claude':            'Claude',
  // Gemini
  'gemini':            'Gemini',
  'google gemini':     'Gemini',
  // Meshy / 3D
  'meshy':             'Meshy',
  'tripo3d':           'Tripo3D',
  'tripo':             'Tripo3D',
}

function normaliseModel(raw: string | null): string | null {
  if (!raw) return null
  const key = raw.toLowerCase().trim()
  return MODEL_ALIASES[key] ?? raw.trim()
}

// ── Pre-processing ─────────────────────────────────────────────────────────
// Strip t.co URLs, trailing hashtag clusters, and excessive whitespace before
// sending to the API. Keeps prompt content, removes tweet boilerplate.
function preprocessTweet(text: string): string {
  return text
    .replace(/https?:\/\/t\.co\/\S+/g, '')     // strip t.co shortlinks
    .replace(/(^|\s)(#\w+)/g, ' ')             // strip hashtags
    .replace(/\s{2,}/g, ' ')                   // collapse whitespace
    .trim()
}

// ── Shared helpers ─────────────────────────────────────────────────────────

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in .env.local')
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 5000): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    if (retries <= 0) throw err
    // Back off longer for rate limit errors
    const isRateLimit = err instanceof Error && (err.message.includes('rate_limit') || err.message.includes('429') || (err as { status?: number }).status === 429)
    const wait = isRateLimit ? 60000 : delayMs
    await new Promise((r) => setTimeout(r, wait))
    return withRetry(fn, retries - 1, delayMs * 2)
  }
}

// ── Bookmark classification (step 1) ──────────────────────────────────────

const CLASSIFY_SYSTEM = `You are a tweet classifier. Classify each tweet into exactly one category:

- tech_ai_product: Technology, AI, ML, product management, startups, developer tools, shipping updates, tech industry news
- career_productivity: Career growth, job searching, workplace advice, productivity systems, professional development, networking
- prompts: ANY tweet that contains a prompt or prompt text for ANY AI tool — image generation (Midjourney, DALL-E, Flux, Stable Diffusion, Firefly, Ideogram, Leonardo, or ANY unfamiliar/unknown image gen tool), video generation (Sora, Runway, Kling, Pika, Luma, Hailuo, Wan, or any unfamiliar video tool), audio generation (Suno, Udio, ElevenLabs), 3D generation, LLM prompts (ChatGPT, Claude, Gemini), system prompts, prompt engineering. KEY RULE: if the tweet body contains descriptive visual text that reads like an image or video prompt — even if the tool name is unfamiliar or made-up — classify it as "prompts".
- uncategorized: Does not clearly fit any category above, or you are not confident.

Set confidence to 0.0-1.0. If confidence < 0.7, use category "uncategorized".
Classify all tweets provided.`

const CLASSIFY_TOOL: Anthropic.Tool = {
  name: 'classify_tweets',
  description: 'Return category classifications for all provided tweets',
  input_schema: {
    type: 'object' as const,
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            tweet_id:   { type: 'string' },
            category:   { type: 'string' },
            confidence: { type: 'number' },
            rationale:  { type: 'string' },
          },
          required: ['tweet_id', 'category', 'confidence', 'rationale'],
        },
      },
    },
    required: ['results'],
  },
}

const VALID_CATEGORIES = new Set<Category>(['tech_ai_product', 'career_productivity', 'prompts', 'uncategorized'])

export async function classifyBatch(
  bookmarks: Pick<Bookmark, 'tweet_id' | 'tweet_text'>[]
): Promise<ClassificationResult[]> {
  const client = getClient()
  const input = bookmarks.map((b) => ({
    tweet_id: b.tweet_id,
    text: preprocessTweet(b.tweet_text).slice(0, 800),
  }))

  const message = await withRetry(() =>
    client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: CLASSIFY_SYSTEM,
      tools: [CLASSIFY_TOOL],
      tool_choice: { type: 'tool', name: 'classify_tweets' },
      messages: [{ role: 'user', content: `Classify these tweets:\n${JSON.stringify(input, null, 2)}` }],
    })
  )

  const toolUse = message.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`No tool_use block in response. stop_reason=${message.stop_reason}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (toolUse.input as { results: any }).results
  const results: ClassificationResult[] = Array.isArray(raw) ? raw : raw ? [raw] : []

  const validIds = new Set(bookmarks.map((b) => b.tweet_id))

  return results
    .filter((r) => r.tweet_id && validIds.has(r.tweet_id))
    .map((r) => ({
      tweet_id:   r.tweet_id as string,
      category:   (VALID_CATEGORIES.has(r.category) && r.confidence >= 0.7 ? r.category : 'uncategorized') as Category,
      confidence: Number(r.confidence) || 0,
      rationale:  r.rationale ?? '',
    }))
}

// ── Prompt extraction (step 2) ─────────────────────────────────────────────

const PROMPT_SYSTEM = `You are an AI prompt classifier and extractor. For each tweet that contains an AI prompt, classify it, detect the tool used, extract the clean prompt text, tag its visual themes, and identify if a reference image is required.

CATEGORIES:

Image Generation — categorise by the PRIMARY SUBJECT / CONTENT of the image:
- image_person: The primary subject is one or more people, characters, or faces. Includes portraits, fashion photography with models, character design, group shots, fictional characters. Use this whenever a human or character is the main focus.
- image_advertisement: Product photography, commercial imagery, brand marketing, e-commerce product shots, lifestyle advertising — the primary purpose is to showcase a product or brand. Fashion flats (no model) also count.
- image_collage: Mood boards, collages, grid layouts, multi-panel compositions, scrapbook-style images — the prompt intentionally combines multiple images or visual elements into one composition.
- image_t2i: All other image generation — landscapes, nature, architecture, abstract art, sci-fi/fantasy environments, animals, vehicles, food, surreal imagery, concept art without a primary human subject. Use this as the default when none of the above fit.

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

DETECTED MODEL:
- Return the canonical tool name if identifiable (e.g. "Midjourney", "Flux", "Runway"). Use null if unclear.
- Do not include version numbers or extra words — just the tool name.

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

const VALID_PROMPT_CATEGORIES = new Set<PromptCategory>([
  'image_person', 'image_advertisement', 'image_collage',
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
const EXTRACT_TOOL: Anthropic.Tool = {
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
  prompts: Pick<Bookmark, 'id' | 'tweet_text' | 'thread_tweets'>[]
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

  // Use sequential 1-based indices as IDs — avoids UUID serialisation issues
  // (JSON.stringify drops keys with undefined values; models reliably echo short integers)
  const indexToId = new Map(prompts.map((p, i) => [String(i + 1), p.id]))

  const input = prompts.map((p, i) => {
    const threadContext = p.thread_tweets?.length
      ? '\n\nThread context:\n' + p.thread_tweets.map((t) => t.tweet_text).join('\n---\n')
      : ''
    const fullText = preprocessTweet(p.tweet_text + threadContext).slice(0, 3000)
    return { id: String(i + 1), text: fullText }
  })

  const message = await withRetry(() =>
    client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16384,
      system: PROMPT_SYSTEM,
      tools: [EXTRACT_TOOL],
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

  const matched = results.filter((r) => r.id && indexToId.has(r.id))
  if (matched.length < results.length) {
    console.warn('[classifyPromptBatch] ID mismatch — sent indices:', [...indexToId.keys()], '| received:', results.map((r) => r.id))
  }
  if (matched.length === 0 && results.length > 0) {
    throw new Error(`All ${results.length} results had unrecognised IDs. First returned ID: ${results[0]?.id}`)
  }

  return matched
    .map((r) => ({
      id: indexToId.get(r.id) as string,
      prompt_category: VALID_PROMPT_CATEGORIES.has(r.prompt_category) ? r.prompt_category : 'other',
      extracted_prompt: r.extracted_prompt ?? null,
      detected_model: normaliseModel(r.detected_model),
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
