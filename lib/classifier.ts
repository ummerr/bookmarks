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
  'runway gen-4':      'Runway',
  'runway gen4':       'Runway',
  'runway gen-4.5':    'Runway',
  'runwayml':          'Runway',
  // Kling
  'kling':             'Kling',
  'kling 3':           'Kling',
  'kling 3.0':         'Kling',
  // Pika
  'pika':              'Pika',
  'pika labs':         'Pika',
  'pika 2.5':          'Pika',
  // Luma
  'luma':              'Luma',
  'luma dream machine': 'Luma',
  'luma ai':           'Luma',
  // Hailuo
  'hailuo':            'Hailuo',
  // Sora (shut down Mar 2026)
  'sora':              'Sora',
  'sora 2':            'Sora',
  // Veo (Google)
  'veo':               'Veo',
  'veo 3':             'Veo',
  'veo 3.1':           'Veo',
  'google veo':        'Veo',
  // Aurora / Grok (xAI)
  'aurora':            'Aurora',
  'grok imagine':      'Aurora',
  'grok imagine video': 'Aurora',
  'xai aurora':        'Aurora',
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
  // Nano Banana (Gemini image gen)
  'gemini':            'Nano Banana',
  'google gemini':     'Nano Banana',
  'nano banana':       'Nano Banana',
  'nano banana pro':   'Nano Banana',
  // Meshy / 3D
  'meshy':             'Meshy',
  'tripo3d':           'Tripo3D',
  'tripo':             'Tripo3D',
}

export function normaliseModel(raw: string | null, category?: string): string | null {
  if (!raw) return null
  const key = raw.toLowerCase().trim()
  const resolved = MODEL_ALIASES[key] ?? raw.trim()
  // Nano Banana is an image model — for video prompts, default to Veo (Google's video model)
  if (resolved === 'Nano Banana' && category?.startsWith('video_')) return 'Veo'
  return resolved
}

