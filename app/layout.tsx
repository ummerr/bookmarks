import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Nav from '@/components/Nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const DESCRIPTION =
  'A hand-curated library of AI prompts sourced from the people actually pushing these tools to their limits — practitioners, artists, and researchers sharing their best work on X. Not scraped. Not synthetic. Real prompts that produced real results.'

export const metadata: Metadata = {
  title: 'Prompts by ummerr',
  description: DESCRIPTION,
  openGraph: {
    title: 'Prompts by ummerr',
    description: DESCRIPTION,
    url: 'https://prompts.ummerr.com',
    siteName: 'prompts.ummerr.com',
    type: 'website',
    images: [{ url: 'https://prompts.ummerr.com/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompts by ummerr',
    description: DESCRIPTION,
    images: ['https://prompts.ummerr.com/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0a0a] text-white`}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
