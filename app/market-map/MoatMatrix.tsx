import type { MatrixRow, Risk } from './data'

const RISK_STYLES: Record<Risk, string> = {
  low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

export default function MoatMatrix({ rows }: { rows: MatrixRow[] }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className="min-w-[760px] rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] overflow-hidden">
        <div className="grid grid-cols-[8.5rem_1.1fr_6rem_1.1fr_1fr] text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/[0.08] px-4 py-2.5 gap-3">
          <div>Layer</div>
          <div>Current differentiation</div>
          <div>Commodit. risk</div>
          <div>Durability lever</div>
          <div>Where leverage settles</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.layer}
            className={`grid grid-cols-[8.5rem_1.1fr_6rem_1.1fr_1fr] px-4 py-3 text-xs gap-3 ${
              i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">{r.layer}</div>
            <div className="text-gray-600 dark:text-zinc-300 leading-relaxed">{r.differentiation}</div>
            <div>
              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${RISK_STYLES[r.risk]}`}>
                {r.risk}
              </span>
            </div>
            <div className="text-gray-600 dark:text-zinc-300 leading-relaxed">{r.durability}</div>
            <div className="text-gray-500 dark:text-zinc-400 leading-relaxed">{r.leverage}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
