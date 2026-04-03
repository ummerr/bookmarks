// ── Prompt discovery definitions ──────────────────────────────────────────
// Twitter/X search queries + external source links for finding AI prompts.
// Operators confirmed working on X web UI (2026): min_faves, filter:media,
// filter:images, filter:videos, since/until, lang, -filter:replies.

export interface SearchQuery {
  label: string
  description: string
  query: string
  category: 'video' | 'image' | 'multishot' | 'workflow' | 'llm'
  hot?: boolean
}

export interface ExternalSource {
  label: string
  description: string
  url: string
  category: 'video_db' | 'image_db' | 'community' | 'tools'
}

export interface CreatorAccount {
  handle: string
  name: string
  description: string
  focus: 'video' | 'image' | 'both'
}

// ── Twitter search categories ─────────────────────────────────────────────

export const SEARCH_CATEGORIES = [
  { key: 'video' as const, label: 'Video Models', color: 'violet' },
  { key: 'image' as const, label: 'Image Models', color: 'pink' },
  { key: 'multishot' as const, label: 'Multi-Shot & Advanced', color: 'emerald' },
  { key: 'workflow' as const, label: 'Workflows & Tools', color: 'amber' },
  { key: 'llm' as const, label: 'LLM / System Prompts', color: 'sky' },
]

// ── Twitter search queries ────────────────────────────────────────────────
// Principles:
// - Match how people actually post: raw prompts, casual shares, JSON configs
// - min_faves filters noise; lower for niche, higher for popular models
// - filter:media or filter:videos ensures output is attached
// - -filter:replies cuts reply noise on broad queries

