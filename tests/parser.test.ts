import { describe, it, expect } from 'vitest'
import { parseTwitterArchiveJson, parseCsv, parseUpload } from '../lib/parser'

// ─── parseTwitterArchiveJson ─────────────────────────────────────────────────

describe('parseTwitterArchiveJson', () => {
  it('parses window.YTD wrapper format', () => {
    const raw = `window.YTD.bookmarks.part0 = [{"tweet":{"id_str":"123","full_text":"hello world","user":{"screen_name":"alice","name":"Alice"}}}];`
    const result = parseTwitterArchiveJson(raw)
    expect(result).toHaveLength(1)
    expect(result[0].tweet_id).toBe('123')
    expect(result[0].tweet_text).toBe('hello world')
    expect(result[0].author_handle).toBe('alice')
    expect(result[0].author_name).toBe('Alice')
    expect(result[0].tweet_url).toBe('https://x.com/alice/status/123')
  })

  it('parses window.YTD wrapper without trailing semicolon', () => {
    const raw = `window.YTD.bookmarks.part0 = [{"tweet":{"id_str":"456","full_text":"no semicolon","user":{"screen_name":"bob"}}}]`
    const result = parseTwitterArchiveJson(raw)
    expect(result).toHaveLength(1)
    expect(result[0].tweet_id).toBe('456')
  })

  it('parses raw JSON array', () => {
    const raw = JSON.stringify([
      { tweet: { id_str: '789', full_text: 'raw array', user: { screen_name: 'carol' } } },
    ])
    const result = parseTwitterArchiveJson(raw)
    expect(result).toHaveLength(1)
    expect(result[0].tweet_id).toBe('789')
  })

  it('parses flat tweet format (no .tweet wrapper)', () => {
    const raw = JSON.stringify([
      { id_str: '100', full_text: 'flat format', user: { screen_name: 'dave' } },
    ])
    const result = parseTwitterArchiveJson(raw)
    expect(result).toHaveLength(1)
    expect(result[0].tweet_id).toBe('100')
    expect(result[0].tweet_text).toBe('flat format')
  })

  it('strips t.co URLs from tweet_text', () => {
    const raw = JSON.stringify([
      { tweet: { id_str: '200', full_text: 'check this https://t.co/abc123 out', user: { screen_name: 'eve' } } },
    ])
    const result = parseTwitterArchiveJson(raw)
    expect(result[0].tweet_text).toBe('check this  out')
  })

  it('extracts media from extended_entities over entities', () => {
    const raw = JSON.stringify([{
      tweet: {
        id_str: '300',
        full_text: 'media test',
        user: { screen_name: 'frank' },
        entities: { media: [{ media_url_https: 'https://entities.jpg' }] },
        extended_entities: { media: [{ media_url_https: 'https://extended.jpg' }] },
      },
    }])
    const result = parseTwitterArchiveJson(raw)
    expect(result[0].media_urls).toEqual(['https://extended.jpg'])
  })

  it('falls back to entities when extended_entities absent', () => {
    const raw = JSON.stringify([{
      tweet: {
        id_str: '301',
        full_text: 'fallback media',
        user: { screen_name: 'grace' },
        entities: { media: [{ media_url_https: 'https://fallback.jpg' }] },
      },
    }])
    const result = parseTwitterArchiveJson(raw)
    expect(result[0].media_urls).toEqual(['https://fallback.jpg'])
  })

  it('skips entries missing required fields', () => {
    const raw = JSON.stringify([
      { tweet: { id_str: '400', user: { screen_name: 'hal' } } },              // no text
      { tweet: { full_text: 'no id', user: { screen_name: 'iris' } } },        // no id
      { tweet: { id_str: '401', full_text: 'no user' } },                       // no handle
    ])
    const result = parseTwitterArchiveJson(raw)
    expect(result).toHaveLength(0)
  })

  it('uses id fallback when id_str absent', () => {
    const raw = JSON.stringify([
      { tweet: { id: '500', full_text: 'id fallback', user: { screen_name: 'jay' } } },
    ])
    const result = parseTwitterArchiveJson(raw)
    expect(result[0].tweet_id).toBe('500')
  })

  it('uses text fallback when full_text absent', () => {
    const raw = JSON.stringify([
      { tweet: { id_str: '600', text: 'text fallback', user: { screen_name: 'kim' } } },
    ])
    const result = parseTwitterArchiveJson(raw)
    expect(result[0].tweet_text).toBe('text fallback')
  })

  it('throws on malformed JSON', () => {
    expect(() => parseTwitterArchiveJson('not json {')).toThrow()
  })

  it('returns empty array for empty JSON array', () => {
    expect(parseTwitterArchiveJson('[]')).toEqual([])
  })

  it('parses bookmarked_at from created_at field', () => {
    const raw = JSON.stringify([
      { tweet: { id_str: '700', full_text: 'dated', user: { screen_name: 'lee' }, created_at: 'Wed Oct 10 20:19:24 +0000 2018' } },
    ])
    const result = parseTwitterArchiveJson(raw)
    expect(result[0].bookmarked_at).toBeTruthy()
    expect(new Date(result[0].bookmarked_at!).getFullYear()).toBe(2018)
  })

  it('sets bookmarked_at to null when created_at missing', () => {
    const raw = JSON.stringify([
      { tweet: { id_str: '701', full_text: 'no date', user: { screen_name: 'mo' } } },
    ])
    const result = parseTwitterArchiveJson(raw)
    expect(result[0].bookmarked_at).toBeNull()
  })
})

