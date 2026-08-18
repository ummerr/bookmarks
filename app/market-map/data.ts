// Typed content for the Generative Media Market Map — August 2026.
// All report content lives here so future updates never touch the JSX.
// Compiled 2026-08-17 from ~150 web searches across six research passes.
// Figures marked "est." are third-party estimates, not company-reported.

export type CompanyKind = 'startup' | 'incumbent' | 'lab'
export type ModelDependency = 'own-models' | 'multi-model' | 'partner-models' | 'open-weights'
export type Layer = 'distribution' | 'application' | 'workflow' | 'model' | 'infrastructure'
export type Verdict = 'strongly-supported' | 'supported' | 'unclear' | 'rejected'
export type Risk = 'low' | 'medium' | 'high'

export interface Company {
  name: string
  kind: CompanyKind
  modelDependency?: ModelDependency
  note?: string
  momentum?: boolean
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
  moat: string
  valueCapture: string
}

export interface StackCompany {
  name: string
  kind: CompanyKind
  layers: Layer[]
  note?: string
}

export interface MomentumEntry {
  rank: number
  name: string
  what: string
  why: string
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
  { id: 'thesis', label: 'Market Thesis' },
  { id: 'market-map', label: 'The Market Map' },
  { id: 'workflow-layer', label: 'Creative Agents & Workflow' },
  { id: 'models', label: 'Foundation Models' },
  { id: 'orchestration', label: 'Orchestration' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'vertical-integration', label: 'Vertical Integration' },
  { id: 'incumbents', label: 'Incumbents vs Startups' },
  { id: 'economics', label: 'Economics' },
  { id: 'moats', label: 'Moats & Commoditization' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'geography', label: 'Geography' },
  { id: 'momentum', label: 'Momentum 25' },
  { id: 'white-space', label: 'Winners & White Space' },
  { id: 'hypotheses', label: 'Ten Hypotheses' },
  { id: 'control-points', label: 'Control Points 2030' },
  { id: 'state-of-genmedia', label: 'The State of GenMedia' },
  { id: 'sources', label: 'Sources' },
]

// ——— The Sequoia-style map: 8 panels, strategically meaningful companies only ———

