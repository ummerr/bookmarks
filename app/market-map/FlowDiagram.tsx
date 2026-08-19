import type { FlowData, FlowNode } from './data'
import { LOGO_DOMAINS } from './logos.generated'

// Aggregator flows: foundation models → aggregation/orchestration → output surfaces.
// Fixed-geometry SVG (no measurement, no JS); bands take the source node's color.

const NODE_W = 210
const NODE_H = 44
const COL_X = { models: 40, aggregators: 345, outputs: 650 } as const
const WEIGHT_STROKE = { 1: 3, 2: 6, 3: 10 } as const

function nodeY(col: keyof typeof COL_X, i: number): number {
  if (col === 'models') return 56 + i * 62
  if (col === 'aggregators') return 74 + i * 64
  return 92 + i * 90
}

function Node({ node, col, i }: { node: FlowNode; col: keyof typeof COL_X; i: number }) {
  const x = COL_X[col]
  const y = nodeY(col, i)
  const hasLogo = node.domain && LOGO_DOMAINS.has(node.domain)
  const textX = x + (hasLogo ? 34 : 14)
  return (
    <g>
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8} className="fill-white dark:fill-[#161616] stroke-black/[0.08] dark:stroke-white/[0.12]" />
      <rect x={x} y={y + 8} width={3} height={NODE_H - 16} rx={1.5} fill={node.color} />
      {hasLogo && <image href={`/logos/${node.domain}.png`} x={x + 12} y={y + 14} width={16} height={16} />}
      <text x={textX} y={y + 19} className="fill-gray-900 dark:fill-white text-[12px] font-medium">
        {node.label}
      </text>
      {node.sub && (
        <text x={textX} y={y + 33} className="fill-gray-400 dark:fill-zinc-500 text-[10px]">
          {node.sub}
        </text>
      )}
    </g>
  )
}

export default function FlowDiagram({ flow }: { flow: FlowData }) {
  const pos = new Map<string, { col: keyof typeof COL_X; i: number; color: string }>()
  flow.models.forEach((n, i) => pos.set(n.id, { col: 'models', i, color: n.color }))
  flow.aggregators.forEach((n, i) => pos.set(n.id, { col: 'aggregators', i, color: n.color }))
  flow.outputs.forEach((n, i) => pos.set(n.id, { col: 'outputs', i, color: n.color }))

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <svg viewBox="0 0 900 560" className="min-w-[760px] w-full" role="img" aria-label="Flow from foundation models through aggregators to output surfaces">
          {/* column headers */}
          <text x={COL_X.models + NODE_W / 2} y={32} textAnchor="middle" className="fill-gray-400 dark:fill-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
            Foundation models
          </text>
          <text x={COL_X.aggregators + NODE_W / 2} y={32} textAnchor="middle" className="fill-gray-400 dark:fill-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
            Aggregation &amp; orchestration
          </text>
          <text x={COL_X.outputs + NODE_W / 2} y={32} textAnchor="middle" className="fill-gray-400 dark:fill-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
            Where the output goes
          </text>
          {/* bands first, nodes on top */}
          {flow.links.map((l) => {
            const from = pos.get(l.from)
            const to = pos.get(l.to)
            if (!from || !to) return null
            const x1 = COL_X[from.col] + NODE_W
            const y1 = nodeY(from.col, from.i) + NODE_H / 2
            const x2 = COL_X[to.col]
            const y2 = nodeY(to.col, to.i) + NODE_H / 2
            const mx = (x1 + x2) / 2
            return (
              <path
                key={`${l.from}-${l.to}`}
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={from.color}
                strokeOpacity={0.25}
                strokeWidth={WEIGHT_STROKE[l.weight]}
                strokeLinecap="round"
              />
            )
          })}
          {flow.models.map((n, i) => <Node key={n.id} node={n} col="models" i={i} />)}
          {flow.aggregators.map((n, i) => <Node key={n.id} node={n} col="aggregators" i={i} />)}
          {flow.outputs.map((n, i) => <Node key={n.id} node={n} col="outputs" i={i} />)}
        </svg>
      </div>
      <p className="text-[12px] leading-relaxed text-gray-400 dark:text-zinc-500">
        Band width marks how load-bearing a connection is; band color follows the source. The heavy
        left-side bands are the point: the video shelf is majority-Chinese, and Western apps reach it
        through aggregators rather than one-by-one integrations. Pricing power sits at the two ends —
        frontier models and owned distribution — while the middle keeps margin only by adding
        workflow state (fal Agent, ComfyUI JSON, Soul ID) on top of routing.
      </p>
    </div>
  )
}
