import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'The Real Prompts Dataset — prompts.ummerr.com'
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle radial glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,161,242,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#1DA1F2', fontSize: '22px' }}>✦</span>
            <span style={{ color: '#52525b', fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              prompts.ummerr.com
            </span>
          </div>

          {/* Main headline */}
          <div
            style={{
              color: '#ffffff',
              fontSize: '64px',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: '780px',
            }}
          >
            The prompts that actually work.
          </div>

          {/* Sub-headline */}
          <div style={{ color: '#71717a', fontSize: '22px', lineHeight: 1.4, maxWidth: '680px' }}>
            Hand-curated from practitioners who ship — not scraped, not synthetic.
            Tagged with model, technique, style, and reference requirements.
          </div>
        </div>

        {/* Bottom: stat pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {[
            { label: 'Real prompts', accent: true },
            { label: 'Text · Image · Video · Audio · 3D' },
            { label: 'Full taxonomy' },
            { label: 'Reference-aware' },
          ].map((pill) => (
            <div
              key={pill.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 20px',
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: pill.accent ? 700 : 500,
                background: pill.accent ? '#1DA1F2' : 'rgba(255,255,255,0.06)',
                border: pill.accent ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: pill.accent ? '#ffffff' : '#a1a1aa',
                letterSpacing: '0.01em',
              }}
            >
              {pill.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
