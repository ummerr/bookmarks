import type { Metadata } from 'next'
import Link from 'next/link'
import ShareArticleButton from './ShareArticleButton'

const TITLE = 'How Seedance Ate the Feed - State of Prompting'
const DESCRIPTION =
  'In April 2026, Seedance 2.0 went from viral clip to default AI video model. Runway integration, CapCut rollout, and a Tom Cruise deepfake that lit up Hollywood. Here is how distribution beat benchmarks.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/state-of-prompting/seedance' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://prompts.ummerr.com/state-of-prompting/seedance',
    siteName: 'prompts.ummerr.com',
    type: 'article',
    images: [{ url: 'https://prompts.ummerr.com/state-of-prompting/seedance/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: 'https://prompts.ummerr.com/state-of-prompting/seedance/opengraph-image', width: 1200, height: 630 }],
  },
}

const STATS = [
  { stat: '1.2M+', label: 'Views on the Cruise\u2013Pitt clip (X)' },
  { stat: '100+', label: 'Countries in the CapCut rollout' },
  { stat: '$76\u201395', label: 'Runway Unlimited \u2014 per month' },
  { stat: '5', label: 'Hollywood studios with legal threats filed' },
]

const TIMELINE = [
  { date: 'Feb 2026', event: 'Seedance 2.0 launches - unified multimodal audio-video model; 1080p, native audio, multi-shot cuts, timestamp syntax', severity: 0, sourceUrl: 'https://seed.bytedance.com/en/seedance2_0' },
  { date: 'Feb 2026', event: 'Ruairi Robinson posts a two-line-prompt clip of \u201CTom Cruise\u201D fighting \u201CBrad Pitt\u201D on a rooftop; 1.2M+ views on X within days', severity: 1, sourceUrl: 'https://variety.com/2026/film/news/motion-picture-association-ai-seedance-bytedance-tom-cruise-1236661753/' },
  { date: 'Feb 2026', event: 'MPA sends a cease-and-desist to ByteDance\u2019s Culver City office, citing \u201Cmassive-scale\u201D copyright infringement', severity: 2, sourceUrl: 'https://www.hollywoodreporter.com/business/business-news/mpa-cease-and-desist-bytedance-seedance-2-0-1236510957/' },
  { date: 'Feb\u2013Mar 2026', event: 'Netflix, Warner Bros., Disney, Paramount, and Sony follow with individual legal threats to ByteDance', severity: 2, sourceUrl: 'https://variety.com/2026/film/news/motion-picture-association-bytedance-seedance-letter-1236668577/' },
  { date: 'Mar 2026', event: 'Seedance 1.5 Pro tops both the T2V and I2V leaderboards on Artificial Analysis', severity: 1, sourceUrl: 'https://artificialanalysis.ai/text-to-video/arena' },
  { date: 'Apr 5, 2026', event: 'Flova ships a Seedance 2.0 integration - the first major US-facing distribution partner', severity: 0 },
  { date: 'Apr 12, 2026', event: 'Seedance 2.0 lands on Runway with an Unlimited plan ($76\u201395/mo). \u201CThe viral AI model continues its takeover.\u201D', severity: 0, sourceUrl: 'https://www.mindstudio.ai/blog/seedance-2-runway-unlimited-plan-review' },
  { date: 'Apr 2026', event: 'CapCut rolls Seedance 2.0 out across 100+ countries - starting with Indonesia, Philippines, Thailand, Vietnam, Malaysia, Brazil, Mexico', severity: 0, sourceUrl: 'https://the-decoder.com/bytedance-rolls-out-seedance-2-0-to-100-countries-but-keeps-the-us-off-the-list/' },
]

export default function SeedancePage() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto px-5 py-10 md:py-16 flex flex-col gap-8">

        {/* Back link */}
        <Link
          href="/state-of-prompting#seedance"
          className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1.5"
        >
          &larr; State of Prompting
        </Link>

        {/* Title */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              How Seedance Ate the Feed
            </h1>
            <ShareArticleButton />
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed max-w-xl">
            In April 2026, Seedance 2.0 went from breakout model to default video layer. A viral clip lit the fuse in February &mdash; Runway, CapCut, and Flova detonated it in April.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ stat, label }) => (
            <div key={label} className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-3 text-center">
              <div className="text-xl font-bold text-emerald-500 dark:text-emerald-400 leading-tight">{stat}</div>
              <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-snug">{label}</div>
            </div>
          ))}
        </div>

        {/* Context */}
        <p className="text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
          The fastest way to win AI video in 2026 was not to top the leaderboard &mdash; Google already does that. It was to appear inside the tools creators already have open. In a single April week, Seedance 2.0 showed up in Runway, CapCut, and Flova. That&rsquo;s the story.
        </p>

        {/* Timeline */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 md:p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">How it spread</h2>
          <div className="relative">
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 dark:from-emerald-500 dark:via-emerald-600 dark:to-emerald-700" />
            <div className="flex flex-col gap-4">
              {TIMELINE.map(({ date, event, severity, sourceUrl }) => {
                const dotColor = severity === 0 ? 'bg-emerald-400' : severity === 1 ? 'bg-emerald-500' : 'bg-amber-400'
                return (
                  <div key={date + event} className="flex gap-4 items-start pl-0 relative">
                    <div className={`relative z-10 shrink-0 mt-1.5 rounded-full ${dotColor} w-[11px] h-[11px] ring-2 ring-white dark:ring-zinc-900`} />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[11px] font-mono font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{date}</span>
                      <span className="text-xs leading-relaxed text-gray-600 dark:text-zinc-300">
                        {event}
                        {sourceUrl && (
                          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-gray-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400"> &uarr;</a>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* What actually works - prompting */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5 md:p-6 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Why the prompts look different</h2>
          <p className="text-[13px] text-gray-600 dark:text-zinc-300 leading-relaxed">
            Seedance&rsquo;s native multi-shot is why creators switched workflows, not just models. Bracketed timestamps (<code className="text-[11px] bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">[0s]</code>, <code className="text-[11px] bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">[5s]</code>) and the <code className="text-[11px] bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">Shot switch</code> marker let one prompt produce an edited sequence instead of a single clip. Reference images carry the identity; the text describes forces and transitions.
          </p>
          <pre className="text-[11px] font-mono text-gray-700 dark:text-zinc-200 leading-[1.7] whitespace-pre-wrap bg-black/[0.02] dark:bg-white/[0.02] rounded-md p-3">{`[0s]: Wide shot - character enters a dimly
lit cafe, looking around curiously.

[Shot switch]

[5s]: Medium - sitting down, ordering coffee
with a warm smile. Warm golden lighting.`}</pre>
        </div>

        {/* The lesson */}
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 p-4">
          <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
            <span className="font-semibold">The lesson.</span> Distribution beat benchmarks. The model that dominated April wasn&rsquo;t the one with the highest T2V ELO &mdash; it was the one that showed up inside Runway, CapCut, and Flova in the same month. The legal cloud is real (five studios, MPA cease-and-desist, ongoing training-data fight), but creators voted with the tools in front of them.
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