// ── Pre-processing ─────────────────────────────────────────────────────────
// Strip t.co URLs, trailing hashtag clusters, and excessive whitespace before
// sending to the API. Keeps prompt content, removes tweet boilerplate.
export function preprocessTweet(text: string): string {
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

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 5000): Promise<T> {
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

const CLASSIFY_SYSTEM = `Classify each tweet into exactly one category.

Categories:
- tech_ai_product: Technology, AI/ML, startups, developer tools, product launches, tech industry news
- career_productivity: Career growth, job advice, productivity systems, professional development
- prompts: ANY tweet containing an AI prompt - image gen (Midjourney, DALL-E, Flux, SD, Firefly, Ideogram, Leonardo, Aurora, ANY tool), video gen (Veo, Runway, Kling, Pika, Luma, Hailuo, Wan, Aurora/Grok, ANY tool), audio gen (Suno, Udio, ElevenLabs), 3D gen, LLM prompts, system prompts, prompt engineering. KEY: if the text reads like a descriptive prompt for any AI tool - even unnamed ones - classify as "prompts".
- uncategorized: Does not fit above, or confidence < 0.7.

Rules: confidence 0.0-1.0. If < 0.7, category must be "uncategorized". Classify all tweets.`

const VALID_CATEGORIES_LIST = ['tech_ai_product', 'career_productivity', 'prompts', 'uncategorized'] as const

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
            category:   { type: 'string', enum: [...VALID_CATEGORIES_LIST] },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
            rationale:  { type: 'string', description: 'One sentence explanation' },
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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: CLASSIFY_SYSTEM,
      tools: [CLASSIFY_TOOL],
      tool_choice: { type: 'tool', name: 'classify_tweets' },
      messages: [{ role: 'user', content: `Classify these tweets:\n${JSON.stringify(input)}` }],
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

const PROMPT_SYSTEM = `Classify and extract AI prompts from tweets.

STEP 1 — CHECK FOR REFERENCE SIGNALS FIRST:
Before choosing a category, check if the prompt contains ANY of these reference signals. If ANY signal is found, the category MUST be image_r2i (for images) or video_r2v (for video) — do NOT use image_person, image_t2i, or other subject categories when a reference is needed.

Reference signals (any ONE of these means requires_reference=true):
- Bracketed placeholders: [SUBJECT], [YOUR IMAGE], [REFERENCE], [UPLOADED IMAGE], [SOURCE IMAGE], [INPUT], [YOUR PHOTO], [FACE], [LOGO]
- Midjourney flags: --sref (style ref), --cref (character ref), --iw (image weight)
- Workflow tools: IP-Adapter, ControlNet, face swap, img2img, style transfer, reference-to-image, InstantID, PhotoMaker, PuLID, ADetailer
- ComfyUI / pipeline signals: "ComfyUI", "workflow", "Load Image node", "KSampler", "denoise", "denoising strength", "init image", "input image"
- Character consistency: "consistent character", "same character across", "character sheet", "maintain the look", "keep the same face", "match the reference"
- Explicit instructions: "upload", "attach", "use your image/photo", "use this as a starting point", "based on this image", "from this reference", "use the attached"
- Multi-step pipelines: "first generate... then use", "take the output and", "feed into"

STEP 2 — IF NO REFERENCE SIGNAL, pick a subject-based category:

Image (text-only, no reference needed):
- image_person: People/characters/faces as main focus, purely text-driven
- image_advertisement: Product photography, commercial/brand imagery, e-commerce, fashion flats
- image_collage: Mood boards, grid layouts, multi-panel compositions
- image_t2i: All other text-to-image (landscapes, abstract, sci-fi, animals, food, concept art). Default for image prompts with no reference.

Image (reference required — from Step 1):
- image_r2i: Prompt requires a user-supplied reference image. USE THIS whenever the prompt cannot work without an input image.
- image_i2i: Direct transformation of an existing image (upscale, restyle, inpaint, outpaint)

Video:
- video_r2v: A reference/uploaded image guides the video (character consistency, scene reference, NOT direct animation)
- video_i2v: Directly animating or extending a specific still image
- video_t2v: Text-to-video, prompt only (Veo, Kling, Runway, Pika, Hailuo, Luma, Wan, Aurora/Grok)
- video_v2v: Video-to-video (restyle, motion transfer, lip sync)

Other: audio (music/voice/SFX), threed (3D models/scenes)
Text: system_prompt, writing, coding, analysis, other

EXAMPLES:
- "A woman in a red dress walking through a garden, golden hour" → image_person (text-only, no reference)
- "Use [YOUR PHOTO] as reference. A woman in a red dress in a garden" → image_r2i (bracketed placeholder = reference)
- "ComfyUI workflow: Load Image → IP-Adapter → KSampler, portrait style" → image_r2i (workflow = reference)
- "--cref [face URL] a warrior in armor" → image_r2i, reference_type=face_person
- "--sref [style URL] minimalist landscape" → image_r2i, reference_type=style_artwork

THEMES (image/video only, else []): 1-3 from: person, cinematic, landscape, architecture, scifi, fantasy, abstract, fashion, product, horror
ART STYLES (image/video only, else []): 0-3 from: photorealistic, anime, illustration, oil_painting, watercolor, digital_art, sketch, pixel_art, 3d_render, concept_art, comic_book, minimalist, surrealist, impressionist, cinematic_photo, neon_noir, vintage, flat_design

REFERENCE:
requires_reference=true if prompt needs user-supplied input image. false if text-only. null for non-visual.
RULE: requires_reference MUST be true for ALL image_r2i, image_i2i, video_r2v, and video_i2v prompts. If category is one of these, requires_reference=true always.

reference_type (when requires_reference=true, else null):
- face_person: Reference provides a face/likeness to maintain (headshots, selfies, --cref with a face, InstantID, PuLID)
- style_artwork: Reference provides a visual style to emulate (--sref, style transfer, color palette, artistic direction)
- subject_object: Reference provides a specific object/product to include (product photos, logos, specific items)
- pose_structure: Reference provides pose/composition guidance (ControlNet depth/pose, skeleton refs, OpenPose)
- scene_background: Reference provides a background/environment (scene plates, background refs)
Disambiguation: --cref → face_person. --sref → style_artwork. IP-Adapter → subject_object (unless context clearly indicates face or style). ControlNet → pose_structure.

MULTI-SHOT: is_multi_shot=true if the prompt describes multiple sequential shots, scenes, or clips in a video. Look for:
- Explicit shot/scene/clip numbering ("Shot 1... Shot 2...", "Scene 1... Scene 2...")
- Timestamp segments ("[0s-3s]... [3s-6s]...")
- Narrative shot descriptions ("Camera opens on X, then cuts to Y, finally we see Z")
- Separator-based formats (shots divided by ---, ///, or similar delimiters)
- Duration-based structure ("5 second intro... 5 second main... 3 second outro")
- Any prompt that describes a sequence of distinct visual moments meant to be rendered as separate shots
Set false for single-shot prompts or non-video. null for non-visual categories.

detected_model: Canonical tool name ("Midjourney", "Flux", "Runway" etc.) or null.
extracted_prompt: Clean prompt only - strip social text, hashtags, engagement bait. Keep technical syntax (--ar, --v, cfg). null if no prompt found.
id: Copy exactly from input.`

const VALID_PROMPT_CATEGORIES_LIST = [
  'image_person', 'image_advertisement', 'image_collage',
  'image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting',
  'video_t2v', 'video_i2v', 'video_r2v', 'video_v2v',
  'audio', 'threed',
  'system_prompt', 'writing', 'coding', 'analysis', 'other',
] as const
const VALID_PROMPT_CATEGORIES = new Set<PromptCategory>(VALID_PROMPT_CATEGORIES_LIST)

const VALID_THEMES_LIST = [
  'person', 'cinematic', 'landscape', 'architecture', 'scifi',
  'fantasy', 'abstract', 'fashion', 'product', 'horror',
] as const
const VALID_THEMES = new Set<PromptTheme>(VALID_THEMES_LIST)

const VALID_ART_STYLES_LIST = [
  'photorealistic', 'anime', 'illustration', 'oil_painting', 'watercolor',
  'digital_art', 'sketch', 'pixel_art', '3d_render', 'concept_art',
  'comic_book', 'minimalist', 'surrealist', 'impressionist',
  'cinematic_photo', 'neon_noir', 'vintage', 'flat_design',
] as const
const VALID_ART_STYLES = new Set<ArtStyle>(VALID_ART_STYLES_LIST)

const VALID_REF_TYPES_LIST = [
  'face_person', 'style_artwork', 'subject_object', 'pose_structure', 'scene_background',
] as const
const VALID_REF_TYPES = new Set<ReferenceType>(VALID_REF_TYPES_LIST)

// Tool schema with enum constraints - dramatically improves output validity,
// especially critical for Haiku where unconstrained string fields drift.
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
            id:                 { type: 'string', description: 'Copy the id field from the input item exactly' },
            prompt_category:    { type: 'string', enum: [...VALID_PROMPT_CATEGORIES_LIST] },
            detected_model:     { type: ['string', 'null'] },
            extracted_prompt:   { type: ['string', 'null'] },
            prompt_themes:      { type: 'array', items: { type: 'string', enum: [...VALID_THEMES_LIST] }, maxItems: 3 },
            art_styles:         { type: 'array', items: { type: 'string', enum: [...VALID_ART_STYLES_LIST] }, maxItems: 3 },
            requires_reference: { type: ['boolean', 'null'] },
            reference_type:     { type: ['string', 'null'], enum: [...VALID_REF_TYPES_LIST, null] },
            is_multi_shot:      { type: ['boolean', 'null'], description: 'true if prompt describes multiple sequential shots/scenes/clips' },
          },
          required: ['id', 'prompt_category', 'detected_model', 'extracted_prompt', 'prompt_themes', 'art_styles', 'requires_reference', 'reference_type', 'is_multi_shot'],
        },
      },
    },
    required: ['results'],
  },
}

