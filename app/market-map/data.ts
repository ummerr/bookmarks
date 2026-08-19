// Typed content for the Generative Media Market Map — August 2026.
// All report content lives here so future updates never touch the JSX.
// Compiled 2026-08-17 from ~150 web searches across six research passes.
// Figures marked "est." are third-party estimates, not company-reported.

// Single source of truth for recency. Bump on every refresh/validation pass.
export const REPORT_DATE = '2026-08-19'

export type CompanyKind = 'startup' | 'incumbent' | 'lab'
export type ModelDependency = 'own-models' | 'multi-model' | 'partner-models' | 'open-weights'
export type Layer = 'distribution' | 'application' | 'workflow' | 'model' | 'infrastructure'
export type Verdict = 'strongly-supported' | 'supported' | 'unclear' | 'rejected'
export type Risk = 'low' | 'medium' | 'high'

// Per-company market facts. All display-formatted strings ("$5.3B", "~$500M ARR",
// "est. 8M MAU") — no math is done on them; estimates carry "~" or "est." in the
// string itself. Everything optional; the renderer skips missing fields.
// asOf is month granularity, format "Aug 2026".
export interface CompanyFacts {
  valuation?: string
  raised?: string
  investors?: string[] // key investors; renderer shows max 3 + "+n"
  arr?: string
  users?: string
  asOf?: string
  cite?: string // SOURCES id backing the headline figure
}

export interface Company {
  name: string
  kind: CompanyKind
  modelDependency?: ModelDependency
  note?: string
  momentum?: boolean
  facts?: CompanyFacts
  /** Canonical website domain — drives the self-hosted logo lookup. Omit for composites. */
  domain?: string
  /**
   * One-line technical thesis: "Durable|Fragile|Unproven — reason".
   * ThesisLine splits on the first ' — '; keep under ~85 chars — renders inline in map rows.
   */
  thesis: string
}

export interface Category {
  id: string
  title: string
  jobToBeDone: string
  color: string
  companies: Company[]
}

export interface ModelEntry {
  name: string
  developer: string
  openness: 'open' | 'closed' | 'hybrid'
  capability: string
  pricing: string
  adoption: string
  flagship?: boolean
}

export interface ModelGroup {
  modality: string
  note?: string
  entries: ModelEntry[]
}

export interface Hypothesis {
  id: string
  statement: string
  verdict: Verdict
  rationale: string
}

export interface ControlPoint {
  title: string
  why: string
  leaders: string
  defensibility: string
  absorption: string
  commoditization: string
  valuePool: string
}

export interface MatrixRow {
  layer: string
  differentiation: string
  risk: Risk
  durability: string
  leverage: string
}

export interface StackCompany {
  name: string
  kind: CompanyKind
  layers: Layer[]
  note?: string
  domain?: string
}

// — Positioning 2x2 —
export interface PositionedCompany {
  name: string
  domain?: string
  kind: CompanyKind
  /** 0–100: rents everyone's models → owns frontier models */
  x: number
  /** 0–100: rents distribution → owns a billion-user surface */
  y: number
  labelSide?: 'left' | 'right'
}

// — Financials (powers the ARR bars and the valuation scatter) —
export type Evidence = 'audited' | 'company-stated' | 'estimate' | 'claimed'
export interface CompanyFinancials {
  name: string
  domain?: string
  kind: CompanyKind
  arrLowM: number
  arrHighM?: number
  arrLabel: string
  evidence: Evidence
  valuationM?: number
  valuationLabel?: string
  /** Reported/rumored valuation range, e.g. Kling spin-out talk — drawn as a whisker, not a point. */
  valuationRangeM?: [number, number]
  raisedM?: number
  note?: string
}

// — Aggregator flow —
export interface FlowNode {
  id: string
  label: string
  sub?: string
  domain?: string
  color: string
}
export interface FlowLink {
  from: string
  to: string
  weight: 1 | 2 | 3
}
export interface FlowData {
  models: FlowNode[]
  aggregators: FlowNode[]
  outputs: FlowNode[]
  links: FlowLink[]
}

export interface MomentumEntry {
  rank: number
  name: string
  what: string
  why: string
  domain?: string
}

export interface NearMomentumEntry {
  /** 'honorable' = evidence just short of the cut; 'latent' = position without 2026 motion */
  group: 'honorable' | 'latent'
  name: string
  what: string
  note: string
  domain?: string
}

export interface Source {
  id: string
  label: string
  url: string
  date?: string
}

export interface SectionDef {
  id: string
  label: string
}

export const SECTIONS: SectionDef[] = [
  { id: 'thesis', label: 'What Changed' },
  { id: 'market-map', label: 'The Map' },
  { id: 'workflow-layer', label: 'Creative Agents & Workflow' },
  { id: 'models', label: 'Foundation Models' },
  { id: 'orchestration', label: 'Orchestration' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'vertical-integration', label: 'Vertical Integration' },
  { id: 'incumbents', label: 'Incumbents vs Startups' },
  { id: 'economics', label: 'Cost Structure' },
  { id: 'moats', label: 'Durability by Layer' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'geography', label: 'Geography' },
  { id: 'momentum', label: 'Momentum 25' },
  { id: 'white-space', label: 'Open Problems' },
  { id: 'hypotheses', label: 'Ten Hypotheses' },
  { id: 'control-points', label: 'Control Points 2030' },
  { id: 'state-of-genmedia', label: 'The State of GenMedia' },
  { id: 'sources', label: 'Sources' },
]

// — Mention index (powers the click-to-highlight company index under the hero) —
// Aliases are matched case-sensitively on word boundaries against the rendered
// essay text, so counts self-correct on every content edit. Include the product
// and model names a reader would recognize as "that company" (Veo → Google).
export interface MentionCompany {
  name: string
  domain?: string
  aliases: string[]
}

export const MENTION_INDEX: MentionCompany[] = [
  { name: 'Google', domain: 'google.com', aliases: ['Google', 'DeepMind', 'Veo', 'Gemini', 'YouTube', 'Genie', 'Lyria', 'Imagen', 'Whisk', 'ImageFX', 'Nano Banana'] },
  { name: 'ByteDance', domain: 'bytedance.com', aliases: ['ByteDance', 'Seedance', 'Seedream', 'CapCut', 'Dreamina', 'Jimeng', 'Doubao', 'Volcano'] },
  { name: 'Kling', domain: 'klingai.com', aliases: ['Kling', 'Kuaishou'] },
  { name: 'OpenAI', domain: 'openai.com', aliases: ['OpenAI', 'Sora', 'ChatGPT', 'GPT Image'] },
  { name: 'Adobe', domain: 'adobe.com', aliases: ['Adobe', 'Firefly', 'Photoshop', 'Premiere'] },
  { name: 'Meta', domain: 'meta.com', aliases: ['Meta', 'Vibes', 'Advantage+', 'Movie Gen', 'Muse', 'GEM'] },
  { name: 'fal', domain: 'fal.ai', aliases: ['fal'] },
  { name: 'Runway', domain: 'runwayml.com', aliases: ['Runway', 'Gen-4.5', 'GWM'] },
  { name: 'ElevenLabs', domain: 'elevenlabs.io', aliases: ['ElevenLabs', 'Eleven v3', 'Eleven Music'] },
  { name: 'Suno', domain: 'suno.com', aliases: ['Suno'] },
  { name: 'Higgsfield', domain: 'higgsfield.ai', aliases: ['Higgsfield', 'Soul ID'] },
  { name: 'MiniMax', domain: 'minimax.io', aliases: ['MiniMax', 'Hailuo'] },
  { name: 'Alibaba', aliases: ['Alibaba', 'Wan', 'HappyHorse'] },
  { name: 'Tencent', domain: 'tencent.com', aliases: ['Tencent', 'Hunyuan', 'Hunyuan3D', 'HunyuanImage'] },
  { name: 'Lightricks', domain: 'ltx.studio', aliases: ['Lightricks', 'LTX'] },
  { name: 'Luma', domain: 'lumalabs.ai', aliases: ['Luma', 'Ray3'] },
  { name: 'Reve', domain: 'reve.com', aliases: ['Reve'] },
  { name: 'Black Forest Labs', domain: 'bfl.ai', aliases: ['Black Forest Labs', 'BFL', 'FLUX'] },
  { name: 'Midjourney', domain: 'midjourney.com', aliases: ['Midjourney'] },
  { name: 'Canva', domain: 'canva.com', aliases: ['Canva', 'Leonardo', 'Affinity'] },
  { name: 'Figma', domain: 'figma.com', aliases: ['Figma', 'Weave', 'Weavy'] },
  { name: 'ComfyUI', domain: 'comfy.org', aliases: ['ComfyUI'] },
  { name: 'Krea', domain: 'krea.ai', aliases: ['Krea'] },
  { name: 'Freepik', domain: 'freepik.com', aliases: ['Freepik', 'Magnific'] },
  { name: 'Flora', domain: 'florafauna.ai', aliases: ['Flora', 'FLORA', 'FAUNA'] },
  { name: 'Synthesia', domain: 'synthesia.io', aliases: ['Synthesia'] },
  { name: 'HeyGen', domain: 'heygen.com', aliases: ['HeyGen'] },
  { name: 'Decart', domain: 'decart.ai', aliases: ['Decart', 'Oasis', 'Lucy'] },
  { name: 'World Labs', domain: 'worldlabs.ai', aliases: ['World Labs', 'Marble'] },
  { name: 'Anthropic', aliases: ['Anthropic', 'Claude'] },
  { name: 'NVIDIA', domain: 'nvidia.com', aliases: ['NVIDIA', 'Cosmos'] },
  { name: 'Microsoft', aliases: ['Microsoft', 'MAI-Image', 'MAI-2.6', 'Copilot', 'Bing'] },
  { name: 'Amazon', domain: 'amazon.com', aliases: ['Amazon', 'Nova'] },
  { name: 'Apple', aliases: ['Apple', 'iOS 27'] },
  { name: 'xAI', domain: 'x.ai', aliases: ['xAI', 'Grok'] },
  { name: 'PixVerse', domain: 'pixverse.ai', aliases: ['PixVerse'] },
  { name: 'Cartesia', domain: 'cartesia.ai', aliases: ['Cartesia', 'Sonic'] },
  { name: 'Udio', domain: 'udio.com', aliases: ['Udio'] },
  { name: 'Vercel', domain: 'vercel.com', aliases: ['Vercel'] },
  { name: 'Cloudflare', aliases: ['Cloudflare'] },
  { name: 'Replicate', domain: 'replicate.com', aliases: ['Replicate'] },
  { name: 'Moonvalley', domain: 'moonvalley.ai', aliases: ['Moonvalley', 'Marey'] },
  { name: 'Meshy', domain: 'meshy.ai', aliases: ['Meshy'] },
  { name: 'Stability', domain: 'stability.ai', aliases: ['Stability'] },
  { name: 'Gamma', domain: 'gamma.app', aliases: ['Gamma'] },
]

// ——— The ecosystem map: 8 problem domains, architecturally meaningful companies only ———

