'use client'

import { useEffect, useState } from 'react'

interface Heading { text: string; id: string }

export default function OmniTOC({ headings, variant }: { headings: Heading[]; variant: 'sidebar' | 'inline' }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')

  useEffect(() => {
    if (typeof window === 'undefined' || headings.length === 0) return
    const targets = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return

    // Track the heading whose top is closest above the upper viewport "line."
    const offset = 100 // px from top — keep in sync with scroll-margin-top in CSS
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
  }, [headings])

  if (variant === 'sidebar') {
    return (
      <ol className="omni-toc-list omni-toc-list-sidebar">
        {headings.map((hd, i) => {
          const isActive = hd.id === activeId
          return (
            <li key={hd.id} data-active={isActive ? 'true' : undefined}>
              <a href={`#${hd.id}`}>
                <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="toc-text">{hd.text}</span>
              </a>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className="omni-toc-list omni-toc-list-inline">
      {headings.map((hd, i) => {
        const isActive = hd.id === activeId
        return (
          <li key={hd.id} data-active={isActive ? 'true' : undefined}>
            <a href={`#${hd.id}`}>
              <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="toc-text">{hd.text}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}
