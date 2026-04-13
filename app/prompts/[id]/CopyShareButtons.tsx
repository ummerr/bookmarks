'use client'

import { useState } from 'react'

const BTN_BASE =
  'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border'
const BTN_IDLE =
  'bg-black/[0.04] dark:bg-white/8 text-gray-700 dark:text-white border-black/[0.1] dark:border-white/10 hover:bg-black/[0.08] dark:hover:bg-white/12 hover:border-black/[0.15] dark:hover:border-white/20'
const ICON_BTN_BASE =
  'flex items-center justify-center rounded-xl p-2.5 transition-all border'

export default function CopyShareButtons({ prompt, id }: { prompt: string; id: string }) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function shareLink() {
    const url = `${window.location.origin}/prompts/${id}`
    const title = 'AI prompt from prompts.ummerr.com'
    // Prefer the native share sheet on mobile / supporting browsers.
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        setShared(true)
        setTimeout(() => setShared(false), 2000)
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/prompts/${id}`
    : `https://prompts.ummerr.com/prompts/${id}`
  const tweetText = 'Curated AI prompt via @ummerr'
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={copyPrompt}
        className={`${BTN_BASE} ${
          copied
            ? 'bg-green-500/15 text-green-600 border-green-500/30'
            : BTN_IDLE
        }`}
      >
        {copied ? (
          <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied</>
        ) : (
          <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy prompt</>
        )}
      </button>

      <button
        onClick={shareLink}
        className={`${BTN_BASE} ${
          shared
            ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30'
            : BTN_IDLE
        }`}
      >
        {shared ? (
          <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Shared</>
        ) : (
          <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>Share</>
        )}
      </button>

      <a
        href={tweetHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Post to X"
        title="Post to X"
        className={`${ICON_BTN_BASE} ${BTN_IDLE}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
    </div>
  )
}
