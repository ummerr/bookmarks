import type { Metadata } from 'next'

const TITLE = 'Prompts — curated gallery | prompts.ummerr.com'
const DESCRIPTION =
  'Browse 500+ hand-curated image and video AI prompts sourced from viral posts on X. Filter by model, technique, and theme. Zero synthetic prompts.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/prompts' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://prompts.ummerr.com/prompts',
    siteName: 'prompts.ummerr.com',
    type: 'website',
    images: [{ url: 'https://prompts.ummerr.com/prompts/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: 'https://prompts.ummerr.com/prompts/opengraph-image', width: 1200, height: 630 }],
  },
}

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return children
}
