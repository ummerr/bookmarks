'use client'

import { useState, useEffect } from 'react'
import type { CategoryCounts } from '@/lib/types'

interface ClassifyResult {
  classified: number
  total: number
  message?: string
  errors?: string[]
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h2>
      <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">{description}</p>
      {children}
    </div>
  )
}

function ResultLine({ result, errors }: { result: string; errors?: string[] }) {
  return (
    <div className="mt-3 text-xs text-gray-500 dark:text-zinc-400 flex flex-col gap-1">
      <span>{result}</span>
      {errors?.map((e, i) => (
        <span key={i} className="text-red-400/80 font-mono">{e}</span>
      ))}
    </div>
  )
}

export default function ToolsPage() {
  const [counts, setCounts] = useState<CategoryCounts | null>(null)
  const [unclassifiedPrompts, setUnclassifiedPrompts] = useState<number | null>(null)

  const [classifyingMain, setClassifyingMain] = useState(false)
  const [mainResult, setMainResult] = useState<string | null>(null)
  const [mainErrors, setMainErrors] = useState<string[]>([])

  const [classifyingPrompts, setClassifyingPrompts] = useState(false)
  const [promptsResult, setPromptsResult] = useState<string | null>(null)
  const [promptsErrors, setPromptsErrors] = useState<string[]>([])

  const [reclassifying, setReclassifying] = useState(false)
  const [reclassifyResult, setReclassifyResult] = useState<string | null>(null)
  const [reclassifyErrors, setReclassifyErrors] = useState<string[]>([])

  async function fetchCounts() {
    const [countsRes, promptsRes] = await Promise.all([
      fetch('/api/bookmarks/counts'),
      fetch('/api/prompts/classify'),
    ])
    if (countsRes.ok) setCounts(await countsRes.json())
    if (promptsRes.ok) {
      const d = await promptsRes.json()
      setUnclassifiedPrompts(d.unclassified)
    }
  }

  useEffect(() => { fetchCounts() }, [])

  async function runMainClassify() {
    setClassifyingMain(true)
    setMainResult(null)
    setMainErrors([])
    try {
      const res = await fetch('/api/classify', { method: 'POST' })
      const data: ClassifyResult = await res.json()
      setMainResult(data.message ?? `Classified ${data.classified} of ${data.total} bookmarks`)
      setMainErrors(data.errors ?? [])
      fetchCounts()
    } catch (err) {
      setMainResult(`Failed: ${String(err)}`)
    } finally {
      setClassifyingMain(false)
    }
  }

  async function runPromptClassify() {
    setClassifyingPrompts(true)
    setPromptsResult(null)
    setPromptsErrors([])
    try {
      const res = await fetch('/api/prompts/classify', { method: 'POST' })
      const data: ClassifyResult = await res.json()
      const base = data.message ?? `Classified ${data.classified} of ${data.total} prompts`
      setPromptsResult(base)
      setPromptsErrors(data.errors ?? [])
      fetchCounts()
    } catch (err) {
      setPromptsResult(`Failed: ${String(err)}`)
    } finally {
      setClassifyingPrompts(false)
    }
  }

  async function runReclassify() {
    setReclassifying(true)
    setReclassifyResult(null)
    setReclassifyErrors([])
    try {
      const res = await fetch('/api/prompts/reclassify', { method: 'POST' })
      const data: ClassifyResult = await res.json()
      setReclassifyResult(data.message ?? `Re-classified ${data.classified} of ${data.total} prompts`)
      setReclassifyErrors(data.errors ?? [])
      fetchCounts()
    } catch (err) {
      setReclassifyResult(`Failed: ${String(err)}`)
    } finally {
      setReclassifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Tools</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">AI classification and data management</p>
        </div>

        {/* Counts summary */}
        {counts && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total',        value: counts.all },
              { label: 'Pending AI',   value: counts.pending },
              { label: 'Prompts',      value: counts.prompts },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main classifier */}
        <Section
          title="Classify Bookmarks"
          description={`Run Sonnet on all unclassified bookmarks to sort them into Tech / Career / Prompts / Uncategorized. ${counts?.pending ?? '…'} pending.`}
        >
          <button
            onClick={runMainClassify}
            disabled={classifyingMain}
            className="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/90 px-4 py-2 text-sm font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-50 transition-colors"
          >
            {classifyingMain ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Classifying…
              </>
            ) : 'Run Classifier'}
          </button>
          {mainResult && <ResultLine result={mainResult} errors={mainErrors} />}
        </Section>

        {/* Prompt sub-classifier */}
        <Section
          title="Classify Prompts"
          description={`Run Sonnet on bookmarks tagged as Prompts to extract categories, themes, models, and reference image requirements. ${unclassifiedPrompts ?? '…'} unclassified.`}
        >
          <button
            onClick={runPromptClassify}
            disabled={classifyingPrompts}
            className="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/90 px-4 py-2 text-sm font-medium text-white hover:bg-[#1DA1F2] disabled:opacity-50 transition-colors"
          >
            {classifyingPrompts ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Classifying…
              </>
            ) : 'Run Prompt Classifier'}
          </button>
          {promptsResult && <ResultLine result={promptsResult} errors={promptsErrors} />}
        </Section>

        {/* Re-classify all */}
        <Section
          title="Re-classify All Prompts"
          description="Force re-run classification on every prompt — useful to backfill themes, art styles, or model data added since the last run."
        >
          <button
            onClick={runReclassify}
            disabled={reclassifying}
            className="flex items-center gap-2 rounded-lg bg-black/[0.06] dark:bg-white/8 border border-black/[0.1] dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-black/[0.1] dark:hover:bg-white/12 disabled:opacity-50 transition-colors"
          >
            {reclassifying ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Re-classifying…
              </>
            ) : 'Re-classify All'}
          </button>
          {reclassifyResult && <ResultLine result={reclassifyResult} errors={reclassifyErrors} />}
        </Section>

      </div>
    </div>
  )
}
