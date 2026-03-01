-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id TEXT UNIQUE NOT NULL,
  tweet_text TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_name TEXT,
  tweet_url TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  category TEXT CHECK (category IN ('tech_ai_product', 'career_productivity', 'prompts', 'uncategorized')) DEFAULT 'uncategorized',
  confidence FLOAT DEFAULT 0,
  rationale TEXT,
  is_thread BOOLEAN DEFAULT FALSE,
  thread_tweets JSONB DEFAULT '[]',
  user_notes TEXT,
  bookmarked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_bookmarks_tweet_id ON bookmarks(tweet_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_author ON bookmarks(author_handle);
CREATE INDEX IF NOT EXISTS idx_bookmarks_text_search ON bookmarks USING gin(to_tsvector('english', tweet_text));

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER bookmarks_updated_at
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
