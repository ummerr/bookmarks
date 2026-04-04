import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dataset — prompts.ummerr.com',
  description: 'Schema, limitations, BibTeX citation, and download links for the ummerr/prompts generative AI prompt dataset.',
  openGraph: {
    title: 'Dataset — prompts.ummerr.com',
    description: 'Schema, limitations, BibTeX citation, and download links for the ummerr/prompts generative AI prompt dataset.',
    url: 'https://prompts.ummerr.com/dataset',
    siteName: 'prompts.ummerr.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dataset — prompts.ummerr.com',
    description: 'Schema, limitations, BibTeX citation, and download links for the ummerr/prompts generative AI prompt dataset.',
  },
}

export default function DatasetLayout({ children }: { children: React.ReactNode }) {
  return children
}
