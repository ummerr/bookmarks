import Anthropic from '@anthropic-ai/sdk'
import type { Bookmark, Category, ClassificationResult, PromptCategory } from './types'

const SYSTEM_PROMPT = `You are a tweet classifier. Classify each tweet into exactly one category:

- tech_ai_product: Technology, AI, ML, product management, startups, developer tools, shipping updates, tech industry news
- career_productivity: Career growth, job searching, workplace advice, productivity systems, professional development, networking
- prompts: AI prompts, prompt engineering, system prompts, LLM usage patterns, ChatGPT/Claude techniques, jailbreaks

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

const PROMPT_SYSTEM = `You are a prompt classifier for AI-generated media and text content. Classify each prompt into exactly one category:

IMAGE GENERATION:
- image_t2i: Text-to-image prompts for tools like Midjourney, DALL-E, Flux, Stable Diffusion, Firefly, Ideogram. Includes style descriptions, scene compositions, lighting, camera settings.
- image_i2i: Image-to-image prompts — style transfer, img2img, ControlNet, IP-Adapter style reference. The prompt references transforming or remixing an existing image.
- image_character_ref: Character consistency / face reference / person likeness prompts. References maintaining a specific face, character, or person across generations (IP-Adapter, InstantID, face swap, etc.).
- image_inpainting: Inpainting, outpainting, masking, or regional editing prompts. Involves editing specific areas of an image.

VIDEO GENERATION:
- video_t2v: Text-to-video prompts for Sora, Kling, Runway Gen3, Pika, Hailuo, Luma. Pure text description generating a video.
- video_i2v: Image-to-video / animate still image prompts. Takes an image and animates it or extends it into video (Runway, Kling, Luma Dream Machine, etc.).
- video_v2v: Video-to-video prompts — restyle, motion transfer, lip sync, video editing using AI (Runway, Pika elements, lip sync tools).

OTHER MEDIA:
- audio: Music generation, voice synthesis, sound effects prompts (Suno, Udio, ElevenLabs, Eleven, voice cloning, etc.).
- threed: 3D model, scene, texture, or asset generation prompts (Meshy, Tripo3D, Shap-E, Luma 3D, etc.).

TEXT / NON-MEDIA:
- system_prompt: System prompts, persona definitions, custom instructions, or role definitions for LLM assistants (ChatGPT, Claude, etc.).
- writing: Creative writing, copywriting, storytelling, or content generation prompts for text output.
- coding: Code generation, debugging, refactoring, architecture, or technical/programming prompts.
- analysis: Analysis, research, summarisation, data extraction, or reasoning prompts.
- other: Anything that doesn't fit the above categories.

Return ONLY a JSON array: [{"id": "...", "prompt_category": "..."}]`

export async function classifyPromptBatch(
  prompts: Pick<Bookmark, 'id' | 'tweet_text'>[]
): Promise<{ id: string; prompt_category: PromptCategory }[]> {
  const client = getClient()
  const input = prompts.map((p) => ({ id: p.id, text: p.tweet_text.slice(0, 600) }))

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Classify these prompts:\n${JSON.stringify(input, null, 2)}` }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const VALID = new Set<PromptCategory>([
    'image_t2i', 'image_i2i', 'image_character_ref', 'image_inpainting',
    'video_t2v', 'video_i2v', 'video_v2v',
    'audio', 'threed',
    'system_prompt', 'writing', 'coding', 'analysis', 'other',
  ])

  let results: { id: string; prompt_category: string }[]
  try {
    results = JSON.parse(raw)
  } catch {
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('Failed to parse prompt classification response')
    results = JSON.parse(match[0])
  }

  return results.map((r) => ({
    id: r.id,
    prompt_category: VALID.has(r.prompt_category as PromptCategory) ? (r.prompt_category as PromptCategory) : 'other',
  }))
}

export async function classifyBatch(
  bookmarks: Pick<Bookmark, 'tweet_id' | 'tweet_text'>[]
): Promise<ClassificationResult[]> {
  const client = getClient()
  const input = bookmarks.map((b) => ({ tweet_id: b.tweet_id, text: b.tweet_text }))

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Classify these tweets:\n${JSON.stringify(input, null, 2)}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  let results: ClassificationResult[]
  try {
    results = JSON.parse(raw)
  } catch {
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('Failed to parse classification response')
    results = JSON.parse(match[0])
  }

  return results.map((r) => ({
    ...r,
    category: (r.confidence >= 0.7 ? r.category : 'uncategorized') as Category,
  }))
}
