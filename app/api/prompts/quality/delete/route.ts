import { NextResponse } from 'next/server'
import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | undefined
function getSql() {
  return (_sql ??= postgres(process.env.DATABASE_URL!, { ssl: 'require', connect_timeout: 8, prepare: false }))
}

const STRATEGY_CLAUSES: Record<string, string> = {
  too_short: `category = 'prompts' AND extracted_prompt IS NOT NULL AND LENGTH(extracted_prompt) < 20`,
  no_extraction: `category = 'prompts' AND extracted_prompt IS NULL`,
  no_category: `category = 'prompts' AND prompt_category IS NULL`,
  no_model: `category = 'prompts' AND (detected_model IS NULL OR detected_model = '')`,
  same_as_tweet: `category = 'prompts' AND extracted_prompt IS NOT NULL AND extracted_prompt = tweet_text`,
  low_confidence: `category = 'prompts' AND confidence < 0.5`,
  no_media: `category = 'prompts' AND (media_urls IS NULL OR media_urls::text = '[]' OR media_urls::text = 'null')`,
  foreign_language: `category = 'prompts' AND extracted_prompt ~ '[\u4e00-\u9fff\u3400-\u4dbf]'`,
}

export async function POST(request: Request) {
  try {
    const { strategy } = await request.json()

    if (!strategy || typeof strategy !== 'string') {
      return NextResponse.json({ error: 'Missing strategy' }, { status: 400 })
    }

    const sql = getSql()
    let deleted: number

    if (strategy === 'duplicates') {
      // Keep one copy (MIN ctid), delete the rest — only where duplicates exist
      const result = await sql.unsafe(`
        DELETE FROM bookmarks
        WHERE category = 'prompts'
          AND ctid NOT IN (
            SELECT MIN(ctid)
            FROM bookmarks
            WHERE category = 'prompts' AND extracted_prompt IS NOT NULL
            GROUP BY extracted_prompt
          )
          AND extracted_prompt IN (
            SELECT extracted_prompt
            FROM bookmarks
            WHERE category = 'prompts' AND extracted_prompt IS NOT NULL
            GROUP BY extracted_prompt
            HAVING COUNT(*) > 1
          )
      `)
      deleted = result.count
    } else {
      const clause = STRATEGY_CLAUSES[strategy]
      if (!clause) {
        return NextResponse.json({ error: `Unknown strategy: ${strategy}` }, { status: 400 })
      }
      const result = await sql.unsafe(`DELETE FROM bookmarks WHERE ${clause}`)
      deleted = result.count
    }

    return NextResponse.json({ deleted })
  } catch (err) {
    console.error('[/api/prompts/quality/delete]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