export const CATEGORIES: Category[] = [
  {
    id: 'workspaces',
    title: 'General Creative Workspaces',
    jobToBeDone: 'One surface from ideation to publish',
    color: '#8b5cf6',
    companies: [
      { name: 'Canva', kind: 'incumbent', modelDependency: 'multi-model', note: '~$4B+ ARR, 265M MAU; Leonardo models + third-party shelf; Affinity now free', momentum: true },
      { name: 'Adobe Firefly', kind: 'incumbent', modelDependency: 'multi-model', note: 'AI-first ARR >$500M (+3x YoY); own commercially-safe models + partner-model hub', momentum: true },
      { name: 'Google Flow', kind: 'lab', modelDependency: 'own-models', note: 'Flow+Whisk+ImageFX unified Feb 2026, 140+ countries, bundled with AI subscriptions' },
      { name: 'Magnific (Freepik)', kind: 'startup', modelDependency: 'multi-model', note: '$230M ARR at Apr 2026 rebrand; every model under one roof, half of revenue from video', momentum: true },
      { name: 'Krea', kind: 'startup', modelDependency: 'multi-model', note: '$500M val; real-time canvas, 60+ models, own Krea 2 open image model' },
      { name: 'Figma Weave', kind: 'incumbent', modelDependency: 'multi-model', note: 'Weavy acquired >$200M; shareable AI workflows in Figma Community' },
      { name: 'OpenArt', kind: 'startup', modelDependency: 'multi-model', note: '$70M ARR, 8M MAU; shareable Recipes' },
      { name: 'Recraft', kind: 'startup', modelDependency: 'own-models', note: 'Design-grade image models, shifting from model shop to workspace' },
      { name: 'Lovart', kind: 'startup', modelDependency: 'multi-model', note: '"AI design agent" archetype; ex-ByteDance founder' },
    ],
  },
  {
    id: 'ads-commerce',
    title: 'Advertising & Commerce',
    jobToBeDone: 'Performance creative at auction speed',
    color: '#f59e0b',
    companies: [
      { name: 'Meta (GEM / Advantage+)', kind: 'incumbent', modelDependency: 'own-models', note: 'Targeting fully automated ad creation by end-2026; Muse model (Jul 2026) replaces Midjourney/BFL licenses', momentum: true },
      { name: 'Google Asset Studio', kind: 'incumbent', modelDependency: 'own-models', note: 'Veo in Google Ads; ~70M Gemini-generated assets in Q4 2025 PMax alone' },
      { name: 'Amazon Creative Agent', kind: 'incumbent', modelDependency: 'own-models', note: 'Free conversational ad agent (Feb 2026), monetized via media spend' },
      { name: 'Creatify', kind: 'startup', modelDependency: 'multi-model', note: 'Creatify Agent (May 2026) trained on 15M+ ads; locked brand facts as constraints' },
      { name: 'Typeface', kind: 'startup', modelDependency: 'partner-models', note: 'Enterprise brand governance, Arc Agents' },
      { name: 'Jasper', kind: 'startup', modelDependency: 'partner-models', note: '900+ enterprise customers; GEO Agent (Jun 2026)' },
      { name: 'Arcads', kind: 'startup', modelDependency: 'multi-model', note: '~$15M ARR est. on $25M raised; AI-actor performance ads' },
      { name: 'Photoroom', kind: 'startup', modelDependency: 'own-models', note: 'Product imagery leader; squeezed by free platform tools' },
      { name: 'Pencil (Brandtech)', kind: 'incumbent', modelDependency: 'multi-model', note: 'Agency-embedded enterprise creative gen' },
      { name: 'Smartly', kind: 'incumbent', modelDependency: 'multi-model', note: 'Synapse orchestration layer (Jun 2026) — adtech incumbents absorbing the agent pattern' },
    ],
  },
  {
    id: 'film-video',
    title: 'Film / TV / Pro Video',
    jobToBeDone: 'Studio-grade production and post',
    color: '#f43f5e',
    companies: [
      { name: 'Runway', kind: 'startup', modelDependency: 'own-models', note: '$315M Series E @ $5.3B (Feb 2026); Gen-4.5 + GWM world-model pivot; rev est. $100–300M (last reported ~$90M mid-2025)', momentum: true },
      { name: 'Luma', kind: 'startup', modelDependency: 'own-models', note: '$900M @ $4B (HUMAIN-led); Ray3.2 HDR/EXR pro deliverables' },
      { name: 'Moonvalley', kind: 'startup', modelDependency: 'own-models', note: 'Marey trained exclusively on licensed data — the clean-model studio wedge' },
      { name: 'LTX Studio (Lightricks)', kind: 'startup', modelDependency: 'open-weights', note: 'Open-sourced LTX-2 (Jan 2026); script-to-screen pipeline + own open models', momentum: true },
      { name: 'Adobe Premiere', kind: 'incumbent', modelDependency: 'multi-model', note: 'Firefly in the timeline; Generative Extend on licensed data' },
      { name: 'DaVinci Resolve', kind: 'incumbent', modelDependency: 'own-models', note: 'Local-first AI free tier — commoditizes assistive editing' },
      { name: 'Autodesk Flow Studio', kind: 'incumbent', modelDependency: 'own-models', note: 'ex-Wonder Dynamics video→CG; $200M into World Labs' },
      { name: 'Promise', kind: 'startup', modelDependency: 'multi-model', note: 'AI-native studio; a16z, Google AI Futures Fund, Crossbeam' },
      { name: 'Flawless', kind: 'startup', modelDependency: 'own-models', note: 'Consent-based visual dubbing for studios' },
      { name: 'Deepdub', kind: 'startup', modelDependency: 'own-models', note: 'Production dubbing with voice-clone royalties' },
    ],
  },
  {
    id: 'social-ugc',
    title: 'Social / UGC / Consumer',
    jobToBeDone: 'Short-form creation at meme speed',
    color: '#0ea5e9',
    companies: [
      { name: 'CapCut / Dreamina', kind: 'incumbent', modelDependency: 'own-models', note: 'Seedance 2.5 into a 400M-MAU editor; the largest creation funnel on earth', momentum: true },
      { name: 'YouTube Shorts + Veo', kind: 'incumbent', modelDependency: 'own-models', note: 'Free frontier video gen inside the feed — the biggest distribution event in GenMedia' },
      { name: 'Grok Imagine', kind: 'lab', modelDependency: 'own-models', note: '#1 on video arenas in early 2026 at ~$4.20/min; X distribution' },
      { name: 'Higgsfield', kind: 'startup', modelDependency: 'multi-model', note: 'Claimed $500M run-rate (soft); Soul ID character persistence is the moat', momentum: true },
      { name: 'PixVerse', kind: 'startup', modelDependency: 'own-models', note: '$439M raised @ >$2B (Jul 2026); 150M users claimed; real-time R1 model', momentum: true },
      { name: 'Mirage (Captions)', kind: 'startup', modelDependency: 'own-models', note: '$75M revenue-linked financing (Mar 2026); own short-form video models' },
      { name: 'Viggle', kind: 'startup', modelDependency: 'own-models', note: 'Physics-aware character motion; meme-format engine' },
      { name: 'Character.AI', kind: 'startup', modelDependency: 'own-models', note: 'Chat → feed → AvatarFX video arc' },
      { name: 'Meta Vibes', kind: 'incumbent', modelDependency: 'own-models', note: '~2M DAU, weak retention; the surviving-but-limping AI feed' },
    ],
  },
  {
    id: 'music-audio',
    title: 'Music & Audio',
    jobToBeDone: 'Licensed sound at API speed',
    color: '#10b981',
    companies: [
      { name: 'ElevenLabs', kind: 'startup', modelDependency: 'own-models', note: '$11B Series D; ~$500M ARR; voice → dubbing → agents → licensed music', momentum: true },
      { name: 'Suno', kind: 'startup', modelDependency: 'own-models', note: '~$300M ARR est., $5.4B val; settled WMG/UMG/BMG from strength; Sony pending', momentum: true },
      { name: 'Udio', kind: 'startup', modelDependency: 'own-models', note: 'Absorbed into a UMG/WMG walled garden — the labels captured it' },
      { name: 'Cartesia', kind: 'startup', modelDependency: 'own-models', note: 'Sonic 3.5: ~90ms latency, #1 naturalness on speech arena' },
      { name: 'KLAY', kind: 'startup', modelDependency: 'own-models', note: 'First AI music co licensed by all three majors' },
      { name: 'Descript', kind: 'startup', modelDependency: 'multi-model', note: 'Underlord agentic editor is now the product center' },
      { name: 'Google Lyria', kind: 'lab', modelDependency: 'own-models', note: 'Music gen wired into Gemini Live API' },
      { name: 'Stability Audio', kind: 'startup', modelDependency: 'own-models', note: 'Survival-mode audio pivot; UMG partnership post-Udio' },
    ],
  },
  {
    id: 'gaming-3d-worlds',
    title: 'Gaming, 3D & World Models',
    jobToBeDone: 'Assets, characters, playable worlds',
    color: '#6366f1',
    companies: [
      { name: 'World Labs', kind: 'startup', modelDependency: 'own-models', note: 'Marble GA + $1B round (Feb 2026, $200M from Autodesk); mesh-native worlds', momentum: true },
      { name: 'Decart', kind: 'startup', modelDependency: 'own-models', note: '$300M @ ~$4B; sub-35ms real-time; reported Anthropic talks at ~$6B (unconfirmed)', momentum: true },
      { name: 'Google Genie', kind: 'lab', modelDependency: 'own-models', note: 'Project Genie shipped Jan 2026 to $250/mo Ultra subscribers, US-only' },
      { name: 'NVIDIA Cosmos', kind: 'incumbent', modelDependency: 'open-weights', note: 'Cosmos 3 open omnimodel + Coalition (BFL, Runway, LTX) — Llama-izing world models' },
      { name: 'Odyssey', kind: 'startup', modelDependency: 'own-models', note: '$310M @ $1.45B; pivoting to simulation infrastructure' },
      { name: 'Meshy', kind: 'startup', modelDependency: 'own-models', note: '~$400M Series B @ $1.5B on ~$30M ARR — priced on world-model optionality' },
      { name: 'Tripo', kind: 'startup', modelDependency: 'own-models', note: '~$200M raised; speed + topology leader in 3D assets' },
      { name: 'Rodin (Deemos)', kind: 'startup', modelDependency: 'own-models', note: 'Lowe’s 30k-item catalog at <$1/model — 3D pricing already commoditized' },
      { name: 'Inworld', kind: 'startup', modelDependency: 'own-models', note: 'NPC infra leader, diversifying into voice agents' },
      { name: 'Scenario', kind: 'startup', modelDependency: 'multi-model', note: 'Style-locked game assets; thin moat vs frontier models' },
      { name: 'Hidden Door', kind: 'startup', modelDependency: 'multi-model', note: 'Licensed-IP interactive fiction — the games analog of music licensing' },
      { name: 'Ubisoft / EA (internal)', kind: 'incumbent', modelDependency: 'multi-model', note: 'Ubisoft’s studio-wide generative pipeline (Ghostwriter, NEO NPCs); EA co-developing with Stability' },
    ],
  },
  {
    id: 'enterprise-comms',
    title: 'Enterprise Video & Comms',
    jobToBeDone: 'Governed video for work',
    color: '#14b8a6',
    companies: [
      { name: 'Synthesia', kind: 'startup', modelDependency: 'own-models', note: '$200M @ $4B (Jan 2026); ~$150M ARR, NRR >140%, 90% of Fortune 100', momentum: true },
      { name: 'HeyGen', kind: 'startup', modelDependency: 'multi-model', note: '$200M ARR near break-even on ~$74M raised — the capital-efficiency story', momentum: true },
      { name: 'Gamma', kind: 'startup', modelDependency: 'partner-models', note: 'Profitable at $100M+ ARR with ~50 people; MSFT/Google now ship native rivals' },
      { name: 'Gemini Notebook', kind: 'incumbent', modelDependency: 'own-models', note: 'ex-NotebookLM, 30M users; free doc→video caps the explainer category' },
      { name: 'Tavus', kind: 'startup', modelDependency: 'own-models', note: 'Real-time conversational avatars, <500ms end-to-end' },
      { name: 'Sync', kind: 'startup', modelDependency: 'own-models', note: 'Lip-sync API layer powering other platforms' },
      { name: 'Argil', kind: 'startup', modelDependency: 'own-models', note: 'Creator clone videos; notable European entrant' },
    ],
  },
  {
    id: 'workflow-orchestration',
    title: 'Workflow, Agents & Orchestration',
    jobToBeDone: 'The connective tissue between apps and models',
    color: '#ec4899',
    companies: [
      { name: 'fal', kind: 'startup', modelDependency: 'multi-model', note: '~$400M annualized; $4.5B → reported ~$8B talks; launched fal Agent Aug 2026', momentum: true },
      { name: 'ComfyUI', kind: 'startup', modelDependency: 'open-weights', note: '$30M @ $500M; 4M+ users; workflows-as-JSON is the portable orchestration format' },
      { name: 'Flora', kind: 'startup', modelDependency: 'multi-model', note: '$42M Series A; FAUNA agent wires node pipelines from a brief; Nike/Netflix/Lionsgate' },
      { name: 'Adobe Firefly Assistant', kind: 'incumbent', modelDependency: 'multi-model', note: 'Creative agent across CC apps; embedded into ChatGPT and Claude (Jun 2026)' },
      { name: 'Replicate (Cloudflare)', kind: 'incumbent', modelDependency: 'multi-model', note: 'Acquired Nov 2025 — thin marketplaces get absorbed' },
      { name: 'Runware', kind: 'startup', modelDependency: 'multi-model', note: '$50M Series A; 1MW containerized inference pods; the EU champion' },
      { name: 'WaveSpeed', kind: 'startup', modelDependency: 'multi-model', note: 'Fastest Western access to Chinese models' },
      { name: 'Vercel AI Gateway', kind: 'incumbent', modelDependency: 'multi-model', note: '32 image + 30 video models; gateways treat media as first-class now' },
      { name: 'Baseten / Modal / Together', kind: 'startup', modelDependency: 'multi-model', note: 'General inference clouds serving media as catalog extension' },
    ],
  },
]

