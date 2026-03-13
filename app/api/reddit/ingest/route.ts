import { NextRequest, NextResponse } from 'next/server'
import { insertBookmarks } from '@/lib/db'
import type { BookmarkInsert } from '@/lib/types'

export const maxDuration = 120

const REDDIT_HEADERS = {
  'User-Agent': 'bookmarks-app/1.0 (prompt collection tool)',
}

// Public subreddits rich in AI prompts
const PROMPT_SUBREDDITS = [
  'midjourney',
  'StableDiffusion',
  'dalle',
  'FluxAI',
  'AIArt',
  'PromptEngineering',
  'aipromptprogramming',
]

// Flairs that signal meta/discussion content rather than actual prompts
const SKIP_FLAIR_PATTERNS = /discussion|question|help|meme|weekly|monthly|meta|announcement|rant|news|article|tutorial|guide|workflow diagram|mod post/i

type TimeFilter = 'week' | 'month' | 'year' | 'all'

interface RedditPost {
  id: string
  title: string
  selftext: string
  author: string
  permalink: string
  url: string
  created_utc: number
  score: number
  link_flair_text?: string | null
  post_hint?: string
  is_gallery?: boolean
  gallery_data?: { items: { media_id: string }[] }
  media_metadata?: Record<string, { s?: { u?: string } }>
  preview?: { images: { source: { url: string } }[] }
}

interface RedditComment {
  body: string
  author: string
  score: number
  is_submitter: boolean
}

// ── Quality filters ───────────────────────────────────────────────────────

function isValidPost(post: RedditPost, minScore: number): boolean {
  // Hard rejections
  if (post.author === '[deleted]' || post.author === 'AutoModerator') return false
  if (post.selftext === '[removed]' || post.selftext === '[deleted]') return false
  if (post.score < minScore) return false

  // Skip meta flairs
  if (post.link_flair_text && SKIP_FLAIR_PATTERNS.test(post.link_flair_text)) return false

  // Require some content signal: image, gallery, meaningful body, or long-ish title
  const hasImage = post.post_hint === 'image' || post.is_gallery || !!post.preview?.images?.length
  const hasMeaningfulBody = post.selftext.trim().length > 30
    && !isJustUrl(post.selftext.trim())
  const titleLooksLikePrompt = post.title.length > 60

  return hasImage || hasMeaningfulBody || titleLooksLikePrompt
}

function isJustUrl(text: string): boolean {
  return /^https?:\/\/\S+$/.test(text.trim())
}

// ── Prompt extraction helpers ─────────────────────────────────────────────

