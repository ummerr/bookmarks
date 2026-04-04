'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const TARGET_MODELS = ['Nano Banana', 'Midjourney', 'ChatGPT Image', 'Grok Imagine'] as const
type TargetModel = (typeof TARGET_MODELS)[number]

const BREAKDOWN_LABELS: Record<string, string> = {
  subject: 'Subject',
  environment: 'Environment',
  lighting: 'Lighting',
  color_palette: 'Color Palette',
  texture_material: 'Texture & Material',
  composition: 'Composition',
  artistic_style: 'Artistic Style',
  mood_tone: 'Mood & Tone',
  camera_feel: 'Camera Feel',
}

interface PromptResult {
  prompt_fragment: string
  breakdown: Record<string, string>
}

// ── History ──────────────────────────────────────────────────────────────────

type HistoryEntry = {
  id: string
  targetModel: TargetModel
  result: PromptResult
  thumbnail: string // small data-URL
  timestamp: number
}

const STORAGE_KEY = 'img2prompt_history'
const MAX_HISTORY = 20

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)))
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

async function makeThumbnail(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const size = 80
  const scale = Math.min(size / bitmap.width, size / bitmap.height)
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.6 })
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

// ── History panel ────────────────────────────────────────────────────────────

function HistoryPanel({
  entries,
  activeId,
  onSelect,
  onDelete,
  onClear,
}: {
  entries: HistoryEntry[]
  activeId: string | null
  onSelect: (e: HistoryEntry) => void
  onDelete: (id: string) => void
  onClear: () => void
}) {
  if (entries.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
          History
        </p>
        <button
          onClick={onClear}
          className="text-[11px] text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {entries.map(entry => (
          <div
            key={entry.id}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
              activeId === entry.id
                ? 'bg-gray-900/5 dark:bg-white/5 border border-gray-900/10 dark:border-white/10'
                : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03] border border-transparent'
            }`}
            onClick={() => onSelect(entry)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.thumbnail}
              alt=""
              className="w-10 h-10 rounded-md object-cover shrink-0 border border-black/[0.06] dark:border-white/6"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-zinc-300 truncate">
                {entry.result.prompt_fragment.slice(0, 80)}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-zinc-600 mt-0.5">
                {entry.targetModel} · {timeAgo(entry.timestamp)}
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(entry.id) }}
              className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-all text-base leading-none"
              aria-label="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ImageToPromptPage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [targetModel, setTargetModel] = useState<TargetModel>('Nano Banana')
  const [result, setResult] = useState<PromptResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // Handle paste from clipboard
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) handleFile(file)
          break
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setImage(file)
    setResult(null)
    setError(null)
    setBreakdownOpen(false)
    setActiveId(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => setDragOver(false), [])

  async function compressImage(file: File): Promise<Blob> {
    const MAX_DIMENSION = 2048
    const TARGET_SIZE = 3.5 * 1024 * 1024

    if (file.size <= TARGET_SIZE) return file

    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()

    for (const quality of [0.85, 0.7, 0.5]) {
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality })
      if (blob.size <= TARGET_SIZE) return blob
    }
    return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.4 })
  }

  async function analyze() {
    if (!image) return
    setLoading(true)
    setError(null)
    setResult(null)
    setCopied(false)
    setActiveId(null)

    try {
      const compressed = await compressImage(image)
      const formData = new FormData()
      formData.append('image', compressed, image.name)
      formData.append('targetModel', targetModel)

      const res = await fetch('/api/tools/image-to-prompt', {
        method: 'POST',
        body: formData,
      })

      const text = await res.text()
      let data: Record<string, unknown>
      try {
        data = JSON.parse(text)
      } catch {
        setError(res.status === 413 ? 'Image too large. Try a smaller file.' : `Server error (${res.status})`)
        return
      }

      if (data.error) {
        setError(data.error as string)
      } else {
        const promptResult = data as unknown as PromptResult
        setResult(promptResult)

        // Auto-save to history
        const thumbnail = await makeThumbnail(image)
        const entry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          targetModel,
          result: promptResult,
          thumbnail,
          timestamp: Date.now(),
        }
        const next = [entry, ...history].slice(0, MAX_HISTORY)
        setHistory(next)
        setActiveId(entry.id)
        saveHistory(next)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  function copyPrompt() {
    if (!result) return
    navigator.clipboard.writeText(result.prompt_fragment)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function reset() {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setBreakdownOpen(false)
    setActiveId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function loadEntry(entry: HistoryEntry) {
    setResult(entry.result)
    setTargetModel(entry.targetModel)
    setPreview(entry.thumbnail)
    setImage(null)
    setActiveId(entry.id)
    setError(null)
    setBreakdownOpen(false)
    setCopied(false)
  }

  function deleteEntry(id: string) {
    const next = history.filter(e => e.id !== id)
    setHistory(next)
    saveHistory(next)
    if (activeId === id) setActiveId(null)
  }

  function clearHistory() {
    setHistory([])
    saveHistory([])
    setActiveId(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-gray-900 dark:text-white">Image to Prompt</h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
          Upload an image and get a copy-pasteable prompt that recreates its look and feel.
        </p>
      </div>

      {/* Model selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {TARGET_MODELS.map((model) => (
          <button
            key={model}
            onClick={() => setTargetModel(model)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              targetModel === model
                ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-black'
                : 'bg-black/[0.03] dark:bg-white/5 border-black/[0.08] dark:border-white/8 text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-500'
            }`}
          >
            {model}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      {!preview ? (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[240px] gap-3 ${
            dragOver
              ? 'border-gray-900 dark:border-white bg-gray-900/5 dark:bg-white/5'
              : 'border-black/[0.12] dark:border-white/10 hover:border-gray-400 dark:hover:border-zinc-500 bg-black/[0.02] dark:bg-white/[0.02]'
          }`}
        >
          <div className="text-3xl text-gray-300 dark:text-zinc-600">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <div className="text-sm text-gray-400 dark:text-zinc-500 text-center">
            <span className="font-medium text-gray-600 dark:text-zinc-300">Drop an image</span>, click to browse, or{' '}
            <span className="font-medium text-gray-600 dark:text-zinc-300">paste from clipboard</span>
          </div>
          <div className="text-xs text-gray-300 dark:text-zinc-600">JPEG, PNG, GIF, WebP up to 10MB</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Uploaded preview" className="w-full max-h-[400px] object-contain" />
          <button
            onClick={reset}
            className="absolute top-3 right-3 rounded-lg bg-black/60 dark:bg-white/20 backdrop-blur px-2.5 py-1.5 text-xs font-medium text-white hover:bg-black/80 dark:hover:bg-white/30 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Analyze button */}
      {image && !result && (
        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-5 py-3 text-sm font-medium text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {loading && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {loading ? 'Analyzing...' : `Generate ${targetModel} Prompt`}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200/60 dark:border-red-800/40 bg-red-50/50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Prompt output */}
      {result && (
        <div className="flex flex-col gap-4">
          {/* Main prompt card */}
          <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/6">
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                {targetModel} Prompt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setResult(null); setError(null); setCopied(false); setActiveId(null) }}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Re-analyze
                </button>
                <button
                  onClick={copyPrompt}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    copied
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="font-mono text-sm leading-relaxed text-gray-800 dark:text-zinc-200 whitespace-pre-wrap select-all">
                {result.prompt_fragment}
              </p>
            </div>
          </div>

          {/* Structured breakdown */}
          <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => setBreakdownOpen(!breakdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Structured Breakdown
              </span>
              <svg
                className={`h-4 w-4 text-gray-400 dark:text-zinc-500 transition-transform ${breakdownOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {breakdownOpen && (
              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-black/[0.06] dark:border-white/6 pt-3">
                {Object.entries(result.breakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
                      {BREAKDOWN_LABELS[key] || key}
                    </div>
                    <p className="font-mono text-xs leading-relaxed text-gray-600 dark:text-zinc-300">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      <HistoryPanel
        entries={history}
        activeId={activeId}
        onSelect={loadEntry}
        onDelete={deleteEntry}
        onClear={clearHistory}
      />
    </div>
  )
}
