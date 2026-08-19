import type { Layer, StackCompany } from './data'
import { Logo } from './Logo'

// Each stack layer carries its own hue (validated light + dark, fixed order),
// so owned layers read as a connected spectrum — the more color, the deeper the
// vertical integration. Unowned layers are quiet dots, not gray bars.
const LAYERS: { key: Layer; label: string; fill: string; dot: string }[] = [
  { key: 'distribution', label: 'Distribution', fill: 'bg-sky-500 dark:bg-sky-600', dot: 'bg-sky-500 dark:bg-sky-600' },
  { key: 'application', label: 'Application', fill: 'bg-violet-500', dot: 'bg-violet-500' },
  { key: 'workflow', label: 'Workflow', fill: 'bg-pink-500', dot: 'bg-pink-500' },
  { key: 'model', label: 'Model', fill: 'bg-amber-500 dark:bg-amber-600', dot: 'bg-amber-500 dark:bg-amber-600' },
  { key: 'infrastructure', label: 'Infra', fill: 'bg-emerald-500 dark:bg-emerald-600', dot: 'bg-emerald-500 dark:bg-emerald-600' },
]

const GRID = 'grid grid-cols-[minmax(8rem,13rem)_1fr_2.5rem] gap-x-3 md:gap-x-4'

export default function StackBars({ companies }: { companies: StackCompany[] }) {
  const sorted = [...companies].sort((a, b) => b.layers.length - a.layers.length)
  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className="min-w-[640px] rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] overflow-hidden">
        <div className={`${GRID} items-center border-b border-black/[0.06] dark:border-white/[0.08] px-4 py-2.5`}>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Company
          </div>
          <div className="grid grid-cols-5">
            {LAYERS.map((l) => (
              <div
                key={l.key}
                className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400"
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${l.dot}`} />
                <span className="truncate">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            Owns
          </div>
        </div>
        {sorted.map((c, i) => (
          <div
            key={c.name}
            className={`${GRID} items-center px-4 py-2.5 ${
              i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-900 dark:text-white leading-tight">
                <Logo domain={c.domain} name={c.name} size={14} />
                <span className="truncate">{c.name}</span>
              </div>
              {c.note && (
                <div className="hidden md:block mt-0.5 text-[10.5px] leading-snug text-gray-400 dark:text-zinc-500">
                  {c.note}
                </div>
              )}
            </div>
            <div className="grid grid-cols-5">
              {LAYERS.map((l, j) => {
                const owned = c.layers.includes(l.key)
                const prevOwned = j > 0 && c.layers.includes(LAYERS[j - 1].key)
                const nextOwned = j < LAYERS.length - 1 && c.layers.includes(LAYERS[j + 1].key)
                return (
                  <div
                    key={l.key}
                    className="flex h-6 items-center"
                    title={`${c.name} — ${owned ? 'owns' : 'does not own'} ${l.label.toLowerCase()}`}
                  >
                    {owned ? (
                      <div
                        className={`h-3.5 w-full ${l.fill} ${prevOwned ? '' : 'rounded-l-full'} ${
                          nextOwned ? '' : 'rounded-r-full'
                        }`}
                        style={{ marginLeft: prevOwned ? 1 : 2, marginRight: nextOwned ? 1 : 2 }}
                      />
                    ) : (
                      <span className="mx-auto h-1 w-1 rounded-full bg-black/[0.12] dark:bg-white/[0.14]" />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="text-right font-mono text-[11px] tabular-nums leading-none">
              <span
                className={
                  c.layers.length === 5
                    ? 'font-bold text-violet-600 dark:text-violet-400'
                    : 'font-bold text-gray-900 dark:text-white'
                }
              >
                {c.layers.length}
              </span>
              <span className="text-gray-300 dark:text-zinc-600">/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
