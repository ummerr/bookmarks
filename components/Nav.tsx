'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { href: '/prompts',             label: 'Prompts' },
  { href: '/datacard',            label: 'Datacard' },
  { href: '/random',              label: 'Random' },
  { href: '/state-of-prompting',  label: 'State of Prompting' },
  { href: '/tools',               label: 'Tools', secret: true },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-black/[0.08] dark:border-white/8 bg-[#f7f6f3]/90 dark:bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-3 md:gap-6 h-12">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white shrink-0">
          <span className="text-[#1DA1F2]">✦</span> ummerr
        </span>
        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                l.secret
                  ? 'text-[#f7f6f3] dark:text-[#0a0a0a] hover:text-[#f7f6f3] dark:hover:text-[#0a0a0a] cursor-default'
                  : pathname === l.href
                  ? 'bg-black/8 text-gray-900 dark:bg-white/10 dark:text-white'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </nav>
  )
}
