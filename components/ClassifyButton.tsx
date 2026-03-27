'use client'

import { useState } from 'react'

export default function ClassifyButton({ onDone }: { onDone?: () => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [classified, setClassified] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function run() {
    setStatus('loading')
    setClassified(0)
    setErrorMsg(null)

    try {
      let total = 0
      // Loop: each request classifies one batch, returns remaining count
      while (true) {
        const res = await fetch('/api/classify', { method: 'POST' })
        const data = await res.json()
        if (data.error) { setErrorMsg(data.error); break }
        total += data.classified ?? 0
        setClassified(total)
        if ((data.remaining ?? 0) === 0 || data.classified === 0) break
      }
      setStatus('done')
      onDone?.()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={run}
        disabled={status === 'loading'}
        className="flex items-center gap-2 rounded-lg bg-[#1DA1F2] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a94da] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Classifying… ({classified})
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.346.346a5.5 5.5 0 01-1.158 1.258c-.437.337-.688.843-.688 1.396v.346a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.346c0-.553-.251-1.059-.688-1.396a5.5 5.5 0 01-1.158-1.258l-.346-.346z" />
            </svg>
            Classify All with AI
          </>
        )}
      </button>

      {status === 'done' && (
        <p className="text-sm text-zinc-400">
          {classified === 0 ? 'Nothing to classify' : `Classified ${classified} bookmarks`}
        </p>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-400">{errorMsg ?? 'Classification failed. Check your API key.'}</p>
      )}
    </div>
  )
}
