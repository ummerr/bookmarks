import type { Category } from './data'
import { CompanyChip, MapLegend } from './components'

export default function MarketMapGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-col gap-3">
      <MapLegend />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] overflow-hidden flex flex-col"
          >
            <div
              className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.06]"
              style={{ background: `${cat.color}0d` }}
            >
              <div className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight" style={{ color: cat.color }}>
                {cat.title}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-snug">{cat.jobToBeDone}</div>
            </div>
            <div className="py-1 divide-y divide-black/[0.04] dark:divide-white/[0.05]">
              {cat.companies.map((c) => (
                <CompanyChip key={c.name} {...c} color={cat.color} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
