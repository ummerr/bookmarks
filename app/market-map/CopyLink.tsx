'use client'

import { useState } from 'react'

// Copies a deep link to a figure anchor so any chart can be shared directly.
export default function CopyLink({ anchor }: { anchor: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${anchor}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.hash = anchor
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy a direct link to this figure"
      className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-black/[0.08] dark:border-white/[0.12] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700/60 transition-colors"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      {copied ? 'copied' : 'link'}
    </button>
  )
}