// Pull out backtick-fenced or "Prompt:" labelled text from raw Reddit markdown
function extractPromptFromText(text: string): string | null {
  // Backtick code block: ```...```
  const fenced = text.match(/```[\s\S]*?```/g)
  if (fenced) {
    const content = fenced.map((b) => b.replace(/```/g, '').trim()).join('\n\n')
    if (content.length > 20) return content
  }

  // Inline backtick: `...` (long enough to be a prompt)
  const inline = text.match(/`([^`]{30,})`/)
  if (inline) return inline[1].trim()

  // Explicit label: "Prompt:", "Positive prompt:", "Negative prompt:", etc.
  const labeled = text.match(/(?:positive\s+)?prompt\s*[:\-]\s*([\s\S]{20,}?)(?:\n\n|\nnegative|\nsteps|\nseed|\nmodel|$)/i)
  if (labeled) return labeled[1].trim()

  return null
}

// ── Comment fetching ──────────────────────────────────────────────────────

async function fetchPromptFromComments(subreddit: string, postId: string): Promise<string | null> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=10&depth=1&sort=top`
    const res = await fetch(url, { headers: REDDIT_HEADERS, next: { revalidate: 0 } })
    if (!res.ok) return null

    const json = await res.json()
    const comments: RedditComment[] = (json?.[1]?.data?.children ?? [])
      .map((c: { data: RedditComment }) => c.data)
      .filter((c: RedditComment) => c.body && c.body !== '[deleted]' && c.body !== '[removed]')

    // Sort: OP comments first, then by score
    comments.sort((a, b) => {
      if (a.is_submitter !== b.is_submitter) return a.is_submitter ? -1 : 1
      return b.score - a.score
    })

    for (const comment of comments.slice(0, 5)) {
      // Try structured extraction first
      const extracted = extractPromptFromText(comment.body)
      if (extracted) return extracted

      // Fall back to whole comment if it looks like a prompt (long, descriptive)
      if (comment.body.length > 80 && !comment.body.startsWith('http')) {
        return comment.body.trim()
      }
    }
  } catch {
    // Ignore comment fetch errors — best-effort only
  }
  return null
}

// ── Media extraction ──────────────────────────────────────────────────────

function extractMediaUrls(post: RedditPost): string[] {
  if (post.is_gallery && post.gallery_data && post.media_metadata) {
    return post.gallery_data.items
      .map((item) => post.media_metadata![item.media_id]?.s?.u)
      .filter(Boolean)
      .map((u) => u!.replace(/&amp;/g, '&'))
  }

  const previewUrl = post.preview?.images?.[0]?.source?.url
  if (previewUrl) return [previewUrl.replace(/&amp;/g, '&')]

  if (post.url && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(post.url)) {
    return [post.url]
  }

  return []
}

// ── Post → Bookmark ───────────────────────────────────────────────────────

async function buildBookmark(
  post: RedditPost,
  subreddit: string,
  fetchComments: boolean
): Promise<BookmarkInsert> {
  const selftext = post.selftext?.trim()
  const hasBody = selftext && selftext.length > 30 && !isJustUrl(selftext)

  // Try to extract a clean prompt from the body first
  let promptText: string | null = hasBody ? extractPromptFromText(selftext) : null

  // If no prompt in body, check comments (only for image posts where prompt is commonly there)
  const hasImage = !!extractMediaUrls(post).length
  if (!promptText && !hasBody && hasImage && fetchComments) {
    promptText = await fetchPromptFromComments(subreddit, post.id)
  }

  // Assemble final text: extracted prompt takes priority, otherwise title + body
  let text: string
  if (promptText) {
    text = `${post.title}\n\n${promptText}`.slice(0, 5000)
  } else if (hasBody) {
    text = `${post.title}\n\n${selftext}`.slice(0, 5000)
  } else {
    text = post.title
  }

  return {
    tweet_id: `reddit_${post.id}`,
    tweet_text: text,
    author_handle: post.author,
    author_name: `r/${subreddit}`,  // subreddit stored here for later filtering
    tweet_url: `https://reddit.com${post.permalink}`,
    media_urls: extractMediaUrls(post),
    category: 'uncategorized',
    confidence: 0,
    bookmarked_at: new Date(post.created_utc * 1000).toISOString(),
    source: 'reddit',
  }
}

// ── Subreddit fetch ───────────────────────────────────────────────────────

async function fetchSubreddit(subreddit: string, timeFilter: TimeFilter, limit: number): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=${timeFilter}`
  const res = await fetch(url, { headers: REDDIT_HEADERS, next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Reddit API ${res.status} for r/${subreddit}`)
  const json = await res.json()
  return (json?.data?.children ?? []).map((c: { data: RedditPost }) => c.data)
}

// ── Route ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const subreddits: string[] = Array.isArray(body.subreddits) && body.subreddits.length
      ? body.subreddits
      : PROMPT_SUBREDDITS
    const timeFilter: TimeFilter = ['week', 'month', 'year', 'all'].includes(body.timeFilter)
      ? body.timeFilter : 'week'
    const limitPerSub: number = Math.min(Number(body.limit) || 50, 100)
    const minScore: number = Number(body.minScore) ?? 10
    const fetchComments: boolean = body.fetchComments !== false  // default true

    const results: {
      subreddit: string
      fetched: number
      filtered: number
      inserted: number
      skipped: number
      error?: string
    }[] = []
    let totalInserted = 0
    let totalSkipped = 0

    for (const subreddit of subreddits) {
      try {
        const posts = await fetchSubreddit(subreddit, timeFilter, limitPerSub)
        const validPosts = posts.filter((p) => isValidPost(p, minScore))

        const bookmarks = await Promise.all(
          validPosts.map((p) => buildBookmark(p, subreddit, fetchComments))
        )

        const { inserted, skipped } = await insertBookmarks(bookmarks)
        totalInserted += inserted
        totalSkipped += skipped
        results.push({
          subreddit,
          fetched: posts.length,
          filtered: posts.length - validPosts.length,
          inserted,
          skipped,
        })
      } catch (err) {
        results.push({ subreddit, fetched: 0, filtered: 0, inserted: 0, skipped: 0, error: String(err) })
      }
    }

    return NextResponse.json({
      inserted: totalInserted,
      skipped: totalSkipped,
      total: totalInserted + totalSkipped,
      subreddits: results,
    })
  } catch (err) {
    console.error('[REDDIT/INGEST]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
