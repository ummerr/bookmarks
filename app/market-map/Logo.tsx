import { LOGO_DOMAINS } from './logos.generated'

// Self-hosted favicon (fetched by scripts/fetch-logos.ts) with a deterministic
// build-time monogram fallback — no client JS, no onError handler.
export function Logo({ domain, name, size = 14, color }: {
  domain?: string
  name: string
  size?: number
  color?: string
}) {
  if (domain && LOGO_DOMAINS.has(domain)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/logos/${domain}.png`}
        width={size}
        height={size}
        alt=""
        loading="lazy"
        decoding="async"
        className="rounded-[3px] shrink-0 dark:bg-white/90 dark:p-[1px]"
      />
    )
  }
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-[3px] shrink-0 font-semibold select-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.55),
        color: color ?? '#6b7280',
        background: color ? `${color}1f` : '#6b72801f',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
