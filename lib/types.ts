export type Category =
  | 'tech_ai_product'
  | 'career_productivity'
  | 'prompts'
  | 'uncategorized'

export interface Bookmark {
  id: string
  tweet_id: string
  tweet_text: string
  author_handle: string
  author_name: string | null
  tweet_url: string
  media_urls: string[]
  category: Category
  confidence: number
  rationale: string | null
  is_thread: boolean
  thread_tweets: TweetInThread[]
  user_notes: string | null
  bookmarked_at: string | null
  created_at: string
  updated_at: string
}

export interface TweetInThread {
  tweet_id: string
  tweet_text: string
}

export interface BookmarkInsert {
  tweet_id: string
  tweet_text: string
  author_handle: string
  author_name?: string | null
  tweet_url: string
  media_urls?: string[]
  category?: Category
  confidence?: number
  rationale?: string | null
  is_thread?: boolean
  thread_tweets?: TweetInThread[]
  user_notes?: string | null
  bookmarked_at?: string | null
}

export interface ClassificationResult {
  tweet_id: string
  category: Category
  confidence: number
  rationale: string
}

export interface CategoryCounts {
  all: number
  tech_ai_product: number
  career_productivity: number
  prompts: number
  uncategorized: number
}
