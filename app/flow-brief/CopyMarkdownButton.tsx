'use client'

import { useState } from 'react'

// One-click copy of the brief's raw markdown — paste straight into a Google Doc,
// Slack, email, etc. Falls back to a hidden textarea + execCommand on older browsers.
export default function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(markdown)
      } else {
        const ta = document.createElement('textarea')
        ta.value = markdown
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (e.g. insecure context) — leave UI unchanged.
    }
  }

  return (
    <button type="button" onClick={copy} className="omni-copy-btn" aria-live="polite">
      <span className="omni-copy-ico" aria-hidden="true">{copied ? '✓' : '⧉'}</span>
      {copied ? 'Copied!' : 'Copy as Markdown'}
    </button>
  )
}