export async function classifyPromptBatch(
  prompts: (Pick<Bookmark, 'id' | 'tweet_text' | 'thread_tweets'> & { media_alt_texts?: (string | null)[] })[]
): Promise<{
  id: string
  prompt_category: PromptCategory
  extracted_prompt: string | null
  detected_model: string | null
  prompt_themes: PromptTheme[]
  art_styles: ArtStyle[]
  requires_reference: boolean | null
  reference_type: ReferenceType | null
  is_multi_shot: boolean | null
}[]> {
  const client = getClient()

  // Use sequential 1-based indices as IDs - avoids UUID serialisation issues
  const indexToId = new Map(prompts.map((p, i) => [String(i + 1), p.id]))

  const input = prompts.map((p, i) => {
    const threadContext = p.thread_tweets?.length
      ? '\n\nThread:\n' + p.thread_tweets.map((t) => t.tweet_text).join('\n---\n')
      : ''
    // Include media alt texts as extra signal for visual prompt classification
    const altTexts = (p.media_alt_texts ?? []).filter(Boolean)
    const altContext = altTexts.length ? '\n\nImage descriptions: ' + altTexts.join(' | ') : ''
    const fullText = preprocessTweet(p.tweet_text + threadContext + altContext).slice(0, 3000)
    return { id: String(i + 1), text: fullText }
  })

  const message = await withRetry(() =>
    client.messages.create({
      model: 'claude-sonnet-4-5-20241022',
      max_tokens: 4096,
      system: PROMPT_SYSTEM,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'classify_prompts' },
      messages: [{ role: 'user', content: `Classify and extract:\n${JSON.stringify(input)}` }],
    })
  )

  const toolUse = message.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`No tool_use block in response. stop_reason=${message.stop_reason}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (toolUse.input as { results: any }).results
  const results: any[] = Array.isArray(raw) ? raw : raw ? [raw] : []

  // Normalise id to string - model sometimes returns integers
  for (const r of results) {
    if (r.id != null) r.id = String(r.id)
  }

  const matched = results.filter((r) => r.id && indexToId.has(r.id))
  if (matched.length < results.length) {
    console.warn('[classifyPromptBatch] ID mismatch - sent:', [...indexToId.keys()], '| received:', results.map((r) => r.id))
  }

  // Positional fallback: if no IDs matched at all, pair results to prompts by order
  const toMap = matched.length > 0
    ? matched.map((r) => ({ r, id: indexToId.get(r.id) as string }))
    : results.slice(0, prompts.length).map((r, i) => {
        console.warn(`[classifyPromptBatch] Positional fallback for index ${i + 1}`)
        return { r, id: prompts[i].id }
      })

  // Post-classification validation: enforce reference consistency
  const REFERENCE_CATEGORIES = new Set(['image_r2i', 'image_i2i', 'video_r2v', 'video_i2v'])

  return toMap
    .map(({ r, id }) => {
      const category = VALID_PROMPT_CATEGORIES.has(r.prompt_category) ? r.prompt_category : 'other'
      let requires_reference = typeof r.requires_reference === 'boolean' ? r.requires_reference : null
      let reference_type: ReferenceType | null = VALID_REF_TYPES.has(r.reference_type) ? r.reference_type : null

      // If category implies reference, force requires_reference=true
      if (REFERENCE_CATEGORIES.has(category) && requires_reference !== true) {
        requires_reference = true
      }
      // If requires_reference but no type, default to subject_object
      if (requires_reference === true && !reference_type) {
        reference_type = 'subject_object'
      }

      return {
        id,
        prompt_category: category,
        extracted_prompt: r.extracted_prompt ?? null,
        detected_model: normaliseModel(r.detected_model, category),
        prompt_themes: Array.isArray(r.prompt_themes)
          ? r.prompt_themes.filter((t: string) => VALID_THEMES.has(t as PromptTheme))
          : [],
        art_styles: Array.isArray(r.art_styles)
          ? r.art_styles.filter((s: string) => VALID_ART_STYLES.has(s as ArtStyle))
          : [],
        requires_reference,
        reference_type,
        is_multi_shot: typeof r.is_multi_shot === 'boolean' ? r.is_multi_shot : null,
      }
    })
}
