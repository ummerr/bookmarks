'use client'

import { useState, useEffect } from 'react'

interface StatsData {
  total: number
  withReference: number
  withTheme: number
  byCategory: { label: string; value: number }[]
  byModel: { label: string; value: number }[]
}

const NAV_SECTIONS = [
  { id: 'findings',            label: 'Key Findings' },
  { id: 'references',         label: 'The Reference Shift' },
  { id: 'templates',          label: 'Templates' },
  { id: 'prompt-engineering', label: 'Prompt Engineering' },
  { id: 'context-engineering', label: 'Context Engineering' },
  { id: 'autonomy',           label: 'How Much Autonomy?' },
  { id: 'skills',             label: 'Skills' },
  { id: 'mcp',                label: 'MCP' },
  { id: 'video',              label: 'Video Prompting' },
  { id: 'multimodal',         label: 'Multimodal' },
  { id: 'practitioners',      label: 'Takeaways' },
  { id: 'sources',            label: 'Sources' },
]

function SectionNav({ activeId }: { activeId: string }) {
  return (
    <nav className="flex flex-col gap-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2 px-2">
        On this page
      </p>
      {NAV_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className={`text-xs px-2 py-1 rounded-md transition-colors leading-snug ${
            activeId === s.id
              ? 'text-gray-900 dark:text-white bg-black/[0.06] dark:bg-white/[0.08] font-medium'
              : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
          }`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={color ? { color, borderColor: `${color}40`, background: `${color}12` } : undefined}
    >
      {children}
    </span>
  )
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div className="flex flex-col gap-4 scroll-mt-20" id={id}>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight border-b border-black/[0.06] dark:border-white/6 pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Insight({ quote, source, color = '#1DA1F2' }: { quote: string; source: string; color?: string }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-[#111] p-5" style={{ borderColor: `${color}30` }}>
      <p className="text-sm text-gray-700 dark:text-zinc-200 leading-relaxed italic">"{quote}"</p>
      <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">{source}</p>
    </div>
  )
}

function FindingCard({ number, title, body, color }: {
  number: string; title: string; body: string; color: string
}) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5 flex gap-4">
      <div className="text-2xl font-bold tabular-nums shrink-0 w-8" style={{ color }}>{number}</div>
      <div className="flex flex-col gap-1.5">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
        <div className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{body}</div>
      </div>
    </div>
  )
}

function StatCard({ value, label, sublabel, color }: { value: string; label: string; sublabel?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.03] px-5 py-4 flex flex-col gap-0.5">
      <div className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight" style={{ color }}>{value}</div>
      <div className="text-xs font-medium text-gray-700 dark:text-zinc-300">{label}</div>
      {sublabel && <div className="text-[11px] text-gray-400 dark:text-zinc-500">{sublabel}</div>}
    </div>
  )
}