export const CATEGORIES: Category[] = [
  {
    id: 'workspaces',
    title: 'General Creative Workspaces',
    jobToBeDone: 'One surface from ideation to publish',
    color: '#8b5cf6',
    companies: [
      { name: 'Canva', kind: 'incumbent', modelDependency: 'multi-model', domain: 'canva.com', thesis: 'Durable — 265M users make models interchangeable inputs', note: 'Leonardo-lineage models + licensed Veo 3 — multi-model under the hood, no user-facing picker; Affinity now free', facts: { arr: '~$4B+ ARR', users: '265M MAU', asOf: 'Jan 2026' }, momentum: true },
      { name: 'Adobe Firefly', kind: 'incumbent', modelDependency: 'multi-model', domain: 'adobe.com', thesis: 'Durable — governed workflow over everyone’s models is working', note: 'Own commercially-safe models + partner-model hub; AI-first ARR up 3x YoY', facts: { arr: 'over $500M AI-first ARR', asOf: 'Jun 2026', cite: '16' }, momentum: true },
      { name: 'Google Flow', kind: 'lab', modelDependency: 'own-models', domain: 'google.com', thesis: 'Durable — bundled frontier gen rides a 1B-MAU assistant', note: 'Flow+Whisk+ImageFX unified Feb 2026, 140+ countries, bundled with AI subscriptions', facts: { users: '1.5B+ creations (claimed)', asOf: 'Feb 2026', cite: '18' } },
      { name: 'Magnific (Freepik)', kind: 'startup', modelDependency: 'multi-model', domain: 'freepik.com', thesis: 'Durable — integration speed and SEO distribution beat model ownership', note: 'Every model under one roof; half of revenue from video', facts: { arr: '$230M ARR', asOf: 'Apr 2026', cite: '4' }, momentum: true },
      { name: 'Krea', kind: 'startup', modelDependency: 'multi-model', domain: 'krea.ai', thesis: 'Durable — real-time canvas is a real paradigm; state must follow', note: 'Real-time canvas, 60+ models; K2 open weights cracked the AA text-to-image top 10 (Jun 2026); enterprise logos incl. LEGO, Samsung, Microsoft — but no new capital since Apr 2025', facts: { valuation: '$500M (Apr 2025)', users: '30M+ users', asOf: 'Jun 2026', cite: '57' } },
      { name: 'Figma Weave', kind: 'incumbent', modelDependency: 'multi-model', domain: 'figma.com', thesis: 'Durable — Community makes workflows a network effect', note: 'Weavy acquired for over $200M; shareable AI workflows inside Figma', facts: { valuation: 'acq. >$200M (Figma)', raised: '$4M seed (as Weavy)', investors: ['Entrée Capital', 'Designer Fund', 'Founder Collective'], asOf: 'Oct 2025' } },
      { name: 'OpenArt', kind: 'startup', modelDependency: 'multi-model', domain: 'openart.ai', thesis: 'Unproven — Recipes are early state; free platform bundles loom', note: 'Shareable Recipes', facts: { arr: '$70M ARR', users: '8M MAU' } },
      { name: 'Recraft', kind: 'startup', modelDependency: 'own-models', domain: 'recraft.ai', thesis: 'Unproven — model-shop-to-workspace pivot must outrun the frontier', note: 'Design-grade image models, shifting from model shop to workspace', facts: { raised: '$42M', investors: ['Accel', 'Khosla Ventures', 'Madrona'], users: '4M+ users (claimed)', asOf: 'May 2025' } },
      { name: 'Reve', kind: 'startup', modelDependency: 'own-models', domain: 'reve.com', thesis: 'Unproven — a $1.9B quiet bet on frontier image quality; demand evidence still absent', note: 'Sutter Hill incubation, ex-Adobe research founders; layout-first "images as code"; #2 on AA image; the Series B was never press-announced', facts: { valuation: '$1.9B', raised: '~$390M', investors: ['Sutter Hill Ventures', 'Top Harvest Capital', 'Basis Set Ventures'], asOf: 'Nov 2025', cite: '59' } },
      { name: 'Lovart', kind: 'startup', modelDependency: 'multi-model', domain: 'lovart.ai', thesis: 'Unproven — agent-first design has no demand proof yet', note: '"AI design agent" archetype; ex-ByteDance founder; no disclosed funding', facts: { users: '10M+ users (claimed)', arr: '~$30M annualized (claimed)', asOf: 'Aug 2026' } },
    ],
  },
  {
    id: 'ads-commerce',
    title: 'Advertising & Commerce',
    jobToBeDone: 'Performance creative at auction speed',
    color: '#f59e0b',
    companies: [
      { name: 'Meta (GEM / Advantage+)', kind: 'incumbent', modelDependency: 'own-models', domain: 'meta.com', thesis: 'Durable — the ad auction is a closed loop no startup can enter', note: 'Targeting fully automated ad creation by end-2026; Muse model (Jul 2026) set to replace Midjourney/BFL licensing — Advantage+ advertiser rollout still pending as of mid-Aug', momentum: true, facts: { arr: '$75B+ Advantage+ run-rate (co-claimed)', users: '4M+ advertisers', asOf: 'Jul 2026' } },
      { name: 'Google Asset Studio', kind: 'incumbent', modelDependency: 'own-models', domain: 'google.com', thesis: 'Durable — creative folds into media spend', note: 'Veo in Google Ads; ~70M Gemini-generated assets in Q4 2025 across AI Max + PMax' },
      { name: 'Amazon Creative Agent', kind: 'incumbent', modelDependency: 'own-models', domain: 'amazon.com', thesis: 'Durable — free creative subsidized by retail media', note: 'Free conversational ad agent (Feb 2026), monetized via media spend' },
      { name: 'Creatify', kind: 'startup', modelDependency: 'multi-model', domain: 'creatify.ai', thesis: 'Unproven — the 15M-ad corpus is real; platform absorption risk is too', note: 'Creatify Agent (May 2026) trained on 15M+ ads; locked brand facts as constraints', facts: { raised: '$23M+', investors: ['WndrCo', 'Kindred Ventures', 'NFDG'], arr: '$9M ARR (May 2025)', users: '1M+ marketers (claimed)', asOf: 'Sep 2025' } },
      { name: 'Typeface', kind: 'startup', modelDependency: 'partner-models', domain: 'typeface.ai', thesis: 'Unproven — brand governance sells; suite bundling squeezes', note: 'Enterprise brand governance, Arc Agents', facts: { valuation: '$1B (Jun 2023)', raised: '$165M', investors: ['Salesforce Ventures', 'Lightspeed', 'GV'], asOf: 'Jun 2023' } },
      { name: 'Jasper', kind: 'startup', modelDependency: 'partner-models', domain: 'jasper.ai', thesis: 'Unproven — enterprise base real, differentiation thinning', note: '900+ enterprise customers; GEO Agent (Jun 2026)', facts: { valuation: '$1.5B (Oct 2022)', raised: '$131M', investors: ['Insight Partners', 'Coatue', 'Bessemer'], asOf: 'May 2025' } },
      { name: 'Arcads', kind: 'startup', modelDependency: 'multi-model', domain: 'arcads.ai', thesis: 'Unproven — lean and niche; AI-actor ads commoditize fast', note: 'AI-actor performance ads', facts: { arr: '~$15M ARR (est.)', raised: '$25M' } },
      { name: 'Photoroom', kind: 'startup', modelDependency: 'own-models', domain: 'photoroom.com', thesis: 'Fragile — free platform tools are eating product imagery', note: 'Product imagery leader; squeezed by free platform tools', facts: { valuation: '$500M (Mar 2024)', raised: '$64M', investors: ['Balderton', 'Y Combinator', 'Aglaé Ventures'], arr: '~$150M ARR (est.)', asOf: 'Jan 2026' } },
      { name: 'Pencil (Brandtech)', kind: 'incumbent', modelDependency: 'multi-model', domain: 'trypencil.com', thesis: 'Fragile — agency-embedded delivery limits how far the product scales', note: 'Agency-embedded enterprise creative gen', facts: { valuation: 'acq. by Brandtech (Jun 2023)', users: '35K+ teams (claimed)', asOf: 'Aug 2026' } },
      { name: 'Smartly', kind: 'incumbent', modelDependency: 'multi-model', domain: 'smartly.io', thesis: 'Unproven — adtech incumbents absorb the agent pattern', note: 'Synapse orchestration layer (Jun 2026) — adtech incumbents absorbing the agent pattern', facts: { valuation: 'Providence Equity majority (2019)', arr: '~$101–221M rev (est.)', users: '700+ brands', asOf: 'Aug 2026' } },
    ],
  },
  {
    id: 'film-video',
    title: 'Film / TV / Pro Video',
    jobToBeDone: 'Studio-grade production and post',
    color: '#f43f5e',
    companies: [
      { name: 'Runway', kind: 'startup', modelDependency: 'own-models', domain: 'runwayml.com', thesis: 'Durable — GWM opens a second act beyond per-generation media revenue', note: 'Gen-4.5 + GWM world-model pivot; revenue undisclosed (est. $100–300M; trackers est. ~$300M annualized by late 2025)', facts: { valuation: '$5.3B', raised: '$315M Series E', asOf: 'Feb 2026', cite: '5' }, momentum: true },
      { name: 'Luma', kind: 'startup', modelDependency: 'own-models', domain: 'lumalabs.ai', thesis: 'Unproven — pro deliverables niche vs omni gravity; HUMAIN compute buys time', note: 'Ray3.2 HDR/EXR pro deliverables', facts: { valuation: '$4B', raised: '$900M', investors: ['HUMAIN'] } },
      { name: 'Moonvalley', kind: 'startup', modelDependency: 'own-models', domain: 'moonvalley.ai', thesis: 'Durable — provenance is what studio procurement actually buys', note: 'Marey trained exclusively on licensed data — the clean-model studio wedge; absorbed into Reka AI (May 2026, all-share) for the physical-AI push', facts: { valuation: 'acq. by Reka AI (May 2026, all-share)', raised: '$154M', investors: ['General Catalyst', 'Khosla Ventures', 'CAA'], asOf: 'Jun 2026' } },
      { name: 'LTX Studio (Lightricks)', kind: 'startup', modelDependency: 'open-weights', domain: 'ltx.studio', thesis: 'Durable — the Linux-of-video position compounds', note: 'Open-sourced LTX-2 (Jan 2026); script-to-screen pipeline + own open models', momentum: true, facts: { valuation: '$1.8B (Sep 2021)', raised: '$335M', investors: ['Insight Partners', 'Goldman Sachs Growth', 'Viola'], arr: '~$250M ARR (Lightricks apps, 2025)', asOf: 'Dec 2025' } },
      { name: 'Adobe Premiere', kind: 'incumbent', modelDependency: 'multi-model', domain: 'adobe.com', thesis: 'Durable — the timeline is where pro video already lives', note: 'Firefly in the timeline; Generative Extend on licensed data' },
      { name: 'DaVinci Resolve', kind: 'incumbent', modelDependency: 'own-models', domain: 'blackmagicdesign.com', thesis: 'Unproven — free local AI commoditizes the assist layer', note: 'Local-first AI free tier — commoditizes assistive editing' },
      { name: 'Autodesk Flow Studio', kind: 'incumbent', modelDependency: 'own-models', domain: 'autodesk.com', thesis: 'Unproven — strategic buyer more than standalone winner', note: 'ex-Wonder Dynamics video→CG; $200M into World Labs', facts: { valuation: 'acq. by Autodesk (May 2024)', asOf: 'Aug 2025' } },
      { name: 'Promise', kind: 'startup', modelDependency: 'multi-model', domain: 'promisestudios.com', thesis: 'Unproven — AI-native studio thesis unproven at feature length', note: 'AI-native studio; a16z, Google AI Futures Fund, Crossbeam', facts: { investors: ['a16z', 'North Road', 'Google AI Futures Fund'], asOf: 'Jul 2026' } },
      { name: 'Flawless', kind: 'startup', modelDependency: 'own-models', domain: 'flawlessai.com', thesis: 'Unproven — consent-based dubbing is defensible but narrow', note: 'Consent-based visual dubbing for studios', facts: { raised: '~$33M', asOf: 'Nov 2021' } },
      { name: 'Deepdub', kind: 'startup', modelDependency: 'own-models', domain: 'deepdub.ai', thesis: 'Unproven — royalty model aligns talent; scale unproven', note: 'Production dubbing with voice-clone royalties', facts: { raised: '$26M', investors: ['Insight Partners'], asOf: 'Feb 2022' } },
    ],
  },
  {
    id: 'social-ugc',
    title: 'Social / UGC / Consumer',
    jobToBeDone: 'Short-form creation at meme speed',
    color: '#0ea5e9',
    companies: [
      { name: 'CapCut / Dreamina', kind: 'incumbent', modelDependency: 'own-models', domain: 'capcut.com', thesis: 'Durable — the largest creation funnel on earth feeds its own model', note: 'Seedance 2.5 (public Jul 31) into a 300M+-MAU editor; Seedance API reportedly past RMB 1B/month (36Kr-lineage, unaudited)', momentum: true, facts: { users: '300M+ MAU (a16z est. ~736M)', asOf: 'Jun 2026', cite: '53' } },
      { name: 'YouTube Shorts + Veo', kind: 'incumbent', modelDependency: 'own-models', domain: 'youtube.com', thesis: 'Durable — free frontier video in the feed ends standalone apps', note: 'Free frontier video gen inside the feed — the biggest distribution event in GenMedia', facts: { users: '200B+ daily Shorts views', asOf: 'Apr 2026' } },
      { name: 'Grok Imagine', kind: 'lab', modelDependency: 'own-models', domain: 'x.ai', thesis: 'Unproven — arena wins and X distribution; retention unproven', note: '#1 on video arenas in early 2026; Video 1.5 now ~$4.20/min; Image 2.0 slipped to Arena #3 in image (MAI-2.6 took #2) but holds #2 in image-edit; X distribution', momentum: true, facts: { users: '20M+ images/day (claimed, Aug 2025)', asOf: 'Mar 2026' } },
      { name: 'Higgsfield', kind: 'startup', modelDependency: 'multi-model', domain: 'higgsfield.ai', thesis: 'Unproven — revenue still company-claimed; Soul ID persistence is the real test', note: 'Soul ID character persistence is the accumulated state; revenue figures company-claimed, not audited', facts: { valuation: '$5.4B', raised: '$400M Series B', arr: '$700M annualized (claimed)', asOf: 'Aug 2026', cite: '40' }, momentum: true },
      { name: 'PixVerse', kind: 'startup', modelDependency: 'own-models', domain: 'pixverse.ai', thesis: 'Unproven — huge consumer reach; serving-cost structure opaque', note: 'Real-time R1 model', facts: { valuation: 'over $2B', raised: '$439M', users: '150M users (claimed)', asOf: 'Jul 2026', cite: '25' }, momentum: true },
      { name: 'Mirage (Captions)', kind: 'startup', modelDependency: 'own-models', domain: 'captions.ai', thesis: 'Unproven — revenue-linked financing implies real recurring revenue', note: 'Own short-form video models', facts: { raised: '$75M revenue-linked', asOf: 'Mar 2026' } },
      { name: 'Viggle', kind: 'startup', modelDependency: 'own-models', domain: 'viggle.ai', thesis: 'Unproven — meme engine with feature-absorption risk', note: 'Physics-aware character motion; meme-format engine', facts: { raised: '$19M', investors: ['a16z', 'Google AI Futures Fund'], asOf: 'May 2025' } },
      { name: 'Character.AI', kind: 'startup', modelDependency: 'own-models', domain: 'character.ai', thesis: 'Unproven — engagement is real; monetization is not yet', note: 'Chat → feed → AvatarFX video arc', facts: { valuation: '$1B (2023); ~$2.7B Google deal (2024)', raised: '$193M', users: '20M MAU', arr: '~$30–50M ARR', asOf: 'Aug 2025' } },
      { name: 'Meta Vibes', kind: 'incumbent', modelDependency: 'own-models', domain: 'meta.com', thesis: 'Fragile — AI feeds need creators, not prompts', note: '~2M DAU (Nov 2025), weak retention; the surviving-but-limping AI feed', facts: { users: '~2M DAU, declining', asOf: 'Nov 2025' } },
    ],
  },
  {
    id: 'music-audio',
    title: 'Music & Audio',
    jobToBeDone: 'Licensed sound at API speed',
    color: '#10b981',
    companies: [
      { name: 'ElevenLabs', kind: 'startup', modelDependency: 'own-models', domain: 'elevenlabs.io', thesis: 'Durable — the cleanest scale-up in GenMedia; licensed-first compounds', note: 'Voice → dubbing → agents → licensed music', facts: { valuation: '$11B', arr: '$600M ARR', asOf: 'Jul 2026', cite: '6' }, momentum: true },
      { name: 'Suno', kind: 'startup', modelDependency: 'own-models', domain: 'suno.com', thesis: 'Durable — WMG/BMG licenses turned legal risk into catalog access; UMG looms', note: 'Settled WMG (Nov 2025), licensed BMG (Aug 2026, never a plaintiff); UMG suit live, Sony ruling not before 2027', facts: { valuation: '$5.4B', raised: '$400M', arr: '~$300M ARR (est.)', asOf: 'Jun 2026', cite: '7' }, momentum: true },
      { name: 'Udio', kind: 'startup', modelDependency: 'own-models', domain: 'udio.com', thesis: 'Fragile — label-captured; roadmap and terms now set by UMG/WMG', note: 'Absorbed into a UMG/WMG walled garden — the labels captured it', facts: { raised: '$10M seed', investors: ['a16z', 'UnitedMasters'], asOf: 'Oct 2025' } },
      { name: 'Cartesia', kind: 'startup', modelDependency: 'own-models', domain: 'cartesia.ai', thesis: 'Durable — latency is a constraint the frontier ignores', note: 'Sonic 3.6 (Aug 18) leads both AA speech arenas; sub-100ms vendor-claimed TTFA', facts: { raised: '$191M', investors: ['Kleiner Perkins', 'Index', 'NVIDIA'], users: '50K+ business customers', asOf: 'May 2026' } },
      { name: 'KLAY', kind: 'startup', modelDependency: 'own-models', domain: 'klay.vision', thesis: 'Unproven — three-major licensing; product still early', note: 'First AI music co licensed by all three majors', facts: { raised: '~$10M', investors: ['Magma Partners'], asOf: 'Nov 2025' } },
      { name: 'Descript', kind: 'startup', modelDependency: 'multi-model', domain: 'descript.com', thesis: 'Unproven — right agent direction, crowded editor field', note: 'Underlord agentic editor is now the product center', facts: { valuation: '~$550M (Nov 2022)', raised: '$100M', investors: ['OpenAI Startup Fund', 'a16z', 'Redpoint'], arr: '$55M ARR (late 2024)', asOf: 'Dec 2024' } },
      { name: 'Google Lyria', kind: 'lab', modelDependency: 'own-models', domain: 'google.com', thesis: 'Unproven — platform feature, not a product', note: 'Music gen wired into Gemini Live API' },
      { name: 'Stability Audio', kind: 'startup', modelDependency: 'own-models', domain: 'stability.ai', thesis: 'Fragile — survival pivot in a licensed-catalog game', note: 'Survival-mode audio pivot; UMG partnership post-Udio', facts: { valuation: '~$1B (Jun 2024 recap)', raised: '~$225M+', investors: ['Coatue', 'Lightspeed', 'Greycroft'], arr: '~$50M rev (2024)', asOf: 'Mar 2025' } },
    ],
  },
  {
    id: 'gaming-3d-worlds',
    title: 'Gaming, 3D & World Models',
    jobToBeDone: 'Assets, characters, playable worlds',
    color: '#6366f1',
    companies: [
      { name: 'World Labs', kind: 'startup', modelDependency: 'own-models', domain: 'worldlabs.ai', thesis: 'Durable — mesh-native worlds drop into real pipelines', note: 'Marble GA; mesh-native worlds', facts: { raised: '$1B round', investors: ['Autodesk ($200M)'], asOf: 'Feb 2026', cite: '22' }, momentum: true },
      { name: 'Decart', kind: 'startup', modelDependency: 'own-models', domain: 'decart.ai', thesis: 'Durable — the optimization stack is worth more than the demos', note: 'Sub-40ms real-time; Anthropic acquisition reported near signing at ~$7B, mostly stock, chosen over a higher NVIDIA offer (Aug 16 — still unsigned)', facts: { valuation: '~$4B', raised: '$300M', asOf: 'Aug 2026', cite: '48' }, momentum: true },
      { name: 'Google Genie', kind: 'lab', modelDependency: 'own-models', domain: 'google.com', thesis: 'Durable — first consumer world model; bundling does the rest', note: 'Project Genie shipped Jan 2026 to $250/mo Ultra subscribers, US-only' },
      { name: 'NVIDIA Cosmos', kind: 'incumbent', modelDependency: 'open-weights', domain: 'nvidia.com', thesis: 'Durable — supplying every builder beats depending on any one lab', note: 'Cosmos 3 open omnimodel + Coalition (BFL, Runway, LTX) — Llama-izing world models', facts: { users: '10M HF downloads (claimed)', asOf: 'Jul 2026' } },
      { name: 'Odyssey', kind: 'startup', modelDependency: 'own-models', domain: 'odyssey.systems', thesis: 'Unproven — simulation pivot chases robotics budgets', note: 'Pivoting to simulation infrastructure', facts: { valuation: '$1.45B', raised: '$310M' } },
      { name: 'Meshy', kind: 'startup', modelDependency: 'own-models', domain: 'meshy.ai', thesis: 'Fragile — capital underwrites world-model optionality, not current usage', note: 'Committed capital runs ~50x ahead of revenue; 12x YoY growth claimed', facts: { valuation: '$1.5B', raised: '~$400M Series B', arr: '~$30M ARR', asOf: 'Jul 2026', cite: '33' } },
      { name: 'Tripo', kind: 'startup', modelDependency: 'own-models', domain: 'tripo3d.ai', thesis: 'Unproven — speed lead in a commoditizing category', note: 'Speed + topology leader in 3D assets', facts: { raised: '~$200M' } },
      { name: 'Rodin (Deemos)', kind: 'startup', modelDependency: 'own-models', domain: 'deemos.com', thesis: 'Unproven — sub-$1 pricing proves the commodity endgame', note: 'Lowe’s 30k-item catalog at <$1/model — 3D pricing already commoditized', facts: { raised: 'CNY 100Ms round (Jun 2026)', investors: ['Cathay Capital', 'Lanchi Ventures', 'ByteDance'], asOf: 'Jun 2026' } },
      { name: 'Inworld', kind: 'startup', modelDependency: 'own-models', domain: 'inworld.ai', thesis: 'Unproven — NPC infra leader hedging into voice', note: 'NPC infra leader, diversifying into voice agents', facts: { valuation: '>$500M (Aug 2023)', raised: '~$120M', investors: ['Lightspeed', 'M12 (Microsoft)', 'Samsung Next'], asOf: 'Jul 2026' } },
      { name: 'Scenario', kind: 'startup', modelDependency: 'multi-model', domain: 'scenario.com', thesis: 'Fragile — style-lock is becoming a frontier-model feature', note: 'Style-locked game assets; little holds once frontier models ship the same control', facts: { raised: '$11M', investors: ['Play Ventures'], asOf: 'Jan 2023' } },
      { name: 'Hidden Door', kind: 'startup', modelDependency: 'multi-model', domain: 'hiddendoor.co', thesis: 'Unproven — licensed-IP fiction, the games analog of music licensing', note: 'Licensed-IP interactive fiction', facts: { raised: '$9M', investors: ['Northzone', 'Makers Fund', 'Betaworks'], asOf: 'Aug 2025' } },
      { name: 'Ubisoft / EA (internal)', kind: 'incumbent', modelDependency: 'multi-model', thesis: 'Unproven — internal pipelines cut costs, not add revenue', note: 'Ubisoft’s studio-wide generative pipeline (Ghostwriter, NEO NPCs); EA co-developing with Stability' },
    ],
  },
  {
    id: 'enterprise-comms',
    title: 'Enterprise Video & Comms',
    jobToBeDone: 'Governed video for work',
    color: '#14b8a6',
    companies: [
      { name: 'Synthesia', kind: 'startup', modelDependency: 'own-models', domain: 'synthesia.io', thesis: 'Durable — NRR over 140% across 90% of the Fortune 100', note: 'NRR over 140%, 90% of Fortune 100; expects $200M ARR during 2026', facts: { valuation: '$4B', raised: '$200M Series E', arr: '~$150M ARR', asOf: 'Jan 2026', cite: '9' }, momentum: true },
      { name: 'HeyGen', kind: 'startup', modelDependency: 'multi-model', domain: 'heygen.com', thesis: 'Durable — break-even on ~$25M burned; the app layer’s cost-discipline benchmark', note: 'Cash-flow break-even; burned only $25M of the $74M raised', facts: { arr: '$200M ARR', raised: '~$74M total', asOf: 'Jun 2026', cite: '8' }, momentum: true },
      { name: 'Gamma', kind: 'startup', modelDependency: 'partner-models', domain: 'gamma.app', thesis: 'Unproven — profitable and lean; native rivals arrived', note: 'Profitable with ~50 people; MSFT/Google now ship native rivals', facts: { valuation: '$2.1B', arr: 'over $100M ARR', asOf: 'Nov 2025' } },
      { name: 'Gemini Notebook', kind: 'incumbent', modelDependency: 'own-models', domain: 'google.com', thesis: 'Durable — free doc-to-video caps the category', note: 'ex-NotebookLM, 30M users; free doc→video caps the explainer category', facts: { users: '30M+ users, 600K+ orgs (claimed)', asOf: 'Jul 2026' } },
      { name: 'Tavus', kind: 'startup', modelDependency: 'own-models', domain: 'tavus.io', thesis: 'Unproven — real-time niche holds on latency; demand breadth unknown', note: 'Real-time conversational avatars, <500ms end-to-end', facts: { valuation: '~$250M (secondary est.)', raised: '$64M', investors: ['CRV', 'Sequoia', 'Scale Venture Partners'], asOf: 'Aug 2026' } },
      { name: 'Sync', kind: 'startup', modelDependency: 'own-models', domain: 'sync.so', thesis: 'Unproven — the API layer rivals quietly resell', note: 'Lip-sync API layer powering other platforms', facts: { raised: '~$5.5M seed', investors: ['GV', 'Y Combinator'], asOf: 'Aug 2026' } },
      { name: 'Argil', kind: 'startup', modelDependency: 'own-models', domain: 'argil.ai', thesis: 'Unproven — must outrun avatars-as-a-feature', note: 'Creator clone videos; notable European entrant', facts: { raised: '€4.9M', investors: ['EQT Ventures', 'Seedcamp'], asOf: 'Nov 2024' } },
    ],
  },
  {
    id: 'workflow-orchestration',
    title: 'Workflow, Agents & Orchestration',
    jobToBeDone: 'The connective tissue between apps and models',
    color: '#ec4899',
    companies: [
      { name: 'fal', kind: 'startup', modelDependency: 'multi-model', domain: 'fal.ai', thesis: 'Durable — media-native inference compounds; agents add workflow state', note: 'Launched fal Agent Aug 2026; ~$8B round in talks since Mar, unclosed', facts: { valuation: '$4.5B', arr: '~$400M annualized', asOf: 'Mar 2026', cite: '10' }, momentum: true },
      { name: 'ComfyUI', kind: 'startup', modelDependency: 'open-weights', domain: 'comfy.org', thesis: 'Durable — workflows-as-JSON is becoming the substrate', note: 'Workflows-as-JSON is the portable orchestration format', facts: { valuation: '$500M', raised: '$30M', users: '4M+ users', asOf: 'Apr 2026', cite: '13' } },
      { name: 'Flora', kind: 'startup', modelDependency: 'multi-model', domain: 'florafauna.ai', thesis: 'Unproven — FAUNA plus marquee logos; needs enterprise state', note: 'FAUNA agent wires node pipelines from a brief; Nike/Netflix/Pentagram run FAUNA, Lionsgate is a FLORA client', facts: { raised: '$42M Series A', asOf: 'Jan 2026', cite: '14' } },
      { name: 'Adobe Firefly Assistant', kind: 'incumbent', modelDependency: 'multi-model', domain: 'adobe.com', thesis: 'Durable — the agent already lives where work happens', note: 'Creative agent across CC apps; embedded into ChatGPT and Claude (Jun 2026)' },
      { name: 'Replicate (Cloudflare)', kind: 'incumbent', modelDependency: 'multi-model', domain: 'replicate.com', thesis: 'Fragile — thin marketplaces get absorbed; the deal proved it', note: 'Acquired Nov 2025 — thin marketplaces get absorbed', facts: { valuation: 'acq. by Cloudflare (terms undisclosed)', raised: '~$58M pre-acq', investors: ['a16z', 'Sequoia', 'NVIDIA'], users: '50K+ hosted models', asOf: 'Nov 2025', cite: '12' } },
      { name: 'Runware', kind: 'startup', modelDependency: 'multi-model', domain: 'runware.ai', thesis: 'Unproven — EU champion on owned hardware; scale gap vs fal', note: '1MW containerized inference pods; the EU champion', facts: { raised: '$50M Series A' } },
      { name: 'WaveSpeed', kind: 'startup', modelDependency: 'multi-model', domain: 'wavespeed.ai', thesis: 'Unproven — fastest non-China shelf for Chinese models; fragile edge', note: 'Singapore-based; fastest non-China access to ByteDance/Alibaba models' },
      { name: 'Vercel AI Gateway', kind: 'incumbent', modelDependency: 'multi-model', domain: 'vercel.com', thesis: 'Unproven — gateways commoditize routing from above', note: '33 image + 32 video models (Aug 2026); gateways treat media as first-class now', facts: { valuation: 'Vercel $9.3B (parent)', users: '200K+ teams (claimed)', asOf: 'Aug 2026' } },
      { name: 'Baseten / Modal / Together', kind: 'startup', modelDependency: 'multi-model', thesis: 'Unproven — media as catalog extension, not focus', note: 'General inference clouds serving media as catalog extension', facts: { valuation: 'Baseten $13B · Modal $4.65B · Together $8.3B', asOf: 'Jul 2026' } },
    ],
  },
]

