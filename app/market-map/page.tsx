import type { Metadata } from 'next'
import {
  CATEGORIES,
  CONTROL_POINTS,
  FINANCIALS,
  FLOW,
  HYPOTHESES,
  MENTION_INDEX,
  MOAT_MATRIX,
  MODEL_GROUPS,
  MOMENTUM,
  type MomentumEntry,
  NEAR_MOMENTUM,
  POSITIONING,
  SECTIONS,
  SOURCES,
  STACK_COMPANIES,
} from './data'
import { Section, Prose, Callout, StatTile, Cite, formatReportDate } from './components'
import Figure from './Figure'
import { Logo } from './Logo'
import MarketMapTOC from './MarketMapTOC'
import MentionIndex from './MentionIndex'
import MarketMapGrid from './MarketMapGrid'
import ModelTable from './ModelTable'
import MoatMatrix from './MoatMatrix'
import StackBars from './StackBars'
import HypothesisCard from './HypothesisCard'
import ControlPointCard from './ControlPointCard'
import ArrBars from './ArrBars'
import ValuationScatter from './ValuationScatter'
import QuadrantChart from './QuadrantChart'
import FlowDiagram from './FlowDiagram'

const TITLE = 'Generative Media Ecosystem Map — August 2026'
const DESCRIPTION =
  'A systems-level map of the generative media stack: how the architecture is consolidating, which layers are commoditizing, and where durable control points are forming in creative computing.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  alternates: { canonical: '/market-map' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://prompts.ummerr.com/market-map',
    siteName: 'prompts.ummerr.com',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export const dynamic = 'force-static'

function ChangeCard({ tag, tagColor, title, body }: { tag: string; tagColor: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] p-4 md:p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest rounded px-1.5 py-0.5"
          style={{ color: tagColor, background: `${tagColor}14` }}
        >
          {tag}
        </span>
        <span className="text-[14px] font-semibold text-gray-900 dark:text-white leading-snug">{title}</span>
      </div>
      <p className="text-[13px] text-gray-500 dark:text-zinc-400 leading-[1.7]">{body}</p>
    </div>
  )
}

const FACT = '#0ea5e9'
const PATTERN = '#f59e0b'
const THESIS = '#8b5cf6'

function MomentumItem({ m }: { m: MomentumEntry }) {
  return (
    <li className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] p-4 flex gap-4">
      <span className="font-mono text-sm font-bold tabular-nums text-violet-500 shrink-0 mt-0.5">
        {String(m.rank).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 dark:text-white leading-snug">
          <Logo domain={m.domain} name={m.name} size={16} />
          <span>
            {m.name}
            <span className="ml-2 font-normal text-gray-400 dark:text-zinc-500 text-[12px]">{m.what}</span>
          </span>
        </div>
        <div className="text-[13px] text-gray-500 dark:text-zinc-400 leading-[1.7] mt-1">{m.why}</div>
      </div>
    </li>
  )
}

