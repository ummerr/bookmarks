import { NextResponse } from 'next/server'
import { insertManualPrompt, updatePromptExtraction } from '@/lib/db'
import { classifyPromptBatch } from '@/lib/classifier'

export async function POST(req: Request) {
  try {
    const { text, url, source_name } = await req.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const name = source_name?.trim() || (url ? new URL(url).hostname.replace('www.', '') : 'manual')
    const bookmark = await insertManualPrompt({ text: text.trim(), url: url?.trim() || '', source_name: name })

    // Auto-classify immediately
    try {
      const [result] = await classifyPromptBatch([{ id: bookmark.id, tweet_text: bookmark.tweet_text, thread_tweets: [] }])
      await updatePromptExtraction(bookmark.id, {
        prompt_category: result.prompt_category,
        extracted_prompt: result.extracted_prompt,
        detected_model: result.detected_model,
        prompt_themes: result.prompt_themes,
        art_styles: result.art_styles,
        requires_reference: result.requires_reference,
        reference_type: result.reference_type,
      })
      return NextResponse.json({ ...bookmark, ...result })
    } catch {
      // Classification failed — still return the saved bookmark
      return NextResponse.json(bookmark)
    }
  } catch (err) {
    console.error('[ADD]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