// ——— Foundation model landscape ———

export const MODEL_GROUPS: ModelGroup[] = [
  {
    modality: 'Video',
    note: 'The most contested modality. Only ~150 Elo separates #1 from #11 on the Artificial Analysis arena (Aug 19, 2026); 9 of the top 10 are Chinese. Native audio is now table stakes, and pure text-to-video has become an onboarding feature — production work runs on image-to-video, multi-reference chaining, and keyframe conditioning (Seedance 2.5 takes 50 reference inputs; Ray3.2 takes 16 keyframes). Leaderboard half-life is now measured in weeks — Gen-4.5 led in Dec 2025; Grok Imagine took both AA video arenas in late Jan at a fraction of rivals’ prices; Wan 3.0 debuted at #1 on AA text-to-video this week, pushing Gemini to #2; Veo 3.1 sits #9 (Arena) to #12 (Artificial Analysis); Seedance edged back ahead of Hailuo H3 on both image-to-video boards mid-August — the gap sits inside the error bars, and H3 remains the top open-weights entry.',
    entries: [
      { name: 'Gemini Omni Flash', developer: 'Google', openness: 'closed', capability: 'Still #1 on Arena text-to-video, but slipped to #2 on AA (Wan 3.0 debuted 10 Elo above it this week) and #3 on image-to-video — the lead is contested weekly; conversational editing without re-prompting', pricing: '$0.10/sec', adoption: 'Gemini app, Flow, YouTube Shorts, Vertex', flagship: true },
      { name: 'Hailuo H3', developer: 'MiniMax', openness: 'hybrid', capability: '#2 on Arena image-to-video (Seedance edged ahead mid-Aug, within error bars) and top open-weights entry on both boards; #3 on AA text-to-video, 11 Elo behind Gemini; 15s, 2K, native stereo (license excludes US/EU/UK/KR local deploy)', pricing: '~1/3 of rivals (est.)', adoption: 'HK-listed; aggregator shelves everywhere' },
      { name: 'Seedance 2.5', developer: 'ByteDance', openness: 'closed', capability: '30s single-pass, 4K, 50 multimodal reference inputs; #2 on Arena image-to-video within error bars of #1, #1 on the new Video Edit board; Seedance 2.0 still holds AA image-to-video #1', pricing: '$0.05–0.40/sec by tier', adoption: 'CapCut (400M+ MAU), Jimeng/Dreamina, Volcano API — reportedly over RMB 1B/month (36Kr-lineage, unaudited)' },
      { name: 'Kling 3.0 Omni', developer: 'Kuaishou', openness: 'closed', capability: 'Native 4K/60fps, 15s, in-model lip-sync; image gen too; 3.0 Turbo speed tier (Jun 2026)', pricing: '~$0.11–0.17/sec', adoption: 'Q2 revenue RMB 850M+, up over 200% YoY (filed Aug 19) — the filed-revenue leader, ~70–75% overseas (Q1); spun out at $18B post (Jul 2026)' },
      { name: 'Gen-4.5', developer: 'Runway', openness: 'closed', capability: '1-minute multi-shot, native audio, character consistency; GWM world-model track', pricing: '~$0.12/sec (Gen-4.5 class)', adoption: 'Studio deals (Lionsgate, AMC); enterprise workflows' },
      { name: 'Veo 3.1', developer: 'Google', openness: 'closed', capability: '8s, up to 4K, native audio; slid to #9 (Arena) – #12 (AA) as Omni took over', pricing: '$0.05–0.75/sec by tier', adoption: 'Google Ads, Shorts, API' },
      { name: 'Wan 3.0', developer: 'Alibaba', openness: 'hybrid', capability: 'Debuted #1 on AA text-to-video (Aug 2026); 30s single-pass in public beta since Aug 6; open-weights line stops at Wan 2.2 — the flagship is closed', pricing: '~$0.05/sec', adoption: 'Top open-video lineage in ComfyUI workflows' },
      { name: 'LTX-2.5', developer: 'Lightricks', openness: 'open', capability: 'Native 4K + synced audio on one RTX 4090; open weights (free under $10M ARR)', pricing: 'Free <$10M ARR, licensed above', adoption: 'The open substrate for on-prem studio work' },
      { name: 'Ray3.2', developer: 'Luma', openness: 'closed', capability: '16-bit HDR, EXR export, 16 keyframes/clip — pro/VFX deliverables', pricing: 'n/a public', adoption: 'Hollywood pipeline; HUMAIN compute' },
      { name: 'Grok Imagine Video 1.5', developer: 'xAI', openness: 'closed', capability: 'Took #1 on both AA video arenas in late Jan 2026; fast 5–30s clips at 720p; the spring Chinese wave has since pushed it out of the AA text-to-video top 10', pricing: '~$4.20/min (86% below Sora 2)', adoption: 'Bundled into X/Grok apps, paid-only since Mar 2026; xAI API + aggregators' },
      { name: 'Sora 2', developer: 'OpenAI', openness: 'closed', capability: 'Still strong; app dead Apr 26, API sunsets Sep 24, 2026', pricing: '$0.10–0.50/sec until sunset', adoption: 'Exiting — the cycle’s cautionary tale' },
    ],
  },
  {
    modality: 'Image',
    note: 'The closest thing to a stable frontier: GPT Image 2 holds #1 on every arena (1368–1463 Elo across boards), but MAI-Image-2.6’s Aug 10 debut at Arena #2 (displacing Grok Image 2.0 to #3) cut the text-to-image lead to 45 Elo — a real capability lead, but no longer a widening one.',
    entries: [
      { name: 'GPT Image 2', developer: 'OpenAI', openness: 'closed', capability: '#1 on every arena (1381 Arena T2I, 1463 image-edit, 1368 AA — lead narrowing); 2K native, text rendering, thinking mode', pricing: '$0.03–0.08/image', adoption: 'ChatGPT + API; 53% of Vercel gateway image volume', flagship: true },
      { name: 'MAI-Image-2.6', developer: 'Microsoft', openness: 'closed', capability: 'Arena #2 at 1336 Elo (Aug 10); +79 Elo over 2.5 in one release; cut the GPT Image lead to 45 Elo', pricing: 'Copilot-bundled', adoption: 'Copilot/Bing; OpenAI-independence signal' },
      { name: 'Reve 2.1', developer: 'Reve', openness: 'closed', capability: '#2 on AA; layout-first (posters, typography, packaging); claims frontier quality on roughly a tenth of rivals’ compute', pricing: '~$0.20/image API (Jul 2026)', adoption: 'Best-funded independent image lab — $350M Series B at $1.9B, never announced; on fal, Replicate, Krea; no disclosed revenue' },
      { name: 'Grok Image 2.0', developer: 'xAI', openness: 'closed', capability: '#2 on Arena image-edit (1439 Elo, behind only GPT Image 2); #3 Arena text-to-image since MAI-2.6’s debut', pricing: 'X subscription tiers', adoption: 'In-feed generation on X — 20M+ images/day claimed (Aug 2025); no public API' },
      { name: 'Nano Banana 2 (Gemini 3.1 Flash Image)', developer: 'Google', openness: 'closed', capability: '#3 AA; Imagen 4 Fast is the $0.02/image cost floor', pricing: '$0.02–0.15/image', adoption: 'Gemini, Flow, Workspace, Vertex' },
      { name: 'FLUX.2 / FLUX 3', developer: 'Black Forest Labs', openness: 'hybrid', capability: 'Dev (32B) is the open standard; Klein Apache-2.0; FLUX 3 goes omni — FLUX 3 Video GA Aug 5, #6 on Arena image-to-video and #2 on Arena text-to-video (not yet listed on AA)', pricing: '~$0.03/MP API', adoption: '~$300M contract value: Meta ($140M), Adobe, Canva' },
      { name: 'Midjourney V8.2', developer: 'Midjourney', openness: 'closed', capability: 'Aesthetics-led; still no API; video stuck at V1', pricing: 'Subscription only', adoption: '~$200–500M revenue est. (wide variance); Disney suit in discovery' },
      { name: 'HunyuanImage 3.0', developer: 'Tencent', openness: 'open', capability: '80B MoE — largest open image model; Instruct adds reasoning', pricing: 'Self-host', adoption: 'Open-ecosystem anchor' },
      { name: 'Seedream 4.5 / 5.0', developer: 'ByteDance', openness: 'closed', capability: '5.0 now publicly ranked — #8 on Arena T2I (Aug 2026)', pricing: 'Ark platform', adoption: 'Dreamina, Doubao, partner shelves' },
    ],
  },
  {
    modality: 'Audio, Music & Voice',
    note: 'Capability alone no longer differentiates here — what a model is licensed to train on and emit does. The unlicensed-training era ended commercially in a nine-month window (Oct 2025 – mid-2026).',
    entries: [
      { name: 'Eleven v3 / Eleven Music', developer: 'ElevenLabs', openness: 'closed', capability: 'Broadest suite: TTS, dubbing, SFX, agents, licensed music (Merlin/Kobalt)', pricing: '~$0.10/1k chars; music $0.15/min', adoption: '$600M ARR (Jul 2026); Spotify audiobooks; 41% of Fortune 500 claimed', flagship: true },
      { name: 'Suno v5/v6', developer: 'Suno', openness: 'closed', capability: 'V5/V5.5 still live; licensed V6 committed under WMG/BMG deals, not yet shipped', pricing: 'Subscription; paid downloads', adoption: '2M paid subs, 100M users (Feb 2026); UMG and Sony suits live, no fair-use ruling before 2027' },
      { name: 'Sonic 3.6', developer: 'Cartesia', openness: 'closed', capability: '#1 on both AA Speech Arenas (shipped Aug 18); sub-100ms vendor TTFA, ~166–190ms in independent tests', pricing: 'API', adoption: 'Voice-agent latency leader; AWS JumpStart' },
      { name: 'Udio (licensed)', developer: 'Udio + UMG/WMG', openness: 'closed', capability: 'Walled-garden remix platform; creations can’t leave', pricing: 'Subscription', adoption: 'Label-captured; exited open generation' },
      { name: 'Lyria 3', developer: 'Google', openness: 'closed', capability: 'Music gen in Gemini Live API', pricing: 'Bundled', adoption: 'Platform feature, not product' },
      { name: 'MiniMax Speech 2.6', developer: 'MiniMax', openness: 'closed', capability: 'Expressive HD + <250ms Turbo, 40+ languages', pricing: 'Aggressive', adoption: 'Cost leader in voice APIs' },
    ],
  },
  {
    modality: '3D',
    note: 'Workflow-dominated, not leaderboard-dominated. No omni model has absorbed rigging or retopology — the long tail here is durable, but unit pricing already commoditized (<$1/model in enterprise e-commerce).',
    entries: [
      { name: 'Meshy-6', developer: 'Meshy', openness: 'closed', capability: 'Most production-ready meshes + texturing; engine export', pricing: 'Subscription + API', adoption: '~$400M Series B @ $1.5B on ~$30–40M ARR (reports conflict)', flagship: true },
      { name: 'Tripo H3.1 / P1.0', developer: 'VAST', openness: 'closed', capability: 'Clean low-poly in ~2s; rigs bipeds and creatures', pricing: 'Subscription + API', adoption: '~$200M raised; 6.5M creators claimed (Mar 2026)' },
      { name: 'Rodin Gen-2.5', developer: 'Deemos', openness: 'closed', capability: 'Sculpt-level detail, production topology controls', pricing: '<$1/model at volume', adoption: 'Lowe’s 30k-item 2D→3D conversion' },
      { name: 'Hunyuan3D 2.5', developer: 'Tencent', openness: 'open', capability: 'Best open 3D; near-proprietary fidelity', pricing: 'Self-host', adoption: 'Open-ecosystem anchor' },
    ],
  },
  {
    modality: 'World Models',
    note: 'The largest concentration of new capital in the stack (over $3B committed in 2026) — and the work is exiting entertainment for simulation infrastructure (AV, robotics). Media, gaming, and robotics requirements converge here.',
    entries: [
      { name: 'Genie 3 (Project Genie)', developer: 'Google DeepMind', openness: 'closed', capability: 'Real-time navigable worlds, 720p/24fps, minutes of consistency', pricing: '$249.99/mo Ultra tier, US-only', adoption: 'First consumer world-model product (Jan 2026)', flagship: true },
      { name: 'Marble', developer: 'World Labs', openness: 'closed', capability: 'Worlds with exportable triangle + collider meshes; World API', pricing: 'Freemium + API', adoption: '$1B round (Feb 2026), $200M from Autodesk' },
      { name: 'Oasis 3 / Lucy 2', developer: 'Decart', openness: 'closed', capability: 'Sub-35ms real-time generation and live video editing', pricing: 'API', adoption: 'Anthropic acquisition reported near signing at ~$7B (still unsigned)' },
      { name: 'GWM-1', developer: 'Runway', openness: 'closed', capability: 'Worlds / Avatars / Robotics SKUs atop Gen-4.5', pricing: 'Enterprise', adoption: 'Media lab bridging into robotics revenue' },
      { name: 'Cosmos 3', developer: 'NVIDIA', openness: 'open', capability: 'Open omnimodel with action output for physical AI', pricing: 'Open', adoption: 'Cosmos Coalition: BFL, Runway, LTX, Skild' },
      { name: 'Odyssey-2', developer: 'Odyssey', openness: 'closed', capability: 'Causal frame-streaming "interactive movie"', pricing: 'n/a public', adoption: '$310M @ $1.45B; simulation pivot' },
    ],
  },
  {
    modality: 'Specialized Survivors',
    note: 'Omni models absorbed lip-sync, SFX, and editing as features. Specialists survive only where there is a hard workflow or real-time constraint the frontier models don’t touch.',
    entries: [
      { name: 'Sync', developer: 'Sync Labs', openness: 'closed', capability: 'Lip-sync API powering other platforms', pricing: 'API', adoption: 'Quality + developer leader' },
      { name: 'Tavus', developer: 'Tavus', openness: 'closed', capability: 'Real-time conversational avatars, <500ms end-to-end', pricing: 'API', adoption: 'The real-time constraint niche' },
      { name: 'Viggle 2.5', developer: 'Viggle', openness: 'closed', capability: 'Physics-aware motion transfer onto any character', pricing: 'Freemium', adoption: 'Huge short-form creator adoption' },
      { name: 'Topaz Bloom / Magnific', developer: 'Topaz / Freepik', openness: 'closed', capability: 'Fidelity vs creative upscaling — frontier models still cap at 2–4K', pricing: 'Subscription', adoption: 'The standard two-upscaler stack' },
    ],
  },
]

