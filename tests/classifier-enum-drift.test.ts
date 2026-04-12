import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Guards against drift between the classifier's output enums and the system
// prompt that teaches Sonnet how to use them. If an enum value is added to
// VALID_*_LIST but never mentioned in PROMPT_SYSTEM, the model will never
// emit it (dead enum). If a value is mentioned in the prompt but not in the
// enum, the tool schema will reject it (silent downgrade to 'other').
//
// Runs as part of `npm test` — cheap correctness check, no network.

const source = readFileSync(join(__dirname, '..', 'lib', 'classifier.ts'), 'utf-8')

function extractList(name: string): string[] {
  const re = new RegExp(`const ${name} = \\[([^\\]]+)\\]`, 'm')
  const match = source.match(re)
  if (!match) throw new Error(`Could not find ${name} in classifier.ts`)
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
}

function extractSystemPrompt(): string {
  const match = source.match(/const PROMPT_SYSTEM = `([\s\S]*?)`/)
  if (!match) throw new Error('Could not find PROMPT_SYSTEM')
  return match[1]
}

describe('classifier enum ↔ system-prompt drift', () => {
  const prompt = extractSystemPrompt()

  const enums: Record<string, string[]> = {
    VALID_PROMPT_CATEGORIES_LIST: extractList('VALID_PROMPT_CATEGORIES_LIST'),
    VALID_THEMES_LIST: extractList('VALID_THEMES_LIST'),
    VALID_ART_STYLES_LIST: extractList('VALID_ART_STYLES_LIST'),
    VALID_REF_TYPES_LIST: extractList('VALID_REF_TYPES_LIST'),
  }

  // 'other' is a generic catch-all that doesn't need to be explicitly taught.
  const EXEMPT = new Set(['other'])

  for (const [listName, values] of Object.entries(enums)) {
    it(`every value in ${listName} is mentioned in PROMPT_SYSTEM`, () => {
      const missing = values.filter((v) => !EXEMPT.has(v) && !prompt.includes(v))
      expect(missing, `dead enum values (in list, absent from prompt): ${missing.join(', ')}`).toEqual([])
    })
  }
})
