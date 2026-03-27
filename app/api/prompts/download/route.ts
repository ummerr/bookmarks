import { NextRequest, NextResponse } from 'next/server'
import { getPrompts } from '@/lib/db'

const CSV_FIELDS = [
  'tweet_id',
  'author_handle',
  'tweet_url',
  'prompt_category',
  'extracted_prompt',
  'detected_model',
  'prompt_themes',
  'art_styles',
  'requires_reference',
  'reference_type',
  'is_multi_shot',
  'source',
  'bookmarked_at',
] as const

function escapeCsv(value: unknown): string {
  if (value == null) return ''
  const str = Array.isArray(value) ? value.join('; ') : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') ?? 'json'
  const prompts = await getPrompts('all')

  if (format === 'csv') {
    const header = CSV_FIELDS.join(',')
    const rows = prompts.map((p) =>
      CSV_FIELDS.map((f) => escapeCsv(p[f as keyof typeof p])).join(','),
    )
    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ummerr-prompts.csv"',
      },
    })
  }

  // JSON — return only the useful fields
  const data = prompts.map((p) => ({
    tweet_id: p.tweet_id,
    author_handle: p.author_handle,
    tweet_url: p.tweet_url,
    prompt_category: p.prompt_category,
    extracted_prompt: p.extracted_prompt,
    detected_model: p.detected_model,
    prompt_themes: p.prompt_themes,
    art_styles: p.art_styles,
    requires_reference: p.requires_reference,
    reference_type: p.reference_type,
    is_multi_shot: p.is_multi_shot,
    source: p.source,
    bookmarked_at: p.bookmarked_at,
  }))

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ummerr-prompts.json"',
    },
  })
}
