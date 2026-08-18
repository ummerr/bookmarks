import type { ControlPoint } from './data'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 text-[13px] leading-relaxed">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500 pt-0.5">
        {label}
      </div>
      <div className="text-gray-600 dark:text-zinc-300">{value}</div>
    </div>
  )
}

export default function ControlPointCard({ cp, number }: { cp: ControlPoint; number: number }) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5 md:p-6 flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-lg font-bold tabular-nums text-violet-500 leading-none">
          {String(number).padStart(2, '0')}
        </span>
        <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white leading-snug">{cp.title}</h3>
      </div>
      <p className="text-[14px] text-gray-600 dark:text-zinc-300 leading-[1.75]">{cp.why}</p>
      <div className="flex flex-col gap-2 border-t border-black/[0.05] dark:border-white/[0.06] pt-3">
        <Row label="Leads today" value={cp.leaders} />
        <Row label="Defensibility" value={cp.defensibility} />
        <Row label="Incumbent risk" value={cp.absorption} />
        <Row label="Commoditizer" value={cp.commoditization} />
        <Row label="Value pool" value={cp.valuePool} />
      </div>
    </div>
  )
}
