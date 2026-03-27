'use client'

import { useState, useEffect } from 'react'

const NAV_SECTIONS = [
  { id: 'findings',            label: 'Key Findings' },
  { id: 'references',         label: 'The Reference Shift' },
  { id: 'templates',          label: 'Templates' },
  { id: 'prompt-engineering', label: 'Prompt Engineering' },
  { id: 'context-engineering', label: 'Brief Architecture' },
  { id: 'sora',               label: 'Why Sora Shut Down' },
  { id: 'video',              label: 'Video Prompting' },
  { id: 'multishot',          label: 'Multi-Shot' },
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



export default function StateOfPromptingPage() {
  const [activeId, setActiveId] = useState('')

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

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Hero */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6 md:p-8 flex flex-col gap-5 mb-10">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge color="#1DA1F2">March 2026</Badge>
            <Badge color="#8b5cf6">Video & Image AI</Badge>
            <Badge color="#f97316">Prompting Research</Badge>
            <Badge color="#22c55e">Skills</Badge>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">State of Prompting 2026</h1>
            <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Updated Mar 26, 2026</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
              The typed prompt is no longer the main way people get results from AI. This report covers what replaced it — reference images, modular skills, and a new way of thinking about what information AI actually needs.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-black/[0.06] dark:border-white/6">
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              Industry data sourced from public research, product announcements, and community analysis.
              Dataset insights from <span className="font-medium text-gray-600 dark:text-zinc-300">ummerr/ai-prompts</span> — a curated collection of real-world AI generation prompts.
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">
              Updated <span className="font-medium text-gray-600 dark:text-zinc-300">Mar 26, 2026</span>
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
                  body="The shift happened through tooling. Midjourney added style and character reference flags. Runway, Kling, and Veo made image-to-video a core feature. Creators stopped describing their characters in text and started uploading character sheets. A photo of a face contains more information than any sentence describing one."
                />
                <FindingCard
                  number="02"
                  color="#8b5cf6"
                  title="Prompt engineering as a job is over"
                  body="'Prompt Engineer' ranked second-to-last in new AI roles companies plan to hire for. What replaced it isn't better prompting — it's building systems: agents, retrieval pipelines, and structured context. Andrej Karpathy named the successor in mid-2025: context engineering — deciding what information the AI sees, not how you phrase the request."
                />
                <FindingCard
                  number="03"
                  color="#a855f7"
                  title="AI performance degrades as its working memory fills up"
                  body="AI has a working memory limit. As it fills with old instructions, outdated notes, and irrelevant history, quality degrades — the AI misses things, contradicts itself, loses the thread. More memory delays this; it doesn't fix it. The goal is filling that memory with precisely the right information for the next step, nothing else."
                />
                <FindingCard
                  number="04"
                  color="#f59e0b"
                  title="The best video prompts describe forces, not aesthetics"
                  body="Adjective-heavy descriptions — 'cinematic', 'dramatic', 'beautiful' — produce averaged, generic results. The prompts that work describe what is physically happening: camera movement, forces acting on objects, cause and effect sequences. 'Gimbal tracking shot, rear suspension compressing on impact' beats 'cinematic car scene' every time."
                />
                <FindingCard
                  number="05"
                  color="#ef4444"
                  title="Sora shut down on March 24, 2026 — six months after launch"
                  body="OpenAI shut down Sora — the app, the API, and video generation in ChatGPT. The economics never worked: $15M/day in costs against $2.1M in total lifetime revenue. Downloads fell 66%, deepfake scandals escalated, and a $1B Disney deal collapsed the same week. The Sora team is now redirected to world simulation for robotics."
                />
              </div>
            </Section>

            <Section title="The Shift to References" id="references">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  In 2023, the dominant idea was simple: write a better prompt, get a better output. By 2025, that had quietly collapsed — not through debate, but through tooling.
                </p>
                <p>
                  Midjourney introduced <code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">--sref</code> (style reference) and <code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">--cref</code> (character reference). Runway, Kling, and Veo made image-to-video a core feature. Creators stopped describing their characters and started uploading character sheets. Style boards replaced style adjectives.
                </p>
                <p>
                  The reason is obvious once you see it: <span className="font-medium text-gray-900 dark:text-white">a photo of a face contains more information than any sentence describing one.</span> Text descriptions lose detail. Reference images don't.
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
                  Templates dominate how most people use generative AI. A good template pre-fills the hard parts — camera angle, lighting, mood — so you only fill in the subject. Iteration time drops 50–70%.
                </p>
                <Insight
                  quote="AI prompts are like recipes — you wouldn't use a cake recipe to make soup. Different content types need different prompt structures. By anchoring responses with predefined sections, you're not just asking what it should say, you're telling it how to say it."
                  source="Prompt Engineering in 2025: The Latest Best Practices"
                  color="#22c55e"
                />
                <p>
                  But templates have a ceiling. Borrowed templates produce borrowed results. People getting standout outputs treat templates as a starting point — adding their own references, adjusting specifics, occasionally breaking the structure. <span className="font-medium text-gray-900 dark:text-white">A template is the floor, not the ceiling.</span>
                </p>
              </div>
            </Section>

            <Section title="Prompt Engineering Is Dead" id="prompt-engineering">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  "Prompt engineer" had a brief run as a real job title — roughly 2023 to mid-2024. By 2025, it ranked second-to-last among new AI roles companies planned to hire for. IEEE Spectrum ran the obituary.
                </p>
                <Insight
                  quote="The primitive era of prompt engineering — characterized by trial-and-error iteration and artisanal prompt crafting — died somewhere between late 2024 and early 2025."
                  source="Death of Prompt Engineering: AI Orchestration in 2026 — BigBlue Academy"
                  color="#f97316"
                />
                <p>
                  What replaced it was a different way of working with AI entirely. In mid-2025, Andrej Karpathy named the successor: <span className="font-medium text-gray-900 dark:text-white">"context engineering"</span> — what you give the AI matters more than how you phrase the request. For serious applications, the "prompt" is now a system: documents, tools, data pipelines, not a carefully worded sentence.
                </p>
                <p>
                  For image and video, this means <span className="font-medium text-gray-900 dark:text-white">showing instead of describing</span>. Experienced creators upload a reference frame, character sheet, and shot list. Text becomes directorial notes on top of a visual brief — not the main input.
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

            <Section title="Brief Architecture: What You Put In" id="context-engineering">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  Most generations fail not because the prompt is badly worded, but because the wrong information is in the brief. What you include shapes the output as much as what you ask for.
                </p>
                <p>
                  A generation model's "context" is everything you feed it: the text prompt, reference images, audio clips, previous frames. The skill is knowing what to include and — just as importantly — what to leave out. Too many competing references and the model averages them into something generic. Too little and it fills the gaps by guessing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      label: 'One reference per role',
                      desc: "Don't stack five style references hoping the model blends them well. Pick one. Competing references produce averaged, muddied results.",
                      color: '#ec4899',
                    },
                    {
                      label: 'Replace words with images',
                      desc: "A style reference image is more precise than 200 words about the aesthetic. If you can show it, don't describe it.",
                      color: '#8b5cf6',
                    },
                    {
                      label: 'Keep the brief scene-specific',
                      desc: "Don't carry forward every reference from your last five shots. Only include what's directly relevant to this frame or clip.",
                      color: '#f97316',
                    },
                    {
                      label: 'Maintain a style card for long projects',
                      desc: 'For multi-scene or multi-session work, keep a consistent core brief — character, palette, look — rather than re-explaining from scratch each time.',
                      color: '#14b8a6',
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: item.color }}>{item.label}</span>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/30 p-4">
                  <p className="text-sm text-violet-700 dark:text-violet-300 leading-relaxed">
                    <span className="font-semibold">Known vs. unknown.</span> Models already understand cinematic language, lighting setups, camera moves, and art movements deeply. What they don't know is your specific character design, your brand palette, or the visual style you've built across prior sessions. That's the part you need to supply explicitly — with reference images, not descriptions.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="Why Sora Shut Down" id="sora">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  On March 24, 2026 — six months after its public launch — OpenAI shut down Sora completely. The app, the developer API, and video generation inside ChatGPT all went dark at the same time. Bill Peebles, Sora's lead researcher, said in an internal note that "the economics are completely unsustainable."
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { stat: '$15M/day', label: 'Estimated inference cost at peak' },
                    { stat: '$2.1M', label: 'Total lifetime in-app revenue' },
                    { stat: '−66%', label: 'Download drop Nov 2025 → Feb 2026' },
                    { stat: '1%', label: '30-day user retention rate' },
                  ].map(({ stat, label }) => (
                    <div key={stat} className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-3 text-center">
                      <div className="text-xl font-bold text-red-500 dark:text-red-400 leading-tight">{stat}</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-snug">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">How it unraveled</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { date: 'Sep 2025', event: 'Sora launches publicly, wide press coverage' },
                      { date: 'Nov 2025', event: 'Downloads peak at 3.3M — then start falling' },
                      { date: 'Dec 2025', event: 'Deepfake scandals escalate; MLK Jr. and Robin Williams likenesses go viral without consent' },
                      { date: 'Jan 2026', event: 'Internal teams describe GPU strain — "the chips are melting"' },
                      { date: 'Mar 2026', event: '$1B Disney partnership collapses; Disney notified 30 minutes after a joint planning meeting' },
                      { date: 'Mar 24, 2026', event: 'OpenAI shuts down Sora entirely; team redirected to robotics world simulation' },
                    ].map(({ date, event }) => (
                      <div key={date} className="flex gap-3 text-xs">
                        <span className="shrink-0 font-mono text-gray-400 dark:text-zinc-500 w-20">{date}</span>
                        <span className="text-gray-600 dark:text-zinc-300">{event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p>
                  The deepfake crisis accelerated things. Synthetic videos of MLK Jr. and Robin Williams went viral — their daughters publicly asked people to stop. OpenAI had no working enforcement at scale. Then the $1B Disney deal collapsed: Disney's team found out 30 minutes after sitting in a joint planning meeting. Cratering usage, unsustainable costs, reputational damage, and a lost anchor customer — the math became impossible.
                </p>

                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 p-4">
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                    <span className="font-semibold">What this means for video AI.</span> Sora's shutdown removes the most powerful video generator from the market — but it also clarifies the field. The remaining tools (Veo 3.1, Kling 3.0, Runway Gen-4.5) have more sustainable economics and tighter use cases. The lesson isn't that AI video failed — it's that building a consumer product around a capability that costs hundreds of dollars per clip to generate doesn't work, no matter how impressive the output.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="How Video Prompting Works Now" id="video">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  Video prompting is a different skill from image prompting. Each of the major tools has a distinct personality — a prompt that works on one can fail on another.
                </p>
                <Insight
                  quote="Modern prompting requires stopping description of what things look like and instead describing the forces acting on them."
                  source="How to Actually Control Next-Gen Video AI — Medium"
                  color="#8b5cf6"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      model: 'Seedance 2.0',
                      personality: 'Leaderboard #1',
                      desc: "ByteDance's dual-branch diffusion transformer co-generates video and audio in a single pass — not spliced together after. Holds #1 ELO across all three Artificial Analysis arenas (T2V, I2V, and audio-video) as of March 2026. Standout character consistency and physics.",
                      strategy: 'Assign explicit roles to each reference asset using the @reference system. Describe physics consequences ("tires smoke as the car drifts") not just actions ("car turns"). Use [Xs] timestamp notation for shot boundaries. Limit multi-shot to 2–3 shots for best character hold.',
                      color: '#10b981',
                    },
                    {
                      model: 'Kling 3.0',
                      personality: 'Multi-Shot Pioneer',
                      desc: 'Popularized storyboard-mode prompting — up to 6 distinct camera cuts from a single prompt. Native lip-sync and speaker attribution across shots. The research behind it (MultiShotMaster, CVPR 2026) is open-sourced.',
                      strategy: 'Use Custom Storyboard mode for full control. Structure each shot as: Scene → Characters → Action → Camera → Audio. Label dialogue per speaker. Give it as many reference files as you have.',
                      color: '#ec4899',
                    },
                    {
                      model: 'Veo 3.1',
                      personality: 'Rendering Engine',
                      desc: 'Works best with structured, ingredient-list prompts and reference images. Provide a start frame and end frame and it fills in the motion. Deep Google infrastructure means reliable uptime and API access.',
                      strategy: 'Lead with subject and shot type. Upload reference images instead of describing them. Use labelled sections for dialogue and sound effects.',
                      color: '#1DA1F2',
                    },
                    {
                      model: 'Runway Gen-4.5',
                      personality: 'Cinematic Realist',
                      desc: "Leads on per-shot visual quality and physical realism. The go-to for complex particle effects, fire, fabric, and fluid. Single shot per generation — multi-shot requires manual assembly.",
                      strategy: 'Be specific about camera movement: steadicam, gimbal, handheld. Skip physics descriptions — it handles those. Focus on atmosphere, blocking, and timing.',
                      color: '#f97316',
                    },
                    {
                      model: 'Grok Imagine Video',
                      personality: 'Top 3 Leaderboard',
                      desc: "Built on Aurora's autoregressive architecture. Generates up to 15 seconds in ~17 seconds. Ranked top 3 on Artificial Analysis I2V (ELO 1,329) — highest-rated non-ByteDance model. Supports video extension and natural language editing.",
                      strategy: 'Use comma-separated ingredient prompts rather than prose. Feed a reference image to anchor style and subject. Use iterative chat refinement rather than rewriting from scratch.',
                      color: '#9333ea',
                    },
                    {
                      model: '🪦 RIP Sora 2',
                      personality: 'Shut Down Mar 24, 2026',
                      desc: 'The most technically ambitious video model — diffusion-based world simulation with physics understanding. Shut down after six months due to $15M/day inference costs against $2.1M lifetime revenue.',
                      strategy: 'N/A — no longer available. Its world-state persistence approach (characters held across shots automatically) influenced the multi-shot techniques every remaining tool now implements.',
                      color: '#6b7280',
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
                <p>
                  The most underrated shift: sound. Kling 3.0 and Veo 3.1 now generate audio — effects, ambient noise, dialogue — in the same pass as the video. Describe it in the brief from the start or it becomes an afterthought.
                </p>
              </div>
            </Section>

            <Section title="Multi-Shot Prompting" id="multishot">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  Single-shot AI video is B-roll. Multi-shot AI video is an edited scene. Kling 3.0's February 2026 launch popularized the technique — and it's now the standard for anything with narrative structure.
                </p>
                <p>
                  Multi-shot prompting describes two or more distinct camera cuts in a single prompt. The model generates them as a coherent sequence — same characters, consistent environment, natural transitions. The underlying research (Kuaishou's MultiShotMaster, CVPR 2026) modified how the model handles position embeddings to deliberately break continuity at shot boundaries while keeping character identity stable across them.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500 dark:text-pink-400">Shot-label format (Kling 3.0)</p>
                    <pre className="text-[11px] text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono bg-black/[0.03] dark:bg-white/[0.03] rounded-lg p-3">{`Shot 1 (0–4s): Wide — rain-soaked city street,
amber streetlights, slow dolly forward.

Shot 2 (4–8s): Medium — woman in red coat
running through alley, tracking shot.

Shot 3 (8–12s): Close-up — catching breath,
eyes wide. [breathless]: "They found us."`}</pre>
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500">Kling 3.0 supports up to 6 shots with native lip-sync and speaker attribution per character.</p>
                  </div>
                  <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Timestamp format (Seedance 2.0)</p>
                    <pre className="text-[11px] text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono bg-black/[0.03] dark:bg-white/[0.03] rounded-lg p-3">{`[0s]: Wide shot — character enters a dimly
lit cafe, looking around curiously.

[Shot switch]

[5s]: Medium — sitting down, ordering
coffee with a warm smile.

[Shot switch]

[10s]: Close-up — eyes react as someone
enters. Warm golden lighting.`}</pre>
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500">Seedance 2.0 uses <code className="bg-black/[0.05] dark:bg-white/[0.05] px-1 rounded">Shot switch</code> or <code className="bg-black/[0.05] dark:bg-white/[0.05] px-1 rounded">Cut to</code> as explicit scene-change markers.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Model</span>
                    <span>Max shots</span>
                    <span>Syntax</span>
                    <span>Lip-sync</span>
                  </div>
                  {[
                    { model: 'Kling 3.0',       shots: '6',  syntax: 'Shot N (Xs): …',            lipsync: true,  color: '#ec4899' },
                    { model: 'Seedance 2.0',    shots: '3–5', syntax: '[Xs]: … / Shot switch',     lipsync: true,  color: '#10b981' },
                    { model: 'Veo 3.1',         shots: '2–3', syntax: 'Start/end frame reference', lipsync: true,  color: '#1DA1F2' },
                    { model: 'Runway Gen-4.5',  shots: '1',  syntax: 'Single shot — assemble in post', lipsync: false, color: '#f97316' },
                    { model: 'Grok Imagine Video', shots: '1', syntax: 'Single shot per generation', lipsync: false, color: '#9333ea' },
                  ].map((row, i) => (
                    <div key={row.model} className={`grid grid-cols-4 px-4 py-2.5 text-xs items-center gap-2 ${i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}>
                      <span className="font-semibold" style={{ color: row.color }}>{row.model}</span>
                      <span className="text-gray-600 dark:text-zinc-300 font-medium">{row.shots}</span>
                      <span className="text-gray-500 dark:text-zinc-400">{row.syntax}</span>
                      <span>{row.lipsync ? <span className="text-violet-500 font-medium">✓</span> : <span className="text-gray-300 dark:text-zinc-600">—</span>}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/30 p-4">
                  <p className="text-sm text-pink-700 dark:text-pink-300 leading-relaxed">
                    <span className="font-semibold">The Continuity Lock.</span> Open every multi-shot prompt with a shared constants block — time of day, location, character description, color grade, visual style. This is the "lock sheet" that anchors all shots to the same world. Repeat the same character descriptors verbatim in every shot. Even small wording changes can cause face drift.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    <span className="font-semibold">Where it breaks down.</span> Character consistency degrades past 4–5 shots. Hard cuts between very different environments (outdoor → indoor, day → night) produce visual seams. Timestamps are probabilistic — the model interprets them, not executes them literally. No current model stores character profiles between sessions: if you come back tomorrow, re-anchor with the same reference image.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="Every Major Tool Now Accepts Multiple Input Types" id="multimodal">
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  A year ago, most AI video tools had one input: a text box. Today every major platform accepts text, images, audio, and video in combination.
                </p>
                <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="grid grid-cols-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                    <span>Platform</span>
                    <span>Text</span>
                    <span>Image / Video</span>
                    <span>Audio</span>
                  </div>
                  {[
                    { name: 'Seedance 2.0',        text: true,  visual: true,  audio: true,  dead: false },
                    { name: 'Kling 3.0',           text: true,  visual: true,  audio: true,  dead: false },
                    { name: 'Veo 3.1',             text: true,  visual: true,  audio: true,  dead: false },
                    { name: 'Grok Imagine Video',  text: true,  visual: true,  audio: false, dead: false },
                    { name: 'Runway Gen-4.5',      text: true,  visual: true,  audio: false, dead: false },
                    { name: 'Aurora (image only)', text: true,  visual: true,  audio: false, dead: false },
                    { name: 'Pika 2.5',            text: true,  visual: true,  audio: false, dead: false },
                    { name: '🪦 RIP Sora 2',       text: true,  visual: true,  audio: true,  dead: true  },
                  ].map((p, i) => (
                    <div
                      key={p.name}
                      className={`grid grid-cols-4 px-4 py-2.5 text-xs items-center ${p.dead ? 'opacity-50' : i % 2 === 0 ? '' : 'bg-black/[0.015] dark:bg-white/[0.015]'}`}
                    >
                      <span className={`font-medium ${p.dead ? 'text-gray-400 dark:text-zinc-500' : 'text-gray-800 dark:text-zinc-200'}`}>{p.name}</span>
                      <span className={p.dead ? 'line-through' : ''}>{p.text ? '✓' : '—'}</span>
                      <span className={p.dead ? 'line-through' : ''}>{p.visual ? <span className={p.dead ? 'text-gray-400' : 'text-emerald-500 font-medium'}>✓</span> : '—'}</span>
                      <span className={p.dead ? 'line-through' : ''}>{p.audio ? <span className={p.dead ? 'text-gray-400' : 'text-violet-500 font-medium'}>✓</span> : <span className="text-gray-300 dark:text-zinc-600">—</span>}</span>
                    </div>
                  ))}
                </div>
                <p>
                  Text-only prompts leave most of the available control unused. The tools that accept reference images, audio clips, and video deliver substantially better results when you use those inputs.
                </p>
                <div className="rounded-xl border border-purple-200 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-950/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-2">Aurora (xAI) — what makes it different</p>
                  <div className="flex flex-col gap-1.5 text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                    <p><span className="font-semibold">Autoregressive, not diffusion.</span> Most image models use diffusion. Aurora predicts image tokens step-by-step — like an LLM — which gives it better coherence on complex multi-condition prompts but more latency.</p>
                    <p><span className="font-semibold">Generates real people.</span> Aurora will render named real individuals. DALL-E 3, Imagen, and Midjourney all refuse. This is both the standout feature and the source of ongoing regulatory scrutiny.</p>
                    <p><span className="font-semibold">Iterative chat editing.</span> Built into Grok's conversational interface — follow up with plain language corrections ("make the lighting warmer", "add sunglasses") rather than rewriting from scratch. It responds to these better than most peers.</p>
                    <p><span className="font-semibold">Prompting style:</span> Comma-separated ingredients outperform prose. Include lighting setup, medium, and lens/camera language. Handles up to ~1,000 characters — longer detailed prompts outperform short ones.</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="What to Actually Do About It" id="practitioners">
              <div className="flex flex-col gap-3">
                {[
                  {
                    title: 'Build a folder of reference images, not a folder of prompts',
                    body: 'Prompts go out of date between model versions. A good reference image — face, visual style, composition, colour palette — works across tools and stays useful indefinitely.',
                    color: '#f97316',
                  },
                  {
                    title: 'Use text to direct, not to describe',
                    body: "Once you have references, written text is directorial notes — what happens, how the camera moves, the emotional beat. It shouldn't carry the visual weight. \"Close-up on her face as she hears the news\" beats \"a beautiful cinematic close-up with dramatic lighting and emotional depth\".",
                    color: '#8b5cf6',
                  },
                  {
                    title: 'Replace large instruction docs with focused skills',
                    body: "If your AI agent runs on one massive instruction file, it's degrading over time. Break it into small skill files, each covering one type of task. Only the relevant one loads at any given moment — that's how reliable agent setups are built.",
                    color: '#f59e0b',
                  },
                  {
                    title: 'Write documentation that AI can actually use',
                    body: "AI agents don't skim. They read everything. If your internal docs are written for humans to scan quickly, the agent may not find what it needs. Key information must be explicit, not implied.",
                    color: '#a855f7',
                  },
                  {
                    title: 'Decide in advance what the AI can do on its own',
                    body: 'When AI produces code, content, or actions at speed, the bottleneck shifts to oversight. The teams that avoid costly mistakes define which decisions need a human in the loop — before they need that policy, not after.',
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
                  { label: 'Context Engineering for Coding Agents — Martin Fowler', url: 'https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html' },
                  { label: 'Seedance 2.0 Official — ByteDance Seed', url: 'https://seed.bytedance.com/en/seedance2_0' },
                  { label: 'Seedance 2.0 vs Veo 3.1: Which Is Best? — SitePoint', url: 'https://www.sitepoint.com/seedance-2-0-vs-veo-3-1-which-is-best-for-ai-video-creators/' },
                  { label: 'Seedance 2.0 Complete Guide — WaveSpeedAI', url: 'https://wavespeed.ai/blog/posts/seedance-2-0-complete-guide-multimodal-video-creation/' },
                  { label: 'Artificial Analysis Text-to-Video Leaderboard', url: 'https://artificialanalysis.ai/video/leaderboard/text-to-video' },
                  { label: 'MultiShotMaster (Kuaishou / Kling Research) — arXiv:2512.03041', url: 'https://arxiv.org/html/2512.03041' },
                  { label: 'VideoGen-of-Thought — arXiv:2503.15138', url: 'https://arxiv.org/abs/2503.15138' },
                  { label: 'Kling 3.0 Multi-Shot Prompting Guide — fal.ai', url: 'https://blog.fal.ai/kling-3-0-prompting-guide/' },
                  { label: 'Timeline Prompting with Seedance 2.0 — MindStudio', url: 'https://www.mindstudio.ai/blog/timeline-prompting-seedance-2-cinematic-ai-video' },
                  { label: 'Timestamp Prompting Guide — Artlist', url: 'https://artlist.io/blog/timestamp-prompting/' },
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