// ——— Ten hypotheses, tested ———

export const HYPOTHESES: Hypothesis[] = [
  {
    id: 'H1',
    statement: 'Raw media generation is becoming a feature rather than a standalone product.',
    verdict: 'strongly-supported',
    rationale: 'Veo is free inside YouTube Shorts, Seedance ships inside CapCut, Adobe is running a 12-month unlimited-generations promo, Apple announced free photorealistic generation with iOS 27 (shipping this fall), and Amazon gives ad creative away to drive media spend. The counter-examples that still monetize generation directly — Midjourney, Kling — do it through community or an owned distribution funnel, not the generation button itself. Sora, the best-known standalone generation product in the West, is dead.',
  },
  {
    id: 'H2',
    statement: 'Model quality is converging faster than model economics.',
    verdict: 'supported',
    rationale: 'In video, ~150 Elo covers #1 through #11 and leaderboard leadership now turns over in weeks, while the price spread between frontier and challenger models is still 5–10x and inference cost fell >10x since 2024 — quality converged, economics did not. The caveat is image, where GPT Image 2 still holds every #1 (though MAI-2.6 just cut the lead nearly in half), and audio, where the licensed catalog (not the model) sets the economics.',
  },
  {
    id: 'H3',
    statement: 'GenMedia will remain a heterogeneous multimodel ecosystem rather than collapsing around one dominant foundation model.',
    verdict: 'strongly-supported',
    rationale: 'No model wins every workload. The market consolidated into three durable archetypes — distribution-owned omni models (Google, ByteDance, Kuaishou, xAI), independent pro labs (Runway, BFL, Luma, ElevenLabs), and open/China-first price leaders (Alibaba, Tencent, MiniMax, Lightricks). Every aggregator shelf is majority-Chinese in video by usage; 3D and real-time niches resist absorption entirely.',
  },
  {
    id: 'H4',
    statement: 'The winning application layer will increasingly own an agentic creative workflow rather than a generation interface.',
    verdict: 'supported',
    rationale: 'Every layer of the stack shipped a creative agent in 2026 — Adobe Firefly Assistant, fal Agent, Flora FAUNA, Krea Node Agent, Creatify Agent, Amazon Creative Agent — and the durable advantage is shifting from model access to creative state: persistent characters, brand constraints, project memory, reusable workflows. Not yet "strongly": today’s revenue leaders (Kling, Midjourney, Magnific) still monetize generation interfaces.',
  },
  {
    id: 'H5',
    statement: 'Model routing/orchestration becomes more valuable as specialized models proliferate.',
    verdict: 'supported',
    rationale: 'fal doubled from ~$200M to ~$400M annualized in months and is reportedly raising at ~$8B — orchestration with media-native depth (kernels, queues, fine-tunes) compounds. But thin aggregation gets absorbed: Replicate sold to Cloudflare, gateways commoditize the unified-API part, and fal itself moving up into agents signals that raw routing alone doesn’t hold its margin structure forever.',
  },
  {
    id: 'H6',
    statement: 'Distribution becomes more important as raw model differentiation declines.',
    verdict: 'strongly-supported',
    rationale: 'The two defining data points of 2026: Sora — frontier model, no distribution economics — shut down; Kling — good-enough model inside Kuaishou’s funnel and a global API — hit a ~$475M annualized run-rate (Q2 2026). Google won the Western consumer field by default through a 1B-MAU assistant and YouTube. Adobe monetizes other people’s models through workflow distribution.',
  },
  {
    id: 'H7',
    statement: 'Incumbent creative platforms are advantaged in workflows, while startups remain advantaged in new AI-native interaction paradigms.',
    verdict: 'supported',
    rationale: 'Adobe’s AI-first ARR >$500M (+3x YoY) and Canva’s ~$4B ARR show workflow incumbency converts. Startups own the new paradigms — node canvases (Flora, Krea), real-time generation (Decart, Krea), character persistence (Higgsfield Soul ID). But the boundary is porous: incumbents buy the paradigm (Weavy → Figma for >$200M) and startups build workflow (LTX Studio), so this reads as tendency, not law.',
  },
  {
    id: 'H8',
    statement: 'Video generation creates sufficiently different infrastructure requirements to support a distinct GenMedia infrastructure ecosystem.',
    verdict: 'supported',
    rationale: 'Long-running jobs, GB-scale intermediate assets, a heterogeneous model zoo, and stateful multi-model pipelines forced fal, Decart, and Runware to hand-build compilers, kernels, and queueing — though a dominant open standard is no longer absent: vLLM-Omni (official vLLM project, open-source since Nov 2025) now serves Wan, FLUX, and Hailuo-class diffusion models in production, which is exactly the commoditization trigger this hypothesis names. External capital still prices the hand-built layer highly — fal at $4.5B+ on ~$400M revenue, Anthropic reportedly near a ~$7B deal for Decart’s optimization stack — while Cloudflare’s $57.4M Replicate purchase (per its 10-Q) shows what absorption of thin aggregation looks like.',
  },
  {
    id: 'H9',
    statement: 'Creative agents become the primary interface between humans and generative media models.',
    verdict: 'unclear',
    rationale: 'The supply side is unanimous — every major player shipped an agent in 2026, which is where the industry believes lock-in lives. But demand-side proof is young: no retention or revenue data yet shows creators preferring delegation to direct manipulation, and the biggest creative revenues still flow through canvases, timelines, and prompt boxes. This is 2026’s consensus hypothesis, not its confirmed behavior.',
  },
  {
    id: 'H10',
    statement: 'The largest GenMedia company may ultimately look less like a model company and more like an operating system for creativity.',
    verdict: 'supported',
    rationale: 'The largest GenMedia businesses today — Canva (~$4B+ ARR), Adobe (>$5B AI-influenced ARR as of Sep 2025), Google — are surfaces that aggregate models, not model companies. The strongest startups (Magnific, Higgsfield, HeyGen) win on workflow and state over commodity models. The caveat: Google is both the OS and the frontier model owner, and in video the model+distribution combination is what actually wins.',
  },
]

