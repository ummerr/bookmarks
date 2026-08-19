import type { Company, CompanyFacts, CompanyKind, ModelDependency, Verdict } from './data'
import { REPORT_DATE } from './data'
import { Logo } from './Logo'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_ABBR: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }

export function formatReportDate(): string {
  const [y, m, d] = REPORT_DATE.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`
}

// A fact dated "MMM YYYY" is stale if the end of that month is more than 90 days
// before REPORT_DATE. Anchored to REPORT_DATE (never Date.now()) so redeploys
// don't silently flip flags; unparseable dates are treated as not stale.
export function isStale(asOf: string): boolean {
  const [mon, yr] = asOf.split(' ')
  const m = MONTH_ABBR[mon]
  if (m === undefined || !yr) return false
  const endOfMonth = new Date(Number(yr), m + 1, 0).getTime()
  return new Date(REPORT_DATE).getTime() - endOfMonth > 90 * 86400000
}

export function Section({ title, eyebrow, takeaway, children, id }: {
  title: string
  eyebrow?: string
  // One-line executive skim layer, used sparingly on major sections only.
  takeaway?: string
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
        {takeaway && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500 dark:text-zinc-400 max-w-3xl">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-violet-500/80 mr-1.5">
              Takeaway
            </span>
            {takeaway}
          </p>
        )}
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

export const KIND_DOT: Record<CompanyKind, string> = {
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

export function FactsLine({ facts }: { facts: CompanyFacts }) {
  const segs: string[] = []
  if (facts.valuation) segs.push(`${facts.valuation} val`)
  if (facts.raised) segs.push(`${facts.raised} raised`)
  if (facts.arr) segs.push(facts.arr)
  if (facts.users) segs.push(facts.users)
  if (facts.investors?.length) {
    const extra = facts.investors.length - 3
    segs.push(facts.investors.slice(0, 3).join(', ') + (extra > 0 ? ` +${extra}` : ''))
  }
  if (segs.length === 0 && !facts.asOf) return null
  return (
    <div className="mt-1 text-[10.5px] leading-snug text-gray-400 dark:text-zinc-500 tabular-nums">
      {segs.join(' · ')}
      {facts.asOf && (
        <span
          className={isStale(facts.asOf) ? 'text-amber-500/80' : 'text-gray-300 dark:text-zinc-600'}
          title={isStale(facts.asOf) ? `Older than 90 days at publication (${formatReportDate()})` : undefined}
        >
          {segs.length > 0 && ' — '}as of {facts.asOf}
        </span>
      )}
      {facts.cite && <Cite id={facts.cite} />}
    </div>
  )
}

const STANCE_STYLES: Record<string, string> = {
  Durable: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/30',
  Fragile: 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-700/50 bg-red-50 dark:bg-red-950/30',
  Unproven: 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/30',
}

// "Durable — reason" / "Fragile — reason" / "Unproven — reason" → tier chip + reason.
export function ThesisLine({ thesis }: { thesis: string }) {
  const [stance, ...rest] = thesis.split(' — ')
  const reason = rest.join(' — ')
  const cls = STANCE_STYLES[stance]
  if (!cls || !reason) {
    return <div className="mt-1.5 text-[11px] font-medium text-gray-700 dark:text-zinc-300 leading-snug">{thesis}</div>
  }
  return (
    <div className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug">
      <span className={`inline-flex shrink-0 rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide border ${cls}`}>
        {stance}
      </span>
      <span className="font-medium text-gray-700 dark:text-zinc-300">{reason}</span>
    </div>
  )
}

export function CompanyChip({ name, kind, modelDependency, note, momentum, facts, domain, thesis, color }: Company & { color?: string }) {
  return (
    <div
      className="px-3 py-2"
      title={modelDependency ? `Models: ${DEP_LABELS[modelDependency]}` : undefined}
    >
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-800 dark:text-zinc-200 leading-none">
        <Logo domain={domain} name={name} size={14} color={color} />
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${KIND_DOT[kind]}`} />
        {name}
        {momentum && <span className="text-amber-500 text-[10px] leading-none">▲</span>}
      </div>
      {note && <div className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400 leading-snug">{note}</div>}
      {facts && <FactsLine facts={facts} />}
      <ThesisLine thesis={thesis} />
    </div>
  )
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500 dark:text-zinc-400">
      <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> startup</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-zinc-500" /> incumbent</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-pink-500" /> frontier lab</span>
      <span className="inline-flex items-center gap-1.5"><span className="text-amber-500 text-[10px]">▲</span> momentum 25</span>
      <span className="text-gray-400 dark:text-zinc-500">figures dated per entry · amber date = older than 90 days · Durable / Fragile / Unproven = our read on how each position holds up</span>
    </div>
  )
}

export function StatTile({ stat, label, cite }: { stat: string; label: string; cite?: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] p-4">
      <div className="font-mono text-lg md:text-xl font-bold tabular-nums text-gray-900 dark:text-white">{stat}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-400 dark:text-zinc-500 leading-snug">
        {label}
        {cite && <Cite id={cite} />}
      </div>
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