export default function StateOfPromptingPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
        { rootMargin: '-15% 0px -70% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const refPct = stats ? Math.round((stats.withReference / stats.total) * 100) : null
  const videoCats = ['video_t2v', 'video_i2v', 'video_r2v', 'video_v2v']
  const videoTotal = stats
    ? stats.byCategory.filter((c) => videoCats.includes(c.label)).reduce((s, c) => s + c.value, 0)
    : null
  const videoPct = stats && videoTotal !== null ? Math.round((videoTotal / stats.total) * 100) : null

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Hero */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6 md:p-8 flex flex-col gap-5 mb-10">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge color="#1DA1F2">March 2026</Badge>
            <Badge color="#8b5cf6">Video & Image AI</Badge>
            <Badge color="#f97316">Prompting Research</Badge>
            <Badge color="#22c55e">Skills & MCP</Badge>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">State of Prompting 2026</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
              The typed prompt is no longer the main way people get results from AI. This report covers what replaced it — reference images, modular skills, standardized tool connections, and a new way of thinking about what information AI actually needs.
            </p>
          </div>
          <div className="flex flex-col gap-1 pt-2 border-t border-black/[0.06] dark:border-white/6">
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              Industry data sourced from public research, product announcements, and community analysis.
              Dataset insights from <span className="font-medium text-gray-600 dark:text-zinc-300">ummerr/ai-prompts</span> — a curated collection of real-world AI generation prompts.
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-10 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">

            <Section title="Key Findings" id="findings">
              <div className="flex flex-col gap-3">
                <FindingCard
                  number="01"
                  color="#ec4899"
                  title="Creators are uploading references instead of writing descriptions"
                  body="Experienced creators are moving away from typing prompts toward uploading reference images, style boards, and character sheets. Text-to-video still accounts for roughly two-thirds of workflows, but the best results increasingly come from image-guided pipelines — not text alone."
                />
                <FindingCard
                  number="02"
                  color="#8b5cf6"
                  title="Prompt engineering as a job is effectively over"
                  body="The trial-and-error era of crafting the perfect sentence for an AI ended between late 2024 and early 2025. 'Prompt Engineer' ranked second-to-last in new roles companies plan to hire for. What replaced it isn't better prompting — it's building systems: AI agents, retrieval pipelines, and structured inputs."
                />
                <FindingCard
                  number="03"
                  color="#f97316"
                  title="Templates dominate but produce generic results"
                  body="Most people use AI through templates — pre-filled structures that reduce guesswork and cut iteration time by 50–70%. But borrowed templates produce borrowed results. The people who stand out treat a template as a starting point and inject their own specifics on top."
                />
                <FindingCard
                  number="04"
                  color="#06b6d4"
                  title="Good video prompts describe physics, not aesthetics"
                  body="The best video prompts in 2026 don't describe what a scene looks like — they describe what's happening physically. Camera movement, forces acting on objects, cause and effect. Adjective-heavy descriptions like 'cinematic and atmospheric' have been replaced by instructions like 'gimbal tracking shot, rear suspension compressing on impact'."
                />
                <FindingCard
                  number="05"
                  color="#22c55e"
                  title="Every major AI video tool now accepts images, audio, and video as input"
                  body="You can no longer get the best results by typing into a single text box. Every leading platform — Kling, Veo, Runway, Sora — now accepts a mix of text, images, audio clips, and video as combined input. The tools that still rely on text alone are falling behind."
                />
                <FindingCard
                  number="06"
                  color="#a855f7"
                  title="AI performance degrades as its working memory fills up"
                  body="Modern AI has a working memory — the information it holds while completing a task. When that memory fills up with old, irrelevant details, the AI starts making worse decisions. Bigger memory doesn't fix this; it just delays it. Managing what the AI sees at any given moment is the central engineering challenge of 2026."
                />
                <FindingCard
                  number="07"
                  color="#14b8a6"
                  title="The new skill is deciding how much to trust the AI, not how to talk to it"
                  body="Companies are no longer asking whether AI can do a task. They're asking: which tasks should run automatically, which need a human check, and which should never be delegated? Designing those rules is the real skill of 2026 — not crafting clever prompts."
                />
                <FindingCard
                  number="08"
                  color="#f59e0b"
                  title="Modular skills are replacing bloated instruction docs"
                  body="Giving an AI one enormous instruction document covering every possible scenario upfront is slow, expensive, and degrades quality over time. Skills are the fix: small, focused instruction files that only load when the AI actually needs them. Over 31,000 skills are now in circulation across 30+ AI coding tools."
                />
                <FindingCard
                  number="09"
                  color="#3b82f6"
                  title="MCP is becoming the standard way to connect AI to tools — but has a security problem"
                  body="The Model Context Protocol (MCP) has become the dominant way to connect AI to databases, APIs, and services — 97M+ monthly downloads, backed by every major AI company. But 25% of MCP servers have no login protection at all, and connecting just 10 tools creates a 92% chance of being exploited. The technology works. The security hasn't caught up."
                />
              </div>
            </Section>

            {stats && (
              <Section title="From This Dataset">
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Patterns from <span className="font-medium text-gray-700 dark:text-zinc-200">{stats.total.toLocaleString()} real-world prompts</span> shared publicly by practitioners — consistent with the broader trends described here.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard value={`${refPct ?? '—'}%`} label="need a reference image" sublabel="face, style, object, or pose" color="#f97316" />
                  <StatCard value={`${videoPct ?? '—'}%`} label="are video prompts" sublabel="text-to-video, image-to-video…" color="#8b5cf6" />
                  <StatCard value={stats.byModel.length.toString()} label="distinct AI models" sublabel="tracked in the wild" color="#1DA1F2" />
                  <StatCard value={stats.withTheme.toLocaleString()} label="theme-tagged prompts" sublabel="person, cinematic, scifi…" color="#22c55e" />
                </div>
                {refPct !== null && refPct > 25 && (
                  <div className="rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 p-4">
                    <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                      <span className="font-semibold">{refPct}% of prompts in this dataset require a reference image</span> — nearly one in three. The real number is likely higher: many text-only prompts are shared alongside a reference output image, even when the workflow doesn't formally require one.
                    </p>
                  </div>
                )}
              </Section>
            )}

            <Section title="The Shift to References" id="references">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  In 2023, the dominant idea was simple: write a better prompt, get a better output. AI generation was treated like a search engine — type something, get something back. Prompt engineering was framed as a learnable skill, a new kind of digital literacy. By 2025, that idea had quietly collapsed.
                </p>
                <p>
                  The collapse happened through tooling. Stable Diffusion added ways to feed in reference images directly. Midjourney introduced <code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">--sref</code> (style reference) and <code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">--cref</code> (character reference). Video tools like Runway, Kling, and Veo made image-to-video a core feature, not an add-on. Creators stopped describing their characters in text and started uploading character sheets. Style boards replaced style adjectives.
                </p>
                <p>
                  The reason is obvious once you see it: <span className="font-medium text-gray-900 dark:text-white">a photo of a face contains more information than any sentence describing one.</span> Text descriptions lose detail. Reference images don't. Users understood this before platforms did.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { label: 'Character reference', desc: 'Consistent faces and identity across every shot — no description needed', color: '#ec4899' },
                    { label: 'Style reference', desc: 'Lock the visual look to an image instead of trying to describe it in words', color: '#8b5cf6' },
                    { label: 'Pose reference', desc: 'Control body position and composition using a skeleton or layout image', color: '#f97316' },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: r.color }}>{r.label}</span>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="The Template Era" id="templates">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  For every person sharing a new prompting trick, there are thousands who just want a reliable output. Templates fill that gap — and the numbers confirm they dominate how most people actually use generative AI.
                </p>
                <p>
                  The appeal is practical: a good template pre-fills the hard parts so you only have to fill in the subject. For a cinematic video shot, the camera angle, lighting, lens type, and mood are already there. Iteration time drops 50–70%. You stop staring at a blank box.
                </p>
                <Insight
                  quote="AI prompts are like recipes — you wouldn't use a cake recipe to make soup. Different content types need different prompt structures. By anchoring responses with predefined sections, you're not just asking what it should say, you're telling it how to say it."
                  source="Prompt Engineering in 2025: The Latest Best Practices"
                  color="#22c55e"
                />
                <p>
                  But templates have a ceiling. Borrowed templates produce borrowed results. The people getting standout outputs treat templates as a starting point — adding their own references, adjusting details, and occasionally breaking the structure on purpose. <span className="font-medium text-gray-900 dark:text-white">A template is the floor, not the ceiling.</span>
                </p>
              </div>
            </Section>

            <Section title="Prompt Engineering Is Dead" id="prompt-engineering">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  "Prompt engineer" had a brief run as a real job title — roughly 2023 to mid-2024. By 2025, it ranked second-to-last among new AI roles companies planned to hire for. IEEE Spectrum ran the obituary. The consensus was unusually clear for a fast-moving industry.
                </p>
                <Insight
                  quote="The primitive era of prompt engineering — characterized by trial-and-error iteration and artisanal prompt crafting — died somewhere between late 2024 and early 2025."
                  source="Death of Prompt Engineering: AI Orchestration in 2026 — BigBlue Academy"
                  color="#f97316"
                />
                <p>
                  What replaced it wasn't better prompting — it was a fundamentally different way of working with AI. In mid-2025, AI researcher Andrej Karpathy named the successor: <span className="font-medium text-gray-900 dark:text-white">"context engineering"</span>. The idea is that what you give the AI matters more than how you phrase the request. For most serious AI applications, the "prompt" is now a system — documents, tools, data pipelines — not a carefully worded sentence.
                </p>
                <p>
                  For image and video specifically, the shift is from <span className="font-medium text-gray-900 dark:text-white">describing what you want to showing what you want</span>. Instead of prompting a video tool to create a scene, experienced creators upload a reference frame, a character sheet, and a shot list. Written text becomes directorial notes on top of a visual brief — not the main input.
                </p>
                <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/6 p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">What replaced prompt engineering</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                    {[
                      { label: 'Context Engineering', desc: 'Deciding what information the AI sees — not just what you type, but what documents and data it has access to', color: '#8b5cf6' },
                      { label: 'Agent Systems', desc: 'AI that runs multi-step tasks automatically: searching, writing, using tools, checking its own work', color: '#3b82f6' },
                      { label: 'Reference-Guided Generation', desc: 'For images and video — upload what you want instead of describing it', color: '#f97316' },
                    ].map((r) => (
                      <div key={r.label} className="flex flex-col gap-1">
                        <span className="text-xs font-semibold" style={{ color: r.color }}>{r.label}</span>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Context Engineering" id="context-engineering">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  Context engineering isn't about writing better prompts. It's about deciding what information the AI has access to at any given moment — what it can see, what gets cleared out when it's no longer relevant, and what only loads when needed.
                </p>
                <p>
                  The problem it solves has a name: <span className="font-medium text-gray-900 dark:text-white">context rot</span>. AI models have a working memory — a limit to how much they can hold at once while completing a task. As that memory fills up with old notes, outdated instructions, and irrelevant history, quality degrades. The AI starts missing things it should catch, contradicts itself, and loses the thread. More memory helps, but doesn't fix the root problem: the wrong things are taking up space. The goal, as Karpathy put it, is filling that memory with "precisely the right information for the next step" — not more, not less.
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Technique</span>
                    <span>How it works</span>
                    <span>Why it helps</span>
                  </div>
                  {[
                    {
                      pattern: 'Load on demand',
                      mech: 'Only bring in tools and instructions when the AI actually needs them. Remove them after.',
                      goal: "Stops the AI paying attention to rules for situations that haven't happened yet.",
                    },
                    {
                      pattern: 'Summarise history',
                      mech: 'Periodically compress old conversation history into a short summary. Discard the raw detail.',
                      goal: 'Keeps memory lean without losing the key decisions already made.',
                    },
                    {
                      pattern: 'Store completed work externally',
                      mech: 'Move finished task records to a database. Pull them back only if they become relevant again.',
                      goal: 'Prevents long-running tasks from accumulating clutter that buries the current work.',
                    },
                    {
                      pattern: 'Limit available tools',
                      mech: 'Only show the AI which tools it can use right now — not everything it will ever need.',
                      goal: 'Fewer options means sharper focus and fewer opportunities to go off track.',
                    },
                  ].map((row, i) => (
                    <div
                      key={row.pattern}
                      className={`grid grid-cols-3 px-4 py-3 text-xs items-start gap-2 ${i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}
                    >
                      <span className="font-medium text-gray-800 dark:text-zinc-200">{row.pattern}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.mech}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.goal}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/30 p-4">
                  <p className="text-sm text-violet-700 dark:text-violet-300 leading-relaxed">
                    <span className="font-semibold">Known territory vs. unknown territory.</span> AI models are trained on enormous amounts of public data — so they already understand TypeScript, React, Python, and most popular tools deeply. But they know nothing about your company's internal systems or custom software. Without deliberately providing that information, they'll fill the gaps by guessing — and get it wrong confidently. Context engineering is largely about knowing which situation you're in and giving the AI the missing knowledge explicitly.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="How Much Should You Trust the AI?" id="autonomy">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  The 2026 question isn't "can AI do this?" — it's "should we let the AI decide how to do this?" Teams using AI effectively have stopped thinking about it as a tool and started thinking about it as a colleague — one that needs clear boundaries about which decisions it can make alone.
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Level</span>
                    <span>What happens</span>
                    <span>Example</span>
                  </div>
                  {[
                    {
                      zone: 'Fully automatic',
                      color: '#22c55e',
                      def: 'The AI acts immediately without asking anyone.',
                      ex: 'Fixing a known bug type; scaling server capacity; reordering stock.',
                    },
                    {
                      zone: 'Reviewed in batches',
                      color: '#f97316',
                      def: 'The AI acts, but a human reviews a weekly summary of what it did.',
                      ex: 'Filtering job applications; tagging support tickets; code review comments.',
                    },
                    {
                      zone: 'Needs approval',
                      color: '#8b5cf6',
                      def: 'The AI does the work and proposes an action — a human signs off before anything happens.',
                      ex: 'Sending a client contract; deploying major code changes to production.',
                    },
                    {
                      zone: 'Human only',
                      color: '#ec4899',
                      def: "AI doesn't touch it. These decisions require judgment, empathy, or accountability.",
                      ex: 'Difficult conversations with employees; strategic decisions; anything with serious legal risk.',
                    },
                  ].map((row, i) => (
                    <div
                      key={row.zone}
                      className={`grid grid-cols-3 px-4 py-3 text-xs items-start gap-2 ${i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}
                    >
                      <span className="font-medium" style={{ color: row.color }}>{row.zone}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.def}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.ex}</span>
                    </div>
                  ))}
                </div>
                <p>
                  Writing a prompt is a one-off act. Defining these levels is a decision that governs every future action the AI takes in that category. The teams with the most effective AI in 2026 aren't the ones with the best prompts — they're the ones who've thought carefully about these boundaries.
                </p>
              </div>
            </Section>

            <Section title="Skills: Replacing the Bloated Instruction Doc" id="skills">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  The most common mistake when setting up an AI agent is giving it one enormous instruction document that tries to cover every scenario it might encounter. These documents grow to tens of thousands of words. Every session, the AI reads the whole thing — whether or not any of it is relevant. Quality degrades, instructions conflict, and failures become hard to diagnose.
                </p>
                <p>
                  Skills are the fix. A skill is a small, focused instruction file for a specific type of task — writing a PR description, reviewing code, setting up a database. The AI only loads a skill when it's actually doing that task. The rest stays out of the way.
                </p>
                <Insight
                  quote="In practice, a typical conversation might invoke one or two skills while the rest remain invisible — allowing you to register 300 skills while consuming fewer words than a traditional mega-prompt setup."
                  source="5 Skills Every AI Agent Needs — Medium"
                  color="#f59e0b"
                />
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Concept</span>
                    <span>What it is</span>
                    <span>When to use it</span>
                  </div>
                  {[
                    {
                      concept: 'Prompt',
                      what: 'A one-off instruction you type each time. The AI forgets it after.',
                      when: "Quick, single tasks where you don't expect to repeat them.",
                    },
                    {
                      concept: 'Skill',
                      what: 'A saved set of instructions for a specific type of task. Loads automatically when relevant.',
                      when: 'Repeated workflows you want the AI to handle consistently every time.',
                    },
                    {
                      concept: 'Tool',
                      what: 'Something the AI can do — run code, search the web, call an external service.',
                      when: 'When the AI needs to take an action, not just produce text.',
                    },
                    {
                      concept: 'Project context',
                      what: 'Background information about your product, codebase, or team.',
                      when: 'Giving the AI the knowledge it needs to be useful in your specific situation.',
                    },
                  ].map((row, i) => (
                    <div
                      key={row.concept}
                      className={`grid grid-cols-3 px-4 py-3 text-xs items-start gap-2 ${i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}
                    >
                      <span className="font-semibold text-gray-800 dark:text-zinc-200">{row.concept}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.what}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.when}</span>
                    </div>
                  ))}
                </div>
                <p>
                  Skills have taken off quickly. The same file format (<code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">SKILL.md</code>) is now used across Claude Code, OpenAI's Codex, GitHub Copilot, Google's Gemini CLI, and Cursor — over 30 AI tools in total. A community library has 1,200+ shared skills; the broader marketplace has more than 31,000.
                </p>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    <span className="font-semibold">The gap between theory and practice is real.</span> Skills clearly work as an approach, but most AI agent projects don't make it to production. Research projects 40% will fail by 2027. The most important skills aren't creative — they're structural: knowing when to use a tool, how to coordinate across tasks, and when to stop and ask a human.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="MCP: The Standard Everyone Adopted — With Caveats" id="mcp">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  Before the Model Context Protocol (MCP), connecting an AI to external tools was a mess. Each connection — AI to database, AI to Slack, AI to GitHub — needed a custom bridge built from scratch. Change your AI model, rebuild everything. MCP solved this by creating a shared plug standard: build the connection once, and it works with any AI that supports the protocol.
                </p>
                <p>
                  The uptake has been remarkable. MCP launched in November 2024. By early 2026 it has 97M+ monthly downloads, 10,000+ active servers, and support from Anthropic, OpenAI, Google, Microsoft, Amazon, and Bloomberg. It's now governed by the Linux Foundation — the same neutral body that maintains much of the internet's core infrastructure.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: '97M+', label: 'monthly downloads', color: '#3b82f6' },
                    { value: '10K+', label: 'active public servers', color: '#22c55e' },
                    { value: '5,800+', label: 'registered connections', color: '#8b5cf6' },
                    { value: '300+', label: 'AI tools that support it', color: '#f97316' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-white/[0.03] px-4 py-3 flex flex-col gap-0.5">
                      <div className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[11px] text-gray-500 dark:text-zinc-400 leading-snug">{s.label}</div>
                    </div>
                  ))}
                </div>
                <p>
                  But the honest picture is more complicated. For a small project with one or two external connections, MCP adds real complexity for minimal gain — a direct API call is simpler and faster to build. MCP makes most sense when you have many tools, need to switch between AI providers without rebuilding everything, or want to share the same connections across multiple products.
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>MCP makes sense when…</span>
                    <span>A direct connection works better when…</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-black/[0.06] dark:divide-white/6">
                    <div className="flex flex-col gap-1.5 p-4">
                      {[
                        'You connect to many services and want one consistent approach',
                        'You want to swap AI providers without rebuilding integrations',
                        'Multiple products need access to the same external tools',
                        'Your team needs proper access control and audit logs',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2 text-xs text-gray-600 dark:text-zinc-300">
                          <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1.5 p-4">
                      {[
                        "You're connecting to one or two services and that's it",
                        "You're prototyping and speed matters more than structure",
                        'You already have working integrations and no reason to change',
                        "Your team doesn't yet have the security setup MCP requires",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2 text-xs text-gray-600 dark:text-zinc-300">
                          <span className="text-gray-400 mt-0.5 shrink-0">○</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-400 dark:text-red-500">The security problem</p>
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                    One in four MCP servers has no password or access control at all. More than half use static credentials that are rarely changed — the equivalent of taping your house key next to the front door. Security researchers found that connecting just 10 MCP plugins creates a <span className="font-semibold">92% chance of being exploited</span>. 38% of developers say these concerns are actively stopping them from using MCP more widely. MCP's own 2026 roadmap has made security its top priority — an acknowledgment that it wasn't solved in the original release.
                  </p>
                </div>
                <Insight
                  quote="Function calling fits small apps and experiments. MCP shines once performance, scale, and maintainability start to matter."
                  source="Function Calling vs MCP — LangWatch"
                  color="#3b82f6"
                />
              </div>
            </Section>

            <Section title="How Video Prompting Works Now" id="video">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  Video prompting is a different skill from image prompting. The best tools in 2026 — Veo 3.1, Sora 2, Kling 3.0, Runway Gen-4.5 — each respond to inputs differently, and a prompt that works well on one can fail on another.
                </p>
                <Insight
                  quote="Modern prompting requires stopping description of what things look like and instead describing the forces acting on them."
                  source="How to Actually Control Next-Gen Video AI — Medium"
                  color="#8b5cf6"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      model: 'Veo 3.1',
                      personality: 'Rendering Engine',
                      desc: 'Works best with structured, ingredient-list prompts and reference images. You can provide a start frame and an end frame and it fills in the motion between them.',
                      strategy: 'Lead with the subject and shot type. Upload reference images instead of describing them. Use labelled sections for dialogue and sound effects.',
                      color: '#1DA1F2',
                    },
                    {
                      model: 'Sora 2',
                      personality: 'Physics Simulator',
                      desc: 'Simulates how the world actually behaves — gravity, momentum, how objects break. Prompts describing cause and effect outperform poetic descriptions.',
                      strategy: 'Break the scene into timed segments: (0–5s) this happens, (5–12s) this happens next. Always use the same name for each subject — never swap to "it" or "the car". Describe what physically happens, not how it looks.',
                      color: '#8b5cf6',
                    },
                    {
                      model: 'Kling 3.0',
                      personality: 'Multimodal Engine',
                      desc: 'The first model to genuinely treat text, images, audio, and video as equal inputs processed together. Multiple references work better here than anywhere else.',
                      strategy: 'Give it as many reference files as you have — image, audio clip, reference video — with brief notes on each. Use the storyboard tool to direct shot by shot.',
                      color: '#ec4899',
                    },
                    {
                      model: 'Runway Gen-4.5',
                      personality: 'Cinematic Realist',
                      desc: "Leads on visual quality and physical realism. You don't need to explain how physics works — just tell it how the camera moves.",
                      strategy: 'Be specific about camera movement: steadicam, gimbal, handheld. Skip descriptions of how things physically behave. Focus on atmosphere, blocking, and timing.',
                      color: '#f97316',
                    },
                  ].map((m) => (
                    <div
                      key={m.model}
                      className="rounded-xl border bg-white dark:bg-[#111] p-4 flex flex-col gap-2"
                      style={{ borderColor: `${m.color}30` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.model}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: m.color, background: `${m.color}15` }}>{m.personality}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{m.desc}</p>
                      <div className="pt-1.5 border-t border-black/[0.06] dark:border-white/6">
                        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: m.color }}>What works</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{m.strategy}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/6 p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">A reliable structure for video prompts</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['What the scene is', 'Who or what is in it', 'What happens', 'How the camera moves', 'The overall mood'].map((step, i) => (
                      <div key={step} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-gray-300 dark:text-zinc-600">→</span>}
                        <span className="rounded-md px-2 py-0.5 font-medium bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/8 text-gray-700 dark:text-zinc-300">{step}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    For scenes with multiple actions: use timed segments — <span className="font-mono text-gray-600 dark:text-zinc-300">(0–5s)</span>, <span className="font-mono text-gray-600 dark:text-zinc-300">(5–12s)</span> — rather than describing everything at once. Physics-based tools handle sequential instructions better than simultaneous ones.
                  </p>
                </div>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Model</span>
                    <span>Best described as</span>
                    <span>What to give it</span>
                    <span>What makes it unique</span>
                  </div>
                  {[
                    { model: 'Sora 2', paradigm: 'Physics simulator', strategy: 'Cause-and-effect descriptions, timed segments, consistent subject names', feature: 'Objects behave physically correctly across the whole clip', color: '#8b5cf6' },
                    { model: 'Veo 3.1', paradigm: 'Cinematic renderer', strategy: 'Reference images, structured lists, labelled audio sections', feature: 'Blends start and end frames; integrated audio design', color: '#1DA1F2' },
                    { model: 'Kling 3.0', paradigm: 'Multimodal engine', strategy: 'Multiple reference files with brief directorial notes', feature: 'Text, image, audio, and video processed together natively', color: '#ec4899' },
                    { model: 'Runway Gen-4.5', paradigm: 'Cinematic realist', strategy: 'Named camera movements, atmosphere, pacing — skip physics detail', feature: 'Top-ranked for fluid, fabric, and complex movement', color: '#f97316' },
                  ].map((row, i) => (
                    <div
                      key={row.model}
                      className={`grid grid-cols-4 px-4 py-3 text-xs items-start gap-2 ${i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}
                    >
                      <span className="font-semibold" style={{ color: row.color }}>{row.model}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.paradigm}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.strategy}</span>
                      <span className="text-gray-500 dark:text-zinc-400 leading-relaxed">{row.feature}</span>
                    </div>
                  ))}
                </div>
                <p>
                  The most underrated shift: sound. Tools like Kling 3.0 now generate audio — effects, ambient noise, dialogue — in the same pass as the video. If you want good audio, describe it in the brief from the start.
                </p>
              </div>
            </Section>

            <Section title="Every Major Tool Now Accepts Multiple Input Types" id="multimodal">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  A year ago, most AI video tools had one input: a text box. Today, every major platform accepts a combination of text, images, audio, and video. Typing a description is no longer the primary way to control what you get.
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Platform</span>
                    <span>Text</span>
                    <span>Image / Video</span>
                    <span>Audio</span>
                  </div>
                  {[
                    { name: 'Kling 3.0',      text: true, visual: true, audio: true  },
                    { name: 'Veo 3.1',        text: true, visual: true, audio: true  },
                    { name: 'Runway Gen-4.5', text: true, visual: true, audio: false },
                    { name: 'Pika 2.5',       text: true, visual: true, audio: false },
                  ].map((p, i) => (
                    <div
                      key={p.name}
                      className={`grid grid-cols-4 px-4 py-2.5 text-xs items-center ${i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}
                    >
                      <span className="font-medium text-gray-800 dark:text-zinc-200">{p.name}</span>
                      <span>{p.text ? '✓' : '—'}</span>
                      <span>{p.visual ? <span className="text-emerald-500 font-medium">✓</span> : '—'}</span>
                      <span>{p.audio ? <span className="text-violet-500 font-medium">✓</span> : <span className="text-gray-300 dark:text-zinc-600">—</span>}</span>
                    </div>
                  ))}
                </div>
                <p>
                  If you're still relying on text-only prompts, you're working with one hand tied behind your back. The tools that accept reference images, audio clips, and video deliver substantially better results when you use those inputs.
                </p>
              </div>
            </Section>

            <Section title="What to Actually Do About It" id="practitioners">
              <div className="flex flex-col gap-3">
                {[
                  {
                    title: 'Build a folder of reference images, not a folder of prompts',
                    body: 'The most valuable thing you can collect in 2026 is a curated set of reference images — faces, visual styles, compositions, colour palettes you like. Prompts go out of date between model versions. A good reference image works across tools and stays relevant indefinitely.',
                    color: '#f97316',
                  },
                  {
                    title: 'Use text to direct, not to describe',
                    body: "Once you have reference images, your written prompt is directorial notes — what happens, how the camera moves, what the emotional beat is. It shouldn't be carrying the visual weight. \"Close-up on her face as she hears the news\" beats \"a beautiful cinematic close-up with dramatic lighting and emotional depth\".",
                    color: '#8b5cf6',
                  },
                  {
                    title: "Learn the tool you're actually using",
                    body: 'Veo 3.1 wants structured ingredient lists. Sora 2 wants cause-and-effect descriptions. Kling 3.0 wants multiple reference files. A prompt written for one rarely works as well on another. Spend time understanding what each tool actually responds to.',
                    color: '#1DA1F2',
                  },
                  {
                    title: 'Include sound in the brief from the start',
                    body: 'Several tools now generate audio alongside video in a single pass. If you want the right sound effects, ambient noise, or dialogue, describe them in the prompt. Treating audio as an afterthought produces audio as an afterthought.',
                    color: '#06b6d4',
                  },
                  {
                    title: 'Replace large instruction docs with focused skills',
                    body: "If your AI agent runs on one massive instruction file, it's degrading over time. Break it into small, focused skill files that each cover one type of task. Only the relevant one should load at any given moment — that's how the most reliable agent setups are built.",
                    color: '#f59e0b',
                  },
                  {
                    title: 'Write documentation that AI can actually use',
                    body: "AI agents don't skim. They read everything — appendices, footnotes, technical specs. If your internal documentation is written for humans to scan quickly, it may not give an AI agent what it needs to be accurate. Key information needs to be explicit, not implied.",
                    color: '#a855f7',
                  },
                  {
                    title: 'Decide in advance what the AI can do on its own',
                    body: 'When AI can produce code, content, or actions at speed, the bottleneck shifts to oversight — not output. The teams that avoid costly mistakes have thought carefully about which decisions need a human in the loop, and made that policy explicit before they needed it.',
                    color: '#14b8a6',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border bg-white dark:bg-[#111] p-4"
                    style={{ borderColor: `${item.color}25` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: item.color }} />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</span>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Sources" id="sources">
              <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                {[
                  { label: 'The State of AI Video Creation 2026 — Vivideo', url: 'https://vivideo.ai/blog/state-of-ai-video-creation-2026' },
                  { label: "Prompt Engineering Is Dying — What's Replacing It in 2026 — Medium", url: 'https://medium.com/@shashanky485/prompt-engineering-is-dying-whats-replacing-it-in-2026-f88d821d77ee' },
                  { label: 'Death of Prompt Engineering: AI Orchestration in 2026 — BigBlue Academy', url: 'https://bigblue.academy/en/the-death-of-prompt-engineering-and-its-ruthless-resurrection-navigating-ai-orchestration-in-2026-and-beyond' },
                  { label: 'AI Prompt Engineering Is Dead — IEEE Spectrum', url: 'https://spectrum.ieee.org/prompt-engineering-is-dead' },
                  { label: 'How to Actually Control Next-Gen Video AI — Medium', url: 'https://medium.com/@creativeaininja/how-to-actually-control-next-gen-video-ai-runway-kling-veo-and-sora-prompting-strategies-92ef0055658b' },
                  { label: 'The State of AI Video Generation in February 2026 — Medium / Cliprise', url: 'https://medium.com/@cliprise/the-state-of-ai-video-generation-in-february-2026-every-major-model-analyzed-6dbfedbe3a5c' },
                  { label: 'Veo 3.1 vs Top AI Video Generators: 2026 Comparison — PXZ', url: 'https://pxz.ai/blog/veo-31-vs-top-ai-video-generators-2026' },
                  { label: 'Google Veo 3.1 Overview — AI/ML API Blog', url: 'https://aimlapi.com/blog/google-veo-3-1' },
                  { label: 'Kling AI 3.0 Review 2026 — Cybernews', url: 'https://cybernews.com/ai-tools/kling-ai-review/' },
                  { label: 'Prompt Engineering in 2025: The Latest Best Practices', url: 'https://www.news.aakashg.com/p/prompt-engineering' },
                  { label: 'AI Video Trends: Predictions For 2026 — LTX Studio', url: 'https://ltx.studio/blog/ai-video-trends' },
                  { label: 'Prompt Engineering Jobs Are Obsolete in 2025 — Salesforce Ben', url: 'https://www.salesforceben.com/prompt-engineering-jobs-are-obsolete-in-2025-heres-why/' },
                  { label: 'Skills Explained: How Skills Compare to Prompts, Projects, MCP, and Subagents — Anthropic', url: 'https://claude.com/blog/skills-explained' },
                  { label: '5 Skills Every AI Agent Needs (And Why Your Mega-Prompt Is Holding You Back) — Medium', url: 'https://medium.com/@Micheal-Lanham/5-skills-every-ai-agent-needs-and-why-your-mega-prompt-is-holding-you-back-4b4ab2471c0e' },
                  { label: 'Agent Skills: The Architectural Shift from Mega-Prompts to Progressive Disclosure — Substack', url: 'https://micheallanham.substack.com/p/agent-skills-the-architectural-shift' },
                  { label: 'Context Engineering for Coding Agents — Martin Fowler', url: 'https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html' },
                  { label: 'One Year of MCP — MCP Blog', url: 'http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/' },
                  { label: 'Why the Model Context Protocol Won — The New Stack', url: 'https://thenewstack.io/why-the-model-context-protocol-won/' },
                  { label: 'MCP vs. Function Calling — Descope', url: 'https://www.descope.com/blog/post/mcp-vs-function-calling' },
                  { label: 'MCP: The Hype vs. Reality — Vellum AI', url: 'https://vellum.ai/blog/mcp-the-hype-vs-reality' },
                  { label: '2026: The Year for Enterprise-Ready MCP Adoption — CData', url: 'https://www.cdata.com/blog/2026-year-enterprise-ready-mcp-adoption' },
                  { label: 'State of MCP Server Security 2025 — Astrix Security', url: 'https://astrix.security/learn/blog/state-of-mcp-server-security-2025/' },
                  { label: 'MCP Stacks Have a 92% Exploit Probability — VentureBeat', url: 'https://venturebeat.com/security/mcp-stacks-have-a-92-exploit-probability-how-10-plugins-became-enterprise' },
                  { label: "MCP's 2026 Roadmap Makes Enterprise Readiness a Top Priority — WorkOS", url: 'https://workos.com/blog/2026-mcp-roadmap-enterprise-readiness' },
                  { label: 'The Zuplo State of MCP Report', url: 'https://zuplo.com/blog/mcp-survey' },
                  { label: 'MCP Adoption Statistics 2025 — MCP Manager', url: 'https://mcpmanager.ai/blog/mcp-adoption-statistics/' },
                ].map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-700 dark:hover:text-zinc-200 transition-colors underline underline-offset-2 decoration-gray-300 dark:decoration-zinc-600"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </Section>

          </div>

          {/* Sticky right-side nav */}
          <aside className="hidden xl:block w-44 shrink-0 sticky top-20 self-start">
            <SectionNav activeId={activeId} />
          </aside>

        </div>
      </div>
    </div>
  )
}
