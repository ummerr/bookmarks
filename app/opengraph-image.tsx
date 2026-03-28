import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'The most shared AI prompts on X - prompts.ummerr.com'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function fetchStats(): Promise<{ total: number; models: number; techniques: number }> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const res = await fetch(`${base}/api/stats`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return {
      total: data.total ?? 0,
      models: data.byModel?.length ?? 0,
      techniques: data.byCategory?.length ?? 0,
    }
  } catch {
    return { total: 0, models: 0, techniques: 0 }
  }
}

export default async function OGImage() {
  const stats = await fetchStats()

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
        {/* Gradient glows */}
        <div style={{ position: 'absolute', top: '-180px', left: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 65%)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '-80px', right: '-120px', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,161,242,0.3) 0%, transparent 65%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-160px', right: '80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 65%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '200px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 65%)', display: 'flex' }} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#1DA1F2', fontSize: '22px' }}>✦</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
              prompts.ummerr.com
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[
              { label: 'Image',  bg: 'rgba(236,72,153,0.15)',  border: 'rgba(236,72,153,0.4)',  color: '#f9a8d4' },
              { label: 'Video',  bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', color: '#c4b5fd' },
            ].map((chip) => (
              <div key={chip.label} style={{ display: 'flex', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, background: chip.bg, border: `1px solid ${chip.border}`, color: chip.color, letterSpacing: '0.02em' }}>
                {chip.label}
              </div>
            ))}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <div style={{ color: '#ffffff', fontSize: '72px', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: '880px' }}>
            The most shared<br />AI prompts on X.
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '22px', lineHeight: 1.5, maxWidth: '680px', fontWeight: 400 }}>
            Image and video generation prompts sourced from viral posts.
            Hand-labelled by model, technique, and theme.
          </div>
        </div>

        {/* Bottom stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0px', position: 'relative' }}>
          {[
            { value: stats.total ? `${stats.total.toLocaleString()}+` : '500+', label: 'prompts',           color: '#a78bfa' },
            { value: '0%',                                                       label: 'synthetic',         color: '#34d399' },
            { value: stats.techniques ? `${stats.techniques}` : '12',            label: 'techniques',        color: '#60a5fa' },
            { value: stats.models ? `${stats.models}+` : '20+',                  label: 'AI models tracked', color: '#f472b6' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
              {i > 0 && <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.08)', margin: '0 28px', display: 'flex' }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: stat.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{stat.value}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
