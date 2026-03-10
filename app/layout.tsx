import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Nav from '@/components/Nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Prompts by ummerr',
  description: 'A curated collection of AI image, video, and text prompts — filterable by model, technique, and theme.',
  openGraph: {
    title: 'Prompts by ummerr',
    description: 'A curated collection of AI image, video, and text prompts — filterable by model, technique, and theme.',
    url: 'https://prompts.ummerr.com',
    siteName: 'prompts.ummerr.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Prompts by ummerr',
    description: 'A curated collection of AI image, video, and text prompts — filterable by model, technique, and theme.',
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
