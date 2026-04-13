import type { Metadata } from 'next'

const TITLE = 'Insights — prompts.ummerr.com'
const DESCRIPTION =
  'Charts and analysis on what kinds of AI prompts go viral: distribution by model, category, reference type, prompt length, and usage over time.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/insights' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://prompts.ummerr.com/insights',
    siteName: 'prompts.ummerr.com',
    type: 'website',
    images: [{ url: 'https://prompts.ummerr.com/insights/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: 'https://prompts.ummerr.com/insights/opengraph-image', width: 1200, height: 630 }],
  },
}

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children
}
