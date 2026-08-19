import type { Layer, StackCompany } from './data'
import { Logo } from './Logo'

const LAYERS: { key: Layer; label: string }[] = [
  { key: 'distribution', label: 'Distribution' },
  { key: 'application', label: 'Application' },
  { key: 'workflow', label: 'Workflow / Agent' },
  { key: 'model', label: 'Model' },
  { key: 'infrastructure', label: 'Infra / Compute' },
]

const KIND_FILL: Record<StackCompany['kind'], string> = {
  startup: 'bg-violet-500/70',
  incumbent: 'bg-gray-400/70 dark:bg-zinc-500/70',
  lab: 'bg-pink-500/70',
}

export default function StackBars({ companies }: { companies: StackCompany[] }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className="min-w-[640px] rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] overflow-hidden">
        <div className="grid grid-cols-[minmax(7rem,10rem)_repeat(5,1fr)] text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/[0.08] px-4 py-2.5 gap-1.5">
          <div>Company</div>
          {LAYERS.map((l) => (
            <div key={l.key} className="text-center">{l.label}</div>
          ))}
        </div>
        {companies.map((c, i) => (
          <div
            key={c.name}
            title={c.note}
            className={`grid grid-cols-[minmax(7rem,10rem)_repeat(5,1fr)] px-4 py-2 items-center gap-1.5 ${
              i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-900 dark:text-white min-w-0">
              <Logo domain={c.domain} name={c.name} size={14} />
              <span className="truncate">{c.name}</span>
            </div>
            {LAYERS.map((l) => (
              <div key={l.key} className="flex justify-center">
                <div
                  className={`h-3 w-full max-w-16 rounded-sm ${
                    c.layers.includes(l.key)
                      ? KIND_FILL[c.kind]
                      : 'bg-black/[0.04] dark:bg-white/[0.05]'
                  }`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
