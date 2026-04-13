import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Methodology — prompts.ummerr.com'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  const steps = [
    { label: 'Source', detail: 'Viral posts on X', color: '#f472b6' },
    { label: 'Filter', detail: 'Hand-review for authenticity', color: '#a78bfa' },
    { label: 'Classify', detail: 'Tiered Claude pipeline', color: '#60a5fa' },
    { label: 'Publish', detail: 'CC BY 4.0 dataset', color: '#34d399' },
  ]

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
        <div style={{ position: 'absolute', top: '-160px', right: '-80px', width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.22) 0%, transparent 65%)', display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <span style={{ color: '#1DA1F2', fontSize: '22px' }}>✦</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            prompts.ummerr.com / methodology
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <div style={{ color: '#ffffff', fontSize: '76px', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em' }}>
            How the dataset is built.
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', lineHeight: 1.5, maxWidth: '760px', fontWeight: 400 }}>
            Selection criteria, classification schema, and the tiered Claude pipeline that labels every prompt.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '12px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.color}33` }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: s.color, letterSpacing: '0.02em' }}>{s.label}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{s.detail}</span>
              </div>
              {i < steps.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '20px' }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
