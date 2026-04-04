import { NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export async function GET() {
  try {
    const sql = getSql()

    // Compare camera motion language across video models
    const [cameraRows, videoModelRows] = await Promise.all([
      sql<{ detected_model: string; camera_count: string; total: string }[]>`
        SELECT
          detected_model,
          COUNT(*) FILTER (
            WHERE extracted_prompt ~* '(camera|pan|tilt|dolly|tracking|zoom|crane|gimbal|orbit|aerial|drone|steadicam|handheld|pov|close.?up|wide.?shot|medium.?shot)'
          ) as camera_count,
          COUNT(*) as total
        FROM bookmarks
        WHERE category = 'prompts'
          AND prompt_category LIKE 'video_%'
          AND detected_model IS NOT NULL
          AND detected_model != ''
          AND extracted_prompt IS NOT NULL
        GROUP BY detected_model
        HAVING COUNT(*) >= 10
        ORDER BY total DESC
      `,
      sql<{ detected_model: string; avg_len: string }[]>`
        SELECT
          detected_model,
          ROUND(AVG(LENGTH(extracted_prompt))) as avg_len
        FROM bookmarks
        WHERE category = 'prompts'
          AND prompt_category LIKE 'video_%'
          AND detected_model IS NOT NULL
          AND detected_model != ''
          AND extracted_prompt IS NOT NULL
        GROUP BY detected_model
        HAVING COUNT(*) >= 10
        ORDER BY avg_len DESC
      `,
    ])

    const cameraMotion = cameraRows.map((r) => ({
      model: r.detected_model,
      cameraCount: Number(r.camera_count),
      total: Number(r.total),
      pct: Number(r.total) > 0 ? Math.round((Number(r.camera_count) / Number(r.total)) * 100) : 0,
    })).sort((a, b) => b.pct - a.pct)

    const promptLength = videoModelRows.map((r) => ({
      model: r.detected_model,
      avgLength: Number(r.avg_len),
    }))

    const headers = { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' }
    return NextResponse.json({ cameraMotion, promptLength }, { headers })
  } catch (err) {
    console.error('[/api/stats/insight]', err)
    return NextResponse.json({ cameraMotion: [], promptLength: [] })
  }
}
