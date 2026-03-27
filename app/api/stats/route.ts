import { NextResponse } from 'next/server'
import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require' }))
}

export async function GET() {
  try {
    const sql = getSql()

    const [categoryRows, modelRows, totalRow, refRow, multiShotRow, refTypeRows, themeRows, promptLengthRows] = await Promise.all([
      sql<{ prompt_category: string; n: string }[]>`
        SELECT prompt_category, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND prompt_category IS NOT NULL
        GROUP BY prompt_category
        ORDER BY n DESC
      `,
      sql<{ detected_model: string; n: string }[]>`
        SELECT detected_model, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND detected_model IS NOT NULL AND detected_model != ''
        GROUP BY detected_model
        ORDER BY n DESC
      `,
      sql<{ total: string }[]>`
        SELECT COUNT(*) as total FROM bookmarks WHERE category = 'prompts'
      `,
      sql<{ ref_count: string }[]>`
        SELECT COUNT(*) as ref_count FROM bookmarks
        WHERE category = 'prompts' AND requires_reference = true
      `,
      sql<{ ms_count: string }[]>`
        SELECT COUNT(*) as ms_count FROM bookmarks
        WHERE category = 'prompts'
          AND COALESCE(extracted_prompt, tweet_text) ~* 'shot\\s*\\d+.*shot\\s*\\d+|cut\\s*\\d+.*cut\\s*\\d+'
      `,
      sql<{ reference_type: string; n: string }[]>`
        SELECT reference_type, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND reference_type IS NOT NULL
        GROUP BY reference_type
        ORDER BY n DESC
      `,
      sql<{ theme: string; n: string }[]>`
        SELECT t.theme, COUNT(*) as n
        FROM bookmarks b, jsonb_array_elements_text(b.prompt_themes) AS t(theme)
        WHERE b.category = 'prompts'
        GROUP BY t.theme
        ORDER BY n DESC
      `,
      sql<{ bucket: string; n: string }[]>`
        SELECT
          CASE
            WHEN LENGTH(COALESCE(extracted_prompt, '')) < 50 THEN 'short'
            WHEN LENGTH(COALESCE(extracted_prompt, '')) < 200 THEN 'medium'
            WHEN LENGTH(COALESCE(extracted_prompt, '')) < 500 THEN 'long'
            ELSE 'very_long'
          END as bucket,
          COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND extracted_prompt IS NOT NULL
        GROUP BY bucket
      `,
    ])

    return NextResponse.json({
      total: Number(totalRow[0].total),
      withReference: Number(refRow[0].ref_count),
      multiShot: Number(multiShotRow[0].ms_count),
      byCategory: categoryRows.map((r) => ({ label: r.prompt_category, value: Number(r.n) })),
      byModel: modelRows.map((r) => ({ label: r.detected_model, value: Number(r.n) })),
      byReferenceType: refTypeRows.map((r) => ({ label: r.reference_type, value: Number(r.n) })),
      byTheme: themeRows.map((r) => ({ label: r.theme, value: Number(r.n) })),
      byPromptLength: promptLengthRows.map((r) => ({ label: r.bucket, value: Number(r.n) })),
    })
  } catch (err) {
    console.error('[/api/stats]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
