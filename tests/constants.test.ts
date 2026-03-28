import { describe, it, expect } from 'vitest'
import { modelToFamily, categoryLabel, CATEGORY_COLORS, THEME_COLORS, CATEGORIES, THEMES, MEDIA_TYPE_CATEGORIES, MODEL_FAMILIES } from '../components/prompts/constants'

// ─── modelToFamily ───────────────────────────────────────────────────────────

describe('modelToFamily', () => {
  const cases: [string, string][] = [
    ['Midjourney', 'Midjourney'],
    ['midjourney v6', 'Midjourney'],
    ['mj style', 'Midjourney'],
    ['Flux.1', 'Flux'],
    ['Stable Diffusion XL', 'Stable Diffusion'],
    ['SDXL Turbo', 'Stable Diffusion'],
    ['DALL-E 3', 'DALL-E'],
    ['dalle 2', 'DALL-E'],
    ['Runway Gen-3', 'Runway'],
    ['gen-3 alpha', 'Runway'],
    ['Kling 3.0', 'Kling'],
    ['Pika 2.5', 'Pika'],
    ['Luma Dream Machine', 'Luma'],
    ['Sora', 'Sora'],
    ['Veo 3', 'Veo'],
    ['ChatGPT', 'ChatGPT'],
    ['GPT-4 Vision', 'ChatGPT'],
    ['Claude', 'Claude'],
    ['Gemini Pro', 'Gemini'],
    ['ElevenLabs', 'ElevenLabs'],
    ['Suno v4', 'Suno'],
  ]

  it.each(cases)('"%s" → "%s"', (input, expected) => {
    expect(modelToFamily(input)).toBe(expected)
  })

  it('returns original string for unknown model', () => {
    expect(modelToFamily('BrandNewAI')).toBe('BrandNewAI')
  })

  it('is case insensitive', () => {
    expect(modelToFamily('MIDJOURNEY')).toBe('Midjourney')
    expect(modelToFamily('flux')).toBe('Flux')
  })
})

// ─── categoryLabel ───────────────────────────────────────────────────────────

describe('categoryLabel', () => {
  it('returns label for known category', () => {
    expect(categoryLabel('image_t2i')).toBe('General')
    expect(categoryLabel('video_t2v')).toBe('T2V')
  })

  it('returns the value itself for unknown category', () => {
    expect(categoryLabel('unknown_cat')).toBe('unknown_cat')
  })

  it('returns - for null', () => {
    expect(categoryLabel(null)).toBe('-')
  })
})

// ─── Color map completeness ──────────────────────────────────────────────────

describe('CATEGORY_COLORS completeness', () => {
  // All categories listed in CATEGORIES (except 'all') should have colors
  const categoryValues = CATEGORIES.map(c => c.value).filter(v => v !== 'all')

  it.each(categoryValues)('has color for "%s"', (cat) => {
    expect(CATEGORY_COLORS[cat]).toBeDefined()
    expect(CATEGORY_COLORS[cat].length).toBeGreaterThan(0)
  })
})

describe('THEME_COLORS completeness', () => {
  const themeValues = THEMES.map(t => t.value)

  it.each(themeValues)('has color for "%s"', (theme) => {
    expect(THEME_COLORS[theme]).toBeDefined()
    expect(THEME_COLORS[theme].length).toBeGreaterThan(0)
  })
})

// ─── MEDIA_TYPE_CATEGORIES validity ──────────────────────────────────────────

describe('MEDIA_TYPE_CATEGORIES validity', () => {
  it('all categories reference valid PromptCategory values or "all"', () => {
    const validValues = new Set(CATEGORIES.map(c => c.value))
    for (const [mediaType, cats] of Object.entries(MEDIA_TYPE_CATEGORIES)) {
      for (const cat of cats) {
        expect(validValues.has(cat), `${mediaType} has unknown category "${cat}"`).toBe(true)
      }
    }
  })
})

// ─── MODEL_FAMILIES structure ────────────────────────────────────────────────

describe('MODEL_FAMILIES', () => {
  it('every family has at least one pattern', () => {
    for (const fam of MODEL_FAMILIES) {
      expect(fam.patterns.length, `${fam.label} has no patterns`).toBeGreaterThan(0)
    }
  })

  it('no duplicate labels', () => {
    const labels = MODEL_FAMILIES.map(f => f.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
