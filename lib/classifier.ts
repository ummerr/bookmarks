import Anthropic from '@anthropic-ai/sdk'
import type { Bookmark, Category, ClassificationResult } from './types'

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