// ——— Strategic control points, 2030 ———

export const CONTROL_POINTS: ControlPoint[] = [
  {
    title: 'Distribution-owned generation surfaces',
    why: 'When quality converges, the default surface wins. Free generation inside YouTube Shorts, CapCut, Gemini, and Instagram decides what billions of people use without ever choosing a model, and subsidizes inference that kills standalone consumer apps.',
    leaders: 'Google (Gemini 1B MAU, YouTube, Flow), ByteDance (CapCut/TikTok), Meta (ad system), xAI (Grok Imagine inside X), Apple (OS-level, arriving)',
    defensibility: 'User bases measured in billions plus owned inference (TPUs, ByteDance scale) — customer-acquisition and serving-cost advantages no startup can match.',
    absorption: 'This IS the incumbents’ position; the question is whether they extend it from casual creation into professional work.',
    commoditization: 'Regulatory separation (EU, US-China), or creation shifting to agent interfaces that sit above any one surface.',
    valuePool: 'Largest in the map — consumer creation folds into existing attention/ads economics measured in tens of billions.',
  },
  {
    title: 'The creative agent & state layer',
    why: 'Whoever holds the project memory — characters, brand constraints, references, reusable workflows — owns switching costs the model layer can’t touch. In 2026 every stack layer shipped a creative agent because everyone believes the durable position lives here.',
    leaders: 'Adobe (Firefly Assistant in ChatGPT/Claude), fal Agent, Higgsfield (Soul ID), Flora (FAUNA), Figma (Weave), Krea',
    defensibility: 'Accumulated creative state = switching costs; workflow communities (Figma Community, ComfyUI JSON, OpenArt Recipes) add network effects.',
    absorption: 'High risk — Adobe, Google, Canva, and Figma are claiming it from above while fal and ComfyUI claim it from below. Independents must convert 2026 growth into enterprise state before the squeeze.',
    commoditization: 'If agents become thin shells over frontier models’ own memory, state migrates down to the model layer.',
    valuePool: 'Professional creative software — a workflow surface on the order of $50B in annual spend — re-platformed onto agents.',
  },
  {
    title: 'Media-native inference & optimization',
    why: 'There is no dominant open serving standard for diffusion yet — vLLM-Omni (Nov 2025) is the first credible contender. Serving 1,000+ heterogeneous models fast, cheap, and queued is still a hand-built kernel business, and video’s cost curve (down >10x since 2024) is set here.',
    leaders: 'fal (~$400M annualized), Decart (sub-40ms real-time; Anthropic deal reported near signing at ~$7B), Cloudflare/Replicate, Runware',
    defensibility: 'Compiler and kernel engineering compounds; every new model release widens the serving problem this layer is paid to solve; usage pricing scales with the whole category.',
    absorption: 'Partial — hyperscalers and frontier labs are buying in (Cloudflare/Replicate, the Decart talks) rather than out-building.',
    commoditization: 'An open-source standard serving engine for DiT models would compress the layer overnight — vLLM-Omni (Nov 2025) is the first credible attempt, not yet dominant.',
    valuePool: 'A single-digit-billions revenue pool growing with all media compute; strategic value far above the revenue.',
  },
  {
    title: 'Frontier omni models with owned distribution',
    why: 'Pure model quality has a half-life now measured in weeks to quarters, but a frontier model fused to a billion-user surface (Gemini Omni + YouTube, Seedance + CapCut) compounds data, cost, and default status simultaneously.',
    leaders: 'Google, ByteDance, Kuaishou, xAI (Grok Imagine riding X); OpenAI in image post-Sora (a “Spud” video successor is reported); Microsoft entering via MAI + Copilot; MiniMax as the public-market pure-play',
    defensibility: 'Capital intensity of frontier training + proprietary usage data + subsidized inference. Distribution is the differentiator, not the checkpoint.',
    absorption: 'This is incumbent territory already; independent labs (Runway, Luma, BFL) survive via pro niches, licensing, or robotics pivots.',
    commoditization: 'Open-weights frontier releases (H3-style) plus falling training costs erode the standalone model premium continuously.',
    valuePool: 'Winner-take-most per surface; monetizes as subscriptions, ads, and API — tens of billions but concentrated.',
  },
  {
    title: 'Licensed data & rights clearing',
    why: 'Music proved the sequence: lawsuits became licenses, and the licensed catalog became the durable advantage. Studio procurement now selects for provenance (Moonvalley, Adobe indemnification), and EU AI Act Article 50 enforcement (Aug 2, 2026) makes provenance infrastructure a compliance requirement.',
    leaders: 'The majors (UMG/WMG capturing Udio), Suno post-WMG-settlement, ElevenLabs (licensed-first), Adobe, Moonvalley, C2PA ecosystem; Loti/Vermillio in likeness',
    defensibility: 'Exclusive catalogs and consent frameworks are legally enforceable advantages — the only kind courts actively strengthen.',
    absorption: 'Rights holders themselves are the incumbents here; tech companies become licensees.',
    commoditization: 'Blanket statutory licensing would flatten the advantage; conversely, a Sony v. Suno fair-use win could weaken it.',
    valuePool: 'Sits in the request path of all commercial generation — a small percentage of an enormous base; likeness rights alone sized at ~$10B.',
  },
  {
    title: 'World models & the simulation bridge',
    why: 'The over-$3B that flowed into world models in 2026 rests on the hypothesis that generative media and robotics/AV simulation are one technology. Whoever owns the world model owns both the next entertainment format and the training ground for physical AI.',
    leaders: 'Google (Genie 3), World Labs (Marble + Autodesk), Decart, NVIDIA (Cosmos 3 open standard + Coalition), Runway (GWM)',
    defensibility: 'Frontier research talent and compute; NVIDIA’s open Cosmos strategy is deliberately commoditizing the closed labs’ edge.',
    absorption: 'Active — Autodesk bought in, Anthropic is reportedly bidding, NVIDIA is arming everyone. Expect the category to be absorbed into larger platforms by 2028.',
    commoditization: 'If Cosmos-style open models reach parity, value shifts to simulation data and integration, not the model.',
    valuePool: 'Speculative but potentially the largest: entertainment plus the simulation layer of the entire physical-AI economy.',
  },
]

// ——— Durability / commoditization matrix ———

export const MOAT_MATRIX: MatrixRow[] = [
  {
    layer: 'Frontier video models',
    differentiation: 'Eroding fast — ~150 Elo across the top 11; leadership turnover compressed from quarterly to weeks',
    risk: 'high',
    durability: 'Fusion with owned distribution and subsidized inference; otherwise none durable',
    leverage: 'Migrates to distribution owners; standalone labs pivot to pro niches or robotics',
  },
  {
    layer: 'Image models',
    differentiation: 'GPT Image 2 holds every #1, but MAI-2.6 cut the Arena lead to 45 Elo',
    risk: 'medium',
    durability: 'Reasoning-in-generation, text rendering; open FLUX.2 caps the price umbrella',
    leverage: 'OpenAI at the frontier; BFL via platform licensing; the cost-price spread thins below the top',
  },
  {
    layer: 'Audio / voice / music',
    differentiation: 'High — licensed catalogs, latency, enterprise trust',
    risk: 'low',
    durability: 'Label deals are legally enforceable; owned models keep serving costs low',
    leverage: 'The strongest cost structures in GenMedia — ElevenLabs, Suno, Synthesia-class',
  },
  {
    layer: 'Thin generation apps',
    differentiation: 'Minimal — same model shelf as everyone else',
    risk: 'high',
    durability: 'None; 40–50% of revenue goes back out as inference serving cost',
    leverage: 'Little hold on either side of the pipeline — the consolidations and shutdowns (Icon, Visual Electric) trace the failure mode',
  },
  {
    layer: 'Creative workspaces & aggregators',
    differentiation: 'Workflow depth, speed of model integration, enterprise governance',
    risk: 'medium',
    durability: 'Templates, brand kits, enterprise contracts, credit-pricing arbitrage',
    leverage: 'Strong today (Canva, Adobe, Magnific) but contested by free platform bundles',
  },
  {
    layer: 'Creative agents & state',
    differentiation: 'Emerging — everyone shipped v1 in 2026',
    risk: 'medium',
    durability: 'Accumulated creative state: characters, brand constraints, project memory',
    leverage: 'The prize; unproven demand-side, claimed from above and below simultaneously',
  },
  {
    layer: 'Orchestration & inference',
    differentiation: 'Kernel/compiler engineering, queueing, media-native DX',
    risk: 'medium',
    durability: 'Hand-built optimization (no dominant open standard yet — vLLM-Omni emerging); usage pricing',
    leverage: 'Real and compounding (fal), but thin aggregation gets absorbed (Replicate)',
  },
  {
    layer: 'GPU / compute',
    differentiation: 'Scale, contracts, energy access',
    risk: 'low',
    durability: 'Capital intensity + multi-year backlogs (CoreWeave’s $21B Meta deal)',
    leverage: 'Rent-setting position — a high share of every dollar of spend, at high capital intensity',
  },
  {
    layer: 'Provenance / rights infra',
    differentiation: 'Regulatory tailwind — EU Art. 50 live Aug 2026, China labeling since Sep 2025',
    risk: 'low',
    durability: 'Compliance mandates with fines attached; C2PA network effects',
    leverage: 'Small revenue today; strategic — and metadata still doesn’t survive re-encoding',
  },
]

