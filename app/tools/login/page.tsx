'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ToolsLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => { inputRef.current?.focus() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const res = await fetch('/api/tools-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/tools')
    } else {
      setError(true)
      setPassword('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <form onSubmit={submit} className="flex flex-col gap-4 w-full max-w-xs">
        <div className="text-center mb-2">
          <p className="text-sm font-medium text-zinc-300">Tools</p>
          <p className="text-xs text-zinc-600 mt-1">Enter password to continue</p>
        </div>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false) }}
          placeholder="Password"
          className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white/3 text-white placeholder-zinc-600 outline-none transition-colors ${
            error
              ? 'border-red-500/50 focus:border-red-500/70'
              : 'border-white/8 focus:border-white/20'
          }`}
        />
        {error && <p className="text-xs text-red-400 text-center -mt-2">Incorrect password</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="rounded-xl bg-white/8 border border-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/12 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
