import type { Hypothesis } from './data'
import { VerdictChip } from './components'

export default function HypothesisCard({ h }: { h: Hypothesis }) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5 md:p-6 flex gap-5">
      <div className="font-mono text-lg font-bold tabular-nums shrink-0 leading-none mt-0.5 text-violet-500">
        {h.id}
      </div>
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
          <span className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug">
            {h.statement}
          </span>
          <VerdictChip verdict={h.verdict} />
        </div>
        <div className="text-[14px] text-gray-500 dark:text-zinc-400 leading-[1.75]">{h.rationale}</div>
      </div>
    </div>
  )
}
