import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Insights — prompts.ummerr.com'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  const bars = [0.85, 0.62, 0.48, 0.38, 0.3, 0.22, 0.18, 0.14, 0.11, 0.08]

  return new ImageResponse(
    (
      <div
        style={{
          background: '#080810',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-150px', left: '-80px', width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 65%)', display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <span style={{ color: '#1DA1F2', fontSize: '22px' }}>✦</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            prompts.ummerr.com / insights
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
          <div style={{ color: '#ffffff', fontSize: '80px', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', display: 'flex', flexDirection: 'column' }}>
            <span>What goes viral?</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '24px', lineHeight: 1.5, maxWidth: '780px', fontWeight: 400 }}>
            Distribution by model, category, reference type, prompt length, and usage over time.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', position: 'relative', height: '110px' }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h * 100}%`,
                background: `linear-gradient(to top, #7c3aed, #a78bfa)`,
                borderRadius: '4px',
                opacity: 0.85 - i * 0.05,
                display: 'flex',
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
