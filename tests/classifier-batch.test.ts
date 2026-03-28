import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Anthropic SDK before importing the module under test
const mockCreate = vi.fn()
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate }
  },
}))

// Set API key so getClient() doesn't throw
process.env.ANTHROPIC_API_KEY = 'test-key'

import { classifyBatch, classifyPromptBatch } from '../lib/classifier'

function toolUseResponse(input: unknown) {
  return {
    stop_reason: 'tool_use',
    content: [{ type: 'tool_use', name: 'classify_tweets', input }],
  }
}

function promptToolUseResponse(input: unknown) {
  return {
    stop_reason: 'tool_use',
    content: [{ type: 'tool_use', name: 'classify_prompts', input }],
  }
}

beforeEach(() => {
  mockCreate.mockReset()
})

// ─── classifyBatch ───────────────────────────────────────────────────────────

describe('classifyBatch', () => {
  it('happy path: returns valid classifications', async () => {
    mockCreate.mockResolvedValue(toolUseResponse({
      results: [
        { tweet_id: 't1', category: 'prompts', confidence: 0.9, rationale: 'It is a prompt' },
        { tweet_id: 't2', category: 'tech_ai_product', confidence: 0.85, rationale: 'Tech content' },
      ],
    }))

    const result = await classifyBatch([
      { tweet_id: 't1', tweet_text: 'A beautiful landscape --ar 16:9' },
      { tweet_id: 't2', tweet_text: 'New AI startup launches' },
    ])

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ tweet_id: 't1', category: 'prompts', confidence: 0.9 })
    expect(result[1]).toMatchObject({ tweet_id: 't2', category: 'tech_ai_product', confidence: 0.85 })
  })

  it('low confidence forces uncategorized', async () => {
    mockCreate.mockResolvedValue(toolUseResponse({
      results: [
        { tweet_id: 't1', category: 'tech_ai_product', confidence: 0.5, rationale: 'Not sure' },
      ],
    }))

    const result = await classifyBatch([{ tweet_id: 't1', tweet_text: 'ambiguous tweet' }])
    expect(result[0].category).toBe('uncategorized')
  })

  it('invalid category from API becomes uncategorized', async () => {
    mockCreate.mockResolvedValue(toolUseResponse({
      results: [
        { tweet_id: 't1', category: 'invalid_category', confidence: 0.9, rationale: 'wrong' },
      ],
    }))

    const result = await classifyBatch([{ tweet_id: 't1', tweet_text: 'test' }])
    expect(result[0].category).toBe('uncategorized')
  })

  it('filters out tweet_ids not in input', async () => {
    mockCreate.mockResolvedValue(toolUseResponse({
      results: [
        { tweet_id: 't1', category: 'prompts', confidence: 0.9, rationale: 'ok' },
        { tweet_id: 'unknown_id', category: 'prompts', confidence: 0.9, rationale: 'ghost' },
      ],
    }))

    const result = await classifyBatch([{ tweet_id: 't1', tweet_text: 'test' }])
    expect(result).toHaveLength(1)
    expect(result[0].tweet_id).toBe('t1')
  })

  it('throws when no tool_use block in response', async () => {
    mockCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'I cannot classify these.' }],
    })

    await expect(classifyBatch([{ tweet_id: 't1', tweet_text: 'test' }]))
      .rejects.toThrow('No tool_use block')
  })

  it('handles empty results array', async () => {
    mockCreate.mockResolvedValue(toolUseResponse({ results: [] }))
    const result = await classifyBatch([{ tweet_id: 't1', tweet_text: 'test' }])
    expect(result).toEqual([])
  })

  it('coerces confidence to number', async () => {
    mockCreate.mockResolvedValue(toolUseResponse({
      results: [
        { tweet_id: 't1', category: 'prompts', confidence: '0.9', rationale: 'ok' },
      ],
    }))

    const result = await classifyBatch([{ tweet_id: 't1', tweet_text: 'test' }])
    expect(typeof result[0].confidence).toBe('number')
  })
})

// ─── classifyPromptBatch ─────────────────────────────────────────────────────

