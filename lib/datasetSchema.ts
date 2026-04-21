// Shared schema description for the dataset — used by both the master /dataset
// page and the per-slice sub-pages so the published schema never drifts.

export interface SchemaField {
  field: string
  type: string
  nullable: boolean
  description: string
}

export const SCHEMA_FIELDS: SchemaField[] = [
  { field: 'id',                 type: 'uuid',           nullable: false, description: 'Primary key' },
  { field: 'tweet_id',           type: 'text',           nullable: false, description: 'Original post ID - enables deduplication and provenance tracing' },
  { field: 'tweet_text',         type: 'text',           nullable: false, description: 'Full text of the source post (unmodified)' },
  { field: 'author_handle',      type: 'text',           nullable: false, description: 'Platform username of the practitioner who shared the prompt' },
  { field: 'author_name',        type: 'text',           nullable: true,  description: 'Display name' },
  { field: 'tweet_url',          type: 'text',           nullable: false, description: 'Canonical URL - links to output media and original engagement context' },
  { field: 'media_urls',         type: 'text[]',         nullable: false, description: 'Output image/video URLs attached to the post' },
  { field: 'source',             type: 'enum',           nullable: false, description: 'Ingestion origin: twitter | reddit | manual' },
  { field: 'category',           type: 'enum',           nullable: false, description: 'Top-level bucket: prompts | tech_ai_product | career_productivity | uncategorized' },
  { field: 'prompt_category',    type: 'enum',           nullable: true,  description: 'Modality + technique: image_t2i, video_t2v, video_i2v, audio, etc.' },
  { field: 'extracted_prompt',   type: 'text',           nullable: true,  description: 'Clean prompt text extracted from post + comments - social framing stripped' },
  { field: 'detected_model',     type: 'text',           nullable: true,  description: 'AI model mentioned (free-text canonical slug, e.g. "Midjourney v6.1")' },
  { field: 'prompt_themes',      type: 'text[]',         nullable: true,  description: 'Visual themes: person, cinematic, landscape, scifi, fantasy, etc.' },
  { field: 'art_styles',         type: 'text[]',         nullable: true,  description: 'Art styles: photorealistic, anime, oil_painting, pixel_art, etc.' },
  { field: 'requires_reference', type: 'boolean',        nullable: true,  description: 'True if prompt requires a reference image as input' },
  { field: 'reference_type',     type: 'enum',           nullable: true,  description: 'face_person | style_artwork | subject_object | pose_structure | scene_background' },
  { field: 'is_thread',          type: 'boolean',        nullable: false, description: 'True if post is a multi-tweet thread' },
  { field: 'thread_tweets',      type: 'jsonb',          nullable: true,  description: 'Array of {tweet_id, tweet_text} for threaded posts' },
  { field: 'confidence',         type: 'float',          nullable: false, description: 'Classifier confidence score (0–1)' },
  { field: 'rationale',          type: 'text',           nullable: true,  description: 'LLM reasoning for the category assignment' },
  { field: 'user_notes',         type: 'text',           nullable: true,  description: 'Human curator notes' },
  { field: 'bookmarked_at',      type: 'timestamptz',    nullable: true,  description: 'When the post was originally bookmarked' },
  { field: 'created_at',         type: 'timestamptz',    nullable: false, description: 'Row insertion timestamp' },
  { field: 'updated_at',         type: 'timestamptz',    nullable: false, description: 'Last modification timestamp' },
]
