'use client'

import { useState } from 'react'

export default function MediaThumbnail({ url, size = 20 }: { url: string; size?: number }) {
  const [hovered, setHovered] = useState(false)
  const dim = `h-${size} w-${size}`

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className={`${dim} rounded-lg object-cover border border-white/8 cursor-zoom-in transition-opacity duration-150 ${hovered ? 'opacity-90' : ''}`}
      />
      {hovered && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 z-50 rounded-xl overflow-hidden border border-white/15 shadow-2xl shadow-black/60 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="max-w-[320px] max-h-[260px] object-contain bg-zinc-900"
          />
        </div>
      )}
    </div>
  )
}
