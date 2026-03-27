import { NextRequest, NextResponse } from 'next/server'
import { getPrompts } from '@/lib/db'
import type { Bookmark } from '@/lib/types'

// Fields included in every export format
function toRecord(p: Bookmark) {
  const prompt = p.extracted_prompt ?? p.tweet_text
  const modality = p.prompt_category?.startsWith('video_')
    ? 'video'
    : p.prompt_category?.startsWith('image_')
      ? 'image'
      : p.prompt_category === 'audio'
        ? 'audio'
        : p.prompt_category === 'threed'
          ? '3d'
          : 'other'

  return {
    id: p.id,
    tweet_id: p.tweet_id,
    author_handle: p.author_handle,
    tweet_url: p.tweet_url,
    source: p.source,
    // Prompt
    extracted_prompt: p.extracted_prompt,
    tweet_text: p.tweet_text,
    prompt_length: prompt.length,
    // Classification
    modality,
    prompt_category: p.prompt_category,
    detected_model: p.detected_model,
    prompt_themes: p.prompt_themes,
    art_styles: p.art_styles,
    requires_reference: p.requires_reference,
    reference_type: p.reference_type,
    is_multi_shot: p.is_multi_shot,
    // Media
    media_urls: p.media_urls,
    media_count: p.media_urls.length,
    // Timestamps
    bookmarked_at: p.bookmarked_at,
    created_at: p.created_at,
  }
}

type Row = ReturnType<typeof toRecord>

const SCHEMA = {
  id:                'string  — unique record identifier (UUID)',
  tweet_id:          'string  — original tweet/post ID',
  author_handle:     'string  — @handle of the post author',
  tweet_url:         'string  — URL to the original post',
  source:            'enum    — twitter | manual | reddit',
  extracted_prompt:  'string? — AI-extracted prompt text (null if extraction failed)',
  tweet_text:        'string  — raw post text before extraction',
  prompt_length:     'int     — character count of extracted_prompt (or tweet_text if null)',
  modality:          'enum    — image | video | audio | 3d | other',
  prompt_category:   'enum?   — fine-grained category (image_person, video_t2v, etc.)',
  detected_model:    'string? — AI model mentioned or inferred (e.g. "Midjourney v6.1")',
  prompt_themes:     'array   — visual themes: person, cinematic, landscape, etc.',
  art_styles:        'array   — rendering styles: photorealistic, anime, etc.',
  requires_reference:'bool?   — whether prompt requires a reference image/video',
  reference_type:    'enum?   — face_person | style_artwork | subject_object | pose_structure | scene_background',
  is_multi_shot:     'bool    — computed: true if prompt contains multi-shot/scene markers',
  media_urls:        'array   — URLs to attached images or videos',
  media_count:       'int     — number of attached media items',
  bookmarked_at:     'string? — ISO 8601 timestamp when post was bookmarked',
  created_at:        'string  — ISO 8601 timestamp when record was created',
}

// ── CSV ────────────────────────────────────────────────

const CSV_FIELDS = Object.keys(SCHEMA) as (keyof Row)[]

function escapeCsv(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  // Arrays → pipe-delimited (standard for multi-value CSV columns)
  const str = Array.isArray(value) ? value.join('|') : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('|')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(rows: Row[]): string {
  const header = CSV_FIELDS.join(',')
  const body = rows.map((r) =>
    CSV_FIELDS.map((f) => escapeCsv(r[f])).join(','),
  )
  return [header, ...body].join('\n')
}

// ── Route handler ──────────────────────────────────────

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') ?? 'json'
  const prompts = await getPrompts('all')
  const rows = prompts.map(toRecord)
  const ts = new Date().toISOString().slice(0, 10)

  if (format === 'csv') {
    return new NextResponse(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ummerr-prompts-${ts}.csv"`,
      },
    })
  }

  if (format === 'jsonl') {
    const jsonl = rows.map((r) => JSON.stringify(r)).join('\n')
    return new NextResponse(jsonl, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Content-Disposition': `attachment; filename="ummerr-prompts-${ts}.jsonl"`,
      },
    })
  }

  // JSON — metadata envelope with schema
  const payload = {
    meta: {
      name: 'ummerr/prompts',
      version: '1.0',
      license: 'CC BY 4.0',
      cite_as: 'ummerr/prompts',
      exported_at: new Date().toISOString(),
      record_count: rows.length,
      description: 'Organic, in-the-wild generative AI prompts sourced from high-engagement posts on X/Twitter.',
      schema: SCHEMA,
    },
    data: rows,
  }

  return new NextResponse(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="ummerr-prompts-${ts}.json"`,
    },
  })
}
