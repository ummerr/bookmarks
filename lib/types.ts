export type Category =
  | 'tech_ai_product'
  | 'career_productivity'
  | 'prompts'
  | 'uncategorized'

export type PromptCategory =
  // ── Image Generation ──────────────────────────────
  | 'image_t2i'           // Text → Image (Midjourney, DALL-E, Flux, SD, Firefly, Ideogram)
  | 'image_i2i'           // Image → Image (img2img, style transfer, ControlNet)
  | 'image_r2i'           // Reference → Image (uploaded/reference image guides output subject/style)
  | 'image_character_ref' // Character / face / person / IP-Adapter reference
  | 'image_inpainting'    // Inpainting, outpainting, masking, regional editing
  // ── Video Generation ──────────────────────────────
  | 'video_t2v'           // Text → Video (Sora, Kling, Runway Gen3, Pika, Hailuo)
  | 'video_i2v'           // Image → Video / animate still (Runway, Kling, Luma Dream Machine)
  | 'video_r2v'           // Reference → Video (reference/uploaded image guides video generation)
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

export type PromptTheme =
  | 'person'
  | 'cinematic'
  | 'landscape'
  | 'architecture'
  | 'scifi'
  | 'fantasy'
  | 'abstract'
  | 'fashion'
  | 'product'
  | 'horror'

export type ArtStyle =
  | 'photorealistic'
  | 'anime'
  | 'illustration'
  | 'oil_painting'
  | 'watercolor'
  | 'digital_art'
  | 'sketch'
  | 'pixel_art'
  | '3d_render'
  | 'concept_art'
  | 'comic_book'
  | 'minimalist'
  | 'surrealist'
  | 'impressionist'
  | 'cinematic_photo'
  | 'neon_noir'
  | 'vintage'
  | 'flat_design'

export type ReferenceType =
  | 'face_person'
  | 'style_artwork'
  | 'subject_object'
  | 'pose_structure'
  | 'scene_background'

export interface Bookmark {
  id: string
  tweet_id: string
  tweet_text: string
  author_handle: string
  author_name: string | null
  tweet_url: string
  media_urls: string[]
  media_alt_texts: (string | null)[]
  category: Category
  confidence: number
  rationale: string | null
  is_thread: boolean
  thread_tweets: TweetInThread[]
  user_notes: string | null
  prompt_category: PromptCategory | null
  extracted_prompt: string | null
  detected_model: string | null
  prompt_themes: PromptTheme[]
  requires_reference: boolean | null
  reference_type: ReferenceType | null
  art_styles: ArtStyle[]
  bookmarked_at: string | null
  source: 'twitter' | 'manual' | 'reddit'
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
  media_alt_texts?: (string | null)[]
  category?: Category
  confidence?: number
  rationale?: string | null
  is_thread?: boolean
  thread_tweets?: TweetInThread[]
  user_notes?: string | null
  bookmarked_at?: string | null
  source?: 'twitter' | 'manual' | 'reddit'
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
