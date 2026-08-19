// Schematic mechanism chart: where app-layer gross margin settles as inference
// cost deflates, under three readings of one unresolved variable — how fast
// competition passes the deflation through to credit prices. Zero client JS.
// Only the starting band is measured (Bessemer 50–60%, Feb 2026); the three
// paths are editorial geometry, not forecasts. Palette: emerald/sky/amber-600,
// validated light + dark; identity is never color-alone (dash pattern + direct
// labels + position).

// value % → y px. Plot band: v ∈ [20, 90] maps to y ∈ [30, 260].
const y = (v: number) => 30 + ((90 - v) * 230) / 70
const X0 = 60
const X1 = 470

const SCENARIOS = [
  {
    key: 'widens',
    cls: 'stroke-emerald-600',
    dash: undefined,
    path: `M ${X0} ${y(55)} C 220 ${y(55.5)}, 330 ${y(69)}, ${X1} ${y(75)}`,
    endY: y(75),
    label: 'Credit prices fall slower than costs',
    outcome: '→ keep-rate widens toward ~75%',
  },
  {
    key: 'holds',
    cls: 'stroke-sky-600',
    dash: '7 5',
    path: `M ${X0} ${y(55)} L ${X1} ${y(55)}`,
    endY: y(55),
    label: 'Prices fall in step with costs',
    outcome: '→ margin structure unchanged',
  },
  {
    key: 'competed',
    cls: 'stroke-amber-600',
    dash: '2 4',
    path: `M ${X0} ${y(55)} C 220 ${y(54.5)}, 330 ${y(41)}, ${X1} ${y(35)}`,
    endY: y(35),
    label: 'Deflation competed away in price',
    outcome: '→ compresses toward commodity',
  },
]

export default function MarginScenarios() {
  return (
    <div className="flex flex-col gap-2">
      {/* legend — line-style + hue per scenario, so identity survives CVD and print */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
        {SCENARIOS.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <svg width="22" height="6" viewBox="0 0 22 6" aria-hidden>
              <line x1="1" y1="3" x2="21" y2="3" strokeWidth="2" strokeDasharray={s.dash} className={s.cls} />
            </svg>
            {s.label.toLowerCase()}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[560px] rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] p-2">
          <svg viewBox="0 0 640 300" className="w-full" role="img" aria-label="Three schematic scenarios for app gross margin, 2026 to 2028">
            {/* gridlines + y labels */}
            {[25, 50, 75].map((v) => (
              <g key={v}>
                <line x1={X0 - 8} x2={X1} y1={y(v)} y2={y(v)} className="stroke-black/[0.06] dark:stroke-white/[0.08]" strokeWidth="1" />
                <text x={X0 - 14} y={y(v) + 3} textAnchor="end" className="fill-gray-400 dark:fill-zinc-500 text-[10px] font-mono">
                  {v}%
                </text>
              </g>
            ))}
            {/* measured starting band: 50–60% keep-rate */}
            <rect x={X0 - 5} y={y(60)} width="5" height={y(50) - y(60)} rx="2" className="fill-violet-500/60" />
            <text x={X0 + 4} y={y(31)} className="fill-gray-400 dark:fill-zinc-500 text-[10px]">
              today: apps on third-party models keep 50–60% after serving costs
            </text>
            {/* scenario paths */}
            {SCENARIOS.map((s) => (
              <path key={s.key} d={s.path} fill="none" strokeWidth="2" strokeLinecap="round" strokeDasharray={s.dash} className={s.cls} />
            ))}
            {/* direct end labels — ink tokens, identity carried by line proximity */}
            {SCENARIOS.map((s) => (
              <g key={s.key}>
                <text x={X1 + 8} y={s.endY - 2} className="fill-gray-700 dark:fill-zinc-300 text-[10.5px] font-medium">
                  {s.label}
                </text>
                <text x={X1 + 8} y={s.endY + 11} className="fill-gray-400 dark:fill-zinc-500 text-[10px]">
                  {s.outcome}
                </text>
              </g>
            ))}
            {/* x axis */}
            <line x1={X0 - 8} x2={X1} y1={y(20)} y2={y(20)} className="stroke-black/[0.1] dark:stroke-white/[0.14]" strokeWidth="1" />
            {(
              [
                [X0, 'Aug 2026', 'start'],
                [(X0 + X1) / 2, 'Aug 2027', 'middle'],
                [X1, 'Aug 2028', 'end'],
              ] as const
            ).map(([x, t, anchor]) => (
              <text key={t} x={x} y={y(20) + 16} textAnchor={anchor} className="fill-gray-400 dark:fill-zinc-500 text-[10px] font-mono">
                {t}
              </text>
            ))}
            <text x={X1} y={y(20) + 32} textAnchor="end" className="fill-gray-400 dark:fill-zinc-500 text-[10px] italic">
              schematic — driver held fixed at ~10x inference-cost decline per 18 months
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