export default function MarketMapPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex gap-10 items-start">
          <main id="mm-essay" className="flex-1 min-w-0 flex flex-col gap-12 md:gap-14">
            {/* Hero */}
            <header className="flex flex-col gap-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500/70">
                Field map · Data as of {formatReportDate()}
              </p>
              <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
                The Generative Media Ecosystem — An Architectural Map
              </h1>
              <p className="text-[15px] md:text-base text-gray-500 dark:text-zinc-400 leading-[1.75] max-w-3xl">
                A working map of how the generative media stack is actually structured: which
                layers are consolidating, which are commoditizing, and where durable control
                points appear to be forming. Treat it as a set of evolving hypotheses grounded in
                shipped systems rather than a settled verdict. Compiled from six research passes
                across roughly 150 sources, weighted toward January–August 2026 developments;
                figures marked <em>est.</em> are third-party estimates, not company-reported.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                <StatTile stat="$5.6B" label="AI-video funding, 2026 YTD — +43% vs all of 2025" />
                <StatTile stat="~$475M" label="Kling run-rate, Q2 2026 (filed Aug 19) — the adoption benchmark: filed, not claimed" />
                <StatTile stat=">10x" label="Video inference cost decline since 2024" />
                <StatTile stat="9 of 10" label="Top video models that are Chinese (AA arena, Aug 2026)" />
              </div>
              <MentionIndex companies={MENTION_INDEX} />
            </header>

            {/* §01 Thesis */}
            <Section id="thesis" title="What Changed, 2023 → 2026: From Single-Turn Generation to Continuous Creative Systems" eyebrow="§ 01">
              <Prose>
                <p>
                  In 2023 generative media ran on a three-step loop:{' '}
                  <strong>prompt → model → output</strong>. You typed, a diffusion model dreamed,
                  and you got one artifact — impressive, hard to steer, disposable. By August 2026
                  the loop that matters is{' '}
                  <strong>
                    intent → plan → generate → evaluate → edit → compose → collaborate → publish
                  </strong>
                  , and nearly every important product decision in the industry is about owning more
                  of it. Node canvases (Flora, Krea, ComfyUI, Figma Weave) turned generation into
                  pipelines; storyboard and character-persistence systems (LTX Studio, Higgsfield’s
                  Soul ID, Popcorn) turned pipelines into projects; and in 2026, creative agents
                  (Adobe Firefly Assistant, fal Agent, FAUNA, Creatify Agent) began turning projects
                  into delegated work.<Cite id="11" /><Cite id="17" />
                </p>
                <p>
                  The competitive battleground moved with it. In 2023–24 the fight was raw model
                  capability. In 2024–25 it was generation products. In 2025–26 it became creative
                  workflows — and the 2026 working hypothesis, held simultaneously by incumbents,
                  startups, and infrastructure companies, is that the end state is{' '}
                  <strong>multimodal creative agents: systems of creation, not tools of generation</strong>.
                  Raw capability is now the least defensible layer in the stack: video-model
                  leadership now turns over in weeks, and the top eleven models sit within
                  ~150 Elo of each other.<Cite id="28" /> The interaction model shifted with it:
                  pure text-to-video has become an onboarding feature, while production work runs
                  on image-to-video, multi-reference chaining, and keyframe conditioning — the same
                  reference shift this site’s own prompt dataset surfaced a year ago, now built
                  into the models themselves.
                </p>
                <p>
                  Two events define the year. On March 24, 2026, OpenAI announced
                  the shutdown of Sora — the best-known consumer video product in the West, dead in
                  six months on inference costs estimated anywhere from $1M to $15M a day against
                  roughly $2.1M of lifetime in-app revenue (both third-party
                  estimates).<Cite id="1" /> That same quarter, Kuaishou disclosed that Kling grew
                  revenue 300% year-over-year, ~70–75% of it from outside China (as of Q1) — the
                  best-grounded number in the industry, because it sits in a listed company’s
                  (unaudited interim) filings.<Cite id="3" /> The Q2 filing (August 19) shows the
                  curve still climbing on a consistent quarterly-annualized basis — roughly $360M
                  (Q1) to ~$475M (Q2), on over RMB 850M of quarterly revenue up more than 200%
                  year-over-year.<Cite id="47" /> Frontier quality with no distribution surface to
                  amortize its serving costs did not survive, while good-enough quality inside an
                  owned funnel became the industry’s filed-revenue benchmark — a difference of
                  system architecture, not of model capability. If the 36Kr-lineage reporting on
                  ByteDance holds — Seedance API revenue past RMB 1B a month by June, unaudited —
                  the same architecture is working at ~3.5x that scale inside
                  China.<Cite id="53" />
                </p>
              </Prose>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ChangeCard tag="Fact" tagColor={FACT} title="Standalone AI-video feeds haven't held" body="Sora shut down (app Apr 26, API Sep 24, 2026); Meta's Vibes limps at ~2M DAU (Nov 2025) with weak retention. AI video as a tool — inside CapCut, Shorts, ad platforms — is where the revenue actually is." />
                <ChangeCard tag="Fact" tagColor={FACT} title="Video quality converged; image held a frontier" body="~150 Elo covers the top 11 video models and 9 of the top 10 are Chinese. In image, GPT Image 2 still holds every #1 — though MAI-2.6's August debut cut the Arena lead from ~83 to 45 Elo — the one modality where frontier capability still differentiates." />
                <ChangeCard tag="Fact" tagColor={FACT} title="Generation went free at the point of distribution" body="Veo free in YouTube Shorts, Seedance in CapCut, Adobe's 12-month unlimited-generations promo, Amazon giving ad creative away, Apple shipping photorealistic generation in iOS 27. The standalone generation button is rapidly losing pricing power." />
                <ChangeCard tag="Fact" tagColor={FACT} title="Music flipped from lawsuits to licenses in nine months" body="WMG and BMG settled with Suno while UMG and WMG captured Udio as a label-controlled walled garden; UMG's suit against Suno is still live. Suno settled from strength at $5.4B, and licensed catalogs are now the durable advantage." />
                <ChangeCard tag="Pattern" tagColor={PATTERN} title="Everyone shipped a creative agent in 2026" body="Adobe, fal, Flora, Krea, Creatify, Amazon — every layer of the stack converged on the same product. The durable advantage is shifting from model access to creative state: characters, brand constraints, project memory." />
                <ChangeCard tag="Pattern" tagColor={PATTERN} title="Omni absorption is compressing the specialist tail" body="Native audio, lip-sync, video editing, and camera control folded into frontier models in 18 months. Specialists survive only behind hard workflow or real-time constraints: 3D rigging, fidelity upscaling, <500ms avatars." />
                <ChangeCard tag="Pattern" tagColor={PATTERN} title="World models became the capital magnet — and left entertainment" body="Over $3B into World Labs, Decart, and Odyssey in 2026, with monetization pivoting from playable worlds to AV/robotics simulation. GenMedia technology is exiting media at the frontier." />
                <ChangeCard tag="Thesis" tagColor={THESIS} title="The market bifurcated by geography and business model" body="The West monetizes GenMedia as enterprise software and platform features; China monetizes it as direct consumer and creator revenue. What holds up under churn is distribution, creative state, and licenses — not model checkpoints." />
              </div>
            </Section>

            {/* §02 Market map */}
            <Section id="market-map" title="The Market Map" eyebrow="§ 02">
              <Prose>
                <p>
                  Eight categories, organized by job-to-be-done rather than model modality, holding
                  only strategically meaningful companies. The foundation-model layer is mapped
                  separately in §06, and who-owns-which-layers in §03.
                </p>
              </Prose>
              <Figure
                id="fig-market-map"
                num={1}
                title="The Generative Media Ecosystem Map, August 2026"
                takeaway="Eight categories by job-to-be-done, architecturally meaningful companies only — with a one-line technical thesis (Durable / Fragile / Unproven) inline on every entry."
                notes={
                  <>
                    <p>
                      Panel color groups the category; the dot beside each name marks company kind
                      (violet startup, gray incumbent, pink frontier lab). ▲ marks membership in the
                      Momentum 25 (§09). Figures are dated per entry — an amber date means the
                      underlying number was more than 90 days old at publication.
                    </p>
                    <p>
                      Inclusion is editorial: companies appear only where they hold a strategically
                      distinct position, so absence is not a judgment of quality. The
                      foundation-model layer is mapped separately in §06.
                    </p>
                  </>
                }
              >
                <MarketMapGrid categories={CATEGORIES} />
              </Figure>
            </Section>

            {/* §03 Battle A: the surface — vertical integration + incumbents vs startups */}
            <Section
              id="vertical-integration"
              title="The Battle for the Surface: Model Ownership vs Distribution"
              eyebrow="§ 03"
              takeaway="A model fused to owned distribution compounds data, cost, and default status; a frontier model without a surface has no loop to close."
            >
              <Prose>
                <p>
                  Who owns which layers decides who keeps the margin when model quality
                  converges. The 2x2 plots the two ownership axes that matter most — model
                  ownership and distribution ownership — and the bars underneath give the full
                  layer-by-layer detail; the incumbent and startup evidence follows from them.
                </p>
              </Prose>
              <Figure
                id="fig-ownership-2x2"
                num={2}
                title="Model ownership vs distribution ownership"
                takeaway="Up-and-right compounds — a model fused to a billion-user surface closes its own feedback loop. The lower-right, frontier labs without a surface, has no loop to close."
                notes={
                  <p>
                    Positions are editorial judgments on a 0–100 scale, not measurements. Dot color
                    follows the map legend (violet startup, gray incumbent, pink frontier lab). The
                    washed quadrant marks the compounding position; Sora is the case study for what
                    happens in the lower-right with no distribution surface to close the
                    loop.<Cite id="1" />
                  </p>
                }
              >
                <QuadrantChart companies={POSITIONING} />
              </Figure>
              <Figure
                id="fig-stack-ownership"
                num={3}
                title="Who owns which layers of the stack"
                takeaway="Each color is a layer; an unbroken run of color is vertical integration — the compounding position. Quiet dots mark layers a company rents from someone else."
                notes={
                  <>
                    <p>
                      Layer ownership is an editorial judgment of where a company operates with
                      strategic weight, not a product inventory — Adobe’s de-emphasized own models
                      still count as a model layer; Vercel-style gateways don’t make everyone an
                      infrastructure owner. Rows sort by layers owned.
                    </p>
                    <p>
                      Full-stack (5/5) demands frontier capital intensity — only Google and
                      ByteDance sustain it. Deliberate single-layer specialists (Black Forest Labs
                      licensing models, fal owning inference) trade ceiling for focus. The dangerous
                      position is the unowned middle: an application renting models with no workflow
                      state above and no cost advantage below.
                    </p>
                  </>
                }
              >
                <StackBars companies={STACK_COMPANIES} />
              </Figure>
              <span id="incumbents" className="block scroll-mt-20" aria-hidden />
              <Prose>
                <p>
                  Incumbent advantages bind in four places. <strong>Distribution and bundling</strong>:
                  Google made video generation a feature of a 1B-MAU assistant and a roughly $8–200/month
                  subscription ladder — after Sora’s exit it won the Western consumer field largely
                  uncontested.<Cite id="19" /> <strong>Ad-system data</strong>: Meta’s GEM models
                  optimize creative against auction outcomes, a closed loop no startup can enter,
                  now feeding its in-house Muse model and a stated goal of fully automated ad
                  creation by end-2026.<Cite id="31" /> <strong>Enterprise workflow and
                  indemnification</strong>: Adobe’s AI-first ARR passed $500M growing 3x
                  year-over-year — and notably, Adobe now monetizes <em>other companies’</em> models
                  through its surfaces.<Cite id="16" /> <strong>Compute economics</strong>: Google’s
                  TPUs and ByteDance’s scale run video inference at costs that killed Sora.
                </p>
                <p>
                  Incumbents also failed visibly: OpenAI exited consumer video; Meta’s Movie Gen
                  never shipped and Vibes has no retention story; Microsoft has no video model
                  (its MAI foray is image-only so far — though MAI-Image-2.6 debuted at Arena #2
                  in August<Cite id="43" />); Amazon’s Nova is an ads utility nobody picks on
                  merit; Apple is two years behind on quality. xAI is the ambiguous case: Grok
                  Imagine took both AA video arenas in late January, Video 1.5 now prices at
                  ~$4.20 per minute (~86% below Sora), and it ships
                  inside X — distribution plus a cheap in-house frontier model — yet it went
                  paid-only in March, the Chinese wave has since pushed it down the video boards,
                  and xAI discloses no usage or revenue.<Cite id="52" /> The pattern: incumbency
                  wins where an existing engine (ads, enterprise
                  seats, OS distribution) absorbs generation as a feature — not where incumbents
                  chase new consumer behavior.
                </p>
                <p>
                  Startups can still build $10B+ companies in five lanes: <strong>audio</strong>{' '}
                  (ElevenLabs at $11B and $600M ARR proves a full-stack modality winner where
                  incumbents under-invested); <strong>enterprise vertical video</strong> (Synthesia
                  compounds at 140%+ NRR and HeyGen at break-even, beneath incumbent attention);{' '}
                  <strong>cost-disciplined consumer video</strong> (Kling, PixVerse, Hailuo — the
                  discipline Sora lacked); <strong>media-native infrastructure</strong> (fal — every
                  new model widens the serving problem it is paid to solve); and{' '}
                  <strong>open-weights and world models</strong> (BFL,
                  Lightricks, World Labs — being the neutral standard as media and simulation
                  converge).
                </p>
              </Prose>
            </Section>

            {/* §04 Battle B: state — creative agents & the workflow layer */}
            <Section
              id="workflow-layer"
              title="The Battle for State: Creative Agents & the Workflow Layer"
              eyebrow="§ 04"
              takeaway="Every layer of the stack shipped a creative agent in 2026; what accumulates is creative state. Demand-side proof that creators want delegation is still missing."
            >
              <Prose>
                <p>
                  A genuine new layer formed between applications and foundation models, and 2026 is
                  the year every player in the stack tried to claim it. The node-canvas cohort
                  (Flora, Krea Nodes, Freepik Spaces, ComfyUI) made multi-model pipelines a
                  first-class artifact; the defining pattern of 2026 is that each of them then
                  shipped an <strong>agent that builds the workflow for you</strong> — Flora’s FAUNA,
                  Krea’s Node Agent, Adobe’s Firefly Assistant orchestrating Photoshop-to-Premiere,
                  Amazon’s free Creative Agent, and in August, fal Agent reaching up from the
                  inference layer.<Cite id="11" /><Cite id="14" />
                </p>
                <p>
                  What accumulates in this layer is not model access — every player rents the same
                  shelf — but <strong>creative state</strong>: Higgsfield’s Soul ID carries a trained
                  character identity across models and sessions; Creatify locks verified brand facts
                  as generation constraints; fal Agent keeps persistent project memory; Figma turned
                  Weave workflows into shareable community assets.<Cite id="15" /> State means
                  switching costs, and switching costs are what the model layer structurally lacks.
                  The mechanism compounds: accumulated state raises first-pass success, fewer
                  retries lower effective generation cost, better output feeds back into richer
                  state — and each pass deepens the switching cost.
                </p>
                <p>
                  The acquisitions already register what buyers think accumulates here. Weavy
                  raised ~$4M and sold to Figma for over $200M; Visual Electric’s team went to
                  Perplexity and the product died; Leonardo disappeared into Canva. The layer’s
                  most instructive shutdown argues the same case from the other side: Sora had the
                  best-known model in the world and no workflow, no B2B motion, no state — and
                  it’s gone.<Cite id="1" />
                </p>
                <p>
                  What no one in this layer has yet shown is demand-side proof. Every revenue
                  figure here is earned by the surface underneath the agent — fal’s inference,
                  Adobe’s suite, HeyGen’s avatar product — not by the agent itself: fal Agent is a
                  week old, Adobe reports Firefly Assistant “traction” without disclosing usage,
                  and FAUNA’s marquee logos come with no revenue attribution. The most telling
                  signal may be Google, which shipped Flow Agent to every tier at I/O in May —
                  free accounts included — while keeping Veo generation itself behind the
                  paywall.<Cite id="58" /> The player best positioned to charge for an agent
                  chose to price it at zero and monetize the layer beneath it. Three months in,
                  that is the honest read on the whole pattern: the agent is a funnel to
                  generation spend, not yet a product anyone has demonstrated people will pay
                  for.
                </p>
                <Callout tone="violet">
                  <strong>Verdict:</strong> the workflow/agent layer is becoming the primary
                  control point of GenMedia, but it is contested from both directions at once —
                  Adobe, Google Flow, Canva, and Figma extend down into it from owned surfaces
                  while fal and ComfyUI build up into it from the serving layer. The open question
                  for independent workflow companies is whether 2026’s growth converts into
                  accumulated enterprise state — project memory, brand constraints, reusable
                  pipelines — before both fronts arrive. On current evidence the strongest
                  positions belong to Adobe, Figma, and Google among incumbents; Higgsfield,
                  Magnific, and Flora among startups; and fal as the infrastructure entrant
                  working upward.
                </Callout>
              </Prose>
            </Section>

            {/* §05 Battle C: underneath — infrastructure & orchestration (merged) */}
            <Section
              id="orchestration"
              title="The Battle Underneath: Infrastructure & Orchestration"
              eyebrow="§ 05"
              takeaway="Media serving is structurally different work from LLM inference — durable while the model zoo stays heterogeneous, compressed the day an open serving standard wins."
            >
              <span id="infrastructure" className="block scroll-mt-20" aria-hidden />
              <Prose>
                <p>
                  Media generation is not LLM inference with bigger outputs — it is structurally
                  different work. A video job is a long-running batch process, not a token stream,
                  which forces queueing, webhooks, retries, and preemption-tolerant scheduling.
                  The model zoo is architecturally heterogeneous (DiT, autoregressive, GAN
                  upscalers, TTS, 3D) with no shared serving standard —{' '}
                  <strong>there is no dominant open serving standard for diffusion</strong> —
                  vLLM-Omni (open-sourced Nov 2025) is the first credible contender<Cite id="50" /> — which is why
                  fal builds tracing compilers and Decart builds sub-40ms kernels by hand. Chaining those
                  architectures in one pipeline spikes VRAM unpredictably, and a mid-render
                  failure burns minutes of GPU time unless the stack does stateful checkpoint
                  recovery — a failure mode token streaming simply doesn’t have. Caching differs
                  in kind too: hot-swappable LoRA weights and reusable keyframe latents, not
                  prefix caches. Intermediate assets are gigabyte-scale per job, making storage
                  and egress a real serving-cost line. And evaluation is still blind human preference:
                  nothing machine-scores temporal consistency, character permanence, or edit
                  fidelity at scale.
                </p>
                <p>
                  Model proliferation created a real orchestration layer — but 2026 showed it splits
                  into two fates. Media-native orchestration with hard engineering depth is durable
                  and compounding: fal roughly doubled from ~$200M to ~$400M annualized revenue in
                  months, raised at $4.5B in December, and was reportedly in talks at ~$8B by
                  March.<Cite id="10" /> Its drivers don’t reverse — a majority-Chinese video model
                  supply that Western apps won’t integrate one-by-one, bursty GPU economics, and
                  weekly model churn that makes single-vendor commitments irrational. Runware ($50M Series
                  A, containerized 1MW inference pods) and WaveSpeed (fastest non-China access to
                  Chinese models) are growing in its wake.
                </p>
                <Figure
                  id="fig-model-flow"
                  num={4}
                  title="The model supply chain"
                  takeaway="Foundation models → aggregators → output surfaces. Band width marks how load-bearing a connection is; the heavy left-side bands are the point — the video shelf is majority-Chinese, and Western apps reach it through aggregators."
                  notes={
                    <p>
                      Band color follows the source model; weights are editorial judgments of how
                      load-bearing each integration is, not measured volume. Leverage sits at
                      the two ends — frontier models and owned distribution — while the middle
                      holds its position only by adding workflow state (fal Agent, ComfyUI JSON,
                      Soul ID) on top of routing. Google Flow is the first-party exception:
                      orchestration that only ever routes Veo, holding the column by owning both
                      ends instead.<Cite id="10" /><Cite id="11" /><Cite id="13" />
                    </p>
                  }
                >
                  <FlowDiagram flow={FLOW} />
                </Figure>
                <p>
                  Thin aggregation without that depth gets absorbed: Replicate — the #2 independent
                  media marketplace — sold to Cloudflare.<Cite id="12" /> Gateways (Vercel’s now
                  lists 33 image and 32 video models) commoditize the unified-API surface from the
                  side, and hyperscalers own regulated-enterprise workloads by default. Meanwhile
                  ComfyUI’s JSON workflows are quietly becoming the portable orchestration format —
                  the closest thing GenMedia has to Terraform.<Cite id="13" />
                </p>
                <p>
                  Acquirers have started registering these gaps. Cloudflare bought Replicate and
                  rights-marketplace Human Native; Anthropic is reportedly closing in on acquiring
                  Decart at ~$7B — advanced drafts exchanged by mid-August, mostly stock, with
                  chosen over a higher NVIDIA offer — a frontier lab valuing a media inference-optimization stack at
                  acquisition scale.<Cite id="23" /><Cite id="48" /> On the compliance side, EU AI Act Article 50
                  transparency obligations began enforcement August 2, 2026, mandating C2PA
                  metadata plus imperceptible watermarking — 6,000+ organizations have adopted
                  C2PA, with Midjourney the prominent holdout — while China’s labeling regime has
                  been live since September 2025.<Cite id="29" /><Cite id="38" /> Demand for
                  provenance now outruns the technology: metadata still doesn’t survive re-encoding
                  and platform uploads.
                </p>
                <p>
                  What remains genuinely unsolved at this layer — a standard serving engine,
                  automated evaluation, provenance that survives distribution, long-form
                  continuity at viable unit cost, rights clearing — is cataloged with the rest of
                  the open problems in the Saturated Zones & Open Problems section (§10).
                </p>
                <Callout tone="amber">
                  <strong>Where the leverage sits:</strong> at the two ends of the pipeline rather
                  than the middle, and the gradient looks structural rather than cyclical. Model
                  owners set the marginal cost floor, while surfaces holding accumulated state —
                  characters, brand constraints, project memory — set what users actually pay; a
                  pure router between them competes on latency and price with no state of its own
                  to defend. The most honest signal comes from fal itself, which launched an agent
                  in August 2026 despite winning the orchestration layer — a working admission
                  that raw routing, however well engineered, does not hold its margin structure
                  once the serving problem is solved more than once.<Cite id="11" />
                </Callout>
              </Prose>
            </Section>

            {/* §06 Models */}
            <Section
              id="models"
              title="The Foundation Model Landscape"
              eyebrow="§ 06"
              takeaway="No single model wins every workload, and each modality is converging toward a different economic structure; treat every ranking as dated the week it posts."
            >
              <Prose>
                <p>
                  There is no single foundation-model market. Each modality is converging toward
                  a different economic structure: video toward codec-like ubiquity — critical,
                  everywhere, rarely paid for directly, monetized by whoever owns the surface it
                  runs in; image holding an LLM-like frontier premium for now; audio behaving
                  like creative software fused to content licensing; 3D defended by hard workflow
                  constraints; and world models trading as simulation optionality.
                </p>
                <p>
                  The landscape has
                  consolidated into three durable archetypes: distribution-owned omni models
                  (Google, ByteDance, Kuaishou, xAI), independent pro-grade labs (Runway, BFL, Luma,
                  ElevenLabs, Reve), and open or China-first price leaders (Alibaba, Tencent,
                  MiniMax, Lightricks). A dated-as-of stamp matters more than any ranking: video
                  leaderboard half-life ran one to two quarters through 2025 and is now
                  compressing toward weeks.<Cite id="28" /> Treat the arenas
                  (Artificial Analysis, and Arena — formerly LMArena, rebranded January
                  2026<Cite id="39" />) with a second caveat: the literature shows models post
                  inflated consistency scores on quasi-static scenes — motion magnitude trades off
                  against temporal coherence — so professional buyers increasingly select on
                  control surfaces (first/last-frame conditioning, motion masks, reference counts)
                  rather than rank.
                </p>
              </Prose>
              <div className="flex flex-col gap-8">
                {MODEL_GROUPS.map((g) => (
                  <ModelTable key={g.modality} group={g} />
                ))}
              </div>
            </Section>

            {/* §07 Economics */}
            <Section
              id="economics"
              title="Economics: Cost Structure & Adoption Signals"
              eyebrow="§ 07"
              takeaway="The durable revenue pools sit at the bottom of the stack and in owned weights; app-layer economics hinge on whether inference deflation accrues to margins or is competed away."
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile stat="50–60%" label="Revenue kept after model-serving costs — apps on third-party models (Bessemer, Feb 2026)" />
                <StatTile stat="2–5x" label="Effective cost vs list price once retries are counted" />
                <StatTile stat="$0.02–0.75" label="Per-second video API price envelope, frontier to challenger" />
                <StatTile stat="~$400M" label="fal annualized revenue — the orchestration proof point" />
              </div>
              <Figure
                id="fig-arr-club"
                num={5}
                title="The $100M+ ARR club"
                takeaway="Annual recurring revenue in $M, sorted by midpoint. Fill saturation encodes evidence quality — from filed numbers down to claimed-and-unverified."
                notes={
                  <p>
                    Figures are as of the date on each entry in the map above. Canva (~$4B total
                    ARR) is excluded — its revenue is not GenMedia-attributable and would break the
                    scale. ByteDance’s Seedance is also off the chart: reportedly over RMB 1B a
                    month (~$1.7B annualized) via 36Kr-lineage press<Cite id="53" />, with no
                    company-disclosed figure to plot. Lighter extensions mark estimate ranges (Runway, Midjourney). Evidence
                    tiers: audited/filed figures (Kling, via Kuaishou’s interim
                    filings<Cite id="47" />), company-stated, third-party estimates, and claimed
                    (Higgsfield’s $700M annualized is company-claimed and unverified<Cite id="40" />).
                  </p>
                }
              >
                <ArrBars entries={FINANCIALS} />
              </Figure>
              <Prose>
                <p>
                  The $100M+ ARR club as of August 2026, weighted by evidence quality: Higgsfield
                  (claimed $700M annualized on the heels of its Aug 17 round — company figures,
                  unverified), Kling (~$475M run-rate per the Aug 19 Q2 filing), ElevenLabs ($600M,
                  company-stated Jul 2026), Adobe AI-first (over $500M, earnings), Canva (~$4B+ total ARR with AI as
                  retention), fal (~$400M est.), Suno (~$300M est.), Runway (est. $100–300M
                  with wide variance — trackers est. ~$300M annualized by late 2025), Magnific ($230M
                  company-stated), HeyGen ($200M company-stated, near break-even), Synthesia
                  (~$150M), Gamma ($100M+, profitable), Midjourney (~$200–500M est., wide
                  variance).<Cite id="3" /><Cite id="8" /><Cite id="16" /><Cite id="40" />{' '}
                  Sector funding: AI video alone took $5.6B in 2026 year-to-date, 43% above all of
                  2025 — concentrated in model builders and world models, while thin-wrapper seed
                  activity visibly cooled.<Cite id="30" /> How that committed capital compares
                  with demonstrated adoption, company by company, is charted in the closing
                  section (Fig. 08).
                </p>
                <p>
                  <strong>Where does the money settle when an app calls someone else’s
                  model?</strong> The durable pools sit at the bottom and at the optimization
                  layer: GPU landlords (CoreWeave’s $21B Meta expansion), media-native inference
                  (fal’s kernel spread), and apps that serve their own weights — the four
                  strongest cost structures among GenMedia app companies (ElevenLabs, HeyGen,
                  Synthesia, Midjourney) all own their models. Apps renting third-party video
                  models send 40–50% of revenue back out as model serving cost and escape through
                  credit-pricing breakage, retry reduction, and riding a cost curve that
                  falls ~10x per 18 months while their credit prices fall slower.<Cite id="36" />{' '}
                  That last point is the open variable rather than a settled tailwind: app-layer
                  cost structures <em>improve</em> with every quarter of inference deflation only
                  if credit prices keep falling slower than serving costs — and nothing in the
                  2026 data yet shows whether the deflation accrues to the apps or gets competed
                  away as cheaper generations.
                </p>
                <p>
                  Attractive economics: audio/voice, enterprise avatar video, media inference
                  infrastructure, model-licensing-to-platforms (BFL’s ~$300M of contracts), and
                  compliance/provenance tooling with regulatory forcing functions. Structurally
                  difficult: consumer free-tier video (Sora’s shutdown), thin wrappers, frontier
                  video labs without distribution, and licensing intermediaries with thin take
                  rates. One threshold worth watching: if per-second video pricing breaks below
                  ~$0.005, programmatic ad video at auction scale becomes economical — and the
                  largest commercial use case moves from creative teams to ad servers.
                </p>
              </Prose>
            </Section>

            {/* §08 What holds up: durability + open weights + geography (merged) */}
            <Section
              id="moats"
              title="What Holds Up: Durability, Open Weights & Geography"
              eyebrow="§ 08"
              takeaway="Positions anchored in accumulated state, enforceable rights, or physical capital hold under model churn; positions anchored in model capability alone do not."
            >
              <Prose>
                <p>
                  Layer by layer: which forms of differentiation hold up under model churn, which
                  architectural levers make them stick, and where the current advantage is likely
                  to commoditize within a couple of years. The pattern that emerges is consistent
                  with the rest of the map: durability comes from distribution, accumulated
                  state, enforceable rights, hard workflow or real-time constraints, a
                  proprietary cost advantage, or capital-intensive physical infrastructure — and
                  model capability alone holds only while it is fused to one of them.
                </p>
              </Prose>
              <Figure
                id="fig-moat-matrix"
                num={7}
                title="Durability and commoditization risk, layer by layer"
                takeaway="Where durable advantages can still form — and which layers are already commodity. Low risk clusters where courts, capital intensity, or regulation enforce the position."
                notes={
                  <p>
                    Risk is the likelihood that the layer’s current differentiation commoditizes
                    within roughly 24 months. Assessments are editorial, synthesized from the
                    leaderboard-turnover, pricing, and licensing evidence in §06, §07, and the
                    open-weights record below.<Cite id="28" /><Cite id="36" />
                  </p>
                }
              >
                <MoatMatrix rows={MOAT_MATRIX} />
              </Figure>
              <h3 id="open-source" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-zinc-400 mt-2 scroll-mt-20">
                Open weights: what open is now for
              </h3>
              <Prose>
                <p>
                  The open-closed gap now differs sharply by modality. In <strong>video</strong> it
                  nearly closed: MiniMax’s H3 put open weights at #3 overall — with the
                  geopolitical caveat that its license excludes local deployment in the US, EU, UK,
                  and Korea, a new "open for China and the rest-of-world" flavor. Truly permissive
                  open video (LTX-2’s 4K-plus-audio on a single consumer GPU, Hunyuan, Wan ≤2.2)
                  trails the frontier by a clear tier.<Cite id="27" /> In <strong>image</strong> the
                  gap is small — FLUX.2 Dev is the open standard — but watch the direction of
                  travel: Alibaba, BFL, and MiniMax are all gating their newest tiers. Open weights
                  are increasingly a trailing-edge distribution strategy, not a frontier strategy.
                  In <strong>audio</strong>, weights are irrelevant — licensed catalogs are the
                  durable advantage. In <strong>3D</strong>, open (Hunyuan3D) is genuinely competitive. In{' '}
                  <strong>world models</strong>, NVIDIA’s Cosmos 3 is the open anchor, deliberately
                  arming the ecosystem the way Llama armed LLMs.<Cite id="21" />
                </p>
                <p>
                  Wan is the cleanest case study in what open weights are now for. Alibaba’s own
                  figures put the series past 6.9M downloads by August 2025, and the 2.1/2.2
                  checkpoints remain the default base for ComfyUI video work and the dominant
                  fine-tune target on Civitai — an installed base every Western aggregator
                  resells.<Cite id="61" /> But the open line quietly stopped there: every flagship
                  since — 2.5 through 3.0 — ships API-only on Alibaba Cloud at per-second pricing,
                  while Apache-licensed side models keep goodwill flowing to the ecosystem. Read as
                  a funnel, the conversion looks complete — build the substrate open, sell the
                  frontier closed — and the community has registered it: the loudest response to
                  Wan 3.0’s #1 debut came from the open-source side that built on 2.2, treating the
                  release as confirmation the open era is over.<Cite id="62" /> The concentration
                  underneath is easy to miss: counting the newer HappyHorse line from a second
                  internal team, Alibaba holds five of the top eight slots on the AA text-to-video
                  board. A workflow standardized on "open video" today is standardized on a line
                  its owner has already stopped feeding.
                </p>
                <p>
                  The pricing implication holds across every modality open weights reach: they
                  cap the price umbrella, which pushes closed labs toward distribution fusion,
                  licensing, or robotics — exactly the pivots Runway, BFL, and Luma made this
                  year.
                </p>
              </Prose>
              <h3 id="geography" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-zinc-400 mt-2 scroll-mt-20">
                Geography: who owns which revenue
              </h3>
              <Prose>
                <p>
                  <strong>China owns consumer GenMedia revenue and export.</strong> Kling is the
                  global filed-revenue leader in video and ByteDance’s Seedance API reportedly
                  runs at roughly 3.5x that scale, unaudited and almost entirely domestic — the
                  figures are in §01<Cite id="53" />; MiniMax IPO’d in
                  Hong Kong with a +109% debut — beating every US lab to public markets, though its
                  prospectus is candid about how early the monetization is: US$79M of FY2025
                  company-wide revenue, with Hailuo an undisclosed slice of a $53.1M consumer
                  bucket<Cite id="64" />; PixVerse
                  raised $439M at a $2B+ valuation on 150M claimed registered users; ByteDance ships
                  Seedance to emerging markets first through CapCut.<Cite id="3" /><Cite id="24" /><Cite id="25" />{' '}
                  Alibaba and Tencent supply the open-weights substrate (Wan, Hunyuan) that runs
                  half the world’s ComfyUI workflows. The constraint is trust: the Disney, Universal, and
                  Warner suit against MiniMax survived its motion to dismiss in May 2026 and is
                  heading into the merits,<Cite id="63" /> and Western enterprise procurement mostly
                  can’t adopt Chinese models — which bifurcates the market and protects Adobe/Runway/licensed-lane
                  pricing in regulated segments.
                </p>
                <p>
                  <strong>The US owns platforms, enterprise monetization, and image.</strong>{' '}
                  Google is the only player integrated from silicon to YouTube; OpenAI leads image;
                  Adobe leads governed enterprise workflow. <strong>Europe owns durable
                  verticals</strong> rather than platforms: audio (ElevenLabs, UK/Poland), open
                  image (Black Forest Labs, Germany), enterprise video (Synthesia, UK), aggregation
                  (Magnific, Spain; Runware, UK) — while the EU AI Act makes provenance a
                  compliance advantage for whoever already has the machinery.<Cite id="29" />{' '}
                  <strong>Israel</strong> punches above its weight in open video (Lightricks) and
                  real-time inference (Decart). Regulation converging on mandatory provenance (§05) is a fixed
                  compliance cost small consumer apps struggle to carry — and a tailwind for
                  watermarking infrastructure.<Cite id="38" />
                </p>
              </Prose>
            </Section>

            {/* §09 Momentum */}
            <Section id="momentum" title="Momentum 25" eyebrow="§ 09">
              <Prose>
                <p>
                  The companies with the strongest January–August 2026 evidence — product
                  breakthroughs, filed or credibly reported revenue, funding at higher marks,
                  enterprise wins, or strategic distribution. Where a figure is reported rather
                  than filed — ByteDance at #1 — the entry says so. The top twelve are shown;
                  ranks 13–25 expand below. Anti-momentum, for balance: OpenAI Sora (dead), Stability
                  (survival mode), Getty–Shutterstock (merger terminated), Pika (quiet), Meta Vibes
                  (no retention), Amazon Nova creative (no traction).
                </p>
              </Prose>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOMENTUM.slice(0, 12).map((m) => (
                  <MomentumItem key={m.rank} m={m} />
                ))}
              </ol>
              <details className="group rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] px-3.5 py-2">
                <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
                  <span className="inline-block transition-transform group-open:rotate-90" aria-hidden>
                    ▸
                  </span>
                  Show ranks 13–25 — the research-complete list
                </summary>
                <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 pb-1">
                  {MOMENTUM.slice(12).map((m) => (
                    <MomentumItem key={m.rank} m={m} />
                  ))}
                </ol>
              </details>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(
                  [
                    ['honorable', 'Honorable mentions', 'Real 2026 cases that missed on evidence — each entry says which.'],
                    ['latent', 'Latent players', 'Positions strong enough to reshape the list, with nothing shipped or filed in 2026 that moves it yet.'],
                  ] as const
                ).map(([group, heading, sub]) => (
                  <div
                    key={group}
                    className="rounded-xl border border-dashed border-black/[0.1] dark:border-white/[0.14] bg-transparent p-4 flex flex-col gap-3"
                  >
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-zinc-500">
                        {heading}
                      </div>
                      <div className="text-[12px] text-gray-400 dark:text-zinc-500 mt-0.5">{sub}</div>
                    </div>
                    {NEAR_MOMENTUM.filter((e) => e.group === group).map((e) => (
                      <div key={e.name} className="min-w-0">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-900 dark:text-white leading-snug">
                          <Logo domain={e.domain} name={e.name} size={14} />
                          <span>
                            {e.name}
                            <span className="ml-2 font-normal text-gray-400 dark:text-zinc-500 text-[12px]">{e.what}</span>
                          </span>
                        </div>
                        <div className="text-[13px] text-gray-500 dark:text-zinc-400 leading-[1.7] mt-0.5">{e.note}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Section>

            {/* §10 Open problems */}
            <Section id="white-space" title="Saturated Zones & Open Problems" eyebrow="§ 10">
              <Prose>
                <p>
                  <strong>Saturated:</strong> consumer text-to-video apps (free platform bundles
                  cap the ceiling), text-to-image workspaces, 3D asset generation (the two
                  best-funded leaders will starve the long tail at sub-$1/model pricing), AI presentations (Gamma
                  won just as Microsoft and Google shipped native equivalents), and ad-creative
                  SaaS (crushed between platform giveaways and synthetic-UGC fatigue — Icon’s
                  pivot from "AI Admaker" to "Human Admaker", followed by a reported March 2026
                  shutdown, is the era’s best tell).
                </p>
                <p>
                  <strong>Commoditizing:</strong> video model quality itself (the ~150-Elo pileup),
                  assistive editing AI (free in DaVinci Resolve), product photography, standalone
                  lip-sync and SFX (absorbed by omni models). <strong>Emerging control
                  points:</strong> covered in §11 — distribution surfaces, the state layer,
                  media-native inference, licensed data, world models.
                </p>
              </Prose>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ChangeCard tag="White space" tagColor="#10b981" title="Automated media evaluation" body="Quality measurement is still blind human Elo. Agents can't self-evaluate, pipelines can't regression-test. Unsolved because taste resists metrics — but temporal consistency, character permanence, and edit fidelity are measurable. A trusted eval layer becomes the QA gate for every creative agent." />
                <ChangeCard tag="White space" tagColor="#10b981" title="The vLLM of diffusion" body="No open serving engine dominates the heterogeneous media-model zoo yet — vLLM-Omni (Nov 2025) is the first credible contender — so fal and Decart still hand-build kernels, and that gap is literally priced at ~$7B (the Decart talks). A winning open engine + hosted control plane would restructure the inference layer — and compress its pricing overnight." />
                <ChangeCard tag="White space" tagColor="#10b981" title="Rights, likeness & provenance clearing" body="Likeness detection exists (Loti, Vermillio); a rail that clears identity, style, and catalog rights at generation time does not — despite music proving rights holders will deal. Provenance is the same rail's flip side: Article 50 mandates watermark plus metadata, but re-encoding strips both and detection-at-consumption is unbuilt, so compliance demand exceeds technical capability with fines attached. Whoever builds the clearing-and-attestation layer collects a small percentage of an enormous base." />
                <ChangeCard tag="White space" tagColor="#10b981" title="Long-form narrative generation" body="Retry-adjusted economics make minutes-long, character-consistent video 10–100x too expensive; the cost curve is solving seconds, not stories. Models generate inside isolated temporal windows with no global scene memory, so the likely winner is continuity middleware — converting rendered output into reusable 3D/keyframe state enforced across heterogeneous model APIs — combined with draft-then-upscale workflows and retry reduction." />
                <ChangeCard tag="White space" tagColor="#10b981" title="Portable creative memory" body="Characters, brand systems, and project state are locked inside each workspace (Soul ID in Higgsfield, Weave in Figma). A cross-platform asset/context layer — the creative equivalent of a password manager — doesn't exist, and whoever owns it owns switching costs across the whole map." />
              </div>
            </Section>

            {/* §11 Control points */}
            <Section id="control-points" title="Architectural Control Points, 2030" eyebrow="§ 11">
              <Prose>
                <p>
                  Derived from the research, not assumed: six places where ownership plausibly
                  produces disproportionate leverage in 2030.
                </p>
              </Prose>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {CONTROL_POINTS.map((cp, i) => (
                  <ControlPointCard key={cp.title} cp={cp} number={i + 1} />
                ))}
              </div>
            </Section>

            {/* §12 Closing thesis */}
            <Section id="state-of-genmedia" title="The State of Generative Media — August 2026" eyebrow="§ 12">
              <Prose>
                <p>
                  <strong>The wrong question.</strong> The industry entered 2026 still organized
                  around a simple question — whose model makes the best pixels? — and exits
                  August 2026 having concluded it was the wrong one. The best pixels changed
                  hands five times in twelve months. What didn’t change hands: YouTube’s two
                  billion users, Adobe’s enterprise contracts, CapCut’s creation funnel, the
                  labels’ catalogs.
                </p>
                <p>
                  <strong>What is commoditizing:</strong> video model quality (a ~150-Elo pileup
                  with sub-quarterly leadership turnover), raw generation interfaces, 3D asset pricing,
                  assistive editing, standalone specialist models. <strong>What remains
                  scarce:</strong> distribution measured in billions of users; creative state that
                  accumulates switching costs; licensed catalogs and consent frameworks; media-native
                  inference engineering; and — still — taste, the one input no model has
                  commoditized. <strong>Where value is migrating:</strong> up from models into
                  agents and state, down from models into inference and compute, and sideways into
                  rights. The model layer itself is the valley: indispensable, expensive, and
                  structurally the hardest place in the stack to hold a margin structure unless
                  fused to distribution.
                </p>
                <p>
                  <strong>Who is best positioned.</strong> Google, because it is the only company
                  integrated from silicon to a billion-user creation surface, and it won consumer
                  video by forfeit. ByteDance, for the same integration in the world’s largest
                  creation funnel. Adobe, which converted from disruption target to the governed
                  gateway for professional work, selling everyone’s models through its own
                  surfaces. ElevenLabs, the cleanest full-stack modality winner. fal, which owns
                  the layer every new model release enriches. And the licensed-catalog holders —
                  the majors, Suno post-WMG-settlement — who hold the only advantages courts actively
                  enforce. The most interesting open cases are the state-layer startups:
                  Higgsfield, Magnific, and Flora are racing to accumulate enough creative state
                  before the incumbents arrive from both sides.
                </p>
                <p>
                  <strong>Where the consensus reading diverges from the evidence.</strong> Three
                  places, each grounded in the same turnover data. Leaderboard position is still
                  widely treated as an accumulating asset, but with leadership changing hands in
                  weeks it behaves like a depreciating one — a recurring engineering expense that
                  buys temporary placement rather than durable position. App-layer cost
                  compression is read as permanent when the underlying curve says otherwise:
                  inference cost falls roughly 10x every 18 months while credit prices have so
                  far fallen slower, so an app that keeps 50–60% of revenue after serving costs
                  today has room to widen toward 75% — if competition keeps letting that gap
                  accrue to the app rather than pricing it away, the one part of the mechanism
                  2026 has not settled. And China registers as a threat
                  to Western model labs when the adoption data points elsewhere — Chinese models
                  pressure Western <em>consumer apps</em> while simultaneously supplying the model
                  shelf that makes Western aggregators and workflow layers more capable.
                </p>
                <p>
                  <strong>The most important unanswered question:</strong> does the creative agent
                  actually change user behavior? The entire industry committed 2026 to the
                  hypothesis that delegation will replace direct manipulation, but no retention
                  data yet proves creators want to hand off the loop rather than hold it. If
                  agents win, the state layer is the biggest prize in creative software history.
                  If they don’t, 2026’s agent build-out will read like 2021’s metaverse pivots —
                  and the canvas owners keep everything. A
                  second open question sits underneath the first: will spatial world models
                  replace 2D frame rendering before 2D video reaches affordable temporal
                  continuity? If real-time simulation hits cost parity first, the industry skips
                  the long-form video problem entirely and renders live camera paths through
                  explorable worlds instead.
                </p>
                <p>
                  <strong>The stack in 2030, as the current evidence points:</strong> a small set
                  of full-stack distribution giants (Google, ByteDance, possibly Meta) serving
                  casual creation as a free feature; enterprise workflow concentrated around
                  Adobe plus whoever wins the agent race — if the agent hypothesis survives
                  contact with demand; a licensed-content regime sitting in the request path of
                  commercial generation, unless a fair-use ruling breaks it; media-native
                  inference held by a few platforms, or compressed outright if an open serving
                  standard wins; a persistent open-weights substrate (Chinese labs plus NVIDIA’s
                  Cosmos orbit) capping prices; and a handful of vertical modality winners —
                  audio looks decided — with video’s independent labs absorbed, IPO’d as robotics
                  companies, or gone. Each clause carries its condition; the watch list below is
                  what would move them.
                </p>
              </Prose>

              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-zinc-400">
                  Five working conclusions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ChangeCard tag="01" tagColor={THESIS} title="Standalone video labs hold depreciating positions" body="By 2028, no independent video-only model company sustains a premium position without owned distribution or a robotics/simulation revenue line. Runway's GWM and Luma's pro-pipeline pivots are the leaders reading their own future." />
                  <ChangeCard tag="02" tagColor={THESIS} title="Creative state is what acquirers are buying next" body="The next wave of $1B+ GenMedia acquisitions will be workflow/state companies, not model labs (infrastructure like Decart excepted). Weavy at >$200M on ~$4M raised was the opening price, not the peak." />
                  <ChangeCard tag="03" tagColor={THESIS} title="China wins consumer; the West keeps enterprise" body="Compliance, IP litigation, and provenance mandates keep Western enterprise procurement in the licensed lane regardless of leaderboards — a durable price premium for Adobe, Moonvalley, and licensed-first labs that no Chinese model can compete away." />
                  <ChangeCard tag="04" tagColor={THESIS} title="App-layer cost structures have room to improve" body="Inference cost falls ~10x per 18 months; if credit prices keep falling slower — the unresolved variable — apps keeping 50–60% of revenue after serving costs reach 75%+ by 2028. The consensus 'wrapper compression' fear is backward-looking either way: the squeeze already happened." />
                  <ChangeCard tag="05" tagColor={THESIS} title="An open serving standard compresses orchestration pricing" body="A vLLM-of-diffusion becomes the standard within 24 months — vLLM-Omni already shipped (Nov 2025) and too much value is pooled behind hand-built kernels for open source to ignore. fal's move up into agents is the incumbent hedging its own commoditization." />
                </div>

                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-zinc-400 mt-2">
                  Five things to watch
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ChangeCard tag="W1" tagColor={FACT} title="Sony and UMG v. Suno" body="The two unsettled major-label suits — no fair-use ruling expected before 2027 (dispositive motions due April). A fair-use win for Suno weakens the licensed-catalog advantage across all modalities; a loss cements licensing as a permanent per-generation fee." />
                  <ChangeCard tag="W2" tagColor={FACT} title="Does Anthropic–Decart close?" body="A frontier LLM lab paying ~$7B for media inference optimization would confirm that real-time media serving is strategic infrastructure — and start a bidding war for the remaining independents." />
                  <ChangeCard tag="W3" tagColor={FACT} title="The Kling IPO" body="The spin-out closed in July — roughly $3B at $18B post, with Tencent and Alibaba among the investors — and a Hong Kong listing is targeted for 2027. A public listing for a Chinese video unit would put audited disclosure behind the consumer side of the bifurcated ecosystem for the first time." />
                  <ChangeCard tag="W4" tagColor={FACT} title="Adobe's agent inside ChatGPT and Claude" body="The first real test of whether creative agents can live inside general assistants. If usage migrates there, the chat surface — not the creative suite — becomes the distribution layer for creative work." />
                  <ChangeCard tag="W5" tagColor={FACT} title="Meta's end-2026 full ad automation" body="If advertisers hand Meta a URL and a budget and get campaigns back, the third-party ad-creative category collapses into the platforms — and the largest commercial GenMedia use case disappears into an ad auction." />
                </div>

                <Figure
                  id="fig-valuation-multiples"
                  num={8}
                  title="Committed capital vs demonstrated adoption"
                  takeaway="Latest valuation against revenue, log-log. Dashed guides mark capital-to-revenue ratios; most of the $100M+ club clusters between 10x and 30x, and the outliers say the most about where expectations run ahead of evidence."
                  notes={
                    <p>
                      A closing cross-check on everything above: where external capital has
                      committed relative to what usage demonstrates, with evidence grade encoded
                      in the marks. Ranges plot at their midpoint. Solid dots are company-stated
                      or audited figures, half-tone dots third-party estimates, and the dashed
                      hollow dot (Higgsfield) is claimed and unverified. Meshy sits alone near the
                      35x guide — capital there is underwriting a world-model research program
                      rather than current usage.<Cite id="33" /> The chart also can’t plot the
                      map’s most cost-disciplined company: HeyGen — $200M ARR on about $74M raised
                      — has no disclosed valuation.<Cite id="8" />
                    </p>
                  }
                >
                  <ValuationScatter entries={FINANCIALS} />
                </Figure>

                <div className="rounded-2xl border border-violet-200 dark:border-violet-800/30 bg-violet-50 dark:bg-violet-950/20 p-6 md:p-8 mt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500/80 mb-3">
                    The one-sentence thesis
                  </p>
                  <p className="font-serif text-xl md:text-2xl leading-[1.5] text-gray-900 dark:text-white">
                    The next era of generative media belongs to whoever holds the creative state —
                    the characters, brands, and project memory that turn interchangeable models into
                    irreplaceable workflows — and the distribution to put it in front of a billion
                    people.
                  </p>
                </div>
              </div>
            </Section>

            {/* Appendix A — Hypotheses (research depth, demoted from the main reading path) */}
            <Section id="hypotheses" title="Ten Hypotheses, Tested" eyebrow="Appendix A">
              <Prose>
                <p>
                  The ten hypotheses this research set out to test, scored against the evidence
                  in the sections above. Most are settled; the two still genuinely open are H9 —
                  whether creative agents change demand-side behavior, the map’s biggest
                  unresolved question — and H8, whether hand-built media serving holds its
                  position now that vLLM-Omni exists.
                </p>
              </Prose>
              <details className="group rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] px-3.5 py-2">
                <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
                  <span className="inline-block transition-transform group-open:rotate-90" aria-hidden>
                    ▸
                  </span>
                  Show the full scorecard
                </summary>
                <div className="flex flex-col gap-3 pt-3 pb-1">
                  {HYPOTHESES.map((h) => (
                    <HypothesisCard key={h.id} h={h} />
                  ))}
                </div>
              </details>
            </Section>

            {/* §13 Sources — data-mention-skip: source labels shouldn't count as essay mentions */}
            <div data-mention-skip>
            <Section id="sources" title="Sources" eyebrow="§ 13">
              <Prose>
                <p>
                  Key primary and reported sources. Leaderboard positions and private-company
                  figures are as of their cited dates and decay quickly; estimates are labeled
                  throughout.
                </p>
              </Prose>
              <ol className="flex flex-col gap-1.5 text-[13px] text-gray-500 dark:text-zinc-400">
                {SOURCES.map((s) => (
                  <li key={s.id} id={`src-${s.id}`} className="scroll-mt-20 leading-relaxed">
                    <span className="font-mono text-[11px] text-violet-500/80 mr-2">[{s.id}]</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                    >
                      {s.label}
                    </a>
                    {s.date && <span className="text-gray-400 dark:text-zinc-600"> · {s.date}</span>}
                  </li>
                ))}
              </ol>
            </Section>
            </div>
          </main>

          <aside className="hidden xl:block w-44 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <MarketMapTOC sections={SECTIONS} />
          </aside>
        </div>
      </div>
    </div>
  )
}