// ——— Vertical integration ———

export const STACK_COMPANIES: StackCompany[] = [
  { name: 'Google', kind: 'incumbent', domain: 'google.com', layers: ['distribution', 'application', 'workflow', 'model', 'infrastructure'], note: 'The only player integrated from TPU silicon to YouTube distribution' },
  { name: 'ByteDance', kind: 'incumbent', domain: 'bytedance.com', layers: ['distribution', 'application', 'workflow', 'model', 'infrastructure'], note: 'Create → publish → monetize in one company; Volcano Engine underneath' },
  { name: 'Adobe', kind: 'incumbent', domain: 'adobe.com', layers: ['distribution', 'application', 'workflow', 'model'], note: 'Own models de-emphasized; the pitch is governed workflow over everyone’s models' },
  { name: 'Meta', kind: 'incumbent', domain: 'meta.com', layers: ['distribution', 'application', 'model'], note: 'Muse (Jul 2026) reduces licensing dependence; the ad system is the real product' },
  { name: 'OpenAI', kind: 'lab', domain: 'openai.com', layers: ['distribution', 'application', 'model'], note: 'Post-Sora: image frontier + ChatGPT distribution, video exited' },
  { name: 'Kuaishou / Kling', kind: 'incumbent', domain: 'klingai.com', layers: ['distribution', 'application', 'model'], note: 'The revenue proof that model + owned funnel + global API works' },
  { name: 'xAI', kind: 'lab', domain: 'x.ai', layers: ['distribution', 'application', 'model'], note: 'Grok Imagine bundled into X — own models on an owned feed, but no disclosed usage or revenue' },
  { name: 'Microsoft', kind: 'incumbent', domain: 'microsoft.com', layers: ['distribution', 'application', 'model'], note: 'MAI-Image-2.6 at Arena #2 ends pure OpenAI dependence; Copilot is the surface; no video model' },
  { name: 'Canva', kind: 'incumbent', domain: 'canva.com', layers: ['distribution', 'application', 'workflow'], note: 'Mass-market distribution; models are interchangeable inputs' },
  { name: 'Runway', kind: 'startup', domain: 'runwayml.com', layers: ['application', 'workflow', 'model'], note: 'Full-stack independent; world-model pivot adds a robotics lane' },
  { name: 'Lightricks / LTX', kind: 'startup', domain: 'ltx.studio', layers: ['application', 'workflow', 'model'], note: 'Open-weights model + owned studio workflow — vertical but open' },
  { name: 'ElevenLabs', kind: 'startup', domain: 'elevenlabs.io', layers: ['application', 'model'], note: 'Owned models — the strongest cost structure in GenMedia' },
  { name: 'Suno', kind: 'startup', domain: 'suno.com', layers: ['application', 'model'], note: 'Owned models; WMG settlement + BMG license building the catalog' },
  { name: 'Higgsfield', kind: 'startup', domain: 'higgsfield.ai', layers: ['application', 'workflow'], note: 'Pure aggregator accumulating state-layer switching costs (Soul ID)' },
  { name: 'Magnific (Freepik)', kind: 'startup', domain: 'freepik.com', layers: ['distribution', 'application', 'workflow'], note: 'SEO distribution + all-models workflow; zero frontier models' },
  { name: 'fal', kind: 'startup', domain: 'fal.ai', layers: ['workflow', 'infrastructure'], note: 'Inference moving up into agents — refusing to stay plumbing' },
  { name: 'Black Forest Labs', kind: 'startup', domain: 'bfl.ai', layers: ['model'], note: 'Deliberate single-layer: license the frontier to platforms' },
  { name: 'NVIDIA', kind: 'incumbent', domain: 'nvidia.com', layers: ['model', 'infrastructure'], note: 'Supplies every lab + the open Cosmos standard; exposed to the whole model layer, not one winner' },
]

// ——— Momentum 25 ———

export const MOMENTUM: MomentumEntry[] = [
  { rank: 1, name: 'ByteDance (Seedance / CapCut)', what: 'model + funnel', domain: 'bytedance.com', why: 'The biggest reported business in GenMedia: Seedance API revenue passed RMB 1B/month by June (~$1.7B annualized — 36Kr-lineage reporting, not a filing), over half of Volcano Engine’s RMB 15B MaaS target, ~95% of China’s short-drama industry. Seedance 2.0 holds #1 on AA image-to-video, 2.5 (public Jul 31) debuted #1 on Arena’s Video Edit board, and it all ships into a 300M+-MAU editor. The asterisks: monetization is China-domestic behind RMB 10M-minimum contracts, and the Hollywood deepfake fight (MPA demand, Disney/Paramount cease-and-desists) is unresolved.' },
  { rank: 2, name: 'Kling (Kuaishou)', what: 'video model + app', domain: 'klingai.com', why: 'The hardest evidence in GenMedia: Q2 revenue over RMB 850M, up over 200% YoY (filed Aug 19, 2026 — a ~$475M annualized run-rate), ~70–75% overseas as of Q1, spun out with a ~$3B round at $18B post (Jul 2026), HK IPO targeted 2027. Smaller than Seedance’s reported numbers — but this one sits in a listed company’s filings, and no rival matches the overseas mix.' },
  { rank: 3, name: 'ElevenLabs', what: 'audio platform', domain: 'elevenlabs.io', why: '$600M ARR (Jul 2026), $11B Series D, Spotify distribution, licensed music expansion — the cleanest scale-up in all of GenMedia, and the largest company-stated figure that is directly GenMedia-attributable.' },
  { rank: 4, name: 'Google (Gemini / Veo / Flow)', what: 'full stack', domain: 'google.com', why: 'Gemini passed 1B MAU and Flow unified into a 140-country workspace — the widest distribution in the field, won largely by Sora’s forfeit. But Wan 3.0 just took the AA text-to-video #1 from Omni Flash, and none of the 1B-MAU scale converts to attributable GenMedia revenue.' },
  { rank: 5, name: 'Adobe', what: 'workspace + agent', domain: 'adobe.com', why: 'AI-first ARR >$500M (+3x YoY); Firefly became a multi-model hub and its creative agent now lives inside ChatGPT and Claude — the incumbent that adapted.' },
  { rank: 6, name: 'fal', what: 'inference / orchestration', domain: 'fal.ai', why: '~$400M annualized (doubled in months), Sequoia-led $4.5B with an ~$8B round in talks since March, and an Aug 2026 move up into agents — the tooling-layer winner.' },
  { rank: 7, name: 'Runway', what: 'video lab', domain: 'runwayml.com', why: '$315M Series E at $5.3B with NVIDIA and Adobe as investors; Gen-4.5 plus the GWM world-model line gives it a second act beyond media.' },
  { rank: 8, name: 'Suno', what: 'music', domain: 'suno.com', why: '$400M at $5.4B raised mid-lawsuit; settled WMG and licensed BMG from a position of strength — licensing is turning its biggest legal risk into its most durable advantage, with UMG still litigating.' },
  { rank: 9, name: 'MiniMax', what: 'model lab (public)', domain: 'minimax.io', why: 'HK IPO popped +109% (Jan 2026); Hailuo H3 put open-weights video at the frontier — briefly #1 on Arena image-to-video in early August, #2 within error bars since — the first public pure-play in GenMedia.' },
  { rank: 10, name: 'Black Forest Labs', what: 'image + video models', domain: 'bfl.ai', why: '$300M at $3.25B; FLUX is the open image standard, ~$300M of licensing contracts (including Meta’s $140M) prove the sell-to-platforms model, and FLUX 3 Video went GA in August.' },
  { rank: 11, name: 'Synthesia', what: 'enterprise video', domain: 'synthesia.io', why: '$200M at $4B, ~$150M ARR, NRR >140%, 90% of the Fortune 100 — governed enterprise video keeps compounding beneath the hype.' },
  { rank: 12, name: 'HeyGen', what: 'enterprise video', domain: 'heygen.com', why: '$200M ARR near break-even on ~$74M raised — the sharpest cost-discipline datapoint in the application layer.' },
  { rank: 13, name: 'World Labs', what: 'world models', domain: 'worldlabs.ai', why: 'Marble went GA with a $1B round including $200M from Autodesk; mesh-native outputs make its worlds drop into real 3D pipelines.' },
  { rank: 14, name: 'Decart', what: 'real-time inference', domain: 'decart.ai', why: 'Sub-40ms real-time generation, $300M at ~$4B, and an Anthropic acquisition reported near signing at ~$7B (mostly stock, over a higher NVIDIA bid) — external capital registering what a hand-built optimization stack is worth.' },
  { rank: 15, name: 'Magnific (Freepik)', what: 'aggregator workspace', domain: 'freepik.com', why: '$230M ARR with zero frontier models of its own — proof that distribution plus integration speed out-monetizes model ownership at the app layer.' },
  { rank: 16, name: 'Higgsfield', what: 'consumer suite', domain: 'higgsfield.ai', why: '$400M Series B at $5.4B (Aug 17, DST-led) — 4x its valuation in eight months — now claiming $700M annualized (still company figures); Soul ID character persistence is the aggregator state-layer experiment to watch.' },
  { rank: 17, name: 'PixVerse', what: 'consumer video', domain: 'pixverse.ai', why: '$439M at >$2B (Jul 2026), 150M registered users (claimed), first real-time consumer video model — China’s consumer export machine at work.' },
  { rank: 18, name: 'Lightricks / LTX', what: 'open video', domain: 'ltx.studio', why: 'LTX-2 open-sourced in January (4K + audio on one consumer GPU) through LTX-2.5 in August — the "Linux of video" position, plus a Cosmos Coalition seat.' },
  { rank: 19, name: 'Luma', what: 'video lab', domain: 'lumalabs.ai', why: '$900M at $4B led by HUMAIN with 2GW of committed compute; Ray3.2’s HDR/EXR deliverables target the pro/VFX lane the omni models ignore.' },
  { rank: 20, name: 'Midjourney', what: 'image', domain: 'midjourney.com', why: 'Still ~$200–500M revenue (est.) with zero funding and ~40 people — but no API, no C2PA, and Disney’s suit in discovery make it momentum with an asterisk.' },
  { rank: 21, name: 'NVIDIA Cosmos', what: 'open world models', domain: 'nvidia.com', why: 'Cosmos 3 (Jun 2026) plus the Coalition arms the whole ecosystem with open world models — the Llama play for physical AI, run by the compute monopolist.' },
  { rank: 22, name: 'ComfyUI', what: 'workflow substrate', domain: 'comfy.org', why: '$30M at $500M, 4M+ users, Comfy Cloud out of beta — its JSON workflows are becoming the portable orchestration format of the industry.' },
  { rank: 23, name: 'xAI (Grok Imagine)', what: 'model + X distribution', domain: 'x.ai', why: 'Took #1 on both AA video arenas in late January and holds image podium spots (#2 image-edit, #3 text-to-image since MAI-2.6 arrived); Video 1.5 now prices at ~$4.20/min — 86% below Sora 2 — with own models bundled into X, but paid-only since March and no disclosed usage or revenue.' },
  { rank: 24, name: 'Meta Muse', what: 'image model', domain: 'meta.com', why: 'Launched July 2026 into Meta AI, Stories, and WhatsApp at billion-user scale, with the Advantage+ advertiser rollout next; the "infinite creative" pipeline optimized against auction outcomes is a closed loop no startup can enter.' },
  { rank: 25, name: 'Tencent Hunyuan', what: 'open ecosystem', domain: 'tencent.com', why: 'The most modality-diverse open lineage (80B image, video, 3D, world) — the open-weights supply chain under indie GenMedia tooling worldwide.' },
]

// ——— Just outside the 25 ———
// 'honorable' = a real 2026 case that missed on evidence, and the entry says which
// evidence. 'latent' = a position strong enough to reshape the list with nothing
// shipped or filed in 2026 that moves it yet.

export const NEAR_MOMENTUM: NearMomentumEntry[] = [
  { group: 'honorable', name: 'Alibaba (Wan)', what: 'open video models', domain: 'alibaba.com', note: 'Wan 3.0 took the AA text-to-video #1 in August, and the Wan lineage is (with Hunyuan) the open-weights substrate under half the world’s ComfyUI workflows — the strongest case for a 26th slot, held back only by zero disclosed revenue or funding events for the model line.' },
  { group: 'honorable', name: 'Krea', what: 'real-time canvas', domain: 'krea.ai', note: 'The strongest pure-product year of anything off the list — K2 open weights cracked the AA text-to-image top 10, an open-sourced real-time video model, the first creative-facing node agent, 30M+ users. What’s missing is the money signal: no new capital since Apr 2025, no ARR disclosure, and a 7x traffic gap to Higgsfield in its own lane.' },
  { group: 'honorable', name: 'Mirage (Captions)', what: 'creator video', domain: 'captions.ai', note: '$75M of revenue-linked financing implies real recurring revenue, and it renamed itself around its own short-form models — edged out once xAI’s leaderboard run demanded a slot.' },
  { group: 'honorable', name: 'Cartesia', what: 'speech models', domain: 'cartesia.ai', note: 'Sonic 3.6 tops both AA speech arenas (Aug 18) — but ElevenLabs owns the audio narrative, the enterprise logos, and the licensing story, so capability alone doesn’t move the audio hierarchy yet.' },
  { group: 'honorable', name: 'Microsoft (MAI-Image)', what: 'image models', domain: 'microsoft.com', note: 'MAI-Image-2.6 launched at #2 on Arena (Aug 10) with Copilot and Bing as distribution — real capability arriving late, still a derivative GenMedia strategy rather than an owned lane.' },
  { group: 'latent', name: 'OpenAI', what: 'post-Sora', domain: 'openai.com', note: 'GPT Image 2 still leads the image arena and ChatGPT remains the largest creative-adjacent surface in the West. Sora died of distribution economics, not capability — video re-entry is a unit-economics decision away, and the list would rearrange the week it happens.' },
  { group: 'latent', name: 'Apple', what: 'OS-level generation', domain: 'apple.com', note: 'Free photorealistic generation announced for iOS 27, shipping this fall — OS-level distribution that would reset consumer image economics. Announced is not shipped, so it stays latent by definition.' },
  { group: 'latent', name: 'Anthropic', what: 'acquirer-in-waiting', domain: 'anthropic.com', note: 'The reported ~$7B Decart acquisition was near signing as of Aug 16. If it closes, a frontier lab enters real-time generation by purchase — the largest single bet on the modality to date.' },
  { group: 'latent', name: 'Udio', what: 'licensed music', domain: 'udio.com', note: 'Captured by the majors — UMG and WMG turned their lawsuit into ownership. A label-licensed music catalog product is sitting in inventory until relaunch; when it ships, it lands on Suno’s position from above.' },
]

