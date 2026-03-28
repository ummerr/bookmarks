import { NextResponse } from 'next/server'
import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require', connect_timeout: 8 }))
}

interface FlagResult {
  id: string
  tweet_id: string
  author_handle: string
  extracted_prompt: string | null
  tweet_text: string
  detected_model: string | null
  prompt_category: string | null
  confidence: number
  tweet_url: string
}

export async function GET() {
  try {
    const sql = getSql()

    // Total prompts baseline
    const [{ total }] = await sql<{ total: string }[]>`
      SELECT COUNT(*) as total FROM bookmarks WHERE category = 'prompts'
    `

    // ── Strategy 1: Too short (<20 chars) ──────────────────────────
    const tooShort = await sql<(FlagResult & { prompt_length: number })[]>`
      SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
             detected_model, prompt_category, confidence, tweet_url,
             LENGTH(extracted_prompt) as prompt_length
      FROM bookmarks
      WHERE category = 'prompts'
        AND extracted_prompt IS NOT NULL
        AND LENGTH(extracted_prompt) < 20
      ORDER BY LENGTH(extracted_prompt) ASC
      LIMIT 50
    `
    const [{ short_count }] = await sql<{ short_count: string }[]>`
      SELECT COUNT(*) as short_count FROM bookmarks
      WHERE category = 'prompts' AND extracted_prompt IS NOT NULL AND LENGTH(extracted_prompt) < 20
    `

    // ── Strategy 2: No extraction ──────────────────────────────────
    const [{ no_extract_count }] = await sql<{ no_extract_count: string }[]>`
      SELECT COUNT(*) as no_extract_count FROM bookmarks
      WHERE category = 'prompts' AND extracted_prompt IS NULL
    `
    const noExtract = await sql<FlagResult[]>`
      SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
             detected_model, prompt_category, confidence, tweet_url
      FROM bookmarks
      WHERE category = 'prompts' AND extracted_prompt IS NULL
      ORDER BY created_at DESC
      LIMIT 30
    `

    // ── Strategy 3: No category ────────────────────────────────────
    const [{ no_cat_count }] = await sql<{ no_cat_count: string }[]>`
      SELECT COUNT(*) as no_cat_count FROM bookmarks
      WHERE category = 'prompts' AND prompt_category IS NULL
    `

    // ── Strategy 4: No model detected ──────────────────────────────
    const [{ no_model_count }] = await sql<{ no_model_count: string }[]>`
      SELECT COUNT(*) as no_model_count FROM bookmarks
      WHERE category = 'prompts' AND (detected_model IS NULL OR detected_model = '')
    `

    // ── Strategy 5: Exact duplicate extracted_prompt ────────────────
    const dupes = await sql<{ extracted_prompt: string; dupe_count: string }[]>`
      SELECT extracted_prompt, COUNT(*) as dupe_count
      FROM bookmarks
      WHERE category = 'prompts' AND extracted_prompt IS NOT NULL
      GROUP BY extracted_prompt
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `
    const [{ total_dupes }] = await sql<{ total_dupes: string }[]>`
      SELECT COUNT(*) as total_dupes FROM (
        SELECT extracted_prompt FROM bookmarks
        WHERE category = 'prompts' AND extracted_prompt IS NOT NULL
        GROUP BY extracted_prompt
        HAVING COUNT(*) > 1
      ) sub
    `
    const [{ dupe_rows }] = await sql<{ dupe_rows: string }[]>`
      SELECT SUM(cnt - 1)::int as dupe_rows FROM (
        SELECT COUNT(*) as cnt FROM bookmarks
        WHERE category = 'prompts' AND extracted_prompt IS NOT NULL
        GROUP BY extracted_prompt
        HAVING COUNT(*) > 1
      ) sub
    `

    // ── Strategy 6: Prompt = tweet_text (no real extraction) ────────
    const [{ same_count }] = await sql<{ same_count: string }[]>`
      SELECT COUNT(*) as same_count FROM bookmarks
      WHERE category = 'prompts'
        AND extracted_prompt IS NOT NULL
        AND extracted_prompt = tweet_text
    `
    const sameAsTweet = await sql<(FlagResult & { prompt_length: number })[]>`
      SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
             detected_model, prompt_category, confidence, tweet_url,
             LENGTH(extracted_prompt) as prompt_length
      FROM bookmarks
      WHERE category = 'prompts'
        AND extracted_prompt IS NOT NULL
        AND extracted_prompt = tweet_text
      ORDER BY LENGTH(extracted_prompt) ASC
      LIMIT 30
    `

    // ── Strategy 7: Low confidence classification ──────────────────
    const confidenceBuckets = await sql<{ bucket: string; n: string }[]>`
      SELECT
        CASE
          WHEN confidence < 0.3 THEN '0.0–0.3'
          WHEN confidence < 0.5 THEN '0.3–0.5'
          WHEN confidence < 0.7 THEN '0.5–0.7'
          WHEN confidence < 0.9 THEN '0.7–0.9'
          ELSE '0.9–1.0'
        END as bucket,
        COUNT(*) as n
      FROM bookmarks
      WHERE category = 'prompts'
      GROUP BY bucket
      ORDER BY bucket
    `
    const lowConf = await sql<FlagResult[]>`
      SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
             detected_model, prompt_category, confidence, tweet_url
      FROM bookmarks
      WHERE category = 'prompts' AND confidence < 0.5
      ORDER BY confidence ASC
      LIMIT 30
    `

    // ── Strategy 8: Prompt length distribution ─────────────────────
    const lengthBuckets = await sql<{ bucket: string; n: string }[]>`
      SELECT
        CASE
          WHEN LENGTH(COALESCE(extracted_prompt, '')) < 10 THEN '0–9'
          WHEN LENGTH(COALESCE(extracted_prompt, '')) < 20 THEN '10–19'
          WHEN LENGTH(COALESCE(extracted_prompt, '')) < 50 THEN '20–49'
          WHEN LENGTH(COALESCE(extracted_prompt, '')) < 100 THEN '50–99'
          WHEN LENGTH(COALESCE(extracted_prompt, '')) < 200 THEN '100–199'
          WHEN LENGTH(COALESCE(extracted_prompt, '')) < 500 THEN '200–499'
          WHEN LENGTH(COALESCE(extracted_prompt, '')) < 1000 THEN '500–999'
          ELSE '1000+'
        END as bucket,
        COUNT(*) as n
      FROM bookmarks
      WHERE category = 'prompts'
      GROUP BY bucket
      ORDER BY MIN(LENGTH(COALESCE(extracted_prompt, '')))
    `

    // ── Strategy 9: No media (no output to show) ───────────────────
    const [{ no_media_count }] = await sql<{ no_media_count: string }[]>`
      SELECT COUNT(*) as no_media_count FROM bookmarks
      WHERE category = 'prompts'
        AND (media_urls IS NULL OR jsonb_array_length(media_urls) = 0)
    `

    // ── Overlap: how many hit MULTIPLE flags ───────────────────────
    const overlaps = await sql<{ flags: string; n: string }[]>`
      SELECT flags, COUNT(*) as n FROM (
        SELECT id,
          (CASE WHEN extracted_prompt IS NULL THEN 1 ELSE 0 END)
          + (CASE WHEN extracted_prompt IS NOT NULL AND LENGTH(extracted_prompt) < 20 THEN 1 ELSE 0 END)
          + (CASE WHEN prompt_category IS NULL THEN 1 ELSE 0 END)
          + (CASE WHEN detected_model IS NULL OR detected_model = '' THEN 1 ELSE 0 END)
          + (CASE WHEN confidence < 0.5 THEN 1 ELSE 0 END)
          + (CASE WHEN media_urls IS NULL OR jsonb_array_length(media_urls) = 0 THEN 1 ELSE 0 END)
          as flags
        FROM bookmarks
        WHERE category = 'prompts'
      ) sub
      WHERE flags > 0
      GROUP BY flags
      ORDER BY flags
    `

    // ── Union: total unique rows flagged by at least 1 heuristic ───
    const [{ any_flag_count }] = await sql<{ any_flag_count: string }[]>`
      SELECT COUNT(*) as any_flag_count FROM bookmarks
      WHERE category = 'prompts' AND (
        extracted_prompt IS NULL
        OR (extracted_prompt IS NOT NULL AND LENGTH(extracted_prompt) < 20)
        OR prompt_category IS NULL
        OR detected_model IS NULL OR detected_model = ''
        OR confidence < 0.5
        OR media_urls IS NULL OR jsonb_array_length(media_urls) = 0
      )
    `

    return NextResponse.json({
      total: Number(total),
      strategies: {
        too_short: {
          label: 'Too short (<20 chars)',
          count: Number(short_count),
          examples: tooShort,
        },
        no_extraction: {
          label: 'No extracted prompt',
          count: Number(no_extract_count),
          examples: noExtract,
        },
        no_category: {
          label: 'No category assigned',
          count: Number(no_cat_count),
        },
        no_model: {
          label: 'No model detected',
          count: Number(no_model_count),
        },
        duplicates: {
          label: 'Exact duplicate prompts',
          unique_prompts_with_dupes: Number(total_dupes),
          removable_rows: Number(dupe_rows) || 0,
          examples: dupes.map((d) => ({
            prompt: d.extracted_prompt.slice(0, 120),
            count: Number(d.dupe_count),
          })),
        },
        same_as_tweet: {
          label: 'Prompt = raw tweet (no extraction)',
          count: Number(same_count),
          examples: sameAsTweet,
        },
        low_confidence: {
          label: 'Low confidence (<0.5)',
          distribution: confidenceBuckets.map((b) => ({ bucket: b.bucket, count: Number(b.n) })),
          examples: lowConf,
        },
        no_media: {
          label: 'No media attached',
          count: Number(no_media_count),
        },
      },
      distributions: {
        prompt_length: lengthBuckets.map((b) => ({ bucket: b.bucket, count: Number(b.n) })),
      },
      overlap: {
        by_flag_count: overlaps.map((o) => ({ flags: Number(o.flags), count: Number(o.n) })),
        any_flag: Number(any_flag_count),
      },
    })
  } catch (err) {
    console.error('[/api/prompts/quality]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
