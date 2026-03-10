import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Prompts curated by ummerr'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: logo + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#1DA1F2', fontSize: '24px' }}>✦</span>
            <span style={{ color: '#52525b', fontSize: '18px', letterSpacing: '0.05em' }}>prompts.ummerr.com</span>
          </div>
          <div style={{ color: '#ffffff', fontSize: '58px', fontWeight: 700, lineHeight: 1.1 }}>
            Prompts, curated by ummerr
          </div>
        </div>

        {/* Bottom: three feature cards */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            {
              title: 'Full-spectrum taxonomy',
              body: 'Spans every AI media type — text-to-image, video, audio, 3D, and LLM prompts — under one unified taxonomy.',
            },
            {
              title: 'Structurally rich',
              body: 'Every prompt tagged with technique, themes, art style, detected model, and reference requirements.',
            },
            {
              title: 'Reference-aware',
              body: 'Distinguishes reference-based workflows (IP-Adapter, face swap, img2img) from pure text prompts.',
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ color: '#e4e4e7', fontSize: '18px', fontWeight: 600 }}>{f.title}</div>
              <div style={{ color: '#71717a', fontSize: '15px', lineHeight: 1.5 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
