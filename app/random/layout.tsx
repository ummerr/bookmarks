import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Random prompt — prompts.ummerr.com',
  description: 'A random curated AI prompt from the ummerr/prompts dataset.',
  alternates: { canonical: '/random' },
  robots: { index: false, follow: true },
}

export default function RandomLayout({ children }: { children: React.ReactNode }) {
  return children
}
