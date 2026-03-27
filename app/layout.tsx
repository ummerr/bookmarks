import type { Metadata } from 'next'
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import Nav from '@/components/Nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const instrumentSerif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-serif' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

const TITLE = 'The most shared AI prompts on X — prompts.ummerr.com'
const DESCRIPTION =
  'A curated dataset of image and video generation prompts sourced from viral posts on X. Hand-labelled by model, technique, theme, and reference type. Zero synthetic prompts.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://prompts.ummerr.com',
    siteName: 'prompts.ummerr.com',
    type: 'website',
    images: [{ url: 'https://prompts.ummerr.com/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['https://prompts.ummerr.com/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {/* Prevent FOUC: read localStorage and apply dark class before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        <Nav />
        {children}
        <footer className="border-t border-black/[0.06] dark:border-white/[0.06] mt-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 dark:text-zinc-500">
            <div className="flex items-center gap-4">
              <span>CC BY 4.0</span>
              <span className="hidden sm:inline text-gray-300 dark:text-zinc-700">·</span>
              <span className="hidden sm:inline">Next.js + Supabase + Vercel</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://x.com/ummerr" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">@ummerr</a>
              <a href="https://github.com/ummerr" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
