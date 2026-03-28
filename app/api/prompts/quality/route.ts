import { NextResponse } from 'next/server'
import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require', connect_timeout: 8, prepare: false }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safe<T>(promise: PromiseLike<T[]>, fallback: T[]): Promise<T[]> {
  try {
    return Array.from(await promise)
  } catch (err) {
    console.warn('[/api/prompts/quality] query failed:', err)
    return fallback
  }
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

    // Run ALL queries in parallel - single round-trip batch
    const [
      countsRow,
      tooShort,
      noExtract,
      dupes,
      dupeStats,
      sameAsTweet,
      confidenceBuckets,
      lowConf,
      lengthBuckets,
      foreignLang,
      overlaps,
      sourceRows,
      sourceStats,
    ] = await Promise.all([
      // ── 1. All counts + total in ONE query ─────────────────────────
      safe(sql<{
        total: string
        short_count: string
        no_extract_count: string
        no_cat_count: string
        no_model_count: string
        same_count: string
        no_media_count: string
        foreign_lang_count: string
        any_flag_count: string
      }[]>`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE extracted_prompt IS NOT NULL AND LENGTH(extracted_prompt) < 20) as short_count,
          COUNT(*) FILTER (WHERE extracted_prompt IS NULL) as no_extract_count,
          COUNT(*) FILTER (WHERE prompt_category IS NULL) as no_cat_count,
          COUNT(*) FILTER (WHERE detected_model IS NULL OR detected_model = '') as no_model_count,
          COUNT(*) FILTER (WHERE extracted_prompt IS NOT NULL AND extracted_prompt = tweet_text) as same_count,
          COUNT(*) FILTER (WHERE media_urls IS NULL OR media_urls::text = '[]' OR media_urls::text = 'null') as no_media_count,
          COUNT(*) FILTER (WHERE extracted_prompt ~ '[\u4e00-\u9fff\u3400-\u4dbf]') as foreign_lang_count,
          COUNT(*) FILTER (WHERE
            extracted_prompt IS NULL
            OR (extracted_prompt IS NOT NULL AND LENGTH(extracted_prompt) < 20)
            OR prompt_category IS NULL
            OR detected_model IS NULL OR detected_model = ''
            OR confidence < 0.5
            OR media_urls IS NULL OR media_urls::text = '[]' OR media_urls::text = 'null'
          ) as any_flag_count
        FROM bookmarks
        WHERE category = 'prompts'
      `, [{
        total: '0', short_count: '0', no_extract_count: '0', no_cat_count: '0',
        no_model_count: '0', same_count: '0', no_media_count: '0', foreign_lang_count: '0', any_flag_count: '0',
      }]),

      // ── 2. Too short examples ──────────────────────────────────────
      safe(sql<(FlagResult & { prompt_length: number })[]>`
        SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
               detected_model, prompt_category, confidence, tweet_url,
               LENGTH(extracted_prompt) as prompt_length
        FROM bookmarks
        WHERE category = 'prompts'
          AND extracted_prompt IS NOT NULL
          AND LENGTH(extracted_prompt) < 20
        ORDER BY LENGTH(extracted_prompt) ASC
        LIMIT 50
      `, []),

      // ── 3. No extraction examples ─────────────────────────────────
      safe(sql<FlagResult[]>`
        SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
               detected_model, prompt_category, confidence, tweet_url
        FROM bookmarks
        WHERE category = 'prompts' AND extracted_prompt IS NULL
        ORDER BY bookmarked_at DESC NULLS LAST, created_at DESC
        LIMIT 30
      `, []),

      // ── 4. Duplicate prompts (top 20) ──────────────────────────────
      safe(sql<{ extracted_prompt: string; dupe_count: string }[]>`
        SELECT extracted_prompt, COUNT(*) as dupe_count
        FROM bookmarks
        WHERE category = 'prompts' AND extracted_prompt IS NOT NULL
        GROUP BY extracted_prompt
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC
        LIMIT 20
      `, []),

      // ── 5. Duplicate stats (unique prompts + removable rows) ───────
      safe(sql<{ total_dupes: string; dupe_rows: string }[]>`
        SELECT
          COUNT(*) as total_dupes,
          COALESCE(SUM(cnt - 1)::int, 0) as dupe_rows
        FROM (
          SELECT COUNT(*) as cnt
          FROM bookmarks
          WHERE category = 'prompts' AND extracted_prompt IS NOT NULL
          GROUP BY extracted_prompt
          HAVING COUNT(*) > 1
        ) sub
      `, [{ total_dupes: '0', dupe_rows: '0' }]),

      // ── 6. Same-as-tweet examples ─────────────────────────────────
      safe(sql<(FlagResult & { prompt_length: number })[]>`
        SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
               detected_model, prompt_category, confidence, tweet_url,
               LENGTH(extracted_prompt) as prompt_length
        FROM bookmarks
        WHERE category = 'prompts'
          AND extracted_prompt IS NOT NULL
          AND extracted_prompt = tweet_text
        ORDER BY LENGTH(extracted_prompt) ASC
        LIMIT 30
      `, []),

      // ── 7. Confidence distribution ─────────────────────────────────
      safe(sql<{ bucket: string; n: string }[]>`
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
      `, []),

      // ── 8. Low confidence examples ─────────────────────────────────
      safe(sql<FlagResult[]>`
        SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
               detected_model, prompt_category, confidence, tweet_url
        FROM bookmarks
        WHERE category = 'prompts' AND confidence < 0.5
        ORDER BY confidence ASC
        LIMIT 30
      `, []),

      // ── 9. Prompt length distribution ──────────────────────────────
      safe(sql<{ bucket: string; n: string }[]>`
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
      `, []),

      // ── 10. Foreign language (CJK) examples ──────────────────────────
      safe(sql<FlagResult[]>`
        SELECT id, tweet_id, author_handle, extracted_prompt, tweet_text,
               detected_model, prompt_category, confidence, tweet_url
        FROM bookmarks
        WHERE category = 'prompts'
          AND extracted_prompt ~ '[\u4e00-\u9fff\u3400-\u4dbf]'
        ORDER BY bookmarked_at DESC NULLS LAST, created_at DESC
        LIMIT 30
      `, []),

      // ── 11. Overlap: rows by flag count ────────────────────────────
      safe(sql<{ flags: string; n: string }[]>`
        SELECT flags, COUNT(*) as n FROM (
          SELECT id,
            (CASE WHEN extracted_prompt IS NULL THEN 1 ELSE 0 END)
            + (CASE WHEN extracted_prompt IS NOT NULL AND LENGTH(extracted_prompt) < 20 THEN 1 ELSE 0 END)
            + (CASE WHEN prompt_category IS NULL THEN 1 ELSE 0 END)
            + (CASE WHEN detected_model IS NULL OR detected_model = '' THEN 1 ELSE 0 END)
            + (CASE WHEN confidence < 0.5 THEN 1 ELSE 0 END)
            + (CASE WHEN media_urls IS NULL OR media_urls::text = '[]' OR media_urls::text = 'null' THEN 1 ELSE 0 END)
            as flags
          FROM bookmarks
          WHERE category = 'prompts'
        ) sub
        WHERE flags > 0
        GROUP BY flags
        ORDER BY flags
      `, []),

      // ── 12. Top sources by count ──────────────────────────────────
      safe(sql<{ author_handle: string; n: string; avg_confidence: string; categories: string }[]>`
        SELECT author_handle, COUNT(*) as n,
          ROUND(AVG(confidence)::numeric, 2) as avg_confidence,
          COUNT(DISTINCT prompt_category) as categories
        FROM bookmarks
        WHERE category = 'prompts' AND author_handle IS NOT NULL
        GROUP BY author_handle
        ORDER BY n DESC
        LIMIT 50
      `, []),

      // ── 13. Source concentration stats ────────────────────────────
      safe(sql<{ unique_sources: string; total: string }[]>`
        SELECT
          COUNT(DISTINCT author_handle) as unique_sources,
          COUNT(*) as total
        FROM bookmarks
        WHERE category = 'prompts'
      `, [{ unique_sources: '0', total: '0' }]),
    ])

    const counts = countsRow[0]
    const ds = dupeStats[0]
    const ss = sourceStats[0]

    return NextResponse.json({
      total: Number(counts.total),
      strategies: {
        too_short: {
          label: 'Too short (<20 chars)',
          count: Number(counts.short_count),
          examples: tooShort,
        },
        no_extraction: {
          label: 'No extracted prompt',
          count: Number(counts.no_extract_count),
          examples: noExtract,
        },
        no_category: {
          label: 'No category assigned',
          count: Number(counts.no_cat_count),
        },
        no_model: {
          label: 'No model detected',
          count: Number(counts.no_model_count),
        },
        duplicates: {
          label: 'Exact duplicate prompts',
          unique_prompts_with_dupes: Number(ds.total_dupes),
          removable_rows: Number(ds.dupe_rows) || 0,
          examples: dupes.map((d) => ({
            prompt: d.extracted_prompt.slice(0, 120),
            count: Number(d.dupe_count),
          })),
        },
        same_as_tweet: {
          label: 'Prompt = raw tweet (no extraction)',
          count: Number(counts.same_count),
          examples: sameAsTweet,
        },
        low_confidence: {
          label: 'Low confidence (<0.5)',
          distribution: confidenceBuckets.map((b) => ({ bucket: b.bucket, count: Number(b.n) })),
          examples: lowConf,
        },
        no_media: {
          label: 'No media attached',
          count: Number(counts.no_media_count),
        },
        foreign_language: {
          label: 'Foreign language (CJK)',
          count: Number(counts.foreign_lang_count),
          examples: foreignLang,
        },
      },
      distributions: {
        prompt_length: lengthBuckets.map((b) => ({ bucket: b.bucket, count: Number(b.n) })),
      },
      overlap: {
        by_flag_count: overlaps.map((o) => ({ flags: Number(o.flags), count: Number(o.n) })),
        any_flag: Number(counts.any_flag_count),
      },
      sources: {
        unique_count: Number(ss.unique_sources),
        total: Number(ss.total),
        top: sourceRows.map(r => ({
          handle: r.author_handle,
          count: Number(r.n),
          avg_confidence: Number(r.avg_confidence),
          categories: Number(r.categories),
        })),
      },
    })
  } catch (err) {
    console.error('[/api/prompts/quality]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
