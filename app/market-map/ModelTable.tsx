import type { ModelGroup } from './data'

const OPENNESS_STYLES: Record<string, string> = {
  open: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  closed: 'bg-gray-500/10 text-gray-500 dark:text-zinc-400',
  hybrid: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

export default function ModelTable({ group }: { group: ModelGroup }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-zinc-400">
          {group.modality}
        </h3>
        {group.note && (
          <p className="text-[13px] text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">{group.note}</p>
        )}
      </div>
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[680px] rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] overflow-hidden">
          <div className="grid grid-cols-[9rem_7rem_5.5rem_1.4fr_1fr] text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/[0.08] px-4 py-2.5 gap-3">
            <div>Model</div>
            <div>Developer</div>
            <div>Weights</div>
            <div>Capability & control</div>
            <div>Pricing / adoption</div>
          </div>
          {group.entries.map((m, i) => (
            <div
              key={m.name}
              className={`grid grid-cols-[9rem_7rem_5.5rem_1.4fr_1fr] px-4 py-2.5 text-xs gap-3 ${
                i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {m.name}
                {m.flagship && <span className="ml-1.5 text-[10px] text-violet-500" title="category flagship">◆</span>}
              </div>
              <div className="text-gray-500 dark:text-zinc-400">{m.developer}</div>
              <div>
                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${OPENNESS_STYLES[m.openness]}`}>
                  {m.openness}
                </span>
              </div>
              <div className="text-gray-600 dark:text-zinc-300 leading-relaxed">{m.capability}</div>
              <div className="text-gray-500 dark:text-zinc-400 leading-relaxed">{m.pricing}{m.adoption ? ` · ${m.adoption}` : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
