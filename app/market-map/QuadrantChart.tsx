import type { PositionedCompany } from './data'
import { KIND_DOT } from './components'
import { Logo } from './Logo'

// The thesis 2x2: model ownership (x) vs distribution ownership (y).
// Pure CSS positioning — no client JS. Positions are editorial judgments.
export default function QuadrantChart({ companies }: { companies: PositionedCompany[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="relative aspect-[4/3] min-w-[560px] rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111]">
          {/* inner plot area */}
          <div className="absolute inset-x-8 inset-y-9">
            {/* winning-quadrant wash */}
            <div className="absolute right-0 top-0 h-1/2 w-1/2 bg-violet-500/[0.04] rounded-tr-lg" />
            {/* center axes */}
            <div className="absolute left-1/2 inset-y-0 w-px bg-black/[0.07] dark:bg-white/[0.1]" />
            <div className="absolute top-1/2 inset-x-0 h-px bg-black/[0.07] dark:bg-white/[0.1]" />
            {/* quadrant captions */}
            <div className="absolute left-[52%] top-[44%] pl-2 text-[11px] italic text-gray-400 dark:text-zinc-500">
              Compounders — model + surface
            </div>
            <div className="absolute left-2 top-1.5 text-[11px] italic text-gray-400 dark:text-zinc-500">
              Surface owners renting models
            </div>
            <div className="absolute right-2 bottom-1.5 text-right text-[11px] italic text-gray-400 dark:text-zinc-500">
              Labs without a funnel — the melting quadrant
            </div>
            <div className="absolute left-2 bottom-1.5 text-[11px] italic text-gray-400 dark:text-zinc-500">
              The unowned middle
            </div>
            {/* companies */}
            {companies.map((c) => (
              <div
                key={c.name}
                className={`absolute flex items-center gap-1.5 ${c.labelSide === 'left' ? 'flex-row-reverse' : ''}`}
                style={{
                  left: `${c.x}%`,
                  bottom: `${c.y}%`,
                  transform: c.labelSide === 'left' ? 'translate(-100%, 50%)' : 'translate(-3px, 50%)',
                }}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${KIND_DOT[c.kind]}`} />
                <Logo domain={c.domain} name={c.name} size={14} />
                <span className="text-[11px] font-medium text-gray-700 dark:text-zinc-300 whitespace-nowrap leading-none">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
          {/* axis labels */}
          <div className="absolute bottom-1.5 left-8 text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            rents models
          </div>
          <div className="absolute bottom-1.5 right-8 text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            owns frontier models →
          </div>
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 whitespace-nowrap">
            owns distribution →
          </div>
        </div>
      </div>
      <p className="text-[12px] leading-relaxed text-gray-400 dark:text-zinc-500">
        Positions are editorial judgments, not measurements. Dot color follows the map legend
        (violet startup, gray incumbent, pink frontier lab).
      </p>
    </div>
  )
}