// ─── parseCsv ────────────────────────────────────────────────────────────────

describe('parseCsv', () => {
  it('parses standard columns', () => {
    const csv = `tweet_id,tweet_text,author_handle,author_name,tweet_url,bookmarked_at
123,hello world,alice,Alice,https://x.com/alice/status/123,2024-01-01`
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      tweet_id: '123',
      tweet_text: 'hello world',
      author_handle: 'alice',
      author_name: 'Alice',
      tweet_url: 'https://x.com/alice/status/123',
      bookmarked_at: '2024-01-01',
    })
  })

  it('handles column aliases: url, content, username', () => {
    const csv = `id,content,username
456,alt columns,bob`
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].tweet_id).toBe('456')
    expect(result[0].tweet_text).toBe('alt columns')
    expect(result[0].author_handle).toBe('bob')
  })

  it('extracts tweet_id from URL when id column missing', () => {
    const csv = `url,text,username
https://x.com/carol/status/789,from url,carol`
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].tweet_id).toBe('789')
  })

  it('handles quoted fields with commas', () => {
    const csv = `tweet_id,tweet_text,author_handle
100,"hello, world",dave`
    const result = parseCsv(csv)
    expect(result[0].tweet_text).toBe('hello, world')
  })

  it('handles escaped quotes in CSV', () => {
    const csv = `tweet_id,tweet_text,author_handle
101,"He said ""hello""",eve`
    const result = parseCsv(csv)
    expect(result[0].tweet_text).toBe('He said "hello"')
  })

  it('skips rows with missing required fields', () => {
    const csv = `tweet_id,tweet_text,author_handle
,,missing_all
200,has text but no handle,
,no id,frank`
    const result = parseCsv(csv)
    expect(result).toHaveLength(0)
  })

  it('returns empty for header-only file', () => {
    expect(parseCsv('tweet_id,tweet_text,author_handle')).toEqual([])
  })

  it('returns empty for empty string', () => {
    expect(parseCsv('')).toEqual([])
  })

  it('handles Windows \\r\\n line endings', () => {
    const csv = `tweet_id,tweet_text,author_handle\r\n300,windows line,grace`
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].tweet_id).toBe('300')
  })

  it('builds tweet_url from handle and id when url missing', () => {
    const csv = `tweet_id,tweet_text,author_handle
400,no url,hal`
    const result = parseCsv(csv)
    expect(result[0].tweet_url).toBe('https://x.com/hal/status/400')
  })

  it('sets media_urls to empty array', () => {
    const csv = `tweet_id,tweet_text,author_handle
500,test,iris`
    const result = parseCsv(csv)
    expect(result[0].media_urls).toEqual([])
  })

  it('handles date column aliases: created_at, date', () => {
    const csv = `tweet_id,tweet_text,author_handle,created_at
600,test,jay,2024-06-15`
    const result = parseCsv(csv)
    expect(result[0].bookmarked_at).toBe('2024-06-15')
  })
})

// ─── parseUpload ─────────────────────────────────────────────────────────────

describe('parseUpload', () => {
  it('routes .csv to parseCsv', () => {
    const csv = `tweet_id,tweet_text,author_handle\n100,csv route,alice`
    const result = parseUpload(csv, 'data.csv')
    expect(result).toHaveLength(1)
    expect(result[0].tweet_text).toBe('csv route')
  })

  it('routes .CSV (uppercase) to parseCsv', () => {
    const csv = `tweet_id,tweet_text,author_handle\n101,upper,bob`
    const result = parseUpload(csv, 'DATA.CSV')
    expect(result).toHaveLength(1)
  })

  it('routes .json to parseTwitterArchiveJson', () => {
    const json = JSON.stringify([
      { tweet: { id_str: '200', full_text: 'json route', user: { screen_name: 'carol' } } },
    ])
    const result = parseUpload(json, 'bookmarks.json')
    expect(result).toHaveLength(1)
    expect(result[0].tweet_text).toBe('json route')
  })

  it('treats unknown extension as JSON', () => {
    const json = JSON.stringify([
      { tweet: { id_str: '300', full_text: 'unknown ext', user: { screen_name: 'dave' } } },
    ])
    const result = parseUpload(json, 'data.txt')
    expect(result).toHaveLength(1)
  })
})
