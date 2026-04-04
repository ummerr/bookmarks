import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Methodology — prompts.ummerr.com',
  description: 'How the ummerr/prompts dataset is sourced, classified, and maintained. Selection criteria, classification schema, and tiered Claude pipeline.',
  openGraph: {
    title: 'Methodology — prompts.ummerr.com',
    description: 'How the ummerr/prompts dataset is sourced, classified, and maintained. Selection criteria, classification schema, and tiered Claude pipeline.',
    url: 'https://prompts.ummerr.com/methodology',
    siteName: 'prompts.ummerr.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Methodology — prompts.ummerr.com',
    description: 'How the ummerr/prompts dataset is sourced, classified, and maintained.',
  },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-xl md:text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

function PipelineStep({ step, model, label, desc }: { step: string; model: string; label: string; desc: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{step}</span>
        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400">{model}</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-5 pt-16 pb-24 flex flex-col gap-12">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-3">
            Methodology
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-gray-900 dark:text-white tracking-tight leading-tight">
            How this dataset is built
          </h1>
          <p className="mt-4 text-[15px] text-gray-500 dark:text-zinc-400 leading-[1.75] max-w-2xl">
            Most prompt datasets exist to evaluate models. This one exists to study practitioners.
            It captures what people actually type into image and video generators when they&apos;re
            trying to make something worth sharing — then classifies it so you can search, filter,
            and find patterns across a thousand-plus real-world prompts.
          </p>
        </div>

        {/* Source */}
        <Section title="Source">
          <div className="text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75] flex flex-col gap-3">
            <p>
              Primary source: high-engagement posts on X/Twitter — the platform where most AI
              generation work gets shared publicly. Secondary: Reddit communities
              (r/midjourney, r/StableDiffusion, r/FluxAI, r/kling_ai), which tend to reward
              technical depth and reproducibility over pure aesthetics. Supplementary: manual
              entries from tutorials and blog posts not covered by automated ingestion.
            </p>
            <p>
              &ldquo;High engagement&rdquo; means substantial view counts, reposts, and saves.
              This is a convenience sample filtered by community reception, not a random sample.
              That&apos;s deliberate — the filtering is the signal. A prompt that thousands of
              practitioners chose to amplify has passed a form of peer review that no annotation
              rubric can replicate.
            </p>
          </div>
        </Section>

        {/* Selection bias */}
        <Section title="Selection bias">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-400/[0.03] p-5">
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">This dataset is not representative of
              all prompting behavior.</strong> It skews toward successful outputs shared for
              engagement — visually impressive, socially shareable results. Failed attempts, iterative
              drafts, and everyday utility prompts are systematically under-represented. Platform
              coverage is English-dominant, X/Twitter-heavy. Professional workflows, Discord
              communities, and non-English practitioners are largely absent.
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
            That said: the bias is the dataset&apos;s signal. &ldquo;What do practitioners consider
            worth sharing?&rdquo; is itself a research question, and this dataset is purpose-built to
            answer it. If your analysis requires unbiased sampling, look elsewhere. If you want to
            study the social dynamics of prompt craft — what goes viral, what gets copied, what
            techniques spread — this is the dataset.
          </p>
        </Section>

        {/* Classification schema */}
        <Section title="Classification schema">
          <div className="text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75] flex flex-col gap-3">
            <p>
              Each prompt is classified using a structured schema designed for this dataset.
              The categories and labels are our own — built to describe practitioner behavior
              (what technique was used, what model, what visual intent) rather than to evaluate
              output quality.
            </p>
            <p>
              Each prompt is classified across five structured dimensions:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Category', desc: 'Modality + technique (e.g., video_t2v, image_i2i, image_character_ref)' },
              { label: 'Visual theme', desc: 'Subject matter (person, cinematic, landscape, sci-fi, fantasy, etc.)' },
              { label: 'Art style', desc: 'Aesthetic approach (photorealistic, anime, oil painting, pixel art, etc.)' },
              { label: 'Reference type', desc: 'Whether the prompt requires a reference image and what kind (face, style, subject, pose, scene)' },
              { label: 'Model family', desc: 'Which AI model is mentioned or inferred (Midjourney, Kling, Flux, etc.)' },
            ].map((d) => (
              <div key={d.label} className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] p-4">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{d.label}</span>
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Classification pipeline */}
        <Section title="Classification pipeline">
          <p className="text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
            Each prompt passes through a tiered pipeline of Claude models — smaller models handle
            routine classification, larger models handle ambiguity. Confidence scores are stored
            with every label. The original post text is always preserved, so reclassification is
            non-destructive.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <PipelineStep
              step="01"
              model="Haiku"
              label="Triage"
              desc="Initial pass: is this a generation prompt? Filter out non-prompt posts, determine modality (image vs. video), and flag ambiguous cases for escalation."
            />
            <PipelineStep
              step="02"
              model="Sonnet"
              label="Structured labeling"
              desc="Core classification: extract the clean prompt, detect model, assign category + technique, tag themes and art styles, identify reference requirements. Uses structured tool-use output with strict enum validation."
            />
            <PipelineStep
              step="03"
              model="Opus"
              label="Edge cases"
              desc="Complex or ambiguous prompts escalated from Sonnet: multi-technique workflows, unfamiliar tools, non-English content, and prompts requiring deeper contextual reasoning."
            />
          </div>
        </Section>

        {/* Scope */}
        <Section title="Scope">
          <div className="text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75] flex flex-col gap-3">
            <p>
              <strong className="text-gray-900 dark:text-white">Included:</strong> Image generation
              (text-to-image, image-to-image, character references, reference-guided generation) and
              video generation (text-to-video, image-to-video, reference-to-video, video-to-video).
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Excluded:</strong> LLM / text-generation
              prompts, audio generation, NSFW and sexualized content. This is a generative media dataset
              focused on craft-oriented prompting.
            </p>
          </div>
        </Section>

        {/* Update cadence */}
        <Section title="Update cadence">
          <p className="text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75]">
            Ingestion is rolling — new prompts arrive as practitioners share them. Reddit communities
            get periodic sweeps. The dataset is a living collection, not a static release. Every entry
            carries timestamps (<code className="text-xs font-mono bg-black/[0.04] dark:bg-white/[0.04] px-1.5 py-0.5 rounded">bookmarked_at</code>,{' '}
            <code className="text-xs font-mono bg-black/[0.04] dark:bg-white/[0.04] px-1.5 py-0.5 rounded">created_at</code>) so you can slice by time period.
          </p>
        </Section>

        {/* Limitations */}
        <Section title="Known limitations">
          <p className="text-[15px] text-gray-600 dark:text-zinc-300 leading-[1.75] mb-2">
            The short version: survivorship bias, platform skew, LLM classifier errors, and
            engagement-as-proxy-for-quality are all real concerns. We document each one honestly.
          </p>
          <Link
            href="/dataset"
            className="inline-flex items-center gap-1.5 text-sm text-violet-500 dark:text-violet-400 hover:underline"
          >
            Full limitations with mitigations on the dataset page &rarr;
          </Link>
        </Section>

        {/* Citation */}
        <Section title="Citation">
          <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.03] dark:bg-white/[0.03]">
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">BibTeX</span>
            </div>
            <pre className="px-4 py-4 text-[11px] font-mono text-gray-700 dark:text-zinc-300 leading-relaxed overflow-x-auto">{`@dataset{ummerr_prompts_2025,
  title        = {ummerr/prompts: An In-the-Wild Generative AI Prompt Dataset},
  author       = {ummerr},
  year         = {2025},
  url          = {https://prompts.ummerr.com/dataset},
  note         = {Organic prompts sourced from high-engagement posts on X/Twitter.
                  Covers image and video generation with structured
                  metadata, model attribution, and technique labels.},
  license      = {CC BY 4.0}
}`}</pre>
          </div>
        </Section>

        {/* Footer links */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <Link href="/dataset" className="text-sm text-violet-500 dark:text-violet-400 hover:underline">
            Dataset documentation &rarr;
          </Link>
          <Link href="/insights" className="text-sm text-violet-500 dark:text-violet-400 hover:underline">
            Dataset insights &rarr;
          </Link>
          <Link href="/prompts" className="text-sm text-violet-500 dark:text-violet-400 hover:underline">
            Browse prompts &rarr;
          </Link>
        </div>

      </div>
    </div>
  )
}
