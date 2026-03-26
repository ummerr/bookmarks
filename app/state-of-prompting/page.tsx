'use client'

import { useState, useEffect } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────

interface StatsData {
  total: number
  withReference: number
  withTheme: number
  byCategory: { label: string; value: number }[]
  byModel: { label: string; value: number }[]
}

// ── Mini components ─────────────────────────────────────────────────────────

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
    <div className="flex flex-col gap-4" id={id}>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight border-b border-black/[0.06] dark:border-white/6 pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Insight({ quote, source, color = '#1DA1F2' }: { quote: string; source: string; color?: string }) {
  return (
    <div
      className="rounded-xl border bg-white dark:bg-[#111] p-5"
      style={{ borderColor: `${color}30` }}
    >
      <p className="text-sm text-gray-700 dark:text-zinc-200 leading-relaxed italic">"{quote}"</p>
      <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">{source}</p>
    </div>
  )
}

function FindingCard({
  number,
  title,
  body,
  color,
}: {
  number: string
  title: string
  body: string
  color: string
}) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-5 flex gap-4">
      <div className="text-2xl font-bold tabular-nums shrink-0 w-8" style={{ color }}>
        {number}
      </div>
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
      <div className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight" style={{ color }}>
        {value}
      </div>
      <div className="text-xs font-medium text-gray-700 dark:text-zinc-300">{label}</div>
      {sublabel && <div className="text-[11px] text-gray-400 dark:text-zinc-500">{sublabel}</div>}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function StateOfPromptingPage() {
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const refPct = stats
    ? Math.round((stats.withReference / stats.total) * 100)
    : null

  const videoCats = ['video_t2v', 'video_i2v', 'video_r2v', 'video_v2v']
  const videoTotal = stats
    ? stats.byCategory.filter((c) => videoCats.includes(c.label)).reduce((s, c) => s + c.value, 0)
    : null
  const videoPct = stats && videoTotal !== null
    ? Math.round((videoTotal / stats.total) * 100)
    : null

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-10">

        {/* Hero */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-6 md:p-8 flex flex-col gap-5">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge color="#1DA1F2">March 2026</Badge>
            <Badge color="#8b5cf6">Video & Image AI</Badge>
            <Badge color="#f97316">Prompting Research</Badge>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">State of Prompting 2026</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Text prompts are no longer the primary interface for generative AI. This report traces the shift from
              freeform text to references, templates, and multimodal inputs — drawing on trends across the video AI
              industry and patterns from a hand-curated dataset of real-world prompts.
            </p>
          </div>
          <div className="flex flex-col gap-1 pt-2 border-t border-black/[0.06] dark:border-white/6">
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              Industry data sourced from public research, product announcements, and community analysis.
              Dataset insights from <span className="font-medium text-gray-600 dark:text-zinc-300">ummerr/ai-prompts</span> — a curated collection of real-world AI generation prompts.
            </p>
          </div>
        </div>

        {/* TL;DR findings */}
        <Section title="Key Findings">
          <div className="flex flex-col gap-3">
            <FindingCard
              number="01"
              color="#ec4899"
              title="Text prompts are losing ground to visual references"
              body="Experienced creators are moving away from writing prompts toward reference images, style boards, and character sheets. Text-to-video still accounts for ~66% of workflows by volume, but the highest-quality outputs increasingly come from reference-guided pipelines — not text alone."
            />
            <FindingCard
              number="02"
              color="#8b5cf6"
              title="Prompt engineering as a skill is effectively dead"
              body="The 'primitive era' of prompt crafting — trial and error, artisanal phrasing — ended between late 2024 and early 2025. What replaced it isn't better prompts; it's context engineering, agent orchestration, and multimodal inputs. Prompt Engineer was ranked second-to-last in new roles companies plan to hire for."
            />
            <FindingCard
              number="03"
              color="#f97316"
              title="Templates are the dominant behavior — but they're a crutch"
              body="Users overwhelmingly prefer templates over freeform prompting. They reduce cognitive load, ensure consistency, and compress iteration time by 50–70%. But borrowed templates produce borrowed results: the signal is in the specificity users add on top, not in the template itself."
            />
            <FindingCard
              number="04"
              color="#06b6d4"
              title="Video prompting has fundamentally changed"
              body="The best video prompts in 2026 don't describe what things look like — they describe the forces acting on them. Physics, causality, camera choreography, and audio cues have replaced adjective-heavy scene descriptions. Kling 3.0, Veo 3.1, and Sora 2 all reward structured, reference-anchored input over freeform prose."
            />
            <FindingCard
              number="05"
              color="#22c55e"
              title="Multimodal is the new default"
              body="Every major video platform now accepts text + image + audio + video as combined inputs. Kling 3.0 launched as the first unified multimodal video model. Kling 2.6 (December 2025) generates synchronized audio and video in a single pass. The era of the single text box is over."
            />
          </div>
        </Section>

        {/* Dataset stats */}
        {stats && (
          <Section title="From This Dataset">
            <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Patterns from <span className="font-medium text-gray-700 dark:text-zinc-200">{stats.total.toLocaleString()} real-world prompts</span> collected from practitioners sharing their work publicly — consistent with broader industry trends.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                value={`${refPct ?? '—'}%`}
                label="require a reference input"
                sublabel="face, style, object, or pose"
                color="#f97316"
              />
              <StatCard
                value={`${videoPct ?? '—'}%`}
                label="are video prompts"
                sublabel="T2V, I2V, R2V, V2V"
                color="#8b5cf6"
              />
              <StatCard
                value={stats.byModel.length.toString()}
                label="distinct AI models"
                sublabel="tracked in the wild"
                color="#1DA1F2"
              />
              <StatCard
                value={stats.withTheme.toLocaleString()}
                label="theme-tagged prompts"
                sublabel="person, cinematic, scifi…"
                color="#22c55e"
              />
            </div>
            {refPct !== null && refPct > 25 && (
              <div className="rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 p-4">
                <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                  <span className="font-semibold">{refPct}% of prompts in this dataset require a reference image</span> — nearly one in three.
                  This understates the real figure: many text prompts are also shared alongside a reference output image even when the technique doesn't formally require one.
                </p>
              </div>
            )}
          </Section>
        )}

        {/* The reference revolution */}
        <Section title="The Reference Revolution" id="references">
          <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <p>
              In 2023, the dominant mental model for AI generation was simple: write a better prompt, get a better image.
              Prompt engineering was positioned as a transferable skill — a new literacy.
              By 2025, that model had quietly collapsed.
            </p>
            <p>
              The shift happened incrementally. IP-Adapter and ControlNet made reference-guided generation accessible in Stable Diffusion.
              Midjourney introduced <code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">--sref</code> and <code className="text-xs bg-black/[0.05] dark:bg-white/[0.05] px-1 py-0.5 rounded">--cref</code>.
              Runway, Kling, and Veo built image-to-video as a first-class workflow — not an add-on.
              Character sheets replaced character descriptions. Style boards replaced style adjectives.
            </p>
            <p>
              The reason is simple: <span className="font-medium text-gray-900 dark:text-white">a reference image contains more information than any text description can.</span> Describing a face in words is lossy. Uploading a photo is not.
              Practitioners figured this out faster than platforms did.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {[
                { label: 'face_person', desc: 'Consistent character identity across frames and shots', color: '#ec4899' },
                { label: 'style_artwork', desc: 'Visual aesthetic locked to a reference image, not an adjective', color: '#8b5cf6' },
                { label: 'pose_structure', desc: 'ControlNet-style composition anchored to a skeleton or layout', color: '#f97316' },
              ].map((r) => (
                <div key={r.label} className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] p-4 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: r.color }}>{r.label}</span>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Templates */}
        <Section title="The Template Era" id="templates">
          <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <p>
              For every practitioner sharing a novel prompting technique, there are thousands of users who just want it to work.
              Templates fill that gap — and the data shows they dominate how people actually use generative AI.
            </p>
            <p>
              The appeal is straightforward: templates encode the structural knowledge so users don't have to.
              A good template for a cinematic shot pre-fills camera angle, lighting, lens, and mood —
              leaving the user to fill in only the subject. Iteration time drops 50–70%.
              The cognitive overhead of "what do I even say?" disappears.
            </p>
            <Insight
              quote="AI prompts are like recipes — you wouldn't use a cake recipe to make soup. Different content types need different prompt structures. By anchoring responses with predefined sections, you're not just asking what it should say, you're telling it how to say it."
              source="Prompt Engineering in 2025: The Latest Best Practices"
              color="#22c55e"
            />
            <p>
              But templates have a ceiling. Borrowed templates produce borrowed aesthetics.
              The practitioners who stand out are those who treat templates as a starting point —
              adding specificity, injecting their own references, and breaking structure intentionally.
              <span className="font-medium text-gray-900 dark:text-white"> The template is the floor, not the ceiling.</span>
            </p>
          </div>
        </Section>

        {/* Death of prompt engineering */}
        <Section title="Prompt Engineering Is Dead" id="prompt-engineering">
          <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <p>
              "Prompt engineer" had a brief moment as a serious job title — roughly 2023 to mid-2024.
              By 2025, it was ranked second-to-last among roles companies planned to hire for.
              IEEE Spectrum ran the obituary. Medium published dozens of takes. The consensus was clear.
            </p>
            <Insight
              quote="The primitive era of prompt engineering — characterized by trial-and-error iteration and artisanal prompt crafting — died somewhere between late 2024 and early 2025."
              source="Death of Prompt Engineering: AI Orchestration in 2026 — BigBlue Academy"
              color="#f97316"
            />
            <p>
              What replaced it wasn't simpler prompting — it was a different paradigm entirely.
              In mid-2025, Andrej Karpathy coined the term <span className="font-medium text-gray-900 dark:text-white">"context engineering"</span>:
              the art of filling the context window with the right information, not just the right words.
              For most production AI applications, the "prompt" is now a system — agents, tools, retrieval, structured outputs — not a sentence.
            </p>
            <p>
              For media generation specifically, the equivalent shift is from
              <span className="font-medium text-gray-900 dark:text-white"> describing output to providing input</span>.
              Instead of prompting Veo to create a scene, experienced creators upload a reference frame, a character sheet, and a motion brief.
              The text is directorial annotation on top of visual structure — not the primary signal.
            </p>
            <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/6 p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">What replaced prompt engineering</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                {[
                  { label: 'Context Engineering', desc: 'For LLMs — structuring the full context window, not just the prompt', color: '#8b5cf6' },
                  { label: 'Agent Orchestration', desc: 'Multi-step AI systems with tools, memory, and retrieval', color: '#3b82f6' },
                  { label: 'Reference-Guided Generation', desc: 'For media — images and video as the primary input signal', color: '#f97316' },
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

        {/* Video prompting in 2026 */}
        <Section title="Video Prompting in 2026" id="video">
          <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <p>
              Video prompting has diverged meaningfully from image prompting — not just in scale but in kind.
              The major models in early 2026 (Veo 3.1, Sora 2, Kling 3.0, Runway Gen-4.5) each have distinct prompting personalities,
              and practitioners have learned to write for the model, not just for the output.
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
                  desc: 'Loves structured input and reference frames. Accepts start and end frames for interpolation. Treat prompts like ingredient lists — precise, not poetic.',
                  color: '#1DA1F2',
                },
                {
                  model: 'Sora 2',
                  personality: 'Physics Simulator',
                  desc: 'Models cause and effect. Prompts that describe causal chains and world logic outperform adjective-heavy scene descriptions.',
                  color: '#8b5cf6',
                },
                {
                  model: 'Kling 3.0',
                  personality: 'Multimodal Engine',
                  desc: 'The first unified multimodal model — accepts text, image, audio, and video as combined inputs. Especially strong when multiple references need to work together.',
                  color: '#ec4899',
                },
                {
                  model: 'Runway Gen-4.5',
                  personality: 'Cinematic Realist',
                  desc: 'Leads on physics and visual fidelity. Less integrated audio than Kling. Rewards camera direction language: blocking, lens choice, depth of field.',
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
                </div>
              ))}
            </div>
            <p>
              The emergence of native audio generation is perhaps the most underappreciated shift.
              Kling 2.6 (December 2025) generates synchronized sound effects, ambient atmosphere, and dialogue in a single pass alongside video.
              Prompting for video now means prompting for an audiovisual experience —
              which requires practitioners to think in complete sensory briefs, not visual descriptions alone.
            </p>
          </div>
        </Section>

        {/* Multimodal */}
        <Section title="The Multimodal Default" id="multimodal">
          <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <p>
              The single text box is over. Every major platform now accepts combined inputs — and the best results require using them.
              This isn't a feature; it's an architectural shift in how generation works.
            </p>
            <div className="rounded-xl border border-black/[0.08] dark:border-white/8 bg-white dark:bg-[#111] overflow-hidden">
              <div className="grid grid-cols-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 border-b border-black/[0.06] dark:border-white/6 px-4 py-2.5">
                <span>Platform</span>
                <span>Text</span>
                <span>Image / Video</span>
                <span>Audio</span>
              </div>
              {[
                { name: 'Kling 3.0',      text: true,  visual: true,  audio: true,  note: 'Unified multimodal' },
                { name: 'Veo 3.1',        text: true,  visual: true,  audio: false, note: 'Start/end frame interpolation' },
                { name: 'Sora 2',         text: true,  visual: true,  audio: true,  note: 'Native audio gen' },
                { name: 'Runway Gen-4.5', text: true,  visual: true,  audio: false, note: 'Less integrated audio' },
                { name: 'Pika 2.5',       text: true,  visual: true,  audio: false, note: 'Speed-focused' },
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
              The implication for prompt design: practitioners who are still writing long text prompts
              are leaving quality on the table.
              The ceiling has moved — and it's only accessible through multimodal input.
            </p>
          </div>
        </Section>

        {/* What this means */}
        <Section title="What This Means for Practitioners">
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Build a reference library, not a prompt library',
                body: 'The most valuable asset for a generative AI practitioner in 2026 is a curated set of reference images — faces, styles, compositions, color palettes. Not a folder of prompts. Prompts are ephemeral; good references transfer across models and modalities.',
                color: '#f97316',
              },
              {
                title: 'Treat text as annotation, not as description',
                body: 'In a reference-guided workflow, text clarifies intent and adjusts emphasis. It doesn\'t bear the weight of the visual. The best video prompts in 2026 are directorial — they describe motion, timing, and emotional beats, not what the scene looks like.',
                color: '#8b5cf6',
              },
              {
                title: 'Understand the model\'s personality',
                body: 'Veo 3.1 rewards structured ingredient-list prompts. Sora 2 rewards causal descriptions. Kling 3.0 rewards multimodal bundles. Generic prompts produce generic results. Model-aware prompting is the new prompt engineering.',
                color: '#1DA1F2',
              },
              {
                title: 'Think in complete sensory briefs',
                body: 'Native audio generation means the best outputs come from prompts that describe the full audiovisual experience. Sound effects, ambient atmosphere, pacing, and music all belong in the brief — not as afterthoughts, but as primary creative direction.',
                color: '#06b6d4',
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

        {/* Sources */}
        <Section title="Sources">
          <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
            {[
              { label: 'The State of AI Video Creation 2026 — Vivideo', url: 'https://vivideo.ai/blog/state-of-ai-video-creation-2026' },
              { label: 'Prompt Engineering Is Dying — What\'s Replacing It in 2026 — Medium', url: 'https://medium.com/@shashanky485/prompt-engineering-is-dying-whats-replacing-it-in-2026-f88d821d77ee' },
              { label: 'Death of Prompt Engineering: AI Orchestration in 2026 — BigBlue Academy', url: 'https://bigblue.academy/en/the-death-of-prompt-engineering-and-its-ruthless-resurrection-navigating-ai-orchestration-in-2026-and-beyond' },
              { label: 'AI Prompt Engineering Is Dead — IEEE Spectrum', url: 'https://spectrum.ieee.org/prompt-engineering-is-dead' },
              { label: 'How to Actually Control Next-Gen Video AI — Medium', url: 'https://medium.com/@creativeaininja/how-to-actually-control-next-gen-video-ai-runway-kling-veo-and-sora-prompting-strategies-92ef0055658b' },
              { label: 'The State of AI Video Generation in February 2026 — Medium / Cliprise', url: 'https://medium.com/@cliprise/the-state-of-ai-video-generation-in-february-2026-every-major-model-analyzed-6dbfedbe3a5c' },
              { label: 'Veo 3.1 vs Top AI Video Generators: 2026 Comparison — PXZ', url: 'https://pxz.ai/blog/veo-31-vs-top-ai-video-generators-2026' },
              { label: 'Google Veo-3.1 vs. Sora 2 and Kling — AI/ML API Blog', url: 'https://aimlapi.com/blog/google-veo-3-1' },
              { label: 'Kling AI 3.0 Review 2026 — Cybernews', url: 'https://cybernews.com/ai-tools/kling-ai-review/' },
              { label: 'Prompt Engineering in 2025: The Latest Best Practices', url: 'https://www.news.aakashg.com/p/prompt-engineering' },
              { label: 'AI Video Trends: Predictions For 2026 — LTX Studio', url: 'https://ltx.studio/blog/ai-video-trends' },
              { label: 'Prompt Engineering Jobs Are Obsolete in 2025 — Salesforce Ben', url: 'https://www.salesforceben.com/prompt-engineering-jobs-are-obsolete-in-2025-heres-why/' },
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
    </div>
  )
}
