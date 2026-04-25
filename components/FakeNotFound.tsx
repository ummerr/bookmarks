'use client'

import { useEffect, useState } from 'react'

const CORNER_SIZE = 48

export default function FakeNotFound() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!dismissed) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [dismissed])

  function dismiss() {
    setDismissed(true)
  }

  if (dismissed) return null

  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    cursor: 'default',
    background: 'transparent',
  }

  return (
    <div
      className="fake-404 fixed inset-0 z-[10000] flex items-center justify-center"
      style={{
        background: '#fff',
        color: '#000',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 500,
            margin: 0,
            paddingRight: 23,
            borderRight: '1px solid rgba(0,0,0,.3)',
            lineHeight: '49px',
          }}
        >
          404
        </h1>
        <div style={{ display: 'inline-block' }}>
          <h2 style={{ fontSize: 14, fontWeight: 400, margin: 0, lineHeight: '49px' }}>
            This page could not be found.
          </h2>
        </div>
      </div>

      <button onClick={dismiss} aria-label="dismiss" style={{ ...cornerStyle, top: 0, left: 0 }} />
      <button onClick={dismiss} aria-label="dismiss" style={{ ...cornerStyle, top: 0, right: 0 }} />
      <button onClick={dismiss} aria-label="dismiss" style={{ ...cornerStyle, bottom: 0, left: 0 }} />
      <button onClick={dismiss} aria-label="dismiss" style={{ ...cornerStyle, bottom: 0, right: 0 }} />
    </div>
  )
}
