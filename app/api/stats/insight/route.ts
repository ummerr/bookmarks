import { NextResponse } from 'next/server'
import { getSql } from '@/lib/db'
import { modelToFamily } from '@/components/prompts/constants'

// Image-gen models to detect inside video prompts. Keys match the SQL column aliases.
const IMAGE_SOURCES: { key: string; label: string }[] = [
  { key: 'nano',       label: 'Nano Banana' },
  { key: 'midjourney', label: 'Midjourney' },
  { key: 'flux',       label: 'Flux' },
  { key: 'seedream',   label: 'Seedream' },
  { key: 'ideogram',   label: 'Ideogram' },
  { key: 'dalle',      label: 'DALL-E' },
  { key: 'chatgpt',    label: 'ChatGPT Image' },
  { key: 'imagen',     label: 'Imagen' },
  { key: 'firefly',    label: 'Firefly' },
  { key: 'leonardo',   label: 'Leonardo' },
  { key: 'sd',         label: 'Stable Diffusion' },
  { key: 'recraft',    label: 'Recraft' },
  { key: 'krea',       label: 'Krea' },
]

type PipelineRow = { detected_model: string | null; [k: string]: string | number | null }

export async function GET() {
  try {
    const sql = getSql()

    // Compare camera motion language across video models
    // Use SUM(CASE) instead of FILTER and ILIKE instead of regex for postgres.js compatibility
    const [cameraRows, videoModelRows, multiShotRows, pipelineRows] = await Promise.all([
      sql<{ detected_model: string; camera_count: string; total: string }[]>`
        SELECT
          detected_model,
          SUM(CASE WHEN
            LOWER(extracted_prompt) SIMILAR TO '%(camera|pan |panning|tilt|dolly|tracking shot|zoom|crane|gimbal|orbit|aerial|drone|steadicam|handheld|pov |close up|closeup|wide shot|medium shot)%'
          THEN 1 ELSE 0 END) as camera_count,
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
      sql<{ multi: string; total: string }[]>`
        SELECT
          SUM(CASE WHEN
            is_multi_shot_llm = true
            OR regexp_count(extracted_prompt, '\\[\\d+s(-\\d+s)?\\]', 1, 'i') >= 2
            OR regexp_count(extracted_prompt, '\\yshot\\s*\\d+', 1, 'i') >= 2
            OR regexp_count(extracted_prompt, '\\ycut\\s*\\d+', 1, 'i') >= 2
            OR regexp_count(extracted_prompt, '\\yscene\\s*\\d+', 1, 'i') >= 2
            OR regexp_count(extracted_prompt, '\\yclip\\s*\\d+', 1, 'i') >= 2
            OR extracted_prompt ~* '\\ymulti[-\\s]?(shot|scene|clip|cut)\\y'
          THEN 1 ELSE 0 END) as multi,
          COUNT(*) as total
        FROM bookmarks
        WHERE category = 'prompts'
          AND prompt_category LIKE 'video_%'
          AND extracted_prompt IS NOT NULL
      `,
      // Image-to-video pipeline detection: one row per video prompt with per-source match flags.
      // Searches extracted_prompt + tweet_text + thread_tweets because workflow ("first I made
      // this in Nano Banana, then animated with Veo") typically lives in the tweet body, not
      // the extracted prompt itself.
      sql<PipelineRow[]>`
        WITH video_corpus AS (
          SELECT
            detected_model,
            LOWER(
              COALESCE(extracted_prompt, '') || ' ' ||
              COALESCE(tweet_text, '') || ' ' ||
              COALESCE(thread_tweets::text, '')
            ) AS corpus
          FROM bookmarks
          WHERE category = 'prompts' AND prompt_category LIKE 'video_%'
        )
        SELECT
          detected_model,
          (CASE WHEN corpus LIKE '%nano banana%' OR corpus LIKE '%gemini%' THEN 1 ELSE 0 END)::int AS nano,
          (CASE WHEN corpus LIKE '%midjourney%' THEN 1 ELSE 0 END)::int AS midjourney,
          (CASE WHEN corpus LIKE '%flux%' THEN 1 ELSE 0 END)::int AS flux,
          (CASE WHEN corpus LIKE '%seedream%' THEN 1 ELSE 0 END)::int AS seedream,
          (CASE WHEN corpus LIKE '%ideogram%' THEN 1 ELSE 0 END)::int AS ideogram,
          (CASE WHEN corpus LIKE '%dall-e%' OR corpus LIKE '%dalle%' THEN 1 ELSE 0 END)::int AS dalle,
          (CASE WHEN corpus LIKE '%chatgpt%' OR corpus LIKE '%gpt-image%' OR corpus LIKE '%4o image%' THEN 1 ELSE 0 END)::int AS chatgpt,
          (CASE WHEN corpus LIKE '%imagen%' THEN 1 ELSE 0 END)::int AS imagen,
          (CASE WHEN corpus LIKE '%firefly%' THEN 1 ELSE 0 END)::int AS firefly,
          (CASE WHEN corpus LIKE '%leonardo%' THEN 1 ELSE 0 END)::int AS leonardo,
          (CASE WHEN corpus LIKE '%stable diffusion%' OR corpus LIKE '%sdxl%' THEN 1 ELSE 0 END)::int AS sd,
          (CASE WHEN corpus LIKE '%recraft%' THEN 1 ELSE 0 END)::int AS recraft,
          (CASE WHEN corpus LIKE '%krea%' THEN 1 ELSE 0 END)::int AS krea
        FROM video_corpus
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

    const msRow = multiShotRows[0]
    const msTotal = Number(msRow?.total ?? 0)
    const msMulti = Number(msRow?.multi ?? 0)
    const multiShot = {
      total: msTotal,
      multi: msMulti,
      pct: msTotal > 0 ? Math.round((msMulti / msTotal) * 100) : 0,
    }

    // Aggregate image → video pipelines. A prompt can cite multiple sources; we credit each.
    const totalVideo = pipelineRows.length
    let withAnySource = 0
    const bySource = new Map<string, number>()
    const pairingCounts = new Map<string, number>() // `${source}→${videoFamily}` → count
    for (const row of pipelineRows) {
      let matched = false
      const videoFamily = row.detected_model ? modelToFamily(row.detected_model) : null
      for (const src of IMAGE_SOURCES) {
        if (Number(row[src.key] ?? 0) > 0) {
          matched = true
          bySource.set(src.label, (bySource.get(src.label) ?? 0) + 1)
          // Skip self-pairings: Nano Banana classified as the video model is implausible
          // for a video prompt, but the text mention could still come from workflow notes.
          // We keep the source→model pair unless the two resolve to the same family.
          if (videoFamily && videoFamily !== src.label) {
            const key = `${src.label}→${videoFamily}`
            pairingCounts.set(key, (pairingCounts.get(key) ?? 0) + 1)
          }
        }
      }
      if (matched) withAnySource++
    }

    const bySourceList = Array.from(bySource.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)

    // Only surface pairings that appear at least twice — singles are noise.
    const topPairings = Array.from(pairingCounts.entries())
      .map(([key, count]) => {
        const [source, videoModel] = key.split('→')
        return { source, videoModel, count }
      })
      .filter((p) => p.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const refPipeline = {
      totalVideo,
      withAnySource,
      pct: totalVideo > 0 ? Math.round((withAnySource / totalVideo) * 100) : 0,
      bySource: bySourceList,
      topPairings,
    }

    const headers = { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' }
    return NextResponse.json({ cameraMotion, promptLength, multiShot, refPipeline }, { headers })
  } catch (err) {
    console.error('[/api/stats/insight]', err)
    return NextResponse.json({ cameraMotion: [], promptLength: [], multiShot: null, refPipeline: null })
  }
}