// ——— Positioning 2x2: model ownership vs distribution ownership ———
// Positions are editorial judgments on a 0–100 scale, not measurements.

export const POSITIONING: PositionedCompany[] = [
  { name: 'Google', domain: 'google.com', kind: 'incumbent', x: 96, y: 96, labelSide: 'left' },
  { name: 'ByteDance', domain: 'bytedance.com', kind: 'incumbent', x: 88, y: 90, labelSide: 'left' },
  { name: 'Meta', domain: 'meta.com', kind: 'incumbent', x: 80, y: 84, labelSide: 'left' },
  { name: 'Kling', domain: 'klingai.com', kind: 'incumbent', x: 85, y: 78, labelSide: 'left' },
  { name: 'OpenAI', domain: 'openai.com', kind: 'lab', x: 90, y: 68, labelSide: 'left' },
  { name: 'xAI', domain: 'x.ai', kind: 'lab', x: 80, y: 60, labelSide: 'left' },
  { name: 'Microsoft', domain: 'microsoft.com', kind: 'incumbent', x: 62, y: 88 },
  { name: 'Adobe', domain: 'adobe.com', kind: 'incumbent', x: 55, y: 75 },
  { name: 'Canva', domain: 'canva.com', kind: 'incumbent', x: 28, y: 80 },
  { name: 'Magnific', domain: 'freepik.com', kind: 'startup', x: 12, y: 58 },
  { name: 'Higgsfield', domain: 'higgsfield.ai', kind: 'startup', x: 12, y: 45 },
  { name: 'ElevenLabs', domain: 'elevenlabs.io', kind: 'startup', x: 90, y: 42, labelSide: 'left' },
  { name: 'Midjourney', domain: 'midjourney.com', kind: 'startup', x: 85, y: 35, labelSide: 'left' },
  { name: 'HeyGen', domain: 'heygen.com', kind: 'startup', x: 35, y: 30 },
  { name: 'Runway', domain: 'runwayml.com', kind: 'startup', x: 90, y: 25, labelSide: 'left' },
  { name: 'fal', domain: 'fal.ai', kind: 'startup', x: 25, y: 15 },
  { name: 'Luma', domain: 'lumalabs.ai', kind: 'startup', x: 88, y: 15, labelSide: 'left' },
  { name: 'Black Forest Labs', domain: 'bfl.ai', kind: 'startup', x: 92, y: 10, labelSide: 'left' },
]

// ——— Financials: the $100M+ club (plus Meshy as the multiple outlier) ———
// Canva (~$4B total ARR) is excluded: not GenMedia-attributable, and it would break the scale.

export const FINANCIALS: CompanyFinancials[] = [
  { name: 'Higgsfield', domain: 'higgsfield.ai', kind: 'startup', arrLowM: 700, arrLabel: '$700M annualized (claimed)', evidence: 'claimed', valuationM: 5400, valuationLabel: '$5.4B', raisedM: 400, note: 'Aug 17 Series B; revenue figures company-claimed, not audited' },
  { name: 'Kling', domain: 'klingai.com', kind: 'incumbent', arrLowM: 475, arrLabel: '~$475M run-rate (Q2 2026)', evidence: 'company-stated', valuationM: 18000, valuationLabel: '$18B post', note: 'Q2 revenue RMB 850M+, up over 200% YoY, per Kuaishou filing of Aug 19, 2026 (unaudited interim results)' },
  { name: 'ElevenLabs', domain: 'elevenlabs.io', kind: 'startup', arrLowM: 600, arrLabel: '$600M ARR (Jul 2026)', evidence: 'company-stated', valuationM: 11000, valuationLabel: '$11B', note: 'Crossed $500M ARR in Apr 2026, $600M by Jul — company-stated (over $330M at end-2025' },
  { name: 'Adobe (AI-first)', domain: 'adobe.com', kind: 'incumbent', arrLowM: 500, arrLabel: 'over $500M AI-first ARR', evidence: 'company-stated', note: 'Earnings-call figure; whole-company scale sits far above this line' },
  { name: 'fal', domain: 'fal.ai', kind: 'startup', arrLowM: 400, arrLabel: '~$400M annualized', evidence: 'estimate', valuationM: 4500, valuationLabel: '$4.5B', note: '~$8B round in talks since March, unclosed' },
  { name: 'Midjourney', domain: 'midjourney.com', kind: 'startup', arrLowM: 200, arrHighM: 500, arrLabel: '$200–500M (est., wide variance)', evidence: 'estimate' },
  { name: 'Suno', domain: 'suno.com', kind: 'startup', arrLowM: 300, arrLabel: '~$300M ARR (est.)', evidence: 'estimate', valuationM: 5400, valuationLabel: '$5.4B', raisedM: 400 },
  { name: 'Magnific', domain: 'freepik.com', kind: 'startup', arrLowM: 230, arrLabel: '$230M ARR', evidence: 'company-stated', note: 'Profitable; no VC rounds, though parent Freepik has been EQT-majority-owned since 2020 — no disclosed valuation' },
  { name: 'HeyGen', domain: 'heygen.com', kind: 'startup', arrLowM: 200, arrLabel: '$200M ARR', evidence: 'company-stated', raisedM: 74, note: 'Break-even; burned only $25M of $74M raised' },
  { name: 'Runway', domain: 'runwayml.com', kind: 'startup', arrLowM: 100, arrHighM: 300, arrLabel: 'est. $100–300M', evidence: 'estimate', valuationM: 5300, valuationLabel: '$5.3B', raisedM: 315 },
  { name: 'Synthesia', domain: 'synthesia.io', kind: 'startup', arrLowM: 150, arrLabel: '~$150M ARR', evidence: 'company-stated', valuationM: 4000, valuationLabel: '$4B', raisedM: 200 },
  { name: 'Gamma', domain: 'gamma.app', kind: 'startup', arrLowM: 100, arrLabel: 'over $100M ARR', evidence: 'company-stated', valuationM: 2100, valuationLabel: '$2.1B' },
  { name: 'OpenArt', domain: 'openart.ai', kind: 'startup', arrLowM: 70, arrLabel: '$70M+ ARR', evidence: 'company-stated' },
  { name: 'Meshy', domain: 'meshy.ai', kind: 'startup', arrLowM: 30, arrLabel: '~$30M ARR', evidence: 'company-stated', valuationM: 1500, valuationLabel: '$1.5B', raisedM: 400, note: 'The ~50x capital-to-revenue outlier — capital underwriting a world-model research program, not current usage' },
]

// ——— Aggregator flow: models → aggregation → where the output goes ———

export const FLOW: FlowData = {
  models: [
    { id: 'gemini', label: 'Gemini Omni / Veo', sub: 'Google', domain: 'google.com', color: '#4285f4' },
    { id: 'seedance', label: 'Seedance 2.5', sub: 'ByteDance', domain: 'bytedance.com', color: '#14b8a6' },
    { id: 'kling', label: 'Kling 3.0', sub: 'Kuaishou', domain: 'klingai.com', color: '#f59e0b' },
    { id: 'hailuo', label: 'Hailuo H3', sub: 'MiniMax', domain: 'minimax.io', color: '#f43f5e' },
    { id: 'flux', label: 'FLUX.2 / 3', sub: 'Black Forest Labs', domain: 'bfl.ai', color: '#8b5cf6' },
    { id: 'wan', label: 'Wan 2.2 / 3.0', sub: 'Alibaba', color: '#f97316' },
    { id: 'ltx', label: 'LTX-2.5', sub: 'Lightricks · open', domain: 'ltx.studio', color: '#10b981' },
    { id: 'gptimage', label: 'GPT Image 2', sub: 'OpenAI', domain: 'openai.com', color: '#64748b' },
  ],
  aggregators: [
    { id: 'googleflow', label: 'Google Flow', sub: 'first-party · Veo only', domain: 'google.com', color: '#4285f4' },
    { id: 'fal', label: 'fal', sub: 'inference + agent', domain: 'fal.ai', color: '#ec4899' },
    { id: 'comfy', label: 'ComfyUI', sub: 'workflows-as-JSON', domain: 'comfy.org', color: '#10b981' },
    { id: 'krea', label: 'Krea', sub: 'real-time canvas', domain: 'krea.ai', color: '#8b5cf6' },
    { id: 'magnific', label: 'Magnific', sub: 'all-models workspace', domain: 'freepik.com', color: '#0ea5e9' },
    { id: 'higgsfield', label: 'Higgsfield', sub: 'consumer suite + Soul ID', domain: 'higgsfield.ai', color: '#f59e0b' },
    { id: 'replicate', label: 'Replicate', sub: 'Cloudflare', domain: 'replicate.com', color: '#f97316' },
    { id: 'vercel', label: 'Vercel AI Gateway', sub: '33 image + 32 video models', domain: 'vercel.com', color: '#64748b' },
  ],
  outputs: [
    { id: 'ads', label: 'Ads & performance', sub: 'auction-speed creative', color: '#f59e0b' },
    { id: 'social', label: 'Social & UGC', sub: 'meme-speed short form', color: '#0ea5e9' },
    { id: 'film', label: 'Film & pro video', sub: 'studio pipelines', color: '#f43f5e' },
    { id: 'enterprise', label: 'Enterprise comms', sub: 'governed video at work', color: '#14b8a6' },
    { id: 'ecom', label: 'E-commerce & 3D', sub: 'catalogs, product media', color: '#6366f1' },
  ],
  links: [
    // The first-party exception: Flow orchestrates only Google's own models.
    { from: 'gemini', to: 'googleflow', weight: 3 },
    // The majority-Chinese shelf: apps won't integrate these one by one — aggregators do it for them.
    { from: 'seedance', to: 'fal', weight: 3 },
    { from: 'kling', to: 'fal', weight: 3 },
    { from: 'hailuo', to: 'fal', weight: 3 },
    { from: 'flux', to: 'fal', weight: 3 },
    { from: 'wan', to: 'comfy', weight: 3 },
    { from: 'flux', to: 'comfy', weight: 2 },
    { from: 'ltx', to: 'comfy', weight: 2 },
    { from: 'kling', to: 'krea', weight: 2 },
    { from: 'flux', to: 'krea', weight: 2 },
    { from: 'gemini', to: 'magnific', weight: 2 },
    { from: 'seedance', to: 'magnific', weight: 2 },
    { from: 'seedance', to: 'higgsfield', weight: 2 },
    { from: 'kling', to: 'higgsfield', weight: 2 },
    { from: 'flux', to: 'replicate', weight: 2 },
    { from: 'gemini', to: 'vercel', weight: 2 },
    { from: 'gptimage', to: 'vercel', weight: 2 },
    // Where the aggregated output actually lands.
    { from: 'googleflow', to: 'social', weight: 2 },
    { from: 'googleflow', to: 'film', weight: 2 },
    { from: 'fal', to: 'ads', weight: 3 },
    { from: 'fal', to: 'social', weight: 2 },
    { from: 'fal', to: 'enterprise', weight: 2 },
    { from: 'comfy', to: 'film', weight: 2 },
    { from: 'comfy', to: 'ecom', weight: 2 },
    { from: 'krea', to: 'social', weight: 2 },
    { from: 'magnific', to: 'ads', weight: 2 },
    { from: 'magnific', to: 'ecom', weight: 1 },
    { from: 'higgsfield', to: 'social', weight: 3 },
    { from: 'replicate', to: 'ecom', weight: 1 },
    { from: 'vercel', to: 'enterprise', weight: 2 },
  ],
}

// ——— Sources ———

