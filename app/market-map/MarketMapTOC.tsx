'use client'

import { useEffect, useState } from 'react'
import type { SectionDef } from './data'

export default function MarketMapTOC({ sections }: { sections: SectionDef[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    if (typeof window === 'undefined' || sections.length === 0) return
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return

    // Track the section whose top is closest above the upper viewport line.
    const offset = 100 // px from top — keep in sync with scroll-mt-20 on sections
    let raf = 0
    const compute = () => {
      let current = targets[0].id
      for (const el of targets) {
        const rect = el.getBoundingClientRect()
        if (rect.top - offset <= 0) current = el.id
        else break
      }
      setActiveId(current)
      raf = 0
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [sections])

  const main = sections.filter((s) => s.tier !== 'appendix')
  const appendix = sections.filter((s) => s.tier === 'appendix')

  const link = (s: SectionDef, demoted: boolean) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      onClick={(e) => {
        e.preventDefault()
        document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
      className={`px-2 py-1 rounded-md transition-colors leading-snug ${demoted ? 'text-[11px]' : 'text-xs'} ${
        activeId === s.id
          ? 'text-gray-900 dark:text-white bg-black/[0.06] dark:bg-white/[0.08] font-medium'
          : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
      }`}
    >
      {s.label}
    </a>
  )

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2 px-2">
        On this page
      </p>
      {main.map((s) => link(s, false))}
      {appendix.length > 0 && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-300 dark:text-zinc-600 mt-3 mb-1 px-2">
            Appendix
          </p>
          {appendix.map((s) => link(s, true))}
        </>
      )}
    </nav>
  )
}
