import { describe, it, expect, vi } from 'vitest'
import { normaliseModel, preprocessTweet, withRetry } from '../lib/classifier'

// ─── normaliseModel ──────────────────────────────────────────────────────────

describe('normaliseModel', () => {
  it('returns null for null input', () => {
    expect(normaliseModel(null)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(normaliseModel('')).toBeNull()
  })

  const cases: [string, string][] = [
    // Midjourney
    ['midjourney', 'Midjourney'],
    ['mj', 'Midjourney'],
    ['mid journey', 'Midjourney'],
    ['MIDJOURNEY', 'Midjourney'],
    // DALL-E
    ['dall-e', 'DALL-E'],
    ['dalle', 'DALL-E'],
    ['dall e', 'DALL-E'],
    ['dall-e 3', 'DALL-E'],
    // Flux
    ['flux', 'Flux'],
    ['flux.1', 'Flux'],
    // Stable Diffusion
    ['stable diffusion', 'Stable Diffusion'],
    ['sd', 'Stable Diffusion'],
    ['sdxl', 'Stable Diffusion'],
    // Firefly
    ['firefly', 'Firefly'],
    ['adobe firefly', 'Firefly'],
    // Runway
    ['runway', 'Runway'],
    ['runway gen3', 'Runway'],
    ['runway gen-4', 'Runway'],
    // Kling
    ['kling', 'Kling'],
    // Pika
    ['pika', 'Pika'],
    ['pika labs', 'Pika'],
    // Luma
    ['luma', 'Luma'],
    ['luma dream machine', 'Luma'],
    // Hailuo
    ['hailuo', 'Hailuo'],
    // Sora
    ['sora', 'Sora'],
    // Veo
    ['veo', 'Veo'],
    ['veo 3', 'Veo'],
    // Aurora / Grok
    ['aurora', 'Aurora'],
    ['grok imagine', 'Aurora'],
    // Audio
    ['suno', 'Suno'],
    ['udio', 'Udio'],
    ['elevenlabs', 'ElevenLabs'],
    // LLMs
    ['chatgpt', 'ChatGPT'],
    ['gpt-4', 'ChatGPT'],
    ['claude', 'Claude'],
    ['gemini', 'Nano Banana'],
    // 3D
    ['meshy', 'Meshy'],
    ['tripo3d', 'Tripo3D'],
  ]

  it.each(cases)('normalises "%s" → "%s"', (input, expected) => {
    expect(normaliseModel(input)).toBe(expected)
  })

  it('is case insensitive', () => {
    expect(normaliseModel('MIDJOURNEY')).toBe('Midjourney')
    expect(normaliseModel('Dall-E')).toBe('DALL-E')
  })

  it('trims whitespace', () => {
    expect(normaliseModel('  flux  ')).toBe('Flux')
  })

  it('maps gemini to Veo for video categories', () => {
    expect(normaliseModel('gemini', 'video_t2v')).toBe('Veo')
    expect(normaliseModel('gemini', 'video_i2v')).toBe('Veo')
    expect(normaliseModel('nano banana', 'video_r2v')).toBe('Veo')
  })

  it('maps gemini to Nano Banana for non-video categories', () => {
    expect(normaliseModel('gemini', 'image_t2i')).toBe('Nano Banana')
    expect(normaliseModel('gemini')).toBe('Nano Banana')
  })

  it('returns null for unknown models (closed enum)', () => {
    expect(normaliseModel('SomeNewModel')).toBeNull()
    expect(normaliseModel('  NewModel  ')).toBeNull()
  })
})

// ─── preprocessTweet ─────────────────────────────────────────────────────────

describe('preprocessTweet', () => {
  it('strips t.co URLs', () => {
    expect(preprocessTweet('check https://t.co/abc123 out')).toBe('check out')
  })

  it('strips multiple t.co URLs', () => {
    expect(preprocessTweet('https://t.co/a https://t.co/b text')).toBe('text')
  })

  it('strips hashtags', () => {
    expect(preprocessTweet('hello #world #test')).toBe('hello')
  })

  it('strips mid-text hashtags', () => {
    expect(preprocessTweet('hello #midjourney prompt')).toBe('hello prompt')
  })

  it('collapses whitespace', () => {
    expect(preprocessTweet('too   many    spaces')).toBe('too many spaces')
  })

  it('preserves Midjourney params like --ar 16:9', () => {
    const input = 'A cat --ar 16:9 --v 6'
    expect(preprocessTweet(input)).toBe('A cat --ar 16:9 --v 6')
  })

  it('handles empty string', () => {
    expect(preprocessTweet('')).toBe('')
  })

  it('handles text that is only URLs and hashtags', () => {
    const result = preprocessTweet('https://t.co/abc #tag')
    expect(result).toBe('')
  })
})

// ─── withRetry ───────────────────────────────────────────────────────────────

describe('withRetry', () => {
  it('returns on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn, 3, 1)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure then succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')
    const result = await withRetry(fn, 3, 1)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'))
    await expect(withRetry(fn, 2, 1)).rejects.toThrow('always fail')
    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it('retries the correct number of times', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))
    await expect(withRetry(fn, 0, 1)).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(1) // no retries
  })
})
