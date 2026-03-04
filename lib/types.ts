export type Category =
  | 'tech_ai_product'
  | 'career_productivity'
  | 'prompts'
  | 'uncategorized'

export type PromptCategory =
  // ── Image Generation ──────────────────────────────
  | 'image_t2i'           // Text → Image (Midjourney, DALL-E, Flux, SD, Firefly, Ideogram)
  | 'image_i2i'           // Image → Image (img2img, style transfer, ControlNet)
  | 'image_character_ref' // Character / face / person / IP-Adapter reference
  | 'image_inpainting'    // Inpainting, outpainting, masking, regional editing
  // ── Video Generation ──────────────────────────────
  | 'video_t2v'           // Text → Video (Sora, Kling, Runway Gen3, Pika, Hailuo)
  | 'video_i2v'           // Image → Video / animate still (Runway, Kling, Luma Dream Machine)
  | 'video_v2v'           // Video → Video (restyle, motion transfer, lip sync)
  // ── Other Media ───────────────────────────────────
  | 'audio'               // Music, voice, sound effects (Suno, Udio, ElevenLabs)
  | 'threed'              // 3D model / scene / texture generation
  // ── Non-Media ─────────────────────────────────────
  | 'system_prompt'       // System prompts, personas, custom instructions
  | 'writing'             // Creative writing, copywriting, content
  | 'coding'              // Code generation, debugging, architecture
  | 'analysis'            // Analysis, research, summarisation
  | 'other'               // Anything else

export interface Bookmark {
  id: string
  tweet_id: string
  tweet_text: string
  author_handle: string
  author_name: string | null
  tweet_url: string
  media_urls: string[]
  category: Category
  confidence: number
  rationale: string | null
  is_thread: boolean
  thread_tweets: TweetInThread[]
  user_notes: string | null
  prompt_category: PromptCategory | null
  extracted_prompt: string | null
  detected_model: string | null
  bookmarked_at: string | null
  created_at: string
  updated_at: string
}

export interface TweetInThread {
  tweet_id: string
  tweet_text: string
}

export interface BookmarkInsert {
  tweet_id: string
  tweet_text: string
  author_handle: string
  author_name?: string | null
  tweet_url: string
  media_urls?: string[]
  category?: Category
  confidence?: number
  rationale?: string | null
  is_thread?: boolean
  thread_tweets?: TweetInThread[]
  user_notes?: string | null
  bookmarked_at?: string | null
}

export interface ClassificationResult {
  tweet_id: string
  category: Category
  confidence: number
  rationale: string
}

export interface CategoryCounts {
  all: number
  tech_ai_product: number
  career_productivity: number
  prompts: number
  uncategorized: number
  pending: number
}
