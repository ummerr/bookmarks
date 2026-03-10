import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Prompts by ummerr'
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
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <span style={{ color: '#1DA1F2', fontSize: '28px' }}>✦</span>
          <span style={{ color: '#71717a', fontSize: '20px', letterSpacing: '0.05em' }}>prompts.ummerr.com</span>
        </div>

        {/* Title */}
        <div style={{ color: '#ffffff', fontSize: '64px', fontWeight: 700, lineHeight: 1.1, marginBottom: '32px' }}>
          Prompts by ummerr
        </div>

        {/* Description */}
        <div style={{ color: '#a1a1aa', fontSize: '26px', lineHeight: 1.5, maxWidth: '900px' }}>
          A hand-curated library of AI prompts from practitioners, artists, and researchers sharing their best work. Not scraped. Not synthetic. Real prompts that produced real results.
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '48px' }}>
          {['Image Generation', 'Video', 'LLM Prompts', 'Reference Workflows'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                padding: '8px 20px',
                color: '#d4d4d8',
                fontSize: '18px',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
