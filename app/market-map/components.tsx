import type { CompanyKind, ModelDependency, Verdict } from './data'

export function Section({ title, eyebrow, children, id }: {
  title: string
  eyebrow?: string
  children: React.ReactNode
  id: string
}) {
  return (
    <div className="flex flex-col gap-6 scroll-mt-20" id={id}>
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500/70 mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-xl md:text-2xl text-gray-900 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

export function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-black/10 dark:border-white/15"
      style={color ? { color, borderColor: `${color}40`, background: `${color}12` } : undefined}
    >
      {children}
    </span>
  )
}

const VERDICT_STYLES: Record<Verdict, { label: string; cls: string }> = {
  'strongly-supported': {
    label: 'Strongly Supported',
    cls: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
  },
  supported: {
    label: 'Supported',
    cls: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/40',
  },
  unclear: {
    label: 'Unclear',
    cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
  },
  rejected: {
    label: 'Rejected',
    cls: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40',
  },
}

export function VerdictChip({ verdict }: { verdict: Verdict }) {
  const v = VERDICT_STYLES[verdict]
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap ${v.cls}`}>
      {v.label}
    </span>
  )
}

const KIND_DOT: Record<CompanyKind, string> = {
  startup: 'bg-violet-500',
  incumbent: 'bg-gray-400 dark:bg-zinc-500',
  lab: 'bg-pink-500',
}

const DEP_LABELS: Record<ModelDependency, string> = {
  'own-models': 'own models',
  'multi-model': 'multi-model',
  'partner-models': 'partner models',
  'open-weights': 'open weights',
}

export function CompanyChip({ name, kind, modelDependency, note, momentum }: {
  name: string
  kind: CompanyKind
  modelDependency?: ModelDependency
  note?: string
  momentum?: boolean
}) {
  const tooltip = [note, modelDependency ? `Models: ${DEP_LABELS[modelDependency]}` : null]
    .filter(Boolean)
    .join(' — ')
  return (
    <span
      title={tooltip || undefined}
      className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#161616] px-2 py-1 text-[12px] text-gray-700 dark:text-zinc-200 leading-none cursor-default"
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${KIND_DOT[kind]}`} />
      {name}
      {momentum && <span className="text-amber-500 text-[10px] leading-none">▲</span>}
    </span>
  )
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
      <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> startup</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-zinc-500" /> incumbent</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-pink-500" /> frontier lab</span>
      <span className="inline-flex items-center gap-1.5"><span className="text-amber-500 text-[10px]">▲</span> momentum 25</span>
      <span className="text-gray-400 dark:text-zinc-500">hover a chip for detail</span>
    </div>
  )
}

export function StatTile({ stat, label }: { stat: string; label: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] p-4">
      <div className="font-mono text-lg md:text-xl font-bold tabular-nums text-gray-900 dark:text-white">{stat}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-400 dark:text-zinc-500 leading-snug">{label}</div>
    </div>
  )
}

export function Callout({ children, tone = 'violet' }: { children: React.ReactNode; tone?: 'violet' | 'emerald' | 'amber' }) {
  const tones = {
    violet: 'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30',
    amber: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30',
  }
  return (
    <div className={`rounded-xl border p-4 md:p-5 text-[15px] leading-[1.75] text-gray-700 dark:text-zinc-200 ${tones[tone]}`}>
      {children}
    </div>
  )
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 text-[15px] leading-[1.75] text-gray-600 dark:text-zinc-300 [&_strong]:text-gray-900 dark:[&_strong]:text-white">
      {children}
    </div>
  )
}

export function Cite({ id }: { id: string }) {
  return (
    <sup>
      <a href={`#src-${id}`} className="text-[10px] text-violet-500/80 hover:text-violet-600 dark:hover:text-violet-400 no-underline px-0.5">
        [{id}]
      </a>
    </sup>
  )
}
