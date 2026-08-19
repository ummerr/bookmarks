import CopyLink from './CopyLink'

// Numbered figure shell: heavy top rule, FIG. NN eyebrow, one-line takeaway,
// a copy-link button for sharing, and an optional expandable notes section.
export default function Figure({
  id,
  num,
  title,
  takeaway,
  notes,
  children,
}: {
  id: string
  num: number
  title: string
  takeaway?: string
  notes?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <figure id={id} className="scroll-mt-20 m-0 flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-3 border-t-2 border-gray-900 dark:border-white pt-2.5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <a
              href={`#${id}`}
              className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
            >
              FIG. {String(num).padStart(2, '0')}
            </a>
            <span className="text-[14px] font-semibold text-gray-900 dark:text-white leading-snug">
              {title}
            </span>
          </div>
          {takeaway && (
            <p className="mt-1 text-[12.5px] leading-relaxed text-gray-500 dark:text-zinc-400 max-w-3xl">
              {takeaway}
            </p>
          )}
        </div>
        <CopyLink anchor={id} />
      </div>
      {children}
      {notes && (
        <details className="group rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] px-3.5 py-2">
          <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
            <span className="inline-block transition-transform group-open:rotate-90" aria-hidden>
              ▸
            </span>
            Notes, method &amp; sources
          </summary>
          <div className="pt-2 pb-1 text-[12px] leading-relaxed text-gray-500 dark:text-zinc-400 flex flex-col gap-2">
            {notes}
          </div>
        </details>
      )}
    </figure>
  )
}
