import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Image → Prompt tool — prompts.ummerr.com'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
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
        <div style={{ position: 'absolute', top: '-150px', right: '-80px', width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,161,242,0.3) 0%, transparent 65%)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-120px', left: '-60px', width: '460px', height: '460px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 65%)', display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <span style={{ color: '#1DA1F2', fontSize: '22px' }}>✦</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
            prompts.ummerr.com / tools
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
          <div style={{ color: '#ffffff', fontSize: '84px', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', display: 'flex', flexDirection: 'column' }}>
            <span>Image <span style={{ color: '#60a5fa' }}>→</span> Prompt</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '26px', lineHeight: 1.5, maxWidth: '820px', fontWeight: 400 }}>
            Upload any image. Get a copy-pasteable prompt broken down by subject, lighting, composition, and style.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {['Nano Banana', 'Midjourney', 'ChatGPT Image', 'Grok Imagine'].map((m) => (
            <div key={m} style={{ display: 'flex', padding: '7px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.02em', fontFamily: 'monospace' }}>
              {m}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
