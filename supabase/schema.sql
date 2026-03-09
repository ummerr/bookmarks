-- Run this once in the Supabase SQL editor before deploying.

CREATE TABLE IF NOT EXISTS bookmarks (
  id                TEXT PRIMARY KEY,
  tweet_id          TEXT UNIQUE NOT NULL,
  tweet_text        TEXT NOT NULL,
  author_handle     TEXT NOT NULL,
  author_name       TEXT,
  tweet_url         TEXT NOT NULL,
  media_urls        JSONB NOT NULL DEFAULT '[]',
  category          TEXT NOT NULL DEFAULT 'uncategorized',
  confidence        REAL NOT NULL DEFAULT 0,
  rationale         TEXT,
  is_thread         BOOLEAN NOT NULL DEFAULT false,
  thread_tweets     JSONB NOT NULL DEFAULT '[]',
  user_notes        TEXT,
  prompt_category   TEXT,
  extracted_prompt  TEXT,
  detected_model    TEXT,
  prompt_themes     JSONB NOT NULL DEFAULT '[]',
  requires_reference BOOLEAN,
  reference_type    TEXT,
  art_styles        JSONB NOT NULL DEFAULT '[]',
  bookmarked_at     TEXT,
  source            TEXT NOT NULL DEFAULT 'twitter',
  created_at        TEXT NOT NULL DEFAULT (NOW()::TEXT),
  updated_at        TEXT NOT NULL DEFAULT (NOW()::TEXT)
);

-- Migrations (run if table already exists):
-- ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'twitter';
-- ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS art_styles JSONB NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_bm_category      ON bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_bm_author        ON bookmarks(author_handle);
CREATE INDEX IF NOT EXISTS idx_bm_bookmarked_at ON bookmarks(bookmarked_at DESC);
CREATE INDEX IF NOT EXISTS idx_bm_confidence    ON bookmarks(confidence DESC);
