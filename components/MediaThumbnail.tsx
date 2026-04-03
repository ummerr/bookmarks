'use client'

import { useState, memo } from 'react'

export default memo(function MediaThumbnail({ url, size = 20 }: { url: string; size?: number }) {
  const [hovered, setHovered] = useState(false)
  const px = size * 4 // Tailwind unit → px (h-20 = 80px, h-24 = 96px)

  return (
    <div
      className="relative shrink-0 group"
      style={{ width: px, height: px }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        loading="lazy"
        style={{ width: px, height: px }}
        className={`rounded-lg object-cover border border-white/8 cursor-zoom-in transition-opacity duration-150 ${hovered ? 'opacity-90' : ''}`}
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
})
