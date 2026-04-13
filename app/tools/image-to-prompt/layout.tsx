import type { Metadata } from 'next'

const TITLE = 'Image → Prompt Tool | prompts.ummerr.com'
const DESCRIPTION =
  'Upload any image and get a copy-pasteable prompt broken down by subject, lighting, composition, and style. Optimized for Nano Banana, Midjourney, ChatGPT Image, and Grok Imagine.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/image-to-prompt' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://prompts.ummerr.com/tools/image-to-prompt',
    siteName: 'prompts.ummerr.com',
    type: 'website',
    images: [{ url: 'https://prompts.ummerr.com/tools/image-to-prompt/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: 'https://prompts.ummerr.com/tools/image-to-prompt/opengraph-image', width: 1200, height: 630 }],
  },
}

export default function ImageToPromptLayout({ children }: { children: React.ReactNode }) {
  return children
}
