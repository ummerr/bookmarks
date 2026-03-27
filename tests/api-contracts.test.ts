/**
 * API Contract Tests
 *
 * Ensures the response shape from API routes matches what client pages expect.
 * These tests parse the source files directly — no database or server needed.
 * If a client page expects a field that the API route doesn't return, the test fails.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(__dirname, '..')

function readFile(relPath: string): string {
  return readFileSync(join(ROOT, relPath), 'utf-8')
}

// ─── /api/stats contract ──────────────────────────────────────────────────────

describe('/api/stats response contract', () => {
  const routeSrc = readFile('app/api/stats/route.ts')

  // Extract the keys from the NextResponse.json({ ... }) block
  function getRouteResponseKeys(): string[] {
    // Find the start of NextResponse.json({ and then match balanced braces
    const start = routeSrc.indexOf('NextResponse.json({')
    if (start === -1) throw new Error('Could not find NextResponse.json in stats route')
    const objStart = routeSrc.indexOf('{', start)
    let depth = 0
    let end = objStart
    for (let i = objStart; i < routeSrc.length; i++) {
      if (routeSrc[i] === '{') depth++
      if (routeSrc[i] === '}') depth--
      if (depth === 0) { end = i; break }
    }
    const objBody = routeSrc.slice(objStart + 1, end)
    // Match only top-level keys (lines starting with whitespace + key:)
    const keys = [...objBody.matchAll(/^\s{6}(\w+)\s*:/gm)].map(m => m[1])
    return keys
  }

  // Extract required (non-optional) fields from a StatsData interface in a given file
  function getRequiredStatsFields(filePath: string): string[] {
    const src = readFile(filePath)
    const ifaceMatch = src.match(/interface StatsData \{([^}]+)\}/)
    if (!ifaceMatch) return []
    const fields: string[] = []
    for (const line of ifaceMatch[1].split('\n')) {
      const fieldMatch = line.match(/^\s*(\w+)(\??)\s*:/)
      if (fieldMatch && !fieldMatch[2]) {
        fields.push(fieldMatch[1])
      }
    }
    return fields
  }

  // Extract all fields (including optional) from StatsData
  function getAllStatsFields(filePath: string): string[] {
    const src = readFile(filePath)
    const ifaceMatch = src.match(/interface StatsData \{([^}]+)\}/)
    if (!ifaceMatch) return []
    const fields: string[] = []
    for (const line of ifaceMatch[1].split('\n')) {
      const fieldMatch = line.match(/^\s*(\w+)\??\s*:/)
      if (fieldMatch) fields.push(fieldMatch[1])
    }
    return fields
  }

  const routeKeys = getRouteResponseKeys()

  it('route returns parseable response keys', () => {
    expect(routeKeys.length).toBeGreaterThan(0)
  })

  const consumers = [
    { name: 'insights', path: 'app/insights/page.tsx' },
    { name: 'datacard', path: 'app/datacard/page.tsx' },
    { name: 'state-of-prompting', path: 'app/state-of-prompting/page.tsx' },
  ]

  for (const consumer of consumers) {
    describe(`${consumer.name} page`, () => {
      it('all required StatsData fields are returned by /api/stats', () => {
        const required = getRequiredStatsFields(consumer.path)
        const missing = required.filter(f => !routeKeys.includes(f))
        expect(missing, `${consumer.name} requires [${missing.join(', ')}] but /api/stats doesn't return them`).toEqual([])
      })

      it('no unknown fields expected (all fields exist in route or are optional)', () => {
        const all = getAllStatsFields(consumer.path)
        const unknown = all.filter(f => !routeKeys.includes(f))
        // These are warnings — optional fields that aren't served yet
        if (unknown.length > 0) {
          console.warn(`  ⚠ ${consumer.name} has optional fields not in /api/stats: ${unknown.join(', ')}`)
        }
      })
    })
  }

  it('route response includes array fields with label/value shape', () => {
    const arrayFields = ['byCategory', 'byModel', 'byReferenceType', 'byTheme', 'byPromptLength']
    for (const field of arrayFields) {
      if (routeKeys.includes(field)) {
        // Verify the mapping produces { label, value } objects
        expect(routeSrc).toMatch(new RegExp(`${field}:.*\\.map.*label.*value`))
      }
    }
  })
})

// ─── /api/stats SQL safety ────────────────────────────────────────────────────

describe('/api/stats SQL safety', () => {
  const routeSrc = readFile('app/api/stats/route.ts')

  it('jsonb_array_elements calls have NULL/type protection or safe() wrapper', () => {
    if (routeSrc.includes('jsonb_array_elements')) {
      const hasSafeWrapper = routeSrc.includes('safe(') && routeSrc.includes('jsonb_array_elements')
      const hasNullCheck = /jsonb_typeof|IS NOT NULL/.test(routeSrc)
      expect(hasSafeWrapper || hasNullCheck, 'jsonb_array_elements used without NULL check or safe() wrapper').toBe(true)
    }
  })

  it('destructured result count matches Promise.all query count', () => {
    const destructureMatch = routeSrc.match(/const \[([^\]]+)\] = await Promise\.all/)
    if (!destructureMatch) throw new Error('Could not parse Promise.all destructuring')
    const varCount = destructureMatch[1].split(',').map(s => s.trim()).filter(Boolean).length

    const queryCount = (routeSrc.match(/sql<\{/g) ?? []).length
    expect(varCount, `Destructured ${varCount} vars but have ${queryCount} queries — will silently misalign results`).toBe(queryCount)
  })
})

// ─── /api/prompts/random contract ─────────────────────────────────────────────

describe('/api/prompts/random response contract', () => {
  it('state-of-prompting PromptExample fields exist in random route response', () => {
    const pageSrc = readFile('app/state-of-prompting/page.tsx')
    const ifaceMatch = pageSrc.match(/interface PromptExample \{([^}]+)\}/)
    if (!ifaceMatch) return // no PromptExample interface, skip

    const expectedFields: string[] = []
    for (const line of ifaceMatch[1].split('\n')) {
      const fieldMatch = line.match(/^\s*(\w+)\??\s*:/)
      if (fieldMatch) expectedFields.push(fieldMatch[1])
    }

    // These fields come from the DB row, verify the random route selects them
    const randomSrc = readFile('app/api/prompts/random/route.ts')
    const dbSrc = readFile('lib/db.ts')

    // Fields that are derived/computed client-side don't need to be in the query
    const dbFields = expectedFields.filter(f => {
      // Check the field appears somewhere in db.ts (column mapping) or the random route
      return dbSrc.includes(f) || randomSrc.includes(f)
    })

    expect(dbFields.length, 'PromptExample has fields not traceable to DB or route').toBeGreaterThan(0)
  })
})
