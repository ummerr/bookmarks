import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dataset — prompts.ummerr.com',
  description: 'Schema, limitations, BibTeX citation, and download links for the ummerr/prompts generative AI prompt dataset.',
  alternates: { canonical: '/dataset' },
  openGraph: {
    title: 'Dataset — prompts.ummerr.com',
    description: 'Schema, limitations, BibTeX citation, and download links for the ummerr/prompts generative AI prompt dataset.',
    url: 'https://prompts.ummerr.com/dataset',
    siteName: 'prompts.ummerr.com',
    type: 'website',
    images: [{ url: 'https://prompts.ummerr.com/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dataset — prompts.ummerr.com',
    description: 'Schema, limitations, BibTeX citation, and download links for the ummerr/prompts generative AI prompt dataset.',
    images: [{ url: 'https://prompts.ummerr.com/opengraph-image', width: 1200, height: 630 }],
  },
}

export default function DatasetLayout({ children }: { children: React.ReactNode }) {
  return children
}