export const SEARCHES: SearchQuery[] = [
  // ── Video: Veo ──────────────────────────────────────────────────────────
  {
    label: 'Veo 3 — viral posts',
    description: 'High-engagement Veo posts — prompt usually in thread or alt',
    query: '"veo 3" filter:videos min_faves:100',
    category: 'video',
    hot: true,
  },
  {
    label: 'Veo 3 — prompt drops',
    description: 'People sharing their actual Veo prompts',
    query: '"veo 3" ("prompt:" OR "prompt in" OR "prompt below" OR "the prompt") filter:media min_faves:10',
    category: 'video',
    hot: true,
  },
  {
    label: 'Veo 3 — casual shares',
    description: '"just made" / "made this" / "look at this" Veo posts',
    query: '"veo 3" ("just made" OR "made this" OR "look at this" OR "check this") filter:media min_faves:10',
    category: 'video',
  },
  // ── Video: Kling ────────────────────────────────────────────────────────
  {
    label: 'Kling — viral posts',
    description: 'High-engagement Kling posts',
    query: 'kling (AI OR video OR prompt) filter:videos min_faves:100',
    category: 'video',
    hot: true,
  },
  {
    label: 'Kling — prompt drops',
    description: 'Kling prompt shares',
    query: 'kling ("prompt:" OR "prompt in" OR "prompt below" OR "the prompt") filter:media min_faves:5',
    category: 'video',
  },
  // ── Video: Runway ───────────────────────────────────────────────────────
  {
    label: 'Runway — prompt shares',
    description: 'Runway Gen-4 prompt drops and showcases',
    query: '(runwayml OR "gen-4" OR "gen 4") ("prompt:" OR "prompt in" OR "made this") filter:media min_faves:10',
    category: 'video',
  },
  // ── Video: Others ───────────────────────────────────────────────────────
  {
    label: 'Hailuo — prompt shares',
    description: 'Hailuo/MiniMax video prompts',
    query: '(hailuo OR minimax) ("prompt:" OR "prompt in" OR "made this") filter:media min_faves:3',
    category: 'video',
  },
  {
    label: 'Seedance / Pika / Luma',
    description: 'Smaller video model prompt shares',
    query: '(seedance OR pika OR "luma ai") ("prompt:" OR "prompt in" OR "made this") filter:media min_faves:3',
    category: 'video',
  },

  // ── Image: Midjourney ───────────────────────────────────────────────────
  {
    label: 'Midjourney — /imagine commands',
    description: 'Actual /imagine commands in tweets',
    query: '"/imagine" filter:images min_faves:20',
    category: 'image',
  },
  {
    label: 'Midjourney — --sref / --cref',
    description: 'Style reference and character reference shots',
    query: '("--sref" OR "--cref") filter:images min_faves:5',
    category: 'image',
  },
  {
    label: 'Midjourney — --ar --v params',
    description: 'Tweets containing actual MJ parameter syntax',
    query: '"--ar" ("--v 6" OR "--v 7") filter:images min_faves:10',
    category: 'image',
  },
  // ── Image: Flux ─────────────────────────────────────────────────────────
  {
    label: 'Flux — prompt shares',
    description: 'Flux image generation prompts',
    query: 'flux ("prompt:" OR "prompt in" OR "made this" OR "generated") filter:images min_faves:15',
    category: 'image',
  },
  // ── Image: DALL-E ───────────────────────────────────────────────────────
  {
    label: 'DALL-E / GPT-4o — image gen',
    description: 'DALL-E and ChatGPT image generation shares',
    query: '("dall-e" OR dalle OR "gpt-4o" OR "chatgpt image") ("prompt:" OR "I asked" OR "told it" OR "made this") filter:images min_faves:10',
    category: 'image',
  },
  // ── Image: Others ───────────────────────────────────────────────────────
  {
    label: 'Ideogram — prompt shares',
    description: 'Ideogram posts (best for text-in-image)',
    query: 'ideogram ("prompt:" OR "prompt in" OR "made this") filter:images min_faves:10',
    category: 'image',
  },
  {
    label: 'Aurora / Grok image gen',
    description: 'xAI Aurora and Grok image generation',
    query: '("aurora" OR "grok" image) ("prompt:" OR "made this" OR "generated") filter:images min_faves:10',
    category: 'image',
  },
  // ── Image: JSON prompts (new trend) ─────────────────────────────────────
  {
    label: 'JSON-structured prompts',
    description: 'Full JSON config prompt shares (Nano Banana style)',
    query: '("prompt" OR "settings") ("json" OR "parameters" OR "cfg" OR "steps") filter:images min_faves:10',
    category: 'image',
  },

  // ── Catch-all patterns ──────────────────────────────────────────────────
  {
    label: '"prompt in alt" — any model',
    description: 'Creators who embed the prompt in image alt text',
    query: '"prompt in alt" filter:images min_faves:5',
    category: 'image',
  },
  {
    label: '"prompt in thread" — any model',
    description: 'Posts where prompt is in the thread below',
    query: '("prompt in thread" OR "prompt in replies" OR "prompt in comments" OR "prompt below") filter:media min_faves:10',
    category: 'image',
  },

  // ── Multi-shot / Advanced ───────────────────────────────────────────────
  {
    label: '[0s] [3s] timestamp syntax',
    description: 'Multi-shot prompts with Kling/Seedance timestamp markers',
    query: '("[0s]" OR "[3s]" OR "[0s-3s]") (kling OR veo OR runway OR seedance) min_faves:3',
    category: 'multishot',
  },
  {
    label: 'Shot/scene breakdowns',
    description: 'Multi-shot prompts broken into labeled shots or scenes',
    query: '("shot 1" "shot 2") OR ("scene 1" "scene 2") (kling OR veo OR runway) min_faves:3',
    category: 'multishot',
  },
  {
    label: 'Image-to-video workflows',
    description: 'i2v technique shares and results',
    query: '("i2v" OR "img2vid" OR "image to video") (kling OR runway OR hailuo) filter:media min_faves:5',
    category: 'multishot',
  },

  // ── Workflows & Tools ───────────────────────────────────────────────────
  {
    label: 'ComfyUI workflows',
    description: 'People sharing their ComfyUI node setups',
    query: 'comfyui ("workflow" OR "node" OR "here\'s my") filter:media min_faves:10',
    category: 'workflow',
  },
  {
    label: 'ControlNet / IP-Adapter',
    description: 'Reference-based generation results',
    query: '(controlnet OR "ip-adapter" OR ipadapter) filter:media min_faves:5',
    category: 'workflow',
  },
  {
    label: 'LoRA releases',
    description: 'New LoRA model releases with example outputs',
    query: 'lora ("just released" OR "just trained" OR "new lora" OR "check out") filter:media min_faves:10',
    category: 'workflow',
  },

  // ── LLM / System Prompts ────────────────────────────────────────────────
  {
    label: 'System prompt leaks',
    description: 'People sharing system prompts they extracted',
    query: '"system prompt" ("leaked" OR "found" OR "extracted" OR "here\'s the") min_faves:50',
    category: 'llm',
  },
  {
    label: 'Custom GPT configs',
    description: 'ChatGPT custom instructions and GPT configs',
    query: '("custom instructions" OR "custom GPT") ("here\'s" OR "I use" OR "my setup" OR sharing) min_faves:20',
    category: 'llm',
  },
  {
    label: 'Prompt engineering — viral',
    description: 'High-engagement prompting tips and tricks',
    query: '("prompt engineering" OR "prompting tip" OR "prompt trick") min_faves:100',
    category: 'llm',
  },
]

