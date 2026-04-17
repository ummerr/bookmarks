import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'How Seedance Ate the Feed'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a14 50%, #0a0a0a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              background: '#10b981',
              color: 'white',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
            }}
          >
            Takeover
          </div>
          <span style={{ color: '#71717a', fontSize: '16px' }}>April 2026</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}
        >
          How Seedance Ate the Feed
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '40px' }}>
          {[
            { stat: '1.2M+', label: 'viral X views' },
            { stat: '100+', label: 'CapCut countries' },
            { stat: '5', label: 'studios, legal threats' },
          ].map(({ stat, label }) => (
            <div key={stat} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: '#10b981' }}>{stat}</span>
              <span style={{ fontSize: '16px', color: '#a1a1aa' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#8b5cf6', fontSize: '18px' }}>&#10022;</span>
          <span style={{ color: '#71717a', fontSize: '18px' }}>prompts.ummerr.com / State of Prompting</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
