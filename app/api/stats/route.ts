import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'
import { DATASET_SLICES, DATASET_SLICE_KEYS, isDatasetSlice, type DatasetSlice } from '@/lib/datasetSlices'

// Run a query with a fallback - if it fails or times out, return the fallback as a plain array
async function safe<T extends Record<string, unknown>>(promise: Promise<T[]>, fallback: T[]): Promise<T[]> {
  try {
    return Array.from(await promise)
  } catch (err) {
    console.warn('[/api/stats] query failed, using fallback:', err)
    return fallback
  }
}

export async function GET(req: NextRequest) {
  const sliceParam = req.nextUrl.searchParams.get('slice')
  const slice = sliceParam && isDatasetSlice(sliceParam) ? sliceParam : null
  if (sliceParam && !slice) {
    return NextResponse.json(
      { error: `Unknown slice "${sliceParam}". Valid: t2i, r2i, t2v, r2v.` },
      { status: 400 },
    )
  }
  const sliceMeta = slice ? DATASET_SLICES[slice] : null
  // Predicate segment ANDed into every aggregation — constant string, never user input
  const sliceAnd = sliceMeta ? `AND (${sliceMeta.predicate})` : ''

  try {
    const sql = getSql()
    // Cast `unsafe` returns through Promise so TS accepts the row shape
    const u = <T extends Record<string, unknown>>(q: string) =>
      sql.unsafe(q) as unknown as Promise<T[]>

    // Slice counts only populated on the top-level call (no slice param) to keep
    // per-slice responses minimal.
    const sliceCountPromises = sliceMeta ? [] : DATASET_SLICE_KEYS.map((k) =>
      safe(u<{ total: string }>(`
        SELECT COUNT(*) as total FROM bookmarks
        WHERE category = 'prompts' AND (${DATASET_SLICES[k].predicate})
      `), [{ total: '0' }]).then((r) => ({ slice: k, value: Number(r[0]?.total ?? 0) }))
    )

    const [categoryRows, modelRows, totalRow, refRow, refTypeRows, promptLengthRows, themeRows, timelineRows, modelTimelineRows, ...sliceCountResults] = await Promise.all([
      safe(u<{ prompt_category: string; n: string }>(`
        SELECT prompt_category, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND prompt_category IS NOT NULL ${sliceAnd}
        GROUP BY prompt_category
        ORDER BY n DESC
      `), []),
      safe(u<{ detected_model: string; n: string }>(`
        SELECT detected_model, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND detected_model IS NOT NULL AND detected_model != '' ${sliceAnd}
        GROUP BY detected_model
        ORDER BY n DESC
      `), []),
      safe(u<{ total: string }>(`
        SELECT COUNT(*) as total FROM bookmarks WHERE category = 'prompts' ${sliceAnd}
      `), [{ total: '0' }]),
      safe(u<{ ref_count: string }>(`
        SELECT COUNT(*) as ref_count FROM bookmarks
        WHERE category = 'prompts' AND requires_reference = true ${sliceAnd}
      `), [{ ref_count: '0' }]),
      safe(u<{ reference_type: string; n: string }>(`
        SELECT reference_type, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND reference_type IS NOT NULL ${sliceAnd}
        GROUP BY reference_type
        ORDER BY n DESC
      `), []),
      safe(u<{ bucket: string; n: string }>(`
        SELECT
          CASE
            WHEN LENGTH(COALESCE(extracted_prompt, '')) < 50 THEN 'short'
            WHEN LENGTH(COALESCE(extracted_prompt, '')) < 200 THEN 'medium'
            WHEN LENGTH(COALESCE(extracted_prompt, '')) < 500 THEN 'long'
            ELSE 'very_long'
          END as bucket,
          COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND extracted_prompt IS NOT NULL ${sliceAnd}
        GROUP BY bucket
      `), []),
      safe(u<{ theme: string; n: string }>(`
        SELECT t.theme, COUNT(*) as n
        FROM (
          SELECT prompt_themes FROM bookmarks
          WHERE category = 'prompts' AND jsonb_typeof(prompt_themes) = 'array' ${sliceAnd}
        ) b, jsonb_array_elements_text(b.prompt_themes) AS t(theme)
        GROUP BY t.theme
        ORDER BY n DESC
      `), []),
      safe(u<{ month: string; n: string }>(`
        SELECT TO_CHAR(bookmarked_at::timestamp, 'YYYY-MM') as month, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND bookmarked_at IS NOT NULL ${sliceAnd}
        GROUP BY month
        ORDER BY month
      `), []),
      safe(u<{ month: string; detected_model: string; n: string }>(`
        SELECT TO_CHAR(bookmarked_at::timestamp, 'YYYY-MM') as month, detected_model, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND bookmarked_at IS NOT NULL AND detected_model IS NOT NULL AND detected_model != '' ${sliceAnd}
        GROUP BY month, detected_model
        ORDER BY month
      `), []),
      ...sliceCountPromises,
    ])

    const sliceCounts = (sliceCountResults as { slice: DatasetSlice; value: number }[])
      .reduce<Record<string, number>>((acc, r) => { acc[r.slice] = r.value; return acc }, {})

    const headers = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    return NextResponse.json({
      total: Number(totalRow[0]?.total ?? 0),
      withReference: Number(refRow[0]?.ref_count ?? 0),
      byCategory: categoryRows.map((r) => ({ label: r.prompt_category, value: Number(r.n) })),
      byModel: modelRows.map((r) => ({ label: r.detected_model, value: Number(r.n) })),
      byReferenceType: refTypeRows.map((r) => ({ label: r.reference_type, value: Number(r.n) })),
      byPromptLength: promptLengthRows.map((r) => ({ label: r.bucket, value: Number(r.n) })),
      byTheme: themeRows.map((r) => ({ label: r.theme, value: Number(r.n) })),
      timeline: timelineRows.map((r) => ({ month: r.month, value: Number(r.n) })),
      modelTimeline: modelTimelineRows.map((r) => ({ month: r.month, model: r.detected_model, value: Number(r.n) })),
      sliceCounts: sliceMeta ? undefined : sliceCounts,
      slice: sliceMeta?.key ?? null,
    }, { headers })
  } catch (err) {
    console.error('[/api/stats]', err)
    // Return empty but valid response shape - never 500
    return NextResponse.json({
      total: 0,
      withReference: 0,
      byCategory: [],
      byModel: [],
      byReferenceType: [],
      byPromptLength: [],
      byTheme: [],
      timeline: [],
      modelTimeline: [],
      slice: sliceMeta?.key ?? null,
    })
  }
}