describe('classifyPromptBatch', () => {
  it('maps sequential IDs back to original UUIDs', async () => {
    mockCreate.mockResolvedValue(promptToolUseResponse({
      results: [
        {
          id: '1',
          prompt_category: 'image_t2i',
          detected_model: 'Midjourney',
          extracted_prompt: 'a cat',
          prompt_themes: ['person'],
          art_styles: ['photorealistic'],
          requires_reference: false,
          reference_type: null,
        },
        {
          id: '2',
          prompt_category: 'video_t2v',
          detected_model: null,
          extracted_prompt: 'a dog running',
          prompt_themes: ['cinematic'],
          art_styles: [],
          requires_reference: false,
          reference_type: null,
        },
      ],
    }))

    const result = await classifyPromptBatch([
      { id: 'uuid-aaa', tweet_text: 'prompt 1', thread_tweets: [] },
      { id: 'uuid-bbb', tweet_text: 'prompt 2', thread_tweets: [] },
    ])

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('uuid-aaa')
    expect(result[1].id).toBe('uuid-bbb')
  })

  it('normalises detected_model via normaliseModel', async () => {
    mockCreate.mockResolvedValue(promptToolUseResponse({
      results: [{
        id: '1',
        prompt_category: 'image_t2i',
        detected_model: 'mj',
        extracted_prompt: 'test',
        prompt_themes: [],
        art_styles: [],
        requires_reference: false,
        reference_type: null,
      }],
    }))

    const result = await classifyPromptBatch([
      { id: 'uuid-1', tweet_text: 'test', thread_tweets: [] },
    ])
    expect(result[0].detected_model).toBe('Midjourney')
  })

  it('filters invalid prompt_themes', async () => {
    mockCreate.mockResolvedValue(promptToolUseResponse({
      results: [{
        id: '1',
        prompt_category: 'image_t2i',
        detected_model: null,
        extracted_prompt: 'test',
        prompt_themes: ['person', 'INVALID_THEME', 'cinematic'],
        art_styles: [],
        requires_reference: false,
        reference_type: null,
      }],
    }))

    const result = await classifyPromptBatch([
      { id: 'uuid-1', tweet_text: 'test', thread_tweets: [] },
    ])
    expect(result[0].prompt_themes).toEqual(['person', 'cinematic'])
  })

  it('filters invalid art_styles', async () => {
    mockCreate.mockResolvedValue(promptToolUseResponse({
      results: [{
        id: '1',
        prompt_category: 'image_t2i',
        detected_model: null,
        extracted_prompt: 'test',
        prompt_themes: [],
        art_styles: ['photorealistic', 'BOGUS', 'anime'],
        requires_reference: false,
        reference_type: null,
      }],
    }))

    const result = await classifyPromptBatch([
      { id: 'uuid-1', tweet_text: 'test', thread_tweets: [] },
    ])
    expect(result[0].art_styles).toEqual(['photorealistic', 'anime'])
  })

  it('defaults invalid prompt_category to other', async () => {
    mockCreate.mockResolvedValue(promptToolUseResponse({
      results: [{
        id: '1',
        prompt_category: 'INVALID',
        detected_model: null,
        extracted_prompt: 'test',
        prompt_themes: [],
        art_styles: [],
        requires_reference: false,
        reference_type: null,
      }],
    }))

    const result = await classifyPromptBatch([
      { id: 'uuid-1', tweet_text: 'test', thread_tweets: [] },
    ])
    expect(result[0].prompt_category).toBe('other')
  })

  it('invalidates unknown reference_type', async () => {
    mockCreate.mockResolvedValue(promptToolUseResponse({
      results: [{
        id: '1',
        prompt_category: 'image_r2i',
        detected_model: null,
        extracted_prompt: 'test',
        prompt_themes: [],
        art_styles: [],
        requires_reference: true,
        reference_type: 'UNKNOWN_REF',
      }],
    }))

    const result = await classifyPromptBatch([
      { id: 'uuid-1', tweet_text: 'test', thread_tweets: [] },
    ])
    expect(result[0].reference_type).toBeNull()
  })

  it('uses positional fallback when no IDs match', async () => {
    // Model returns IDs that don't match our sequential indices
    mockCreate.mockResolvedValue(promptToolUseResponse({
      results: [
        {
          id: 'garbage-id-1',
          prompt_category: 'image_t2i',
          detected_model: null,
          extracted_prompt: 'first',
          prompt_themes: [],
          art_styles: [],
          requires_reference: false,
          reference_type: null,
        },
        {
          id: 'garbage-id-2',
          prompt_category: 'video_t2v',
          detected_model: null,
          extracted_prompt: 'second',
          prompt_themes: [],
          art_styles: [],
          requires_reference: false,
          reference_type: null,
        },
      ],
    }))

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await classifyPromptBatch([
      { id: 'uuid-aaa', tweet_text: 'prompt 1', thread_tweets: [] },
      { id: 'uuid-bbb', tweet_text: 'prompt 2', thread_tweets: [] },
    ])

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('uuid-aaa') // positional: index 0 → first prompt
    expect(result[1].id).toBe('uuid-bbb')
    expect(result[0].extracted_prompt).toBe('first')
    expect(result[1].extracted_prompt).toBe('second')

    consoleSpy.mockRestore()
  })

  it('handles integer IDs from model (coerced to string)', async () => {
    mockCreate.mockResolvedValue(promptToolUseResponse({
      results: [{
        id: 1, // integer, not string
        prompt_category: 'image_t2i',
        detected_model: null,
        extracted_prompt: 'test',
        prompt_themes: [],
        art_styles: [],
        requires_reference: false,
        reference_type: null,
      }],
    }))

    const result = await classifyPromptBatch([
      { id: 'uuid-1', tweet_text: 'test', thread_tweets: [] },
    ])
    expect(result[0].id).toBe('uuid-1')
  })
})
