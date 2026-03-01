'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { parseUpload } from '@/lib/parser'
import ClassifyButton from '@/components/ClassifyButton'
import type { BookmarkInsert } from '@/lib/types'

interface IngestResult {
  inserted: number
  skipped: number
  total: number
  error?: string
}

type UploadStatus = 'idle' | 'parsing' | 'uploading' | 'done' | 'error'

export default function ImportPage() {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [result, setResult] = useState<IngestResult | null>(null)
  const [preview, setPreview] = useState<BookmarkInsert[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setStatus('parsing')
    setResult(null)
    setPreview([])

    const text = await file.text()
    let parsed: BookmarkInsert[]

    try {
      parsed = parseUpload(text, file.name)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setResult({ inserted: 0, skipped: 0, total: 0, error: 'Could not parse file. Check the format.' })
      return
    }

    if (parsed.length === 0) {
      setStatus('error')
      setResult({ inserted: 0, skipped: 0, total: 0, error: 'No bookmarks found in file.' })
      return
    }

    setPreview(parsed)
    setStatus('uploading')

    const res = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    })

    const data: IngestResult = await res.json()
    setResult(data)
    setStatus(res.ok ? 'done' : 'error')
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors mb-8 inline-flex items-center gap-1">
          ← Dashboard
        </Link>

        <h1 className="text-2xl font-semibold mt-4 mb-1">Import Bookmarks</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Upload a Twitter/X archive JSON or a CSV file with your bookmarks.
        </p>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-colors ${
            dragOver
              ? 'border-[#1DA1F2] bg-[#1DA1F2]/5'
              : 'border-white/10 hover:border-white/20 bg-white/2'
          }`}
        >
          <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div className="text-center">
            <p className="text-sm text-zinc-300">Drop your file here, or click to browse</p>
            <p className="text-xs text-zinc-600 mt-1">JSON (Twitter archive) or CSV</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Status */}
        {status === 'parsing' && (
          <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Parsing file…
          </div>
        )}

        {status === 'uploading' && (
          <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Uploading {preview.length} bookmarks to database…
          </div>
        )}

        {status === 'done' && result && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-sm font-medium text-green-400">Import complete</p>
            <ul className="mt-2 text-sm text-zinc-400 space-y-1">
              <li>✓ {result.inserted} new bookmarks added</li>
              <li className="text-zinc-600">⊘ {result.skipped} duplicates skipped</li>
              <li className="text-zinc-600">Total in file: {result.total}</li>
            </ul>
          </div>
        )}

        {status === 'error' && result && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-medium text-red-400">Import failed</p>
            <p className="text-sm text-zinc-400 mt-1">{result.error}</p>
          </div>
        )}

        {/* Classify section — shown once import is done */}
        {status === 'done' && result && result.inserted > 0 && (
          <div className="mt-8 rounded-xl border border-white/8 bg-white/3 p-5">
            <h2 className="text-sm font-medium text-white mb-1">Next step: Classify with AI</h2>
            <p className="text-xs text-zinc-500 mb-4">
              Run Claude Haiku on all unclassified bookmarks to sort them into categories.
            </p>
            <ClassifyButton />
          </div>
        )}

        {/* Format help */}
        <div className="mt-10 space-y-4">
          <h2 className="text-sm font-medium text-zinc-400">Supported formats</h2>

          <div className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-2">
            <p className="text-xs font-medium text-zinc-300">Twitter / X Archive (JSON)</p>
            <p className="text-xs text-zinc-500">
              Request your data from Settings → Privacy → Download an archive. The file is{' '}
              <code className="text-zinc-400">data/bookmarks.js</code> inside the archive.
            </p>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-2">
            <p className="text-xs font-medium text-zinc-300">CSV</p>
            <p className="text-xs text-zinc-500">
              Required columns: <code className="text-zinc-400">tweet_id</code>,{' '}
              <code className="text-zinc-400">tweet_text</code>,{' '}
              <code className="text-zinc-400">author_handle</code>,{' '}
              <code className="text-zinc-400">tweet_url</code>. Optional:{' '}
              <code className="text-zinc-400">author_name</code>,{' '}
              <code className="text-zinc-400">bookmarked_at</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
