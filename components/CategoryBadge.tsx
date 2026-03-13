import type { Category } from '@/lib/types'

const CONFIG: Record<Category, { label: string; className: string }> = {
  tech_ai_product: {
    label: 'Tech / AI',
    className: 'bg-blue-500/15 text-blue-600 ring-blue-500/20 dark:text-blue-400',
  },
  career_productivity: {
    label: 'Career',
    className: 'bg-green-500/15 text-green-600 ring-green-500/20 dark:text-green-400',
  },
  prompts: {
    label: 'Prompts',
    className: 'bg-purple-500/15 text-purple-600 ring-purple-500/20 dark:text-purple-400',
  },
  uncategorized: {
    label: 'Uncategorized',
    className: 'bg-zinc-500/15 text-zinc-600 ring-zinc-500/20 dark:text-zinc-400',
  },
}

export default function CategoryBadge({ category }: { category: Category }) {
  const { label, className } = CONFIG[category] ?? CONFIG.uncategorized
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  )
}
