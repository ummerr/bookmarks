import { Fragment } from 'react'
import type { CompanyFinancials, Evidence } from './data'
import { Logo } from './Logo'

const EVIDENCE_STYLE: Record<Evidence, { cls: string; label: string }> = {
  audited: { cls: 'bg-violet-500', label: 'audited' },
  'company-stated': { cls: 'bg-violet-500/70', label: 'company-stated' },
  estimate: { cls: 'bg-violet-500/40', label: 'third-party estimate' },
  claimed: { cls: 'bg-violet-500/20 border border-dashed border-violet-500/60', label: 'claimed, unverified' },
}

// The $100M+ ARR club as horizontal bars. Single hue; the fill encodes evidence
// quality, and range entries get a lighter extension to the high end.
export default function ArrBars({ entries }: { entries: CompanyFinancials[] }) {
  const sorted = [...entries].sort(
    (a, b) => (b.arrLowM + (b.arrHighM ?? b.arrLowM)) / 2 - (a.arrLowM + (a.arrHighM ?? a.arrLowM)) / 2,
  )
  const max = Math.max(...sorted.map((e) => e.arrHighM ?? e.arrLowM))
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(6.5rem,10rem)_1fr] md:grid-cols-[minmax(6.5rem,10rem)_1fr_auto] items-center gap-x-3 gap-y-2.5">
        {sorted.map((e) => (
          <Fragment key={e.name}>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-800 dark:text-zinc-200 leading-tight min-w-0">
              <Logo domain={e.domain} name={e.name} size={14} />
              <span className="truncate" title={e.note}>{e.name}</span>
            </div>
            <div className="flex items-center h-3.5" aria-label={e.arrLabel}>
              <div
                className={`h-3.5 rounded-r-[4px] ${EVIDENCE_STYLE[e.evidence].cls}`}
                style={{ width: `${(e.arrLowM / max) * 100}%` }}
              />
              {e.arrHighM && (
                <div
                  className="h-3.5 rounded-r-[4px] bg-violet-500/15 -ml-px"
                  style={{ width: `${((e.arrHighM - e.arrLowM) / max) * 100}%` }}
                />
              )}
            </div>
            <div className="hidden md:block text-[11px] font-mono tabular-nums text-gray-500 dark:text-zinc-400 whitespace-nowrap">
              {e.arrLabel}
            </div>
            <div className="md:hidden col-span-2 -mt-2 text-[10.5px] font-mono tabular-nums text-gray-400 dark:text-zinc-500">
              {e.arrLabel}
            </div>
          </Fragment>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
        {(Object.keys(EVIDENCE_STYLE) as Evidence[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-4 rounded-[3px] ${EVIDENCE_STYLE[k].cls}`} />
            {EVIDENCE_STYLE[k].label}
          </span>
        ))}
      </div>
      <p className="text-[12px] leading-relaxed text-gray-400 dark:text-zinc-500">
        Annual recurring revenue, $M, as of the date on each entry in the map above. Canva (~$4B total ARR)
        is excluded — its revenue is not GenMedia-attributable and would break the scale. Lighter extensions
        mark estimate ranges (Runway, Midjourney).
      </p>
    </div>
  )
}
