import type { Metadata } from 'next'
import {
  CATEGORIES,
  CONTROL_POINTS,
  FINANCIALS,
  FLOW,
  HYPOTHESES,
  MOAT_MATRIX,
  MODEL_GROUPS,
  MOMENTUM,
  POSITIONING,
  SECTIONS,
  SOURCES,
  STACK_COMPANIES,
} from './data'
import { Section, Prose, Callout, StatTile, Cite, formatReportDate } from './components'
import { Logo } from './Logo'
import MarketMapTOC from './MarketMapTOC'
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

const TITLE = 'Generative Media Market Map — August 2026'
const DESCRIPTION =
  'An investor-grade map of the generative media ecosystem: where value is accruing, which layers are commoditizing, and the strategic control points of the next era of creative computing.'

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

export default function MarketMapPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#0a0a0a] text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex gap-10 items-start">
          <main className="flex-1 min-w-0 flex flex-col gap-12 md:gap-14">
            {/* Hero */}
            <header className="flex flex-col gap-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500/70">
                Market map · Data as of {formatReportDate()}
              </p>
              <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.1]">
                The Generative Media Market Map
              </h1>
              <p className="text-[15px] md:text-base text-gray-500 dark:text-zinc-400 leading-[1.75] max-w-3xl">
                Not a list of companies — a view of how the market is structured, where value is
                accruing, which layers are commoditizing, and where durable control points are
                emerging. Compiled from six research passes across roughly 150 sources, weighted
                toward January–August 2026 developments. Figures marked <em>est.</em> are
                third-party estimates, not company-reported.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                <StatTile stat="$5.6B" label="AI-video funding, 2026 YTD — +43% vs all of 2025" />
                <StatTile stat="~$475M" label="Kling run-rate, Q2 2026 (filed Aug 19) — the revenue benchmark" />
                <StatTile stat=">10x" label="Video inference cost decline since 2024" />
                <StatTile stat="9 of 10" label="Top video models that are Chinese (AA arena, Aug 2026)" />
              </div>
            </header>

            {/* §01 Thesis */}
            <Section id="thesis" title="Market Thesis: What Changed, 2023 → 2026" eyebrow="§ 01">
              <Prose>
                <p>
                  In 2023 generative media was a party trick with a three-step loop:{' '}
                  <strong>prompt → model → output</strong>. You typed, a diffusion model dreamed,
                  and you got one artifact — impressive, uncontrollable, disposable. By August 2026
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
                  workflows — and the 2026 bet, made simultaneously by incumbents, startups, and
                  infrastructure companies, is that the endgame is{' '}
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
                  Two events five weeks apart define the year. On March 24, 2026, OpenAI announced
                  the shutdown of Sora — the best-known consumer video product in the West, dead in
                  six months on an estimated ~$1M/day of inference against roughly $2.1M of lifetime
                  in-app revenue.<Cite id="1" /> That same quarter, Kuaishou disclosed that Kling
                  grew revenue 300% year-over-year to a ~$500M ARR run-rate, 75% of it from outside
                  China — the best-audited number in the industry, because it sits in a listed
                  company’s filings.<Cite id="3" /> The Q2 filing (August 19) shows the curve
                  continuing but decelerating: over RMB 850M of quarterly Kling revenue, up more
                  than 200% year-over-year — a ~$475M annualized run-rate.<Cite id="47" /> Frontier quality without distribution economics
                  died; good-enough quality inside an owned funnel became the revenue leader.
                </p>
              </Prose>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ChangeCard tag="Fact" tagColor={FACT} title="The AI-video-as-feed thesis died" body="Sora shut down (app Apr 26, API Sep 24, 2026); Meta's Vibes limps at ~2M DAU with weak retention. AI video as a tool — inside CapCut, Shorts, ad platforms — is where the revenue actually is." />
                <ChangeCard tag="Fact" tagColor={FACT} title="Video quality converged; image held a frontier" body="~150 Elo covers the top 11 video models and 9 of the top 10 are Chinese. In image, GPT Image 2 still holds every #1 — though MAI-2.6's August debut cut the Arena lead from ~83 to 45 Elo — the one modality where frontier capability still differentiates." />
                <ChangeCard tag="Fact" tagColor={FACT} title="Generation went free at the point of distribution" body="Veo free in YouTube Shorts, Seedance in CapCut, Adobe unlimited generations, Amazon giving ad creative away, Apple shipping photorealistic generation in iOS 27. The generation button is no longer a product." />
                <ChangeCard tag="Fact" tagColor={FACT} title="Music flipped from lawsuits to licenses in nine months" body="UMG and WMG converted suits against Udio and Suno into licensing regimes; Udio became a label-controlled walled garden while Suno settled from strength at $5.4B. Licensed catalogs are now moats." />
                <ChangeCard tag="Pattern" tagColor={PATTERN} title="Everyone shipped a creative agent in 2026" body="Adobe, fal, Flora, Krea, Creatify, Amazon — every layer of the stack converged on the same product. The moat is shifting from model access to creative state: characters, brand constraints, project memory." />
                <ChangeCard tag="Pattern" tagColor={PATTERN} title="Omni absorption is compressing the specialist tail" body="Native audio, lip-sync, video editing, and camera control folded into frontier models in 18 months. Specialists survive only behind hard workflow or real-time constraints: 3D rigging, fidelity upscaling, <500ms avatars." />
                <ChangeCard tag="Pattern" tagColor={PATTERN} title="World models became the capital magnet — and left entertainment" body="Over $3B into World Labs, Decart, and Odyssey in 2026, with monetization pivoting from playable worlds to AV/robotics simulation. GenMedia technology is exiting media at the frontier." />
                <ChangeCard tag="Thesis" tagColor={THESIS} title="The market bifurcated by geography and business model" body="The West monetizes GenMedia as enterprise software and platform features; China monetizes it as direct consumer and creator revenue. Durable moats are distribution, creative state, and licenses — not model checkpoints." />
              </div>
            </Section>

            {/* §02 Market map */}
            <Section id="market-map" title="The Market Map" eyebrow="§ 02">
              <Prose>
                <p>
                  Eight categories, organized by job-to-be-done rather than model modality, holding
                  only strategically meaningful companies. The foundation-model layer is mapped
                  separately in §04, and who-owns-which-layers in §07.
                </p>
              </Prose>
              <MarketMapGrid categories={CATEGORIES} />
            </Section>

            {/* §03 Workflow layer */}
            <Section id="workflow-layer" title="Creative Agents & the Workflow Layer" eyebrow="§ 03">
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
                  The moat being built here is not model access — everyone rents the same shelf. It
                  is <strong>creative state</strong>: Higgsfield’s Soul ID carries a trained
                  character identity across models and sessions; Creatify locks verified brand facts
                  as generation constraints; fal Agent keeps persistent project memory; Figma turned
                  Weave workflows into shareable community assets.<Cite id="15" /> State means
                  switching costs, and switching costs are what the model layer structurally lacks.
                </p>
                <p>
                  The exits already price this in. Weavy raised ~$4M and sold to Figma for over
                  $200M; Visual Electric’s team went to Perplexity and the product died; Leonardo
                  disappeared into Canva. And the layer’s biggest corpse argues the same case from
                  the other side: Sora had the best-known model in the world and no workflow, no
                  B2B motion, no state — and it’s gone.<Cite id="1" />
                </p>
                <Callout tone="violet">
                  <strong>Verdict:</strong> the workflow/agent layer is becoming the primary control
                  point of GenMedia — but it is being squeezed from above (Adobe, Google Flow,
                  Canva, Figma) and below (fal, ComfyUI) simultaneously. Independent workflow
                  companies must convert 2026 growth into enterprise state moats before the pincer
                  closes. Best positioned: Adobe, Figma, and Google among incumbents; Higgsfield,
                  Magnific, and Flora among startups; fal as the infrastructure insurgent.
                </Callout>
              </Prose>
            </Section>

            {/* §04 Models */}
            <Section id="models" title="The Foundation Model Landscape" eyebrow="§ 04">
              <Prose>
                <p>
                  No single model wins every workload, and none is on track to. The landscape has
                  consolidated into three durable archetypes: distribution-owned omni models
                  (Google, ByteDance, Kuaishou, xAI), independent pro-grade labs (Runway, BFL, Luma,
                  ElevenLabs, Reve), and open or China-first price leaders (Alibaba, Tencent,
                  MiniMax, Lightricks). A dated-as-of stamp matters more than any ranking: video
                  leaderboard half-life is one to two quarters.<Cite id="28" /> Treat the arenas
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

            {/* §05 Orchestration */}
            <Section id="orchestration" title="Orchestration & Aggregation" eyebrow="§ 05">
              <Prose>
                <p>
                  Model proliferation created a real orchestration layer — but 2026 showed it splits
                  into two fates. Media-native orchestration with hard engineering depth is durable
                  and compounding: fal roughly doubled from ~$200M to ~$400M annualized revenue in
                  months, raised at $4.5B in December, and was reportedly in talks at ~$8B by
                  March.<Cite id="10" /> Its drivers don’t reverse — a majority-Chinese video model
                  supply that Western apps won’t integrate one-by-one, bursty GPU economics, and
                  weekly model churn that makes single-vendor bets irrational. Runware ($50M Series
                  A, containerized 1MW inference pods) and WaveSpeed (fastest Western access to
                  Chinese models) are growing in its wake.
                </p>
                <FlowDiagram flow={FLOW} />
                <p>
                  Thin aggregation without that depth gets absorbed: Replicate — the #2 independent
                  media marketplace — sold to Cloudflare.<Cite id="12" /> Gateways (Vercel’s now
                  lists 32 image and 30 video models) commoditize the unified-API surface from the
                  side, and hyperscalers own regulated-enterprise workloads by default. Meanwhile
                  ComfyUI’s JSON workflows are quietly becoming the portable orchestration format —
                  the closest thing GenMedia has to Terraform.<Cite id="13" />
                </p>
                <Callout tone="amber">
                  <strong>Where the pricing power sits:</strong> at the two ends, not the middle.
                  Frontier model owners set wholesale prices; consumer aggregators with state moats
                  set retail. Naked resellers in between compete on latency and price. The tell is
                  fal itself launching an agent in August 2026 — even the winning orchestrator
                  doesn’t believe raw orchestration holds margin forever.<Cite id="11" />
                </Callout>
              </Prose>
            </Section>

            {/* §06 Infrastructure */}
            <Section id="infrastructure" title="Infrastructure" eyebrow="§ 06">
              <Prose>
                <p>
                  Media generation is not LLM inference with bigger outputs — it is structurally
                  different work. A video job is a long-running batch process, not a token stream,
                  which forces queueing, webhooks, retries, and preemption-tolerant scheduling.
                  The model zoo is architecturally heterogeneous (DiT, autoregressive, GAN
                  upscalers, TTS, 3D) with no shared serving standard —{' '}
                  <strong>there is no vLLM-of-diffusion</strong>, which is why fal builds tracing
                  compilers and Decart builds sub-35ms kernels by hand. Chaining those
                  architectures in one pipeline spikes VRAM unpredictably, and a mid-render
                  failure burns minutes of GPU time unless the stack does stateful checkpoint
                  recovery — a failure mode token streaming simply doesn’t have. Caching differs
                  in kind too: hot-swappable LoRA weights and reusable keyframe latents, not
                  prefix caches. Intermediate assets are gigabyte-scale per job, making storage
                  and egress a real COGS line. And evaluation is still blind human preference:
                  nothing machine-scores temporal consistency, character permanence, or edit
                  fidelity at scale.
                </p>
                <p>
                  The market has started pricing these gaps. Cloudflare bought Replicate and
                  rights-marketplace Human Native; Anthropic is reportedly closing in on acquiring
                  Decart at ~$7B — advanced drafts exchanged by mid-August, mostly stock, with
                  NVIDIA outbid — a frontier lab valuing a media inference-optimization stack at
                  acquisition scale.<Cite id="23" /><Cite id="48" /> On the compliance side, EU AI Act Article 50
                  transparency obligations began enforcement August 2, 2026, mandating C2PA
                  metadata plus imperceptible watermarking — 6,000+ organizations have adopted
                  C2PA, with Midjourney the prominent holdout — while China’s labeling regime has
                  been live since September 2025.<Cite id="29" /><Cite id="38" /> Demand for
                  provenance now outruns the technology: metadata still doesn’t survive re-encoding
                  and platform uploads.
                </p>
                <p>
                  Five problems remain genuinely unsolved as of August 2026: a standard serving
                  engine for heterogeneous media models; automated media evaluation; provenance
                  that survives distribution; long-form, character-consistent generation at viable
                  unit cost (retries make effective cost 2–5x list price, so minutes-long narrative
                  is still 10–100x too expensive); and prompt-level rights and likeness clearing —
                  detection exists, a clearing rail does not.
                </p>
              </Prose>
            </Section>

            {/* §07 Vertical integration */}
            <Section id="vertical-integration" title="Vertical Integration" eyebrow="§ 07">
              <Prose>
                <p>
                  Who owns which layers. Full-stack strategies (Google, ByteDance) compound data,
                  cost, and default status — but demand frontier capital intensity. Deliberate
                  single-layer specialists (BFL licensing models to platforms, fal owning
                  inference) trade ceiling for focus and capital efficiency. The dangerous place is
                  the unowned middle: an application renting models with no workflow state above and
                  no cost advantage below. The 2x2 plots the two ownership axes that decide this;
                  the bars underneath show the full layer-by-layer detail.
                </p>
              </Prose>
              <QuadrantChart companies={POSITIONING} />
              <StackBars companies={STACK_COMPANIES} />
            </Section>

            {/* §08 Incumbents */}
            <Section id="incumbents" title="Incumbents vs Startups" eyebrow="§ 08">
              <Prose>
                <p>
                  Incumbent advantages bind in four places. <strong>Distribution and bundling</strong>:
                  Google made video generation a feature of a 1B-MAU assistant and a $20–250/month
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
                  never shipped and Vibes has no retention story; Microsoft has no video model;
                  Amazon’s Nova is an ads utility nobody picks on merit; Apple is two years behind
                  on quality. The pattern: incumbency wins where an existing engine (ads, enterprise
                  seats, OS distribution) absorbs generation as a feature — not where incumbents
                  chase new consumer behavior.
                </p>
                <p>
                  Startups can still build $10B+ companies in five lanes: <strong>audio</strong>{' '}
                  (ElevenLabs at $11B and ~$500M ARR proves a full-stack modality winner where
                  incumbents under-invested); <strong>enterprise vertical video</strong> (Synthesia
                  and HeyGen compound with 140%+ NRR beneath incumbent attention);{' '}
                  <strong>cost-disciplined consumer video</strong> (Kling, PixVerse, Hailuo — the
                  discipline Sora lacked); <strong>media-native infrastructure</strong> (fal — every
                  model war grows its TAM); and <strong>open-weights and world models</strong> (BFL,
                  Lightricks, World Labs — being the neutral standard as media and simulation
                  converge).
                </p>
              </Prose>
            </Section>

            {/* §09 Economics */}
            <Section id="economics" title="Economics" eyebrow="§ 09">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile stat="50–60%" label="Gross margin for apps on third-party models (Bessemer, Feb 2026)" />
                <StatTile stat="2–5x" label="Effective cost vs list price once retries are counted" />
                <StatTile stat="$0.02–0.75" label="Per-second video API price envelope, frontier to challenger" />
                <StatTile stat="~$400M" label="fal annualized revenue — the orchestration proof point" />
              </div>
              <ArrBars entries={FINANCIALS} />
              <Prose>
                <p>
                  The $100M+ ARR club as of August 2026, weighted by evidence quality: Higgsfield
                  (claimed $700M annualized on the heels of its Aug 17 round — company figures,
                  unverified), Kling (~$475M run-rate per the Aug 19 Q2 filing), ElevenLabs (~$500M
                  est.), Adobe AI-first (over $500M, earnings), Canva (~$4B+ total ARR with AI as
                  retention), fal (~$400M reported), Suno (~$300M est.), Runway (est. $100–300M
                  with wide variance — the last hard figure is ~$90M in mid-2025), Magnific ($230M
                  company-stated), HeyGen ($200M company-stated, near break-even), Synthesia
                  (~$150M), Gamma ($100M+, profitable), Midjourney (~$200–500M est., wide
                  variance).<Cite id="3" /><Cite id="8" /><Cite id="16" /><Cite id="40" />{' '}
                  Sector funding: AI video alone took $5.6B in 2026 year-to-date, 43% above all of
                  2025 — concentrated in model builders and world models, while thin-wrapper seed
                  activity visibly cooled.<Cite id="30" />
                </p>
                <ValuationScatter entries={FINANCIALS} />
                <p>
                  <strong>Who captures the margin when an app calls someone else’s model?</strong>{' '}
                  The pools sit at the bottom and at the optimization layer: GPU landlords
                  (CoreWeave’s $21B Meta expansion), media-native inference (fal’s kernel spread),
                  and apps that own their model — the four best-margin GenMedia app companies
                  (ElevenLabs, HeyGen, Synthesia, Midjourney) all serve their own weights. Apps
                  renting third-party video models run 40–50% of revenue in model COGS and escape
                  through credit-pricing breakage, retry reduction, and riding a cost curve that
                  falls ~10x per 18 months while their credit prices fall slower.<Cite id="36" />{' '}
                  That last point is under-appreciated: app-layer margins structurally{' '}
                  <em>improve</em> with every quarter of inference deflation.
                </p>
                <p>
                  Attractive economics: audio/voice, enterprise avatar video, media inference
                  infrastructure, model-licensing-to-platforms (BFL’s ~$300M of contracts), and
                  compliance/provenance tooling with regulatory forcing functions. Structurally
                  difficult: consumer free-tier video (Sora’s corpse), thin wrappers, frontier
                  video labs without distribution, and licensing intermediaries with thin take
                  rates. One threshold worth watching: if per-second video pricing breaks below
                  ~$0.005, programmatic ad video at auction scale becomes economical — and the
                  largest commercial use case moves from creative teams to ad servers.
                </p>
              </Prose>
            </Section>

            {/* §10 Moats */}
            <Section id="moats" title="Moats & Commoditization" eyebrow="§ 10">
              <MoatMatrix rows={MOAT_MATRIX} />
            </Section>

            {/* §11 Open source */}
            <Section id="open-source" title="Open Source" eyebrow="§ 11">
              <Prose>
                <p>
                  The open-closed gap now differs sharply by modality. In <strong>video</strong> it
                  nearly closed: MiniMax’s H3 put open weights at #2 overall — with the
                  geopolitical caveat that its license excludes local deployment in the US, EU, UK,
                  and Korea, a new "open for China and the rest-of-world" flavor. Truly permissive
                  open video (LTX-2’s 4K-plus-audio on a single consumer GPU, Hunyuan, Wan ≤2.2)
                  trails the frontier by a clear tier.<Cite id="27" /> In <strong>image</strong> the
                  gap is small — FLUX.2 Dev is the open standard — but watch the direction of
                  travel: Alibaba, BFL, and MiniMax are all gating their newest tiers. Open weights
                  are increasingly a trailing-edge distribution strategy, not a frontier strategy.
                  In <strong>audio</strong>, weights are irrelevant — licensed catalogs are the
                  moat. In <strong>3D</strong>, open (Hunyuan3D) is genuinely competitive. In{' '}
                  <strong>world models</strong>, NVIDIA’s Cosmos 3 is the open anchor, deliberately
                  arming the ecosystem the way Llama armed LLMs.<Cite id="21" />
                </p>
                <p>
                  So what do GenMedia models ultimately resemble — LLMs, cloud infrastructure,
                  creative software, or commodity compute? The answer splits: video models are
                  trending toward <strong>codecs</strong> — critical, everywhere, and rarely paid
                  for directly, monetized by whoever owns the surface they run in. Image retains an
                  LLM-like frontier premium for now. Audio behaves like creative software fused to
                  content licensing. The implication for pricing: open models cap the price
                  umbrella in every modality they reach, which pushes closed labs toward
                  distribution fusion, licensing, or robotics — exactly the pivots Runway, BFL, and
                  Luma made this year.
                </p>
              </Prose>
            </Section>

            {/* §12 Geography */}
            <Section id="geography" title="Geography" eyebrow="§ 12">
              <Prose>
                <p>
                  <strong>China owns consumer GenMedia revenue and export.</strong> Kling is the
                  global video revenue leader (~$475M run-rate per the Aug 19 Q2 filing, ~70–75%
                  overseas as of Q1); MiniMax IPO’d in
                  Hong Kong with a +109% debut — beating every US lab to public markets; PixVerse
                  raised $439M at a $2B+ valuation on 150M claimed international users; ByteDance ships
                  Seedance to emerging markets first through CapCut.<Cite id="3" /><Cite id="24" /><Cite id="25" />{' '}
                  Alibaba and Tencent supply the open-weights substrate (Wan, Hunyuan) that runs
                  half the world’s ComfyUI workflows. The constraint is trust: Disney and Warner
                  are suing MiniMax, and Western enterprise procurement mostly can’t adopt Chinese
                  models — which bifurcates the market and protects Adobe/Runway/licensed-lane
                  pricing in regulated segments.
                </p>
                <p>
                  <strong>The US owns platforms, enterprise monetization, and image.</strong>{' '}
                  Google is the only player integrated from silicon to YouTube; OpenAI leads image;
                  Adobe leads governed enterprise workflow. <strong>Europe owns durable
                  verticals</strong> rather than platforms: audio (ElevenLabs, UK/Poland), open
                  image (Black Forest Labs, Germany), enterprise video (Synthesia, UK), aggregation
                  (Magnific, Spain; Runware, UK) — while the EU AI Act makes provenance a
                  compliance moat for whoever has the machinery.<Cite id="29" />{' '}
                  <strong>Israel</strong> punches above its weight in open video (Lightricks) and
                  real-time inference (Decart). Regulation is converging on mandatory provenance —
                  China since September 2025, the EU since August 2026 — a tax on small consumer
                  apps and a tailwind for watermarking infrastructure.<Cite id="38" />
                </p>
              </Prose>
            </Section>

            {/* §13 Momentum */}
            <Section id="momentum" title="Momentum 25" eyebrow="§ 13">
              <Prose>
                <p>
                  The companies with the strongest January–August 2026 evidence — product
                  breakthroughs, audited revenue, funding at higher marks, enterprise wins, or
                  strategic distribution. Anti-momentum, for balance: OpenAI Sora (dead), Stability
                  (survival mode), Getty–Shutterstock (merger terminated), Pika (quiet), Meta Vibes
                  (no retention), Amazon Nova creative (no traction).
                </p>
              </Prose>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOMENTUM.map((m) => (
                  <li
                    key={m.rank}
                    className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#111] p-4 flex gap-4"
                  >
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
                ))}
              </ol>
            </Section>

            {/* §14 White space */}
            <Section id="white-space" title="Winners, Losers & White Space" eyebrow="§ 14">
              <Prose>
                <p>
                  <strong>Overcrowded:</strong> consumer text-to-video apps (free platform bundles
                  cap the ceiling), text-to-image workspaces, 3D asset generation (two capital
                  leaders will starve the long tail at sub-$1/model pricing), AI presentations (Gamma
                  won just as Microsoft and Google shipped native equivalents), and ad-creative
                  SaaS (crushed between platform giveaways and synthetic-UGC fatigue — Icon’s
                  pivot from "AI Admaker" to "Human Admaker" is the era’s best tell).
                </p>
                <p>
                  <strong>Commoditizing:</strong> video model quality itself (the ~150-Elo pileup),
                  assistive editing AI (free in DaVinci Resolve), product photography, standalone
                  lip-sync and SFX (absorbed by omni models). <strong>Emerging control
                  points:</strong> covered in §16 — distribution surfaces, the state layer,
                  media-native inference, licensed data, world models.
                </p>
              </Prose>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ChangeCard tag="White space" tagColor="#10b981" title="Automated media evaluation" body="Quality measurement is still blind human Elo. Agents can't self-evaluate, pipelines can't regression-test. Unsolved because taste resists metrics — but temporal consistency, character permanence, and edit fidelity are measurable. A trusted eval layer becomes the QA gate for every creative agent." />
                <ChangeCard tag="White space" tagColor="#10b981" title="The vLLM of diffusion" body="No open standard serving engine exists for the heterogeneous media-model zoo; fal and Decart hand-build kernels, and that gap is literally priced at ~$7B (the Decart talks). An open engine + hosted control plane would restructure the inference layer — and halve its margins." />
                <ChangeCard tag="White space" tagColor="#10b981" title="Prompt-level rights clearing" body="Likeness detection exists (Loti, Vermillio); a rail that clears identity, style, and catalog rights at generation time does not — despite music proving rights holders will deal. Whoever builds the clearing house collects a small percentage of an enormous base." />
                <ChangeCard tag="White space" tagColor="#10b981" title="Long-form narrative generation" body="Retry-adjusted economics make minutes-long, character-consistent video 10–100x too expensive; the cost curve is solving seconds, not stories. Models generate inside isolated temporal windows with no global scene memory, so the likely winner is continuity middleware — converting rendered output into reusable 3D/keyframe state enforced across heterogeneous model APIs — combined with draft-then-upscale workflows and retry reduction." />
                <ChangeCard tag="White space" tagColor="#10b981" title="Provenance that survives distribution" body="Article 50 mandates watermark + metadata, but re-encoding strips both and detection-at-consumption is unbuilt. Compliance demand now exceeds technical capability — a regulatory forcing function with fines attached and no adequate vendor." />
                <ChangeCard tag="White space" tagColor="#10b981" title="Portable creative memory" body="Characters, brand systems, and project state are locked inside each workspace (Soul ID in Higgsfield, Weave in Figma). A cross-platform asset/context layer — the creative equivalent of a password manager — doesn't exist, and whoever owns it owns switching costs across the whole map." />
              </div>
            </Section>

            {/* §15 Hypotheses */}
            <Section id="hypotheses" title="Ten Hypotheses, Tested" eyebrow="§ 15">
              <div className="flex flex-col gap-3">
                {HYPOTHESES.map((h) => (
                  <HypothesisCard key={h.id} h={h} />
                ))}
              </div>
            </Section>

            {/* §16 Control points */}
            <Section id="control-points" title="Strategic Control Points, 2030" eyebrow="§ 16">
              <Prose>
                <p>
                  Derived from the research, not assumed: six places where ownership plausibly
                  produces disproportionate power in 2030.
                </p>
              </Prose>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {CONTROL_POINTS.map((cp, i) => (
                  <ControlPointCard key={cp.title} cp={cp} number={i + 1} />
                ))}
              </div>
            </Section>

            {/* §17 Closing thesis */}
            <Section id="state-of-genmedia" title="The State of Generative Media — August 2026" eyebrow="§ 17">
              <Prose>
                <p>
                  <strong>Where the market came from.</strong> Generative media spent 2023 as a
                  demo, 2024 as a product race, and 2025 as a workflow land-grab. The industry that
                  entered 2026 was still organized around a simple question — whose model makes the
                  best pixels? — and the industry exiting August 2026 has concluded that this was
                  the wrong question. The best pixels changed hands five times in twelve months.
                  What didn’t change hands: YouTube’s two billion users, Adobe’s enterprise
                  contracts, CapCut’s creation funnel, the labels’ catalogs.
                </p>
                <p>
                  <strong>What changed in the last twelve months</strong> compresses into five
                  events. Sora died — the most capable consumer video product in the West could not
                  survive its own inference bill, and its shutdown handed the consumer field to
                  Google and ByteDance. Kling posted a ~$475M filed run-rate and became the
                  industry’s revenue benchmark. Music’s lawsuits became licenses, converting the
                  industry’s largest legal risk into its most enforceable moat. Every layer of the
                  stack shipped a creative agent, from Adobe down to fal. And world models pulled in
                  over $3B while quietly leaving entertainment for simulation — the first sign that
                  GenMedia’s frontier technology may ultimately be worth more outside media than
                  inside it.
                </p>
                <p>
                  <strong>What is commoditizing:</strong> video model quality (a ~150-Elo pileup
                  with quarterly leadership turnover), raw generation interfaces, 3D asset pricing,
                  assistive editing, standalone specialist models. <strong>What remains
                  scarce:</strong> distribution measured in billions of users; creative state that
                  accumulates switching costs; licensed catalogs and consent frameworks; media-native
                  inference engineering; and — still — taste, the one input no model has
                  commoditized. <strong>Where value is migrating:</strong> up from models into
                  agents and state, down from models into inference and compute, and sideways into
                  rights. The model layer itself is the valley: indispensable, expensive, and
                  structurally the hardest place in the stack to keep margin unless fused to
                  distribution.
                </p>
                <p>
                  <strong>Who is best positioned.</strong> Google, because it is the only company
                  integrated from silicon to a billion-user creation surface, and it won consumer
                  video by forfeit. ByteDance, for the same integration in the world’s largest
                  creation funnel. Adobe, which converted from disruption target to toll collector
                  by selling everyone’s models through governed workflow. ElevenLabs, the cleanest
                  full-stack modality winner. fal, which owns the layer every model war enriches.
                  And the licensed-catalog holders — the majors, Suno post-settlement — who own the
                  only moats that courts actively enforce. The most interesting long shots are the
                  state-layer startups: Higgsfield, Magnific, and Flora are racing to accumulate
                  enough creative state to survive the incumbent pincer.
                </p>
                <p>
                  <strong>What the market misunderstands.</strong> Three things. First, it still
                  prices frontier video labs as if leaderboard position were an asset; it is a
                  quarterly expense. Second, it treats app-layer margin compression as permanent
                  when it is cyclical — inference deflation of ~10x per 18 months means today’s
                  50–60% gross margin apps are tomorrow’s 75% apps, and the market is underpricing
                  that operating leverage. Third, it reads China as a threat to Western model labs
                  when the evidence says China is a threat to Western <em>consumer apps</em> — and
                  simultaneously the supply side that makes Western aggregators and workflow
                  companies more valuable.
                </p>
                <p>
                  <strong>The most important unanswered question:</strong> does the creative agent
                  actually change user behavior? The entire industry bet 2026 on delegation
                  replacing manipulation, but no retention data yet proves creators want to hand
                  off the loop rather than hold it. If agents win, the state layer is the biggest
                  prize in creative software history. If they don’t, 2026’s agent land-grab will
                  look like 2021’s metaverse pivots — and the canvas owners keep everything. A
                  second open question sits underneath the first: will spatial world models
                  replace 2D frame rendering before 2D video reaches affordable temporal
                  continuity? If real-time simulation hits cost parity first, the industry skips
                  the long-form video problem entirely and renders live camera paths through
                  explorable worlds instead.
                </p>
                <p>
                  <strong>The stack in 2030, most likely shape:</strong> two or three full-stack
                  distribution giants (Google, ByteDance, possibly Meta) serving casual creation as
                  a free feature; an enterprise workflow duopoly (Adobe, plus whoever wins the
                  agent race) collecting tolls on professional work; a licensed-content regime
                  taxing all commercial generation; one or two media-native inference platforms
                  under everything; a persistent open-weights substrate (Chinese labs plus NVIDIA’s
                  Cosmos orbit) capping prices; and a handful of vertical modality winners —
                  audio’s already decided — with video’s independent labs either absorbed,
                  IPO’d as robotics companies, or gone.
                </p>
              </Prose>

              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-zinc-400">
                  Five things we believe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ChangeCard tag="01" tagColor={THESIS} title="Standalone video labs are melting assets" body="By 2028, no independent video-only model company commands a premium valuation without owned distribution or a robotics/simulation revenue line. Runway's GWM and Luma's pro-pipeline pivots are the leaders reading their own future." />
                  <ChangeCard tag="02" tagColor={THESIS} title="Creative state is the next acquisition currency" body="The next wave of $1B+ GenMedia acquisitions will be workflow/state companies, not model labs (infrastructure like Decart excepted). Weavy at >$200M on ~$4M raised was the opening price, not the peak." />
                  <ChangeCard tag="03" tagColor={THESIS} title="China wins consumer; the West keeps enterprise" body="Compliance, IP litigation, and provenance mandates keep Western enterprise procurement in the licensed lane regardless of leaderboards — a durable price premium for Adobe, Moonvalley, and licensed-first labs that no Chinese model can compete away." />
                  <ChangeCard tag="04" tagColor={THESIS} title="App-layer margins inflect upward from here" body="Inference cost falls ~10x per 18 months while credit prices fall slower; today's 50–60% gross-margin apps become 75%+ by 2028. The consensus 'wrapper compression' fear is backward-looking — the squeeze already happened." />
                  <ChangeCard tag="05" tagColor={THESIS} title="An open serving standard halves orchestration margins" body="A vLLM-of-diffusion emerges within 24 months — too much value is pooled behind hand-built kernels for open source to ignore. fal's move up into agents is the incumbent hedging its own commoditization." />
                </div>

                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-zinc-400 mt-2">
                  Five things to watch
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ChangeCard tag="W1" tagColor={FACT} title="Sony and UMG v. Suno" body="The two unsettled major-label suits — no fair-use ruling expected before 2027 (dispositive motions due April). A fair-use win for Suno weakens the licensed-catalog moat across all modalities; a loss cements licensing as the permanent tax on generation." />
                  <ChangeCard tag="W2" tagColor={FACT} title="Does Anthropic–Decart close?" body="A frontier LLM lab paying ~$7B for media inference optimization would confirm that real-time media serving is strategic infrastructure — and start a bidding war for the remaining independents." />
                  <ChangeCard tag="W3" tagColor={FACT} title="The Kling IPO" body="The spin-out closed in July — roughly $3B at $18B post, with Tencent and Alibaba among 38 investors — and a Hong Kong listing is targeted for 2027. A public comp for a Chinese video unit would test whether Western investors can own the consumer side of the bifurcated market." />
                  <ChangeCard tag="W4" tagColor={FACT} title="Adobe's agent inside ChatGPT and Claude" body="The first real test of whether creative agents can live inside general assistants. If usage migrates there, the chat surface — not the creative suite — becomes the distribution layer for creative work." />
                  <ChangeCard tag="W5" tagColor={FACT} title="Meta's end-2026 full ad automation" body="If advertisers hand Meta a URL and a budget and get campaigns back, the third-party ad-creative category collapses into the platforms — and the largest commercial GenMedia use case disappears into an ad auction." />
                </div>

                <div className="rounded-2xl border border-violet-200 dark:border-violet-800/30 bg-violet-50 dark:bg-violet-950/20 p-6 md:p-8 mt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500/80 mb-3">
                    The one-sentence thesis
                  </p>
                  <p className="font-serif text-xl md:text-2xl leading-[1.5] text-gray-900 dark:text-white">
                    The next era of generative media will be won by whoever owns the creative state —
                    the characters, brands, and project memory that turn interchangeable models into
                    irreplaceable workflows — and the distribution to put it in front of a billion
                    people.
                  </p>
                </div>
              </div>
            </Section>

            {/* §18 Sources */}
            <Section id="sources" title="Sources" eyebrow="§ 18">
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
          </main>

          <aside className="hidden xl:block w-44 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <MarketMapTOC sections={SECTIONS} />
          </aside>
        </div>
      </div>
    </div>
  )
}
