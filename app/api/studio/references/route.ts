import { getReferences } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const refs = await getReferences()
  return NextResponse.json({
    references: refs.map(r => ({
      id: r.id,
      handle: r.author_handle,
      thumbnail: r.media_urls[0],
      mediaUrls: r.media_urls,
      refType: r.reference_type,
      artStyles: r.art_styles,
      extractedPrompt: r.extracted_prompt,
    })),
  })
}
