import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Curated AI prompts gallery — prompts.ummerr.com'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function fetchTotal(): Promise<number> {
  try {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    const res = await fetch(`${base}/api/stats`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return data.total ?? 0
  } catch {
    return 0
  }
}

export default async function OGImage() {
  const total = await fetchTotal()
  const totalLabel = total ? `${total.toLocaleString()}+` : '500+'

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
        <div style={{ position: 'absolute', top: '-160px', left: '-80px', width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 65%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-140px', right: '-60px', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 65%)', display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <span style={{ color: '#1DA1F2', fontSize: '22px' }}>✦</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            prompts.ummerr.com / prompts
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
          <div style={{ color: '#ffffff', fontSize: '76px', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: '940px', display: 'flex', flexDirection: 'column' }}>
            <span>{totalLabel} curated prompts.</span>
            <span style={{ color: '#a78bfa' }}>Zero synthetic.</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '22px', lineHeight: 1.5, maxWidth: '760px', fontWeight: 400 }}>
            Filter by model, technique, theme. Every prompt hand-sourced from viral posts on X.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {[
            { label: 'Image Gen', bg: 'rgba(236,72,153,0.15)',  border: 'rgba(236,72,153,0.4)',  color: '#f9a8d4' },
            { label: 'Video Gen', bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.4)',  color: '#c4b5fd' },
            { label: 'Multi-shot', bg: 'rgba(29,161,242,0.15)', border: 'rgba(29,161,242,0.4)', color: '#93c5fd' },
            { label: 'References', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#fcd34d' },
          ].map((chip) => (
            <div key={chip.label} style={{ display: 'flex', padding: '7px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, background: chip.bg, border: `1px solid ${chip.border}`, color: chip.color, letterSpacing: '0.02em' }}>
              {chip.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
