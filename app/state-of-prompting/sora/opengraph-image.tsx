import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'Why Sora Shut Down'
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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              background: '#dc2626',
              color: 'white',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
            }}
          >
            Shutdown
          </div>
          <span style={{ color: '#71717a', fontSize: '16px' }}>March 24, 2026</span>
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
          Why Sora Shut Down
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '40px' }}>
          {[
            { stat: '$15M/day', label: 'inference cost' },
            { stat: '$2.1M', label: 'lifetime revenue' },
            { stat: '1%', label: '30-day retention' },
          ].map(({ stat, label }) => (
            <div key={stat} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: '#ef4444' }}>{stat}</span>
              <span style={{ fontSize: '16px', color: '#a1a1aa' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#3b82f6', fontSize: '18px' }}>&#10022;</span>
          <span style={{ color: '#71717a', fontSize: '18px' }}>prompts.ummerr.com / State of Prompting</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
