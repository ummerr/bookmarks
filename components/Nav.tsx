'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/prompts', label: 'Prompts' },
  { href: '/random',  label: 'Random' },
  { href: '/stats',   label: 'Stats' },
  { href: '/bookmarks', label: 'Bookmarks' },
  { href: '/add',     label: 'Add' },
  { href: '/tools',   label: 'Tools', secret: true },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-white/8 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-3 md:gap-6 h-12">
        <span className="flex items-center gap-2 text-sm font-semibold text-white shrink-0">
          <span className="text-[#1DA1F2]">✦</span> ummerr
        </span>
        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                l.secret
                  ? 'text-[#0a0a0a] hover:text-[#0a0a0a] cursor-default'
                  : pathname === l.href
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
