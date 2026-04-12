/**
 * Type Consistency Tests
 *
 * Verifies that enum values in types.ts stay in sync with validation Sets
 * in classifier.ts and UI maps in constants.ts. Static analysis — no DB needed.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(__dirname, '..')

function readFile(relPath: string): string {
  return readFileSync(join(ROOT, relPath), 'utf-8')
}

function extractUnionValues(src: string, typeName: string): string[] {
  const regex = new RegExp(`type ${typeName}\\s*=([\\s\\S]*?)(?=\\nexport|\\ninterface|\\ntype |$)`)
  const match = src.match(regex)
  if (!match) return []
  return [...match[1].matchAll(/'([^']+)'/g)].map(m => m[1])
}

function extractArrayValues(src: string, varName: string): string[] {
  const regex = new RegExp(`${varName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as\\s*const`)
  const match = src.match(regex)
  if (!match) return []
  return [...match[1].matchAll(/'([^']+)'/g)].map(m => m[1])
}

const typesSrc = readFile('lib/types.ts')
const classifierSrc = readFile('lib/classifier.ts')

// ─── PromptCategory sync ─────────────────────────────────────────────────────

describe('PromptCategory sync', () => {
  const typeValues = extractUnionValues(typesSrc, 'PromptCategory')
  const classifierValues = extractArrayValues(classifierSrc, 'VALID_PROMPT_CATEGORIES_LIST')

  it('types.ts has PromptCategory values', () => {
    expect(typeValues.length).toBeGreaterThan(0)
  })

  it('classifier.ts has VALID_PROMPT_CATEGORIES_LIST', () => {
    expect(classifierValues.length).toBeGreaterThan(0)
  })

  // types.ts is a superset of the classifier output enum: it retains legacy
  // categories (image_character_ref, image_inpainting) so historical rows can
  // still render in the UI, even though the classifier no longer emits them.
  const LEGACY_DISPLAY_ONLY = new Set(['image_character_ref', 'image_inpainting'])

  it('every PromptCategory in types.ts is in VALID_PROMPT_CATEGORIES_LIST (except legacy display-only)', () => {
    const missing = typeValues.filter(v => !classifierValues.includes(v) && !LEGACY_DISPLAY_ONLY.has(v))
    expect(missing, `types.ts has [${missing.join(', ')}] not in classifier validation`).toEqual([])
  })

  it('every value in VALID_PROMPT_CATEGORIES_LIST is in types.ts', () => {
    const extra = classifierValues.filter(v => !typeValues.includes(v))
    expect(extra, `classifier has [${extra.join(', ')}] not in types.ts`).toEqual([])
  })
})

// ─── PromptTheme sync ────────────────────────────────────────────────────────

describe('PromptTheme sync', () => {
  const typeValues = extractUnionValues(typesSrc, 'PromptTheme')
  const classifierValues = extractArrayValues(classifierSrc, 'VALID_THEMES_LIST')

  it('every PromptTheme is in VALID_THEMES_LIST', () => {
    const missing = typeValues.filter(v => !classifierValues.includes(v))
    expect(missing).toEqual([])
  })

  it('every VALID_THEMES_LIST value is in types.ts', () => {
    const extra = classifierValues.filter(v => !typeValues.includes(v))
    expect(extra).toEqual([])
  })
})

// ─── ArtStyle sync ───────────────────────────────────────────────────────────

describe('ArtStyle sync', () => {
  const typeValues = extractUnionValues(typesSrc, 'ArtStyle')
  const classifierValues = extractArrayValues(classifierSrc, 'VALID_ART_STYLES_LIST')

  it('every ArtStyle is in VALID_ART_STYLES_LIST', () => {
    const missing = typeValues.filter(v => !classifierValues.includes(v))
    expect(missing).toEqual([])
  })

  it('every VALID_ART_STYLES_LIST value is in types.ts', () => {
    const extra = classifierValues.filter(v => !typeValues.includes(v))
    expect(extra).toEqual([])
  })
})

// ─── ReferenceType sync ──────────────────────────────────────────────────────

describe('ReferenceType sync', () => {
  const typeValues = extractUnionValues(typesSrc, 'ReferenceType')
  const classifierValues = extractArrayValues(classifierSrc, 'VALID_REF_TYPES_LIST')

  it('every ReferenceType is in VALID_REF_TYPES_LIST', () => {
    const missing = typeValues.filter(v => !classifierValues.includes(v))
    expect(missing).toEqual([])
  })

  it('every VALID_REF_TYPES_LIST value is in types.ts', () => {
    const extra = classifierValues.filter(v => !typeValues.includes(v))
    expect(extra).toEqual([])
  })
})

// ─── Category sync ───────────────────────────────────────────────────────────

describe('Category sync', () => {
  const typeValues = extractUnionValues(typesSrc, 'Category')
  const classifierValues = extractArrayValues(classifierSrc, 'VALID_CATEGORIES_LIST')

  it('every Category is in VALID_CATEGORIES_LIST', () => {
    const missing = typeValues.filter(v => !classifierValues.includes(v))
    expect(missing).toEqual([])
  })
})
