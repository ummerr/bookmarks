'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/tools',          label: 'Admin' },
  { href: '/tools/searches', label: 'Discovery' },
  { href: '/tools/quality',  label: 'Quality' },
  { href: '/tools/review',   label: 'Reviewer' },
]

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a]">
      {/* Tab bar */}
      <div className="border-b border-black/[0.06] dark:border-white/6 bg-[#f7f6f3]/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mb-px">
            {TABS.map((tab) => {
              const active = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    active
                      ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
