'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'site-unlocked'
const PASSWORD = 'chelsea'

export default function SiteGate() {
  const [unlocked, setUnlocked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        setUnlocked(true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!unlocked) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      inputRef.current?.focus()
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [mounted, unlocked])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim().toLowerCase() === PASSWORD) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true')
      } catch {}
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  if (unlocked) return null

  return (
    <div
      className="site-gate fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
      aria-modal="true"
      role="dialog"
    >
      <form onSubmit={submit} className="w-full max-w-sm">
        <label htmlFor="site-gate-input" className="block text-sm text-gray-600 dark:text-zinc-400 mb-3">
          Enter password to continue
        </label>
        <input
          ref={inputRef}
          id="site-gate-input"
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(false)
          }}
          autoFocus
          autoComplete="off"
          className="w-full rounded border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 text-black dark:text-white px-3 py-2 outline-none focus:border-black/30 dark:focus:border-white/30"
        />
        {error && (
          <p className="mt-2 text-sm text-red-500">Incorrect password</p>
        )}
      </form>
    </div>
  )
}
