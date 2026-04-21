// Single source of truth for the four derived sub-datasets (T2I, R2I, T2V, R2V).
// The master dataset at /dataset is unchanged; each slice is a filtered view.

export type DatasetSlice = 't2i' | 'r2i' | 't2v' | 'r2v'

export interface DatasetSliceMeta {
  key: DatasetSlice
  shortLabel: string
  longLabel: string
  description: string
  color: string
  // Raw SQL fragment ANDed into the WHERE clause. Never derived from user input —
  // safe to interpolate. category = 'prompts' is always applied separately.
  predicate: string
  // Human-readable rule, shown in the download meta envelope and on the sub-page.
  rule: string
}

export const DATASET_SLICES: Record<DatasetSlice, DatasetSliceMeta> = {
  t2i: {
    key: 't2i',
    shortLabel: 'T2I',
    longLabel: 'Text to Image',
    description: 'Image prompts that generate from text alone — no reference image required.',
    color: '#ec4899',
    predicate: "prompt_category LIKE 'image_%' AND COALESCE(requires_reference, false) = false",
    rule: "prompt_category starts with 'image_' AND requires_reference is false or null",
  },
  r2i: {
    key: 'r2i',
    shortLabel: 'R2I',
    longLabel: 'Reference to Image',
    description: 'Image prompts that require a user-supplied reference image (face, style, subject, pose, or scene).',
    color: '#f97316',
    predicate: "prompt_category LIKE 'image_%' AND requires_reference = true",
    rule: "prompt_category starts with 'image_' AND requires_reference is true",
  },
  t2v: {
    key: 't2v',
    shortLabel: 'T2V',
    longLabel: 'Text to Video',
    description: 'Video prompts generated from text only — no reference or source image conditioning.',
    color: '#8b5cf6',
    predicate: "prompt_category = 'video_t2v'",
    rule: "prompt_category equals 'video_t2v'",
  },
  r2v: {
    key: 'r2v',
    shortLabel: 'R2V',
    longLabel: 'Reference to Video',
    description: 'Video prompts conditioned on an input image or video (image-to-video, reference-to-video, video-to-video).',
    color: '#a855f7',
    predicate: "prompt_category LIKE 'video_%' AND prompt_category <> 'video_t2v'",
    rule: "prompt_category starts with 'video_' AND is not 'video_t2v'",
  },
}

export const DATASET_SLICE_KEYS: DatasetSlice[] = ['t2i', 'r2i', 't2v', 'r2v']

export function isDatasetSlice(v: string | null | undefined): v is DatasetSlice {
  return v != null && (DATASET_SLICE_KEYS as string[]).includes(v)
}