// ——— Foundation model landscape ———

export const MODEL_GROUPS: ModelGroup[] = [
  {
    modality: 'Video',
    note: 'The most contested modality. Only ~150 Elo separates #1 from #11 on the Artificial Analysis arena (Aug 2026); 8 of the top 10 are Chinese. Native audio is now table stakes, and pure text-to-video has become an onboarding feature — production work runs on image-to-video, multi-reference chaining, and keyframe conditioning (Seedance 2.5 takes 50 reference inputs; Ray3.2 takes 16 keyframes). Leaderboard half-life is one to two quarters — Gen-4.5 led in Dec 2025; Veo 3.1 now sits #8 (Arena) to #11 (Artificial Analysis).',
    entries: [
      { name: 'Gemini Omni Flash', developer: 'Google', openness: 'closed', capability: '#1 on all AA video arenas; conversational editing without re-prompting; physics-aware', pricing: '$0.10/sec', adoption: 'Gemini app, Flow, YouTube Shorts, Vertex', flagship: true },
      { name: 'Hailuo H3', developer: 'MiniMax', openness: 'hybrid', capability: '#2 overall; 15s, 2K, native stereo; first frontier-quality open-weights video (license excludes US/EU/UK/KR local deploy)', pricing: '~1/3 of rivals (est.)', adoption: 'HK-listed; aggregator shelves everywhere' },
      { name: 'Seedance 2.5', developer: 'ByteDance', openness: 'closed', capability: '30s single-pass, 4K, 50 multimodal reference inputs', pricing: '$0.05–0.40/sec by tier', adoption: 'CapCut (400M+ MAU), Jimeng/Dreamina, Volcano API' },
      { name: 'Kling 3.0 Omni', developer: 'Kuaishou', openness: 'closed', capability: 'Native 4K/60fps, 15s, in-model lip-sync; image gen too', pricing: '~$0.11–0.17/sec', adoption: '~$500M ARR run-rate, 75% overseas — the revenue leader' },
      { name: 'Gen-4.5', developer: 'Runway', openness: 'closed', capability: '1-minute multi-shot, native audio, character consistency; GWM world-model track', pricing: '~$0.12/sec (Gen-4.5 class)', adoption: 'Studio deals (Lionsgate, AMC); enterprise workflows' },
      { name: 'Veo 3.1', developer: 'Google', openness: 'closed', capability: '8s, up to 4K, native audio; slid to #8 (Arena) – #11 (AA) as Omni took over', pricing: '$0.05–0.75/sec by tier', adoption: 'Google Ads, Shorts, API' },
      { name: 'Wan 2.6 / 3.0', developer: 'Alibaba', openness: 'hybrid', capability: '30s native in 3.0 beta; open line trails the closed flagship', pricing: '~$0.05/sec', adoption: 'Top open-video lineage in ComfyUI workflows' },
      { name: 'LTX-2.5', developer: 'Lightricks', openness: 'open', capability: 'Native 4K + synced audio on one RTX 4090; truly open weights', pricing: 'Free <$10M ARR, licensed above', adoption: 'The open substrate for on-prem studio work' },
      { name: 'Ray3.2', developer: 'Luma', openness: 'closed', capability: '16-bit HDR, EXR export, 16 keyframes/clip — pro/VFX deliverables', pricing: 'n/a public', adoption: 'Hollywood pipeline; HUMAIN compute' },
      { name: 'Sora 2', developer: 'OpenAI', openness: 'closed', capability: 'Still strong; app dead Apr 26, API sunsets Sep 24, 2026', pricing: '$0.10–0.70/sec until sunset', adoption: 'Exiting — the cycle’s cautionary tale' },
    ],
  },
  {
    modality: 'Image',
    note: 'The exception to convergence: GPT Image 2’s lead is widening, not shrinking. Microsoft’s MAI line went from debut to Arena #2 in ten months.',
    entries: [
      { name: 'GPT Image 2', developer: 'OpenAI', openness: 'closed', capability: '#1 on every arena (~1375 Elo); 2K native, text rendering, thinking mode', pricing: '$0.03–0.08/image', adoption: 'ChatGPT + API; 53% of Vercel gateway image volume', flagship: true },
      { name: 'MAI-Image-2.6', developer: 'Microsoft', openness: 'closed', capability: 'Arena #2 (Aug 2026); +79 Elo over 2.5 in one release', pricing: 'Copilot-bundled', adoption: 'Copilot/Bing; OpenAI-independence signal' },
      { name: 'Reve 2.1', developer: 'Reve', openness: 'closed', capability: '#2 on AA; layout-first (posters, typography, packaging)', pricing: 'n/a public', adoption: 'Independent lab holding a podium spot' },
      { name: 'Nano Banana 2 / Imagen 4', developer: 'Google', openness: 'closed', capability: '#3 AA; Imagen 4 Fast is the $0.02/image cost floor', pricing: '$0.02–0.15/image', adoption: 'Gemini, Flow, Workspace, Vertex' },
      { name: 'FLUX.2', developer: 'Black Forest Labs', openness: 'hybrid', capability: 'Dev (32B) is the open standard; Klein Apache-2.0; FLUX 3 goes omni', pricing: '~$0.03/MP API', adoption: '~$300M contract value: Meta ($140M), Adobe, Canva' },
      { name: 'Midjourney V8.2', developer: 'Midjourney', openness: 'closed', capability: 'Aesthetics-led; still no API; video stuck at V1', pricing: 'Subscription only', adoption: '~$200–500M revenue est. (wide variance); Disney suit in discovery' },
      { name: 'HunyuanImage 3.0', developer: 'Tencent', openness: 'open', capability: '80B MoE — largest open image model; Instruct adds reasoning', pricing: 'Self-host', adoption: 'Open-ecosystem anchor' },
      { name: 'Seedream 4.5 / 5.0', developer: 'ByteDance', openness: 'closed', capability: '5.0 announced Jun 2026, not independently demoed', pricing: 'Ark platform', adoption: 'Dreamina, Doubao, partner shelves' },
    ],
  },
  {
    modality: 'Audio, Music & Voice',
    note: 'Capability is table stakes; the licensed catalog is the moat. The unlicensed-training era ended commercially in a nine-month window (Oct 2025 – mid-2026).',
    entries: [
      { name: 'Eleven v3 / Eleven Music', developer: 'ElevenLabs', openness: 'closed', capability: 'Broadest suite: TTS, dubbing, SFX, agents, licensed music (Merlin/Kobalt)', pricing: '~$0.10/1k chars; music $0.15/min', adoption: '~$500M ARR; Spotify audiobooks; 41% of Fortune 500 claimed', flagship: true },
      { name: 'Suno v5/v6', developer: 'Suno', openness: 'closed', capability: 'Licensed models per WMG/UMG/BMG deals; old models deprecating', pricing: 'Subscription; paid downloads', adoption: '2M paid subs, 100M users; Sony fair-use ruling pending' },
      { name: 'Sonic 3.5', developer: 'Cartesia', openness: 'closed', capability: '#1 naturalness on AA Speech Arena; ~90ms TTFA', pricing: 'API', adoption: 'Voice-agent latency leader; AWS JumpStart' },
      { name: 'Udio (licensed)', developer: 'Udio + UMG/WMG', openness: 'closed', capability: 'Walled-garden remix platform; creations can’t leave', pricing: 'Subscription', adoption: 'Label-captured; exited open generation' },
      { name: 'Lyria 3', developer: 'Google', openness: 'closed', capability: 'Music gen in Gemini Live API', pricing: 'Bundled', adoption: 'Platform feature, not product' },
      { name: 'MiniMax Speech 2.6', developer: 'MiniMax', openness: 'closed', capability: 'Expressive HD + <250ms Turbo, 40+ languages', pricing: 'Aggressive', adoption: 'Cost leader in voice APIs' },
    ],
  },
  {
    modality: '3D',
    note: 'Workflow-dominated, not leaderboard-dominated. No omni model has absorbed rigging or retopology — the long tail here is durable, but unit pricing already commoditized (<$1/model in enterprise e-commerce).',
    entries: [
      { name: 'Meshy-6', developer: 'Meshy', openness: 'closed', capability: 'Most production-ready meshes + texturing; engine export', pricing: 'Subscription + API', adoption: '~$400M Series B @ $1.5B on ~$30M ARR', flagship: true },
      { name: 'Tripo 2.5', developer: 'VAST', openness: 'closed', capability: 'Clean low-poly in ~2s; rigs bipeds and creatures', pricing: 'Subscription + API', adoption: '~$200M raised; 6.5M creators claimed' },
      { name: 'Rodin Gen-2.5', developer: 'Deemos', openness: 'closed', capability: 'Sculpt-level detail, production topology controls', pricing: '<$1/model at volume', adoption: 'Lowe’s 30k-item 2D→3D conversion' },
      { name: 'Hunyuan3D 3.0', developer: 'Tencent', openness: 'open', capability: 'Best open 3D; near-proprietary fidelity', pricing: 'Self-host', adoption: 'Open-ecosystem anchor' },
    ],
  },
  {
    modality: 'World Models',
    note: 'The hottest capital category (>$3B in 2026) — and it is exiting entertainment for simulation infrastructure (AV, robotics). Media, gaming, and robotics budgets converge here.',
    entries: [
      { name: 'Genie 3 (Project Genie)', developer: 'Google DeepMind', openness: 'closed', capability: 'Real-time navigable worlds, 720p/24fps, minutes of consistency', pricing: '$249.99/mo Ultra tier, US-only', adoption: 'First consumer world-model product (Jan 2026)', flagship: true },
      { name: 'Marble', developer: 'World Labs', openness: 'closed', capability: 'Worlds with exportable triangle + collider meshes; World API', pricing: 'Freemium + API', adoption: '$1B round (Feb 2026), $200M from Autodesk' },
      { name: 'Oasis 3 / Lucy 2', developer: 'Decart', openness: 'closed', capability: 'Sub-35ms real-time generation and live video editing', pricing: 'API', adoption: 'Reported Anthropic acquisition talks ~$6B (unconfirmed)' },
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
    rationale: 'Veo is free inside YouTube Shorts, Seedance ships inside CapCut, Adobe went unlimited-generations, Apple ships photorealistic generation free in iOS 27, and Amazon gives ad creative away to drive media spend. The counter-examples that still monetize generation directly — Midjourney, Kling — do it through community or an owned distribution funnel, not the generation button itself. Sora, the best-known standalone generation product in the West, is dead.',
  },
  {
    id: 'H2',
    statement: 'Model quality is converging faster than model economics.',
    verdict: 'supported',
    rationale: 'In video, ~150 Elo covers #1 through #11 and leaderboard leadership turns over quarterly, while the price spread between frontier and challenger models is still 5–10x and inference cost fell >10x since 2024 — quality converged, economics did not. The caveat is image, where GPT Image 2’s lead is widening, and audio, where the licensed catalog (not the model) sets the economics.',
  },
  {
    id: 'H3',
    statement: 'GenMedia will remain a heterogeneous multimodel ecosystem rather than collapsing around one dominant foundation model.',
    verdict: 'strongly-supported',
    rationale: 'No model wins every workload. The market consolidated into three durable archetypes — distribution-owned omni models (Google, ByteDance, Kuaishou), independent pro labs (Runway, BFL, Luma, ElevenLabs), and open/China-first price leaders (Alibaba, Tencent, MiniMax, Lightricks). Every aggregator shelf is majority-Chinese in video by usage; 3D and real-time niches resist absorption entirely.',
  },
  {
    id: 'H4',
    statement: 'The winning application layer will increasingly own an agentic creative workflow rather than a generation interface.',
    verdict: 'supported',
    rationale: 'Every layer of the stack shipped a creative agent in 2026 — Adobe Firefly Assistant, fal Agent, Flora FAUNA, Krea Node Agent, Creatify Agent, Amazon Creative Agent — and the moat is shifting from model access to creative state: persistent characters, brand constraints, project memory, reusable workflows. Not yet "strongly": today’s revenue leaders (Kling, Midjourney, Magnific) still monetize generation interfaces.',
  },
  {
    id: 'H5',
    statement: 'Model routing/orchestration becomes more valuable as specialized models proliferate.',
    verdict: 'supported',
    rationale: 'fal doubled from ~$200M to ~$400M annualized in months and is reportedly raising at ~$8B — orchestration with media-native depth (kernels, queues, fine-tunes) compounds. But thin aggregation gets absorbed: Replicate sold to Cloudflare, gateways commoditize the unified-API part, and fal itself moving up into agents signals that raw routing alone doesn’t hold margin forever.',
  },
  {
    id: 'H6',
    statement: 'Distribution becomes more important as raw model differentiation declines.',
    verdict: 'strongly-supported',
    rationale: 'The two defining data points of 2026, five weeks apart: Sora — frontier model, no distribution economics — shut down; Kling — good-enough model inside Kuaishou’s funnel and a global API — hit ~$500M ARR. Google won the Western consumer field by default through a 1B-MAU assistant and YouTube. Adobe monetizes other people’s models through workflow distribution.',
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
    verdict: 'strongly-supported',
    rationale: 'There is no vLLM-of-diffusion: long-running jobs, GB-scale intermediate assets, a heterogeneous model zoo, and stateful multi-model pipelines forced fal, Decart, and Runware to hand-build compilers, kernels, and queueing. The market has priced the moat: fal at $4.5B+ on ~$400M revenue, Cloudflare buying Replicate, and Anthropic reportedly bidding ~$6B for Decart’s optimization stack.',
  },
  {
    id: 'H9',
    statement: 'Creative agents become the primary interface between humans and generative media models.',
    verdict: 'unclear',
    rationale: 'The supply side is unanimous — every major player shipped an agent in 2026, which is where the industry believes lock-in lives. But demand-side proof is young: no retention or revenue data yet shows creators preferring delegation to direct manipulation, and the biggest creative revenues still flow through canvases, timelines, and prompt boxes. This is 2026’s consensus bet, not its confirmed behavior.',
  },
  {
    id: 'H10',
    statement: 'The largest GenMedia company may ultimately look less like a model company and more like an operating system for creativity.',
    verdict: 'supported',
    rationale: 'The largest GenMedia businesses today — Canva (~$4B+ ARR), Adobe (>$5B AI-influenced ARR), Google — are surfaces that aggregate models, not model companies. The strongest startups (Magnific, Higgsfield, HeyGen) win on workflow and state over commodity models. The caveat: Google is both the OS and the frontier model owner, and in video the model+distribution combination is what actually wins.',
  },
]

// ——— Strategic control points, 2030 ———

export const CONTROL_POINTS: ControlPoint[] = [
  {
    title: 'Distribution-owned generation surfaces',
    why: 'When quality converges, the default surface wins. Free generation inside YouTube Shorts, CapCut, Gemini, and Instagram decides what billions of people use without ever choosing a model, and subsidizes inference that kills standalone consumer apps.',
    leaders: 'Google (Gemini 1B MAU, YouTube, Flow), ByteDance (CapCut/TikTok), Meta (ad system), Apple (OS-level, arriving)',
    defensibility: 'User bases measured in billions plus owned inference (TPUs, ByteDance scale) — CAC and COGS advantages no startup can match.',
    absorption: 'This IS the incumbents’ position; the question is whether they extend it from casual creation into professional work.',
    commoditization: 'Regulatory separation (EU, US-China), or creation shifting to agent interfaces that sit above any one surface.',
    valuePool: 'Largest in the map — consumer creation folds into existing attention/ads economics measured in tens of billions.',
  },
  {
    title: 'The creative agent & state layer',
    why: 'Whoever holds the project memory — characters, brand constraints, references, reusable workflows — owns switching costs the model layer can’t touch. In 2026 every stack layer shipped a creative agent because everyone believes the margin lives here.',
    leaders: 'Adobe (Firefly Assistant in ChatGPT/Claude), fal Agent, Higgsfield (Soul ID), Flora (FAUNA), Figma (Weave), Krea',
    defensibility: 'Accumulated creative state = switching costs; workflow communities (Figma Community, ComfyUI JSON, OpenArt Recipes) add network effects.',
    absorption: 'High risk — Adobe, Google, Canva, and Figma are claiming it from above while fal and ComfyUI claim it from below. Independents must convert 2026 growth into enterprise state before the squeeze.',
    commoditization: 'If agents become thin shells over frontier models’ own memory, state migrates down to the model layer.',
    valuePool: 'The strategic prize: professional creative software’s ~$50B+ TAM re-platformed onto agents.',
  },
  {
    title: 'Media-native inference & optimization',
    why: 'There is no vLLM for diffusion. Serving 1,000+ heterogeneous models fast, cheap, and queued is a hand-built kernel business, and video’s cost curve (down >10x since 2024) is set here.',
    leaders: 'fal (~$400M annualized), Decart (sub-35ms real-time; reported ~$6B Anthropic interest), Cloudflare/Replicate, Runware',
    defensibility: 'Compiler and kernel engineering compounds; every new model war grows the TAM; usage pricing scales with the whole category.',
    absorption: 'Partial — hyperscalers and frontier labs are buying in (Cloudflare/Replicate, the Decart talks) rather than out-building.',
    commoditization: 'An open-source standard serving engine for DiT models would compress the layer overnight — it doesn’t exist yet.',
    valuePool: 'A single-digit-billions revenue pool growing with all media compute; strategic value far above the revenue.',
  },
  {
    title: 'Frontier omni models with owned distribution',
    why: 'Pure model quality has a one-to-two-quarter half-life, but a frontier model fused to a billion-user surface (Gemini Omni + YouTube, Seedance + CapCut) compounds data, cost, and default status simultaneously.',
    leaders: 'Google, ByteDance, Kuaishou; OpenAI in image only post-Sora; MiniMax as the public-market pure-play',
    defensibility: 'Capital intensity of frontier training + proprietary usage data + subsidized inference. Distribution is the differentiator, not the checkpoint.',
    absorption: 'This is incumbent territory already; independent labs (Runway, Luma, BFL) survive via pro niches, licensing, or robotics pivots.',
    commoditization: 'Open-weights frontier releases (H3-style) plus falling training costs erode the standalone model premium continuously.',
    valuePool: 'Winner-take-most per surface; monetizes as subscriptions, ads, and API — tens of billions but concentrated.',
  },
  {
    title: 'Licensed data & rights clearing',
    why: 'Music proved the sequence: lawsuits became licenses, and the licensed catalog became the moat. Studio procurement now selects for provenance (Moonvalley, Adobe indemnification), and EU AI Act Article 50 enforcement (Aug 2, 2026) makes provenance infrastructure a compliance requirement.',
    leaders: 'The majors (UMG/WMG capturing Udio), Suno post-settlement, ElevenLabs (licensed-first), Adobe, Moonvalley, C2PA ecosystem; Loti/Vermillio in likeness',
    defensibility: 'Exclusive catalogs and consent frameworks are legally enforceable moats — the only kind courts actively strengthen.',
    absorption: 'Rights holders themselves are the incumbents here; tech companies become licensees.',
    commoditization: 'Blanket statutory licensing would flatten the advantage; conversely, a Sony v. Suno fair-use win could weaken it.',
    valuePool: 'A tax on all commercial generation — small percentage, enormous base; likeness rights alone sized at ~$10B.',
  },
  {
    title: 'World models & the simulation bridge',
    why: 'The >$3B that flowed into world models in 2026 is a bet that generative media and robotics/AV simulation are one technology. Whoever owns the world model owns both the next entertainment format and the training ground for physical AI.',
    leaders: 'Google (Genie 3), World Labs (Marble + Autodesk), Decart, NVIDIA (Cosmos 3 open standard + Coalition), Runway (GWM)',
    defensibility: 'Frontier research talent and compute; NVIDIA’s open Cosmos strategy is deliberately commoditizing the closed labs’ edge.',
    absorption: 'Active — Autodesk bought in, Anthropic is reportedly bidding, NVIDIA is arming everyone. Expect the category to be absorbed into larger platforms by 2028.',
    commoditization: 'If Cosmos-style open models reach parity, value shifts to simulation data and integration, not the model.',
    valuePool: 'Speculative but potentially the largest: entertainment plus the simulation layer of the entire physical-AI economy.',
  },
]

// ——— Commoditization / moats matrix ———

export const MOAT_MATRIX: MatrixRow[] = [
  {
    layer: 'Frontier video models',
    differentiation: 'Eroding fast — ~150 Elo across the top 11; leadership turns over quarterly',
    risk: 'high',
    moat: 'Fusion with owned distribution and subsidized inference; otherwise none durable',
    valueCapture: 'Migrates to distribution owners; standalone labs pivot to pro niches or robotics',
  },
  {
    layer: 'Image models',
    differentiation: 'GPT Image 2’s lead is widening — the convergence exception',
    risk: 'medium',
    moat: 'Reasoning-in-generation, text rendering; open FLUX.2 caps the price umbrella',
    valueCapture: 'OpenAI at the frontier; BFL via platform licensing; margins thin below the top',
  },
  {
    layer: 'Audio / voice / music',
    differentiation: 'High — licensed catalogs, latency, enterprise trust',
    risk: 'low',
    moat: 'Label deals are legally enforceable; owned models keep COGS low',
    valueCapture: 'Best economics in GenMedia — ElevenLabs, Suno, Synthesia-class margins',
  },
  {
    layer: 'Thin generation apps',
    differentiation: 'Minimal — same model shelf as everyone else',
    risk: 'high',
    moat: 'None; 40–50% of revenue goes to model COGS',
    valueCapture: 'Squeezed from both sides; consolidation and shutdowns (Icon, Visual Electric)',
  },
  {
    layer: 'Creative workspaces & aggregators',
    differentiation: 'Workflow depth, speed of model integration, enterprise governance',
    risk: 'medium',
    moat: 'Templates, brand kits, enterprise contracts, credit-pricing arbitrage',
    valueCapture: 'Strong today (Canva, Adobe, Magnific) but contested by free platform bundles',
  },
  {
    layer: 'Creative agents & state',
    differentiation: 'Emerging — everyone shipped v1 in 2026',
    risk: 'medium',
    moat: 'Accumulated creative state: characters, brand constraints, project memory',
    valueCapture: 'The prize; unproven demand-side, claimed from above and below simultaneously',
  },
  {
    layer: 'Orchestration & inference',
    differentiation: 'Kernel/compiler engineering, queueing, media-native DX',
    risk: 'medium',
    moat: 'Hand-built optimization (no open standard exists); usage pricing',
    valueCapture: 'Real and compounding (fal), but thin aggregation gets absorbed (Replicate)',
  },
  {
    layer: 'GPU / compute',
    differentiation: 'Scale, contracts, energy access',
    risk: 'low',
    moat: 'Capital intensity + multi-year backlogs (CoreWeave’s $21B Meta deal)',
    valueCapture: 'Landlord economics — high capture, high capex',
  },
  {
    layer: 'Provenance / rights infra',
    differentiation: 'Regulatory tailwind — EU Art. 50 live Aug 2026, China labeling since Sep 2025',
    risk: 'low',
    moat: 'Compliance mandates with fines attached; C2PA network effects',
    valueCapture: 'Small revenue today; strategic — and metadata still doesn’t survive re-encoding',
  },
]

// ——— Vertical integration ———

export const STACK_COMPANIES: StackCompany[] = [
  { name: 'Google', kind: 'incumbent', layers: ['distribution', 'application', 'workflow', 'model', 'infrastructure'], note: 'The only player integrated from TPU silicon to YouTube distribution' },
  { name: 'ByteDance', kind: 'incumbent', layers: ['distribution', 'application', 'workflow', 'model', 'infrastructure'], note: 'Create → publish → monetize in one company; Volcano Engine underneath' },
  { name: 'Adobe', kind: 'incumbent', layers: ['distribution', 'application', 'workflow', 'model'], note: 'Own models de-emphasized; the pitch is governed workflow over everyone’s models' },
  { name: 'Meta', kind: 'incumbent', layers: ['distribution', 'application', 'model'], note: 'Muse (Jul 2026) ends licensing dependence; the ad system is the real product' },
  { name: 'OpenAI', kind: 'lab', layers: ['distribution', 'application', 'model'], note: 'Post-Sora: image frontier + ChatGPT distribution, video exited' },
  { name: 'Kuaishou / Kling', kind: 'incumbent', layers: ['distribution', 'application', 'model'], note: 'The revenue proof that model + owned funnel + global API works' },
  { name: 'Canva', kind: 'incumbent', layers: ['distribution', 'application', 'workflow'], note: 'Mass-market distribution; models are interchangeable inputs' },
  { name: 'Runway', kind: 'startup', layers: ['application', 'workflow', 'model'], note: 'Full-stack independent; world-model pivot adds a robotics lane' },
  { name: 'Lightricks / LTX', kind: 'startup', layers: ['application', 'workflow', 'model'], note: 'Open-weights model + owned studio workflow — vertical but open' },
  { name: 'ElevenLabs', kind: 'startup', layers: ['application', 'model'], note: 'Owned models = the best margins in GenMedia' },
  { name: 'Suno', kind: 'startup', layers: ['application', 'model'], note: 'Owned models + licensed catalog post-settlements' },
  { name: 'Higgsfield', kind: 'startup', layers: ['application', 'workflow'], note: 'Pure aggregator building moats in the state layer (Soul ID)' },
  { name: 'Magnific (Freepik)', kind: 'startup', layers: ['distribution', 'application', 'workflow'], note: 'SEO distribution + all-models workflow; zero frontier models' },
  { name: 'fal', kind: 'startup', layers: ['workflow', 'infrastructure'], note: 'Inference moving up into agents — refusing to stay plumbing' },
  { name: 'Black Forest Labs', kind: 'startup', layers: ['model'], note: 'Deliberate single-layer: license the frontier to platforms' },
  { name: 'NVIDIA', kind: 'incumbent', layers: ['model', 'infrastructure'], note: 'Arms dealer + open Cosmos standard; index-long the whole model layer' },
]

// ——— Momentum 25 ———

export const MOMENTUM: MomentumEntry[] = [
  { rank: 1, name: 'Kling (Kuaishou)', what: 'video model + app', why: 'ARR ~$240M → ~$500M in a quarter (+300% YoY, audited via Kuaishou filings), 75% overseas — the global revenue benchmark for AI video, now reportedly spinning out at $15–18B.' },
  { rank: 2, name: 'Google (Gemini / Veo / Flow)', what: 'full stack', why: 'Gemini passed 1B MAU, Omni Flash tops every video arena, and Flow unified into a 140-country workspace — Google won the Western consumer field largely by Sora’s forfeit.' },
  { rank: 3, name: 'ElevenLabs', what: 'audio platform', why: '~$500M ARR, $11B Series D, Spotify distribution, licensed music expansion — the cleanest scale-up in all of GenMedia.' },
  { rank: 4, name: 'ByteDance (Seedance / CapCut)', what: 'model + funnel', why: 'Seedance 2.5 (30s single-pass) ships into a 400M-MAU editor; the only company fusing frontier video with a billion-user creation-to-publication funnel.' },
  { rank: 5, name: 'Adobe', what: 'workspace + agent', why: 'AI-first ARR >$500M (+3x YoY); Firefly became a multi-model hub and its creative agent now lives inside ChatGPT and Claude — the incumbent that adapted.' },
  { rank: 6, name: 'fal', what: 'inference / orchestration', why: '~$400M annualized (doubled in months), Sequoia-led $4.5B with reported ~$8B talks, and an Aug 2026 move up into agents — the picks-and-shovels winner.' },
  { rank: 7, name: 'Runway', what: 'video lab', why: '$315M Series E at $5.3B with NVIDIA and Adobe on the cap table; Gen-4.5 plus the GWM world-model line gives it a second act beyond media.' },
  { rank: 8, name: 'Suno', what: 'music', why: '$400M at $5.4B raised mid-lawsuit; settled with WMG, UMG, and BMG from a position of strength — licensing turned its biggest risk into its moat.' },
  { rank: 9, name: 'MiniMax', what: 'model lab (public)', why: 'HK IPO popped +109% (Jan 2026); Hailuo H3 put open-weights video at the frontier — the first public pure-play in GenMedia.' },
  { rank: 10, name: 'Black Forest Labs', what: 'image models', why: '$300M at $3.25B; FLUX is the open image standard and ~$300M of licensing contracts (including Meta’s $140M) prove the sell-to-platforms model.' },
  { rank: 11, name: 'Synthesia', what: 'enterprise video', why: '$200M at $4B, ~$150M ARR, NRR >140%, 90% of the Fortune 100 — governed enterprise video keeps compounding beneath the hype.' },
  { rank: 12, name: 'HeyGen', what: 'enterprise video', why: '$200M ARR near break-even on ~$74M raised — the sharpest capital-efficiency datapoint in the application layer.' },
  { rank: 13, name: 'World Labs', what: 'world models', why: 'Marble went GA with a $1B round including $200M from Autodesk; mesh-native outputs make its worlds drop into real 3D pipelines.' },
  { rank: 14, name: 'Decart', what: 'real-time inference', why: 'Sub-35ms real-time generation, $300M at ~$4B, and reported Anthropic acquisition talks at ~$6B — the market pricing the media-optimization moat.' },
  { rank: 15, name: 'Magnific (Freepik)', what: 'aggregator workspace', why: '$230M ARR with zero frontier models of its own — proof that distribution plus integration speed out-monetizes model ownership at the app layer.' },
  { rank: 16, name: 'Higgsfield', what: 'consumer suite', why: 'Claimed ~$500M run-rate (soft figures, real trajectory) at a $1.3B valuation with $5B talks; Soul ID character persistence is the aggregator-moat experiment to watch.' },
  { rank: 17, name: 'PixVerse', what: 'consumer video', why: '$439M at >$2B (Jul 2026), 150M claimed users, first real-time consumer video model — China’s consumer export machine at work.' },
  { rank: 18, name: 'Lightricks / LTX', what: 'open video', why: 'LTX-2 open-sourced in January (4K + audio on one consumer GPU) through LTX-2.5 in August — the "Linux of video" position, plus a Cosmos Coalition seat.' },
  { rank: 19, name: 'Luma', what: 'video lab', why: '$900M at $4B led by HUMAIN with 2GW of committed compute; Ray3.2’s HDR/EXR deliverables target the pro/VFX lane the omni models ignore.' },
  { rank: 20, name: 'Midjourney', what: 'image', why: 'Still ~$200–500M revenue (est.) with zero funding and ~40 people — but no API, no C2PA, and Disney’s suit in discovery make it momentum with an asterisk.' },
  { rank: 21, name: 'NVIDIA Cosmos', what: 'open world models', why: 'Cosmos 3 (Jun 2026) plus the Coalition arms the whole ecosystem with open world models — the Llama play for physical AI, run by the compute monopolist.' },
  { rank: 22, name: 'ComfyUI', what: 'workflow substrate', why: '$30M at $500M, 4M+ users, Comfy Cloud out of beta — its JSON workflows are becoming the portable orchestration format of the industry.' },
  { rank: 23, name: 'Mirage (Captions)', what: 'creator video', why: '$75M revenue-linked financing and own short-form models; renamed itself around the model ambition, and the financing structure implies real recurring revenue.' },
  { rank: 24, name: 'Meta Muse', what: 'image model', why: 'Launched July 2026 directly into the ad system at billion-user scale; the "infinite creative" pipeline optimized against auction outcomes is a closed loop no startup can enter.' },
  { rank: 25, name: 'Tencent Hunyuan', what: 'open ecosystem', why: 'The most modality-diverse open lineage (80B image, video, 3D, world) — the open-weights supply chain under indie GenMedia tooling worldwide.' },
]

// ——— Sources ———

export const SOURCES: Source[] = [
  { id: '1', label: 'TechCrunch — OpenAI shuts down Sora', url: 'https://techcrunch.com/2026/03/24/openais-sora-was-the-creepiest-app-on-your-phone-now-its-shutting-down/', date: 'Mar 24, 2026' },
  { id: '2', label: 'OpenAI Help Center — Sora discontinuation timeline', url: 'https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation', date: '2026' },
  { id: '3', label: 'Kuaishou IR — Q1 2026 results (Kling +300% YoY)', url: 'https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-technology-announces-first-quarter-2026-unaudited', date: 'May 2026' },
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
  { id: '27', label: 'GlobeNewswire — Lightricks open-sources LTX-2', url: 'https://www.globenewswire.com/news-release/2026/01/06/3213304/0/en/Lightricks-Open-Sources-LTX-2-the-First-Production-Ready-Audio-and-Video-Generation-Model-With-Truly-Open-Weights.html', date: 'Jan 6, 2026' },
  { id: '28', label: 'Artificial Analysis — Video Generation Arena leaderboard', url: 'https://artificialanalysis.ai/video/leaderboard/text-to-video', date: 'Aug 2026' },
  { id: '29', label: 'Greenberg Traurig — EU AI Act Article 50 transparency obligations', url: 'https://www.gtlaw.com/en/insights/2026/6/deepfakes-chatbots-ai-generated-text-european-commission-details-transparency-obligations-under-the-ai-act', date: 'Jun 2026' },
  { id: '30', label: 'PitchBook — AI video investment reaches $5.6B in 2026 YTD', url: 'https://pitchbook.com/news/articles/from-models-to-studios-how-ai-video-investment-is-evolving', date: '2026' },
  { id: '31', label: 'CNBC — Meta launches in-house Muse image model', url: 'https://www.cnbc.com/2026/07/07/meta-ai-muse-image.html', date: 'Jul 7, 2026' },
  { id: '32', label: 'Billboard — what the Suno/Udio licensing deals mean', url: 'https://www.billboard.com/pro/what-suno-udio-licensing-deals-mean-future-ai-music/', date: '2025–26' },
  { id: '33', label: 'TechFundingNews — Meshy raises ~$400M at $1.5B', url: 'https://techfundingnews.com/from-mit-research-to-1-5b-unicorn-ethan-hus-meshy-raises-400m-for-ai-powered-3d-creation/', date: 'Jul 21, 2026' },
  { id: '34', label: 'SEC — Getty terminates Shutterstock merger', url: 'https://www.sec.gov/Archives/edgar/data/0001898496/000162828026056698/gety-20260813.htm', date: 'Jul 7, 2026' },
  { id: '35', label: 'TechCrunch — Decart’s Oasis 3 world model', url: 'https://techcrunch.com/2026/06/10/decarts-new-world-model-can-simulate-hours-of-photorealistic-driving-with-some-caveats/', date: 'Jun 10, 2026' },
  { id: '36', label: 'Dodo Payments / Bessemer — AI-native gross margin benchmarks', url: 'https://dodopayments.com/blogs/ai-pricing-models', date: 'Feb 2026' },
  { id: '37', label: 'Atlas Cloud — cheapest AI video generation APIs 2026', url: 'https://www.atlascloud.ai/blog/guides/cheapest-ai-video-generation-api-2026', date: '2026' },
  { id: '38', label: 'CGTN — China enforces AI-content labeling rules', url: 'https://news.cgtn.com/news/2025-09-01/China-enforces-new-rules-on-labeling-AI-generated-content-1Gj1GWXQeJi/p.html', date: 'Sep 1, 2025' },
  { id: '39', label: 'Arena — LMArena is now Arena', url: 'https://arena.ai/blog/lmarena-is-now-arena', date: 'Jan 28, 2026' },
]
