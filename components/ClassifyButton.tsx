'use client'

import { useState } from 'react'

interface ClassifyResult {
  classified: number
  total: number
  message?: string
  errors?: string[]
}

export default function ClassifyButton({ onDone }: { onDone?: () => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<ClassifyResult | null>(null)

  async function run() {
    setStatus('loading')
    setResult(null)

    try {
      const res = await fetch('/api/classify', { method: 'POST' })
      const data: ClassifyResult = await res.json()
      setResult(data)
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
            Classifying…
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

      {status === 'done' && result && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-zinc-400">
            {result.message
              ? result.message
              : `Classified ${result.classified} of ${result.total} bookmarks`}
          </p>
          {result.errors && result.errors.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-red-400 select-none">
                {result.errors.length} batch error{result.errors.length > 1 ? 's' : ''}
              </summary>
              <ul className="mt-1 flex flex-col gap-0.5 pl-2 border-l border-red-500/30">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-red-400/80 font-mono">{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-400">Classification failed. Check your API key.</p>
      )}
    </div>
  )
}
