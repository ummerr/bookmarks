-- Performance indexes for prompt filtering and pending items
CREATE INDEX IF NOT EXISTS idx_bm_prompt_category   ON bookmarks(prompt_category) WHERE category = 'prompts';
CREATE INDEX IF NOT EXISTS idx_bm_prompts_compound  ON bookmarks(category, prompt_category, bookmarked_at DESC) WHERE category = 'prompts';
CREATE INDEX IF NOT EXISTS idx_bm_pending           ON bookmarks(bookmarked_at ASC) WHERE confidence = 0;