export const SOURCES: Source[] = [
  { id: '1', label: 'TechCrunch — OpenAI shuts down Sora', url: 'https://techcrunch.com/2026/03/24/openais-sora-was-the-creepiest-app-on-your-phone-now-its-shutting-down/', date: 'Mar 24, 2026' },
  { id: '2', label: 'OpenAI Help Center — Sora discontinuation timeline', url: 'https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation', date: '2026' },
  { id: '3', label: 'Kuaishou IR — Q1 2026 results (Kling +300% YoY)', url: 'https://www.prnewswire.com/apac/news-releases/kuaishou-technology-announces-first-quarter-2026-unaudited-financial-results-302782902.html', date: 'May 27, 2026' },
  { id: '4', label: 'Fortune — Freepik becomes Magnific at $230M ARR', url: 'https://fortune.com/2026/04/28/freepik-magnific-joaquin-cuenca-abela-230-million-arr-video-generation-ai-pivot/', date: 'Apr 28, 2026' },
  { id: '5', label: 'TechCrunch — Runway raises $315M at $5.3B', url: 'https://techcrunch.com/2026/02/10/ai-video-startup-runway-raises-315m-at-5-3b-valuation-eyes-more-capable-world-models/', date: 'Feb 10, 2026' },
  { id: '6', label: 'TechCrunch — ElevenLabs raises $500M at $11B', url: 'https://techcrunch.com/2026/02/04/elevenlabs-raises-500m-from-sequioia-at-a-11-billion-valuation/', date: 'Feb 4, 2026' },
  { id: '7', label: 'Variety — Suno raises $400M at $5.4B', url: 'https://variety.com/2026/digital/news/ai-music-suno-funding-round-400-million-5-4-billion-valuation-1236765727/', date: 'Jun 2026' },
  { id: '8', label: 'HeyGen — $200M ARR announcement', url: 'https://www.heygen.com/blog/heygen-surpasses-200m-arr', date: 'Jun 2026' },
  { id: '9', label: 'CNBC — Synthesia Series E at $4B', url: 'https://www.cnbc.com/2026/01/26/nvidia-alphabet-vc-arms-back-synthesia.html', date: 'Jan 26, 2026' },
  { id: '10', label: 'Bloomberg — Sequoia-led round values fal at $4.5B', url: 'https://www.bloomberg.com/news/articles/2025-12-09/sequoia-led-funding-vaults-ai-startup-fal-to-4-5-billion-valuation', date: 'Dec 9, 2025' },
  { id: '11', label: 'PR Newswire — fal launches fal Agent', url: 'https://www.prnewswire.com/news-releases/fal-launches-fal-agent-a-creative-partner-for-frontier-generative-media-302850038.html', date: 'Aug 12, 2026' },
  { id: '12', label: 'Cloudflare — agreement to acquire Replicate', url: 'https://www.cloudflare.com/press/press-releases/2025/cloudflare-to-acquire-replicate-to-build-the-most-seamless-ai-cloud-for-developers/', date: 'Nov 17, 2025' },
  { id: '13', label: 'TechCrunch — ComfyUI hits $500M valuation', url: 'https://techcrunch.com/2026/04/24/comfyui-hits-500m-valuation-as-creators-seek-more-control-over-ai-generated-media/', date: 'Apr 24, 2026' },
  { id: '14', label: 'The AI Insider — Flora raises $42M Series A', url: 'https://theaiinsider.tech/2026/01/30/flora-raises-42m-series-a-to-build-ai-native-creative-workflows-for-designers/', date: 'Jan 30, 2026' },
  { id: '15', label: 'Figma — Config 2026 / Weave rollout', url: 'https://help.figma.com/hc/en-us/articles/39582753756695-What-s-new-from-Config-2026', date: 'Jun 2026' },
  { id: '16', label: 'Adobe Q2 FY26 earnings call (AI-first ARR >$500M)', url: 'https://www.fool.com/earnings/call-transcripts/2026/06/11/adobe-adbe-q2-2026-earnings-transcript/', date: 'Jun 11, 2026' },
  { id: '17', label: 'Forbes — Adobe Firefly agent inside ChatGPT and Claude', url: 'https://www.forbes.com/sites/davidphelan/2026/06/19/adobe-brings-its-firefly-ai-creative-agent-directly-into-chatgpt-and-claude/', date: 'Jun 19, 2026' },
  { id: '18', label: 'Google — Flow, Whisk and ImageFX unified', url: 'https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates-february-2026/', date: 'Feb 25, 2026' },
  { id: '19', label: 'Google — Gemini passes 1B monthly users', url: 'https://blog.google/innovation-and-ai/products/gemini-app/one-billion-monthly-users/', date: '2026' },
  { id: '20', label: '9to5Google — Project Genie launches for Ultra subscribers', url: 'https://9to5google.com/2026/01/29/google-project-genie/', date: 'Jan 29, 2026' },
  { id: '21', label: 'NVIDIA — Cosmos 3 open frontier model for physical AI', url: 'https://nvidianews.nvidia.com/news/nvidia-launches-cosmos-3-the-open-frontier-foundation-model-for-physical-ai', date: 'Jun 1, 2026' },
  { id: '22', label: 'The AI Insider — World Labs raises $1B', url: 'https://theaiinsider.tech/2026/02/19/fei-fei-lis-world-labs-raises-1b-in-fresh-funding-to-advance-development-of-world-models/', date: 'Feb 19, 2026' },
  { id: '23', label: 'Bloomberg — Anthropic in talks to buy Decart for ~$6B', url: 'https://www.bloomberg.com/news/articles/2026-08-13/anthropic-said-in-talks-to-buy-ai-startup-decart-for-6-billion', date: 'Aug 13, 2026' },
  { id: '24', label: 'WinBuzzer — MiniMax raises $619M in Hong Kong IPO', url: 'https://winbuzzer.com/2026/01/08/minimax-raises-619m-in-hong-kong-ipo-as-chinese-ai-startups-beat-silicon-valley-to-public-markets-xcxwbn/', date: 'Jan 8, 2026' },
  { id: '25', label: 'TechFundingNews — PixVerse lands $439M', url: 'https://techfundingnews.com/video-generation-startup-pixverse-lands-439m-from-alibaba-and-others-to-reshape-entertainment/', date: 'Jul 2026' },
  { id: '26', label: 'TechCrunch — Black Forest Labs raises $300M at $3.25B', url: 'https://techcrunch.com/2025/12/01/black-forest-labs-raises-300m-at-3-25b-valuation', date: 'Dec 1, 2025' },
  { id: '27', label: 'GlobeNewswire — Lightricks open-sources LTX-2', url: 'https://finance.yahoo.com/news/lightricks-open-sources-ltx-2-053000934.html', date: 'Jan 6, 2026' },
  { id: '28', label: 'Artificial Analysis — Video Generation Arena leaderboard', url: 'https://artificialanalysis.ai/video/leaderboard/text-to-video', date: 'Aug 2026' },
  { id: '29', label: 'Greenberg Traurig — EU AI Act Article 50 transparency obligations', url: 'https://www.gtlaw.com/en/insights/2026/6/deepfakes-chatbots-ai-generated-text-european-commission-details-transparency-obligations-under-the-ai-act', date: 'Jun 2026' },
  { id: '30', label: 'PitchBook — AI video investment reaches $5.6B in 2026 YTD', url: 'https://pitchbook.com/news/articles/from-models-to-studios-how-ai-video-investment-is-evolving', date: '2026' },
  { id: '31', label: 'CNBC — Meta launches in-house Muse image model', url: 'https://www.cnbc.com/2026/07/07/meta-ai-muse-image.html', date: 'Jul 7, 2026' },
  { id: '32', label: 'Billboard — what the Suno/Udio licensing deals mean', url: 'https://www.billboard.com/pro/what-suno-udio-licensing-deals-mean-future-ai-music/', date: '2025–26' },
  { id: '33', label: 'TechFundingNews — Meshy raises ~$400M at $1.5B', url: 'https://techfundingnews.com/from-mit-research-to-1-5b-unicorn-ethan-hus-meshy-raises-400m-for-ai-powered-3d-creation/', date: 'Jul 21, 2026' },
  { id: '34', label: 'SEC — Getty terminates Shutterstock merger (board action Jul 7)', url: 'https://www.sec.gov/Archives/edgar/data/1898496/000162828026056698/gety-20260813.htm', date: 'Aug 13, 2026' },
  { id: '35', label: 'TechCrunch — Decart’s Oasis 3 world model', url: 'https://techcrunch.com/2026/06/10/decarts-new-world-model-can-simulate-hours-of-photorealistic-driving-with-some-caveats/', date: 'Jun 10, 2026' },
  { id: '36', label: 'Dodo Payments / Bessemer — AI-native gross margin benchmarks', url: 'https://dodopayments.com/blogs/ai-pricing-models', date: 'Feb 2026' },
  { id: '37', label: 'Atlas Cloud — cheapest AI video generation APIs 2026', url: 'https://www.atlascloud.ai/blog/guides/cheapest-ai-video-generation-api-2026', date: '2026' },
  { id: '38', label: 'CGTN — China enforces AI-content labeling rules', url: 'https://news.cgtn.com/news/2025-09-01/China-enforces-new-rules-on-labeling-AI-generated-content-1Gj1GWXQeJi/p.html', date: 'Sep 1, 2025' },
  { id: '39', label: 'Arena — LMArena is now Arena', url: 'https://arena.ai/blog/lmarena-is-now-arena', date: 'Jan 28, 2026' },
  { id: '40', label: 'TechCrunch — Higgsfield raises $400M Series B at $5.4B', url: 'https://techcrunch.com/2026/08/17/higgsfield-raises-400m-series-b-quadrupling-its-valuation-in-8-months-to-5-4b/', date: 'Aug 17, 2026' },
  { id: '41', label: 'BlueFive Capital (co-lead) — Kling AI ~$3B round at $18B post ($2B initial close per Bloomberg, Jul 2)', url: 'https://bluefivecapital.com/newsroom/bluefive-capital-co-leads-3-billion-kling-ai-funding-round/', date: 'Jul 2026' },
  { id: '42', label: 'Music Business Worldwide — Suno inks global licensing deal with BMG', url: 'https://www.musicbusinessworldwide.com/suno-inks-global-licensing-deal-with-bmg/', date: 'Aug 12, 2026' },
  { id: '43', label: 'Microsoft AI — MAI-Image-2.6 launches at #2 on Arena', url: 'https://microsoft.ai/news/mai-image-2-6-launches-at-no-2-on-arena-ahead-of-google-meta-and-xai/', date: 'Aug 10, 2026' },
  { id: '44', label: 'Black Forest Labs — FLUX 3 Video release notes', url: 'https://docs.bfl.ml/release-notes', date: 'Aug 5, 2026' },
  { id: '45', label: 'The Information — fal in funding talks at ~$8B valuation', url: 'https://www.theinformation.com/articles/video-hosting-startup-fal-funding-talks-8-billion-valuation', date: 'Mar 2026' },
  { id: '46', label: 'Cartesia — Sonic 3.6 tops both AA speech arenas', url: 'https://x.com/cartesia/status/2057880195403800633', date: 'Aug 18, 2026' },
  { id: '47', label: 'Kuaishou IR — Q2 2026 results (Kling RMB 850M+, up over 200% YoY)', url: 'https://www.prnewswire.com/news-releases/kuaishou-technology-announces-second-quarter-and-interim-2026-unaudited-financial-results-302855081.html', date: 'Aug 19, 2026' },
  { id: '48', label: 'Calcalist — Anthropic closing in on Decart at ~$7B', url: 'https://www.calcalistech.com/ctechnews/article/b1evv3aufg', date: 'Aug 16, 2026' },
  { id: '49', label: 'TechNode Global — Alibaba releases Wan 3.0 in public beta', url: 'https://technode.global/2026/08/10/chinas-alibaba-releases-wan3-0-ai-video-model-in-public-beta-with-30s-clips-multimodal-inputs/', date: 'Aug 10, 2026' },
  { id: '50', label: 'vLLM-Omni — open-source diffusion/omni model serving (vLLM project)', url: 'https://github.com/vllm-project/vllm-omni', date: 'Nov 2025' },
  { id: '51', label: 'ElevenLabs reaches $600M ARR', url: 'https://www.arr.club/elevenlabs/elevenlabs-arr-hit-600m-within-just-29-months-of-launching-its-first-product', date: 'Jul 2026' },
  { id: '52', label: 'Tech Times — Grok Imagine Video 1.5 tops AI video leaderboard at 86% below Sora', url: 'https://www.techtimes.com/articles/318635/20260618/grok-imagine-video-15-goes-live-xai-tops-ai-video-leaderboard-86-percent-below-sora.htm', date: 'Jun 18, 2026' },
  { id: '53', label: 'KrAsia (36Kr) — ByteDance raises Volcano Engine MaaS target on Seedance 2.0 growth (>RMB 1B/month)', url: 'https://kr-asia.com/bytedance-raises-volcano-engines-maas-revenue-target-on-seedance-2-0-growth', date: 'Jun 5, 2026' },
  { id: '54', label: 'BigGo (36Kr-lineage) — Seedance contract minimums, margins, ~95% short-drama penetration', url: 'https://finance.biggo.com/news/98d36dcf-1051-463b-a962-430c503d70ca', date: 'Jul 7, 2026' },
  { id: '55', label: 'Arena — Seedance 2.5 #2 image-to-video, #1 on the new Video Edit board', url: 'https://x.com/arena/status/2089448812159045848', date: 'Aug 2026' },
  { id: '56', label: 'Artificial Analysis — image-to-video leaderboard (Seedance 2.0 #1; Kling 3.0 Pro #12)', url: 'https://artificialanalysis.ai/video/leaderboard/image-to-video', date: 'Aug 19, 2026' },
  { id: '57', label: 'VentureBeat — Krea 2 Raw/Turbo open weights; 30M+ users, enterprise logos', url: 'https://venturebeat.com/technology/enterprise-grade-ai-image-generation-in-2-seconds-is-here-krea-2-raw-and-turbo-available-as-open-weights-under-custom-license', date: 'Jun 2026' },
  { id: '58', label: 'TestingCatalog — Google tests Agent Mode on Flow (build traces, unshipped)', url: 'https://www.testingcatalog.com/google-prepares-agent-mode-for-flow-to-automate-video-production/', date: 'May 2026' },
  { id: '59', label: 'PostRound (PitchBook data) — Reve $350M Series B at $1.9B, Top Harvest Capital (never press-announced)', url: 'https://postround.substack.com/p/series-b-activity-november-2025', date: 'Nov 2025' },
  { id: '60', label: 'Reve — launching Reve 2.1 (#2 on AA image; independent-lab framing, compute-efficiency claim)', url: 'https://blog.reve.com/posts/launching-reve-2.1/', date: 'Jul 9, 2026' },
  { id: '61', label: 'Alibaba Cloud blog — Wan series passes 6.9M downloads (HF + ModelScope)', url: 'https://www.alibabacloud.com/blog/alibaba-introduces-open-source-model-for-digital-human-video-generation_602493', date: 'Aug 2025' },
  { id: '62', label: 'Hugging Face community analysis — Wan 3.0 and the end of the open Wan line', url: 'https://huggingface.co/blog/ResterChed/wan-3-0', date: 'Jul 29, 2026' },
  { id: '63', label: 'MLex — MiniMax fails to dismiss Disney/Universal/WBD copyright claims (C.D. Cal.)', url: 'https://www.mlex.com/mlex/artificial-intelligence/articles/2482498/minimax-fails-to-beat-us-copyright-infringement-claims-by-movie-studios', date: 'May 26, 2026' },
  { id: '64', label: 'MiniMax — FY2025 results (US$79M revenue; AI-native products US$53.1M incl. Hailuo + Talkie)', url: 'https://www.prnewswire.com/news-releases/minimax-announces-full-year-2025-financial-results-302700868.html', date: 'Mar 2, 2026' },
]