// ── Creator accounts to follow ────────────────────────────────────────────
// Following these accounts and browsing with the extension is higher ROI than
// any search query. Create a Twitter List from these for bulk capture.

export const CREATORS: CreatorAccount[] = [
  // Video-focused
  { handle: 'Samann_ai', name: 'Samann', description: 'AI video art, Kling/Higgsfield prompts', focus: 'video' },
  { handle: 'umesh_ai', name: 'Umesh', description: 'Cinematic AI filmmaking, animations', focus: 'video' },
  { handle: 'CharaspowerAI', name: 'Charaspower', description: 'Cinematic workflows, VFX, detailed prompts', focus: 'video' },
  { handle: 'underwoodxie96', name: 'Underwood', description: 'AI video tips, tutorials, workflows', focus: 'video' },
  // Image-focused
  { handle: 'egeberkina', name: 'Ege Berkina', description: 'Daily AI art drops with full JSON prompts', focus: 'image' },
  { handle: 'bri_guy_ai', name: 'Bri Guy', description: 'Portrait gen prompts, weekly curated zines', focus: 'image' },
  { handle: 'craftian_keskin', name: 'Craftian', description: 'Midjourney dark fantasy style explorations', focus: 'image' },
  { handle: 'Arminn_Ai', name: 'Armin', description: 'Regular prompt drops with high-impact results', focus: 'image' },
  { handle: 'Sheldon056', name: 'Sheldon', description: 'Cinematic Nano Banana / photorealistic prompts', focus: 'image' },
  { handle: 'rovvmut_', name: 'Rovvmut', description: 'Portraits and videos with detailed JSON prompts', focus: 'image' },
  { handle: 'SimplyAnnisa', name: 'Annisa', description: 'Ultra-realistic portraits, cozy vibes, precise prompts', focus: 'image' },
  { handle: 'lexx_aura', name: 'Lexx', description: 'Photorealistic fashion/lifestyle with JSON prompts', focus: 'image' },
  { handle: 'nickfloats', name: 'Nick St. Pierre', description: 'MJ style studies, prompt in alt text', focus: 'image' },
  // Both
  { handle: 'aitrendz_xyz', name: 'AI Trendz', description: 'Practical tips for image, video, text gen', focus: 'both' },
  { handle: 'TechieBySA', name: 'Techie', description: 'Underrated AI tools, advanced prompts, experiments', focus: 'both' },
  { handle: 'r4jjesh', name: 'Rajjesh', description: 'Creative cinematic prompts with humor', focus: 'both' },
  { handle: 'ai_for_success', name: 'AI for Success', description: 'AI news, tool tutorials, step-by-step guides', focus: 'both' },
  { handle: 'LearnWithAbbay', name: 'Abbay', description: 'Structured prompts, Y2K aesthetics, educational', focus: 'both' },
]

// ── External prompt databases & sources ───────────────────────────────────

