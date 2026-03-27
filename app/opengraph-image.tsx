import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'The prompt dataset you cannot generate — prompts.ummerr.com'
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
            top: '-140px',
            right: '-140px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(29,161,242,0.14) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#1DA1F2', fontSize: '20px' }}>✦</span>
            <span style={{ color: '#3f3f46', fontSize: '15px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              prompts.ummerr.com
            </span>
          </div>

          {/* Main headline */}
          <div
            style={{
              color: '#ffffff',
              fontSize: '66px',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              maxWidth: '820px',
            }}
          >
            The prompt dataset you can't generate.
          </div>

          {/* Sub-headline */}
          <div style={{ color: '#71717a', fontSize: '21px', lineHeight: 1.5, maxWidth: '700px' }}>
            Practitioner-sourced. Hand-labelled. The real-world distribution
            that benchmarks don't capture — across text, image, video, audio, and 3D.
          </div>
        </div>

        {/* Bottom: label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {[
            { label: 'Non-synthetic', accent: true },
            { label: 'Multi-modal corpus' },
            { label: 'Model + technique labels' },
            { label: 'Reference-workflow aware' },
          ].map((pill) => (
            <div
              key={pill.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '9px 18px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: pill.accent ? 700 : 500,
                background: pill.accent ? '#1DA1F2' : 'rgba(255,255,255,0.05)',
                border: pill.accent ? 'none' : '1px solid rgba(255,255,255,0.09)',
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
