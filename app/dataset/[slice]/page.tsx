import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DATASET_SLICES, DATASET_SLICE_KEYS, isDatasetSlice, type DatasetSlice } from '@/lib/datasetSlices'
import { SCHEMA_FIELDS } from '@/lib/datasetSchema'
import SliceStats from './SliceStats'

export function generateStaticParams() {
  return DATASET_SLICE_KEYS.map((slice) => ({ slice }))
}

export function generateMetadata({ params }: { params: { slice: string } }) {
  if (!isDatasetSlice(params.slice)) return {}
  const meta = DATASET_SLICES[params.slice]
  return {
    title: `${meta.longLabel} (${meta.shortLabel}) — ummerr/prompts`,
    description: meta.description,
  }
}

export default function SlicePage({ params }: { params: { slice: string } }) {
  if (!isDatasetSlice(params.slice)) notFound()
  const slice: DatasetSlice = params.slice
  const meta = DATASET_SLICES[slice]

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-10">

        {/* Breadcrumb ────────────────────────────────────────────────────── */}
        <div className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-2">
          <Link href="/dataset" className="hover:text-gray-700 dark:hover:text-zinc-300">Dataset</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-zinc-300">{meta.shortLabel}</span>
        </div>

        {/* Hero ─────────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border bg-white dark:bg-[#111] p-6 md:p-8 flex flex-col gap-5"
          style={{ borderColor: `${meta.color}30` }}
        >
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
              style={{ color: meta.color, borderColor: `${meta.color}40`, background: `${meta.color}12` }}
            >
              Sub-dataset · {meta.shortLabel}
            </span>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-emerald-500/40 text-emerald-500 bg-emerald-500/10">
              CC BY 4.0
            </span>
          </div>

          <div>
            <h1 className="font-serif text-2xl md:text-3xl tracking-tight" style={{ color: meta.color }}>
              {meta.longLabel}
            </h1>
            <p className="mt-3 text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.7] max-w-2xl">
              {meta.description}
            </p>
            <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500 font-mono">
              Filter: {meta.rule}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-black/[0.06] dark:border-white/6">
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { format: 'jsonl', label: 'JSONL' },
                { format: 'csv',   label: 'CSV' },
                { format: 'json',  label: 'JSON' },
              ].map(({ format, label }) => (
                <a
                  key={format}
                  href={`/api/prompts/download?slice=${slice}&format=${format}`}
                  className="rounded-lg bg-black/[0.05] dark:bg-white/[0.05] px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-colors"
                >
                  Download {label}
                </a>
              ))}
              <span className="text-[11px] text-gray-400 dark:text-zinc-600">
                cite as ummerr/prompts ({meta.shortLabel})
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <a
                href={`/api/prompts/download?slice=${slice}&format=jsonl&variant=research`}
                className="self-start rounded-lg border border-black/[0.12] dark:border-white/[0.12] bg-transparent px-4 py-2 text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
              >
                Download Research Export (JSONL)
              </a>
              <span className="text-[11px] text-gray-400 dark:text-zinc-600 leading-relaxed max-w-xl">
                PII-stripped for X/Twitter ToS and GDPR compliance. Rehydrate via tweet_id.
              </span>
            </div>
          </div>
        </div>

        {/* Live stats (client component) ─────────────────────────────────── */}
        <SliceStats slice={slice} color={meta.color} />

        {/* Relationship to master dataset ────────────────────────────────── */}
        <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5 flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-zinc-500">
            About this slice
          </h2>
          <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            This is a filtered view of the{' '}
            <Link href="/dataset" className="text-violet-500 dark:text-violet-400 hover:underline">
              ummerr/prompts
            </Link>{' '}
            master dataset. All rows, fields, and classifications are preserved identically — only the
            row selection differs. Every record here also appears in the master download.
          </p>
          <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            For methodology, limitations, benchmarks, and citation details, see the{' '}
            <Link href="/dataset" className="text-violet-500 dark:text-violet-400 hover:underline">
              master datacard
            </Link>
            .
          </p>
        </div>

        {/* Schema ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
            Schema
          </h2>
          <div className="rounded-xl border border-black/[0.08] dark:border-white/8 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/[0.08] dark:border-white/8 bg-black/[0.03] dark:bg-white/[0.03]">
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400">Field</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400 hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400 hidden md:table-cell">Nullable</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 dark:text-zinc-400">Description</th>
                </tr>
              </thead>
              <tbody>
                {SCHEMA_FIELDS.map((f, i) => (
                  <tr
                    key={f.field}
                    className={`border-b border-black/[0.04] dark:border-white/4 last:border-0 ${
                      i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-[11px] text-gray-800 dark:text-zinc-200 whitespace-nowrap">{f.field}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-violet-500 dark:text-violet-400 whitespace-nowrap hidden sm:table-cell">{f.type}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      {f.nullable ? (
                        <span className="text-gray-400 dark:text-zinc-600">yes</span>
                      ) : (
                        <span className="text-emerald-500">no</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-zinc-400 leading-relaxed">{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Other sub-datasets ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
            Other sub-datasets
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DATASET_SLICE_KEYS.filter((k) => k !== slice).map((k) => {
              const m = DATASET_SLICES[k]
              return (
                <Link
                  key={k}
                  href={`/dataset/${k}`}
                  className="rounded-xl border bg-white dark:bg-[#111] p-4 flex flex-col gap-1 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: `${m.color}30` }}
                >
                  <span className="font-mono text-xs font-bold" style={{ color: m.color }}>{m.shortLabel}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{m.longLabel}</span>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