export const EXTERNAL_SOURCES: ExternalSource[] = [
  // Video prompt databases
  {
    label: 'UlazAI',
    description: '1,990+ community prompts for Veo 3, Sora, Kling, Grok. Closest thing to Civitai for video.',
    url: 'https://ulazai.com/directory/',
    category: 'video_db',
  },
  {
    label: 'Videoprompt.info',
    description: 'Optimized prompts for Sora 2, Veo 3, Kling, Runway. Cinematic, sci-fi, product templates.',
    url: 'https://www.videoprompt.info',
    category: 'video_db',
  },
  {
    label: 'Visionary Video',
    description: '440 hand-picked prompts across cinematic, anime, 3D, sci-fi. Works for Kling, Runway, Sora, Veo.',
    url: 'https://visionaryvideo.app/prompt-library/',
    category: 'video_db',
  },
  {
    label: 'awesome-ai-video-prompts',
    description: 'GitHub repo with curated templates, cinematic techniques, audio-visual sync methods.',
    url: 'https://github.com/geekjourneyx/awesome-ai-video-prompts',
    category: 'video_db',
  },
  {
    label: 'Veo 3 Prompting Guide',
    description: 'GitHub guide with structure, examples, and best practices for Veo 3.',
    url: 'https://github.com/snubroot/Veo-3-Prompting-Guide',
    category: 'video_db',
  },

  // Image prompt databases
  {
    label: 'Civitai',
    description: 'Largest prompt collection. Every image shows full prompt, parameters, model, LoRA used.',
    url: 'https://civitai.com/images',
    category: 'image_db',
  },
  {
    label: 'PromptHero',
    description: 'Millions of prompts across Midjourney, SD, DALL-E, Flux. Searchable and filterable.',
    url: 'https://prompthero.com',
    category: 'image_db',
  },
  {
    label: 'Lexica',
    description: 'Search engine for Stable Diffusion prompts. Great for reverse-engineering styles.',
    url: 'https://lexica.art',
    category: 'image_db',
  },
  {
    label: 'OpenArt',
    description: 'Gallery + prompt sharing. Good for inspiration across multiple models.',
    url: 'https://openart.ai/discovery',
    category: 'image_db',
  },

  // Communities
  {
    label: 'r/StableDiffusion',
    description: 'Most active for full generation metadata (prompt, negative, seed, CFG, sampler).',
    url: 'https://reddit.com/r/StableDiffusion',
    category: 'community',
  },
  {
    label: 'r/midjourney',
    description: '1.1M+ members. Prompt shares, showcase, tips.',
    url: 'https://reddit.com/r/midjourney',
    category: 'community',
  },
  {
    label: 'r/AIVideo',
    description: 'Video generation discussion and prompt sharing.',
    url: 'https://reddit.com/r/AIVideo',
    category: 'community',
  },

  // Tools
  {
    label: 'Prompt AI Videos',
    description: 'Reverse-engineers existing AI videos to generate prompts for Sora, Runway, Veo, Kling.',
    url: 'https://www.promptaivideos.com',
    category: 'tools',
  },
  {
    label: 'Promptomania',
    description: 'Visual prompt builder for Midjourney, DALL-E, SD, Flux. Covers image, video, 3D, audio.',
    url: 'https://promptomania.com',
    category: 'tools',
  },
]

export const SOURCE_CATEGORIES = [
  { key: 'video_db' as const, label: 'Video Prompt Databases', color: 'violet' },
  { key: 'image_db' as const, label: 'Image Prompt Databases', color: 'pink' },
  { key: 'community' as const, label: 'Communities', color: 'emerald' },
  { key: 'tools' as const, label: 'Prompt Tools', color: 'amber' },
]

// ── URL builders ──────────────────────────────────────────────────────────

export function buildTwitterSearchUrl(query: string, mode: 'top' | 'latest' = 'top'): string {
  const f = mode === 'latest' ? 'live' : 'top'
  return `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=${f}`
}

export function buildTwitterProfileUrl(handle: string): string {
  return `https://x.com/${handle}`
}

export function addDateRange(query: string, days: number = 7): string {
  const now = new Date()
  const until = now.toISOString().split('T')[0]
  const since = new Date(now.getTime() - days * 86400000).toISOString().split('T')[0]
  const lowered = query.replace(/min_faves:\d+/, 'min_faves:3')
  return `${lowered} since:${since} until:${until}`
}
