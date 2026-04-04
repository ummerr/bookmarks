'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const TARGET_MODELS = ['Midjourney', 'DALL-E', 'Imagen', 'Flux', 'Stable Diffusion'] as const
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

export default function ImageToPromptPage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [targetModel, setTargetModel] = useState<TargetModel>('Midjourney')
  const [result, setResult] = useState<PromptResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    // Vercel Hobby has a 4.5MB request body limit.
    // Resize large images client-side to stay safely under it.
    const MAX_DIMENSION = 2048
    const TARGET_SIZE = 3.5 * 1024 * 1024 // 3.5MB leaves room for form overhead

    if (file.size <= TARGET_SIZE) return file

    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()

    // Try quality levels until under target size
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
        setResult(data as unknown as PromptResult)
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
    if (fileInputRef.current) fileInputRef.current.value = ''
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
                  onClick={() => { setResult(null); setError(null); setCopied(false) }}
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
    </div>
  )
}
