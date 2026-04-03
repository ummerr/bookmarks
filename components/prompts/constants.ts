import type { PromptCategory, PromptTheme } from '@/lib/types'

export const MEDIA_TYPES = [
  { value: 'all',   label: 'All' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
] as const
export type MediaType = typeof MEDIA_TYPES[number]['value']

export const MEDIA_TYPE_CATEGORIES: Record<MediaType, (PromptCategory | 'all')[]> = {
  all:   ['all', 'image_person', 'image_advertisement', 'image_collage', 'image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting', 'video_t2v', 'video_i2v', 'video_r2v', 'video_v2v'],
  image: ['image_person', 'image_advertisement', 'image_collage', 'image_t2i', 'image_i2i', 'image_r2i', 'image_character_ref', 'image_inpainting'],
  video: ['video_t2v', 'video_i2v', 'video_r2v', 'video_v2v'],
}

// Model families - order matters (more specific first)
export const MODEL_FAMILIES: { label: string; patterns: string[] }[] = [
  { label: 'Midjourney',       patterns: ['midjourney', 'mj'] },
  { label: 'Flux',             patterns: ['flux'] },
  { label: 'Stable Diffusion', patterns: ['stable diffusion', 'sdxl', 'sd3', 'sd '] },
  { label: 'DALL-E',           patterns: ['dall-e', 'dalle'] },
  { label: 'Firefly',          patterns: ['firefly'] },
  { label: 'Ideogram',         patterns: ['ideogram'] },
  { label: 'Leonardo',         patterns: ['leonardo'] },
  { label: 'Kling',            patterns: ['kling'] },
  { label: 'Runway',           patterns: ['runway', 'gen-2', 'gen-3', 'gen 2', 'gen 3'] },
  { label: 'Sora',             patterns: ['sora'] },
  { label: 'Pika',             patterns: ['pika'] },
  { label: 'Hailuo',           patterns: ['hailuo', 'minimax'] },
  { label: 'Luma',             patterns: ['luma', 'dream machine'] },
  { label: 'Veo',              patterns: ['veo'] },
  { label: 'Wan',              patterns: ['wan'] },
  { label: 'Seedance',        patterns: ['seedance'] },
  { label: 'Higgsfield',      patterns: ['higgsfield'] },
  { label: 'ElevenLabs',       patterns: ['elevenlabs'] },
  { label: 'Suno',             patterns: ['suno'] },
  { label: 'Udio',             patterns: ['udio'] },
  { label: 'ChatGPT',          patterns: ['chatgpt', 'gpt-4', 'gpt4'] },
  { label: 'Claude',           patterns: ['claude'] },
  { label: 'Nano Banana',      patterns: ['nano banana', 'gemini'] },
  { label: 'Meshy',            patterns: ['meshy'] },
]

export function modelToFamily(model: string): string {
  const lower = model.toLowerCase()
  return MODEL_FAMILIES.find((f) => f.patterns.some((p) => lower.includes(p)))?.label ?? model
}

// Model families that are primarily video generators
const VIDEO_MODEL_FAMILIES = new Set([
  'Kling', 'Runway', 'Sora', 'Pika', 'Hailuo', 'Luma', 'Veo', 'Wan',
  'Seedance', 'Higgsfield',
])

export function modelFamilyMediaType(family: string): 'image' | 'video' | 'other' {
  if (VIDEO_MODEL_FAMILIES.has(family)) return 'video'
  // Audio / 3D / LLMs that don't clearly fit
  if (['ElevenLabs', 'Suno', 'Udio', 'Meshy'].includes(family)) return 'other'
  return 'image'
}

export const CATEGORIES: { value: PromptCategory | 'all'; label: string }[] = [
  { value: 'all',                  label: 'All' },
  { value: 'image_person',        label: 'Person' },
  { value: 'image_advertisement', label: 'Ad' },
  { value: 'image_collage',       label: 'Collage' },
  { value: 'image_t2i',           label: 'General' },
  { value: 'image_i2i',           label: 'I2I' },
  { value: 'image_r2i',           label: 'R2I' },
  { value: 'image_character_ref', label: 'Char Ref' },
  { value: 'image_inpainting',    label: 'Inpainting' },
  { value: 'video_t2v',           label: 'T2V' },
  { value: 'video_i2v',           label: 'Frames to Video' },
  { value: 'video_r2v',           label: 'Ref to Video' },
  { value: 'video_v2v',           label: 'V2V' },
]

export const THEMES: { value: PromptTheme; label: string }[] = [
  { value: 'person',       label: 'Person' },
  { value: 'cinematic',    label: 'Cinematic' },
  { value: 'landscape',    label: 'Landscape' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'scifi',        label: 'Sci-fi' },
  { value: 'fantasy',      label: 'Fantasy' },
  { value: 'abstract',     label: 'Abstract' },
  { value: 'fashion',      label: 'Fashion' },
  { value: 'product',      label: 'Product' },
  { value: 'horror',       label: 'Horror' },
]

export const THEME_COLORS: Record<PromptTheme, string> = {
  person:       'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/40',
  cinematic:    'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800/40',
  landscape:    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/40',
  architecture: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/60 dark:text-stone-300 dark:border-stone-700/40',
  scifi:        'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800/40',
  fantasy:      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/40',
  abstract:     'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800/40',
  fashion:      'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800/40',
  product:      'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800/40',
  horror:       'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/40',
}

export const REFERENCE_TYPE_LABELS: Record<string, string> = {
  face_person:    'Face / Person',
  style_artwork:  'Style / Artwork',
  subject_object: 'Subject / Object',
  pose_structure: 'Pose / Structure',
  scene_background: 'Scene / Background',
}

export const CATEGORY_COLORS: Record<string, string> = {
  image_person:        'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800/50',
  image_advertisement: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800/50',
  image_collage:       'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 dark:border-fuchsia-800/50',
  image_t2i:           'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800/50',
  image_i2i:           'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800/50',
  image_r2i:           'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800/50',
  image_character_ref: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800/50',
  image_inpainting:    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800/50',
  video_t2v:           'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800/50',
  video_i2v:           'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800/50',
  video_r2v:           'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800/50',
  video_v2v:           'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800/50',
  audio:               'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800/50',
  threed:              'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800/50',
  system_prompt:       'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800/50',
  writing:             'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800/50',
  coding:              'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800/50',
  analysis:            'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800/50',
  other:               'bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
}

export function categoryLabel(val: string | null) {
  return CATEGORIES.find((c) => c.value === val)?.label ?? val ?? '-'
}
