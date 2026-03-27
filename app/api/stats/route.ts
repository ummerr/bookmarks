import { NextResponse } from 'next/server'
import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require' }))
}

export async function GET() {
  try {
    const sql = getSql()

    const [categoryRows, modelRows, themeRows, totalRow, refRow, refTypeRows, multiShotRow, promptLengthRows] = await Promise.all([
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
      sql<{ prompt_themes: unknown }[]>`
        SELECT prompt_themes FROM bookmarks
        WHERE category = 'prompts' AND prompt_themes IS NOT NULL
      `,
      sql<{ total: string }[]>`
        SELECT COUNT(*) as total FROM bookmarks WHERE category = 'prompts'
      `,
      sql<{ ref_count: string }[]>`
        SELECT COUNT(*) as ref_count FROM bookmarks
        WHERE category = 'prompts' AND requires_reference = true
      `,
      sql<{ reference_type: string; n: string }[]>`
        SELECT reference_type, COUNT(*) as n
        FROM bookmarks
        WHERE category = 'prompts' AND reference_type IS NOT NULL
        GROUP BY reference_type
        ORDER BY n DESC
      `,
      sql<{ n: string }[]>`
        SELECT COUNT(*) as n FROM bookmarks
        WHERE category = 'prompts' AND is_multi_shot = true
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

    // Aggregate themes in JS to avoid JSONB unnesting issues
    const themeCounts: Record<string, number> = {}
    let withTheme = 0
    for (const row of themeRows) {
      const themes = Array.isArray(row.prompt_themes) ? row.prompt_themes : []
      if (themes.length > 0) withTheme++
      for (const t of themes) {
        if (t && typeof t === 'string') themeCounts[t] = (themeCounts[t] ?? 0) + 1
      }
    }
    const byTheme = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value }))

    return NextResponse.json({
      total: Number(totalRow[0].total),
      withReference: Number(refRow[0].ref_count),
      withTheme,
      multiShot: Number(multiShotRow[0].n),
      byCategory: categoryRows.map((r) => ({ label: r.prompt_category, value: Number(r.n) })),
      byModel: modelRows.map((r) => ({ label: r.detected_model, value: Number(r.n) })),
      byTheme,
      byReferenceType: refTypeRows.map((r) => ({ label: r.reference_type, value: Number(r.n) })),
      byPromptLength: promptLengthRows.map((r) => ({ label: r.bucket, value: Number(r.n) })),
    })
  } catch (err) {
    console.error('[/api/stats]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
