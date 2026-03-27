import type { Metadata } from 'next'
import Link from 'next/link'

const TITLE = 'Why Sora Shut Down — State of Prompting'
const DESCRIPTION =
  'On March 24, 2026, OpenAI shut down Sora entirely — app, API, and ChatGPT video. $15M/day inference costs, $2.1M lifetime revenue, 1% retention. Here\'s how it unraveled.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://prompts.ummerr.com/state-of-prompting/sora',
    siteName: 'prompts.ummerr.com',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const STATS = [
  { stat: '$15M/day', label: 'Estimated inference cost at peak' },
  { stat: '$2.1M', label: 'Total lifetime in-app revenue' },
  { stat: '\u221266%', label: 'Download drop Nov 2025 \u2192 Feb 2026' },
  { stat: '1%', label: '30-day user retention rate' },
]

const TIMELINE = [
  { date: 'Sep 2025', event: 'Sora launches publicly, wide press coverage', severity: 0 },
  { date: 'Nov 2025', event: 'Downloads peak at 3.3M \u2014 then start falling', severity: 1 },
  { date: 'Dec 2025', event: 'Deepfake scandals escalate; MLK Jr. and Robin Williams likenesses go viral without consent', severity: 2 },
  { date: 'Jan 2026', event: 'Internal teams describe GPU strain \u2014 "the chips are melting"', severity: 2 },
  { date: 'Mar 2026', event: '$1B Disney partnership collapses; Disney notified 30 minutes after a joint planning meeting', severity: 3 },
  { date: 'Mar 24, 2026', event: 'OpenAI announces full Sora shutdown \u2014 app, API, and ChatGPT video; team redirected to robotics world simulation', severity: 3 },
]

export default function SoraPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-5 py-10 md:py-16 flex flex-col gap-8">

        {/* Back link */}
        <Link
          href="/state-of-prompting#sora"
          className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1.5"
        >
          &larr; State of Prompting
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Why Sora Shut Down
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed max-w-xl">
            On March 24, 2026 &mdash; six months after its public launch &mdash; OpenAI announced the full shutdown of Sora: the consumer app, ChatGPT video generation, and the API. All of it.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ stat, label }) => (
            <div key={stat} className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-3 text-center">
              <div className="text-xl font-bold text-red-500 dark:text-red-400 leading-tight">{stat}</div>
              <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-snug">{label}</div>
            </div>
          ))}
        </div>

        {/* Context */}
        <p className="text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
          At its peak, Sora 2 was the only non-Google model in the T2V top 5 (ELO 1,367), but the economics were never close to working.
        </p>

        {/* Timeline */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 md:p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">How it unraveled</h2>
          <div className="relative">
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-400 via-red-400 to-red-600 dark:from-amber-500 dark:via-red-500 dark:to-red-700" />
            <div className="flex flex-col gap-4">
              {TIMELINE.map(({ date, event, severity }) => {
                const dotColor = severity === 0 ? 'bg-amber-400' : severity === 1 ? 'bg-orange-400' : severity === 2 ? 'bg-red-400' : 'bg-red-600'
                const isTerminal = severity === 3
                return (
                  <div key={date} className="flex gap-4 items-start pl-0 relative">
                    <div className={`relative z-10 shrink-0 mt-1.5 rounded-full ${dotColor} ${isTerminal ? 'w-3 h-3 -ml-[1px]' : 'w-[11px] h-[11px]'} ring-2 ring-white dark:ring-zinc-900`} />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[11px] font-mono font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{date}</span>
                      <span className={`text-xs leading-relaxed ${isTerminal ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-zinc-300'}`}>{event}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* The lesson */}
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 p-4">
          <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
            <span className="font-semibold">The lesson.</span> The model did not survive either &mdash; OpenAI is deprecating the API alongside the consumer app. The field consolidated around Google (Veo 3.1 dominates T2V), xAI (Grok leads I2V and Video Edit), and Kling/Seedance/Runway for specialized tasks. Building a consumer product around a capability that costs hundreds of dollars per clip doesn&apos;t work &mdash; and unlike other shutdowns, there&apos;s no API fallback this time.
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4 pt-2">
          <Link
            href="/state-of-prompting"
            className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
          >
            Read the full State of Prompting &rarr;
          </Link>
        </div>

      </div>
    </div>
  )
}
