-- Improve full-text search: cover tweet_text + extracted_prompt, add author trigram index

-- Drop the old single-column tsvector index
DROP INDEX IF EXISTS idx_bookmarks_text_search;

-- Create a combined tsvector index covering both tweet_text and extracted_prompt
CREATE INDEX idx_bookmarks_fts ON bookmarks
  USING gin(to_tsvector('english', COALESCE(tweet_text, '') || ' ' || COALESCE(extracted_prompt, '')));

-- Trigram index on author_handle for partial/fuzzy matching (requires pg_trgm)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_bookmarks_author_trgm ON bookmarks USING gin(author_handle gin_trgm_ops);
