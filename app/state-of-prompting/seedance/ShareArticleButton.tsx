'use client'

import { useState } from 'react'

const URL = 'https://prompts.ummerr.com/state-of-prompting/seedance'
const TITLE = 'How Seedance Ate the Feed'
const TWEET = 'How Seedance ate the feed: Runway integration, CapCut rollout in 100+ countries, and the Tom Cruise deepfake that lit up Hollywood'

export default function ShareArticleButton() {
  const [shared, setShared] = useState(false)

  async function share() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: TITLE, url: URL })
        setShared(true)
        setTimeout(() => setShared(false), 2000)
        return
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(URL)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(TWEET)}&url=${encodeURIComponent(URL)}`

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={share}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
          shared
            ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30'
            : 'bg-black/[0.04] dark:bg-white/8 text-gray-600 dark:text-zinc-300 border-black/[0.08] dark:border-white/10 hover:bg-black/[0.08] dark:hover:bg-white/12'
        }`}
      >
        {shared ? (
          <><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Shared</>
        ) : (
          <><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>Share</>
        )}
      </button>
      <a
        href={tweetHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Post to X"
        title="Post to X"
        className="flex items-center justify-center rounded-lg p-1.5 transition-all border bg-black/[0.04] dark:bg-white/8 text-gray-600 dark:text-zinc-300 border-black/[0.08] dark:border-white/10 hover:bg-black/[0.08] dark:hover:bg-white/12"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
    </div>
  )
}
