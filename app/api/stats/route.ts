import { NextResponse } from 'next/server'
import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require' }))
}

export async function GET() {
  try {
    const sql = getSql()

    const [categoryRows, modelRows, themeRows, totalRow] = await Promise.all([
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
      sql<{ theme: string; n: string }[]>`
        SELECT t.theme, COUNT(*) as n
        FROM bookmarks
        CROSS JOIN LATERAL jsonb_array_elements_text(prompt_themes) AS t(theme)
        WHERE category = 'prompts'
          AND prompt_themes IS NOT NULL
          AND jsonb_typeof(prompt_themes) = 'array'
        GROUP BY t.theme
        ORDER BY n DESC
      `,
      sql<{ total: string }[]>`
        SELECT COUNT(*) as total FROM bookmarks WHERE category = 'prompts'
      `,
    ])

    return NextResponse.json({
      total: Number(totalRow[0].total),
      byCategory: categoryRows.map((r) => ({ label: r.prompt_category, value: Number(r.n) })),
      byModel: modelRows.map((r) => ({ label: r.detected_model, value: Number(r.n) })),
      byTheme: themeRows.map((r) => ({ label: r.theme, value: Number(r.n) })),
    })
  } catch (err) {
    console.error('[/api/stats]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
