import type { CompanyFinancials } from './data'
import { LOGO_DOMAINS } from './logos.generated'

// Latest valuation vs ARR, log-log, with 10x/30x/100x capital-to-revenue ratio guides.
// Single-hue marks; identity is carried by the direct label on every point.

const X_MIN = Math.log10(30) // $30M ARR
const X_MAX = Math.log10(1000) // $1B ARR
const Y_MIN = Math.log10(1000) // $1B valuation
const Y_MAX = Math.log10(20000) // $20B valuation
const PLOT = { left: 70, right: 610, top: 20, bottom: 370 }

const xs = (arrM: number) =>
  PLOT.left + ((Math.log10(arrM) - X_MIN) / (X_MAX - X_MIN)) * (PLOT.right - PLOT.left)
const ys = (valM: number) =>
  PLOT.bottom - ((Math.log10(valM) - Y_MIN) / (Y_MAX - Y_MIN)) * (PLOT.bottom - PLOT.top)

// Clip the valuation = k × ARR guide to the plot box.
function guide(k: number): { x1: number; y1: number; x2: number; y2: number } {
  const arrLo = Math.max(Math.pow(10, X_MIN), Math.pow(10, Y_MIN) / k)
  const arrHi = Math.min(Math.pow(10, X_MAX), Math.pow(10, Y_MAX) / k)
  return { x1: xs(arrLo), y1: ys(arrLo * k), x2: xs(arrHi), y2: ys(arrHi * k) }
}

const X_TICKS = [50, 100, 200, 500, 1000]
const Y_TICKS = [1000, 2000, 5000, 10000, 20000]
const LABEL_LEFT = new Set(['Higgsfield', 'Runway', 'Kling', 'ElevenLabs'])
// Vertical nudges to break ties (Suno and Higgsfield share the $5.4B line).
const LABEL_DY: Record<string, number> = { Higgsfield: -16 }

export default function ValuationScatter({ entries }: { entries: CompanyFinancials[] }) {
  const points = entries
    .filter((e) => e.valuationM)
    .map((e) => ({
      ...e,
      arrMidM: (e.arrLowM + (e.arrHighM ?? e.arrLowM)) / 2,
    }))
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <svg viewBox="0 0 640 420" className="min-w-[560px] w-full" role="img" aria-label="Latest valuation versus ARR, log-log scatter">
          {/* gridlines + ticks */}
          {X_TICKS.map((t) => (
            <g key={`x${t}`}>
              <line x1={xs(t)} y1={PLOT.top} x2={xs(t)} y2={PLOT.bottom} className="stroke-black/[0.05] dark:stroke-white/[0.07]" />
              <text x={xs(t)} y={PLOT.bottom + 16} textAnchor="middle" className="fill-gray-400 dark:fill-zinc-500 text-[10px] font-mono">
                {t >= 1000 ? '$1B' : `$${t}M`}
              </text>
            </g>
          ))}
          {Y_TICKS.map((t) => (
            <g key={`y${t}`}>
              <line x1={PLOT.left} y1={ys(t)} x2={PLOT.right} y2={ys(t)} className="stroke-black/[0.05] dark:stroke-white/[0.07]" />
              <text x={PLOT.left - 8} y={ys(t) + 3} textAnchor="end" className="fill-gray-400 dark:fill-zinc-500 text-[10px] font-mono">
                ${t / 1000}B
              </text>
            </g>
          ))}
          {/* multiple guides */}
          {[
            { k: 10, label: '10x', lx: 604, ly: guide(10).y2 - 8, anchor: 'end' as const },
            { k: 30, label: '30x', lx: guide(30).x2 + 4, ly: 30, anchor: 'start' as const },
            { k: 100, label: '100x', lx: guide(100).x2 + 4, ly: 14, anchor: 'start' as const },
          ].map(({ k, label, lx, ly, anchor }) => {
            const g = guide(k)
            return (
              <g key={k}>
                <line {...g} strokeDasharray="4 4" className="stroke-black/[0.12] dark:stroke-white/[0.16]" />
                <text x={lx} y={ly} textAnchor={anchor} className="fill-gray-400 dark:fill-zinc-500 text-[9px] font-mono">
                  {label}
                </text>
              </g>
            )
          })}
          {/* points */}
          {points.map((p) => {
            const cx = xs(p.arrMidM)
            const cy = ys(p.valuationM!)
            const left = LABEL_LEFT.has(p.name)
            const hasLogo = p.domain && LOGO_DOMAINS.has(p.domain)
            const lx = left ? cx - 10 : cx + 10
            const dy = LABEL_DY[p.name] ?? 0
            return (
              <g key={p.name}>
                {p.evidence === 'claimed' ? (
                  <circle cx={cx} cy={cy} r={5} strokeDasharray="2.5 2" strokeWidth={1.5} className="fill-white dark:fill-[#111] stroke-violet-500" />
                ) : (
                  <circle cx={cx} cy={cy} r={5} className={p.evidence === 'estimate' ? 'fill-violet-500/50' : 'fill-violet-500'} />
                )}
                {hasLogo && (
                  <image
                    href={`/logos/${p.domain}.png`}
                    x={left ? lx - 13 : lx}
                    y={cy - 6.5 + dy}
                    width={13}
                    height={13}
                  />
                )}
                <text
                  x={left ? lx - (hasLogo ? 17 : 0) : lx + (hasLogo ? 17 : 0)}
                  y={cy + 3.5 + dy}
                  textAnchor={left ? 'end' : 'start'}
                  className="fill-gray-700 dark:fill-zinc-300 text-[10.5px] font-medium"
                >
                  {p.name} · {p.valuationLabel}
                </text>
              </g>
            )
          })}
          {/* axis titles */}
          <text x={(PLOT.left + PLOT.right) / 2} y={412} textAnchor="middle" className="fill-gray-400 dark:fill-zinc-500 text-[10px] uppercase tracking-wider">
            ARR, $M · log scale
          </text>
          <text x={14} y={(PLOT.top + PLOT.bottom) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(PLOT.top + PLOT.bottom) / 2})`} className="fill-gray-400 dark:fill-zinc-500 text-[10px] uppercase tracking-wider">
            Latest valuation · log scale
          </text>
        </svg>
      </div>
    </div>
  )
}
