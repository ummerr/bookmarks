import { describe, it, expect } from 'vitest'
import { detectMultiShot, toArray, toBookmark } from '../lib/db'

// ─── detectMultiShot ─────────────────────────────────────────────────────────

describe('detectMultiShot', () => {
  it('detects timestamp syntax [0s]...[3s]', () => {
    expect(detectMultiShot('[0s] A cat walking. [3s] The cat sits down.')).toBe(true)
  })

  it('detects range timestamp syntax [0s-3s]...[3s-6s]', () => {
    expect(detectMultiShot('[0s-3s] Opening shot. [3s-6s] Zoom in.')).toBe(true)
  })

  it('detects Shot 1...Shot 2', () => {
    expect(detectMultiShot('Shot 1: wide angle. Shot 2: close-up.')).toBe(true)
  })

  it('detects Shot1...Shot2 (no space)', () => {
    expect(detectMultiShot('Shot1: wide. Shot2: close.')).toBe(true)
  })

  it('detects Cut 1...Cut 2', () => {
    expect(detectMultiShot('Cut 1: exterior. Cut 2: interior.')).toBe(true)
  })

  it('detects Scene 1...Scene 2', () => {
    expect(detectMultiShot('Scene 1: sunrise. Scene 2: sunset.')).toBe(true)
  })

  it('detects Clip 1...Clip 2', () => {
    expect(detectMultiShot('Clip 1: intro. Clip 2: main.')).toBe(true)
  })

  it('detects ordinal shot labels', () => {
    expect(detectMultiShot('First shot: wide. Second shot: close.')).toBe(true)
  })

  it('is case insensitive', () => {
    expect(detectMultiShot('SHOT 1: wide. shot 2: close.')).toBe(true)
  })

  it('returns false for single occurrence', () => {
    expect(detectMultiShot('Shot 1: the only shot.')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(detectMultiShot('')).toBe(false)
  })

  it('returns false for null-ish input', () => {
    // @ts-expect-error testing runtime safety
    expect(detectMultiShot(null)).toBe(false)
    // @ts-expect-error testing runtime safety
    expect(detectMultiShot(undefined)).toBe(false)
  })

  it('returns false for normal text without shot syntax', () => {
    expect(detectMultiShot('A beautiful landscape with mountains and rivers.')).toBe(false)
  })
})

// ─── toArray ─────────────────────────────────────────────────────────────────

describe('toArray', () => {
  it('passes through actual arrays', () => {
    const arr = ['a', 'b']
    expect(toArray(arr)).toBe(arr)
  })

  it('parses JSON string arrays', () => {
    expect(toArray('["a","b"]')).toEqual(['a', 'b'])
  })

  it('returns [] for non-array JSON string', () => {
    expect(toArray('"hello"')).toEqual([])
  })

  it('returns [] for malformed string', () => {
    expect(toArray('not json')).toEqual([])
  })

  it('returns [] for null', () => {
    expect(toArray(null)).toEqual([])
  })

  it('returns [] for undefined', () => {
    expect(toArray(undefined)).toEqual([])
  })

  it('returns [] for number', () => {
    expect(toArray(42)).toEqual([])
  })

  it('returns [] for empty object', () => {
    expect(toArray({})).toEqual([])
  })
})

// ─── toBookmark ──────────────────────────────────────────────────────────────

describe('toBookmark', () => {
  const baseRow = {
    id: 'abc-123',
    tweet_id: 't-456',
    tweet_text: 'hello world',
    author_handle: 'alice',
    author_name: 'Alice',
    tweet_url: 'https://x.com/alice/status/456',
    media_urls: ['https://img.jpg'],
    media_alt_texts: [],
    thread_tweets: [],
    prompt_themes: [],
    art_styles: [],
    category: 'prompts',
    confidence: '0.95',
    rationale: 'test',
    is_thread: false,
    user_notes: null,
    prompt_category: 'image_t2i',
    extracted_prompt: null,
    detected_model: 'Midjourney',
    requires_reference: false,
    reference_type: null,
    source: 'twitter',
    bookmarked_at: '2024-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  it('converts a full row to correct Bookmark shape', () => {
    const bm = toBookmark({ ...baseRow })
    expect(bm.id).toBe('abc-123')
    expect(bm.tweet_id).toBe('t-456')
    expect(bm.confidence).toBe(0.95) // coerced to number
    expect(bm.media_urls).toEqual(['https://img.jpg'])
    expect(bm.source).toBe('twitter')
  })

  it('parses string-encoded media_urls', () => {
    const bm = toBookmark({ ...baseRow, media_urls: '["https://a.jpg","https://b.jpg"]' })
    expect(bm.media_urls).toEqual(['https://a.jpg', 'https://b.jpg'])
  })

  it('parses string-encoded thread_tweets', () => {
    const threads = [{ tweet_id: '1', tweet_text: 'thread' }]
    const bm = toBookmark({ ...baseRow, thread_tweets: JSON.stringify(threads) })
    expect(bm.thread_tweets).toEqual(threads)
  })

  it('computes is_multi_shot from extracted_prompt', () => {
    const bm = toBookmark({ ...baseRow, extracted_prompt: 'Shot 1: wide. Shot 2: close.' })
    expect(bm.is_multi_shot).toBe(true)
  })

  it('computes is_multi_shot from tweet_text when extracted_prompt is null', () => {
    const bm = toBookmark({ ...baseRow, tweet_text: '[0s] cat. [3s] dog.', extracted_prompt: null })
    expect(bm.is_multi_shot).toBe(true)
  })

  it('is_multi_shot is false for normal text', () => {
    const bm = toBookmark({ ...baseRow, tweet_text: 'normal text', extracted_prompt: null })
    expect(bm.is_multi_shot).toBe(false)
  })

  it('defaults source to twitter when missing', () => {
    const bm = toBookmark({ ...baseRow, source: undefined })
    expect(bm.source).toBe('twitter')
  })

  it('handles null prompt_themes via toArray', () => {
    const bm = toBookmark({ ...baseRow, prompt_themes: null })
    expect(bm.prompt_themes).toEqual([])
  })

  it('handles string-encoded prompt_themes', () => {
    const bm = toBookmark({ ...baseRow, prompt_themes: '["person","cinematic"]' })
    expect(bm.prompt_themes).toEqual(['person', 'cinematic'])
  })

  it('coerces confidence to number', () => {
    const bm = toBookmark({ ...baseRow, confidence: '0' })
    expect(bm.confidence).toBe(0)
    expect(typeof bm.confidence).toBe('number')
  })

  it('defaults missing optional fields to null', () => {
    const bm = toBookmark({ ...baseRow, prompt_category: undefined, detected_model: undefined })
    expect(bm.prompt_category).toBeNull()
    expect(bm.detected_model).toBeNull()
  })
})
