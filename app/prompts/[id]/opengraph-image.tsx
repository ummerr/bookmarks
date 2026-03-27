import { ImageResponse } from 'next/og'
import { getBookmarkById } from '@/lib/db'

export const runtime = 'nodejs'
export const alt = 'AI Prompt'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CATEGORY_LABELS: Record<string, string> = {
  image_t2i: 'Text to Image',
  image_i2i: 'Image to Image',
  image_r2i: 'Reference to Image',
  image_character_ref: 'Character Ref',
  image_person: 'Person / Portrait',
  image_advertisement: 'Ad / Product',
  image_collage: 'Collage / Grid',
  image_inpainting: 'Inpainting',
  video_t2v: 'Text to Video',
  video_i2v: 'Image to Video',
  video_r2v: 'Reference to Video',
  video_v2v: 'Video to Video',
}

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bookmark = await getBookmarkById(id)

  const prompt = bookmark
    ? (bookmark.extracted_prompt ?? bookmark.tweet_text ?? '')
    : ''
  const truncated = prompt.length > 220 ? `${prompt.slice(0, 220).trimEnd()}…` : prompt
  const model = bookmark?.detected_model ?? null
  const category = bookmark?.prompt_category ? (CATEGORY_LABELS[bookmark.prompt_category] ?? null) : null
  const mediaUrl = bookmark?.media_urls?.[0] ?? null

  // Fetch image as base64 for embedding
  let imageData: string | null = null
  if (mediaUrl) {
    try {
      const res = await fetch(mediaUrl, { signal: AbortSignal.timeout(4000) })
      const buf = await res.arrayBuffer()
      const mime = res.headers.get('content-type') ?? 'image/jpeg'
      imageData = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`
    } catch {
      // skip
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#080810',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Left: prompt text panel */}
        <div
          style={{
            flex: imageData ? '0 0 680px' : '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 56px',
            position: 'relative',
          }}
        >
          {/* Gradient glow */}
          <div style={{ position: 'absolute', top: '-120px', left: '-80px', width: '440px', height: '440px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 65%)', display: 'flex' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <span style={{ color: '#1DA1F2', fontSize: '20px' }}>✦</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
              prompts.ummerr.com
            </span>
          </div>

          {/* Prompt text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', flex: 1, justifyContent: 'center', padding: '24px 0' }}>
            <div
              style={{
                color: 'rgba(255,255,255,0.88)',
                fontSize: truncated.length > 140 ? '20px' : '24px',
                lineHeight: 1.6,
                fontFamily: 'monospace',
                letterSpacing: '-0.01em',
                wordBreak: 'break-word' as const,
              }}
            >
              {truncated}
            </div>
          </div>

          {/* Footer tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', flexWrap: 'wrap' as const }}>
            {category && (
              <div style={{ display: 'flex', padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', letterSpacing: '0.02em' }}>
                {category}
              </div>
            )}
            {model && (
              <div style={{ display: 'flex', padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)' }}>
                {model}
              </div>
            )}
          </div>
        </div>

        {/* Right: image panel */}
        {imageData && (
          <div
            style={{
              flex: '1',
              display: 'flex',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Gradient overlay on left edge */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, #080810, transparent)', zIndex: 1, display: 'flex' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageData}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.9,
              }}
            />
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
