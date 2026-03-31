-- Add user flag columns for end-user reporting
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS user_flag TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS user_flag_note TEXT;

-- Index for quality tool queries
CREATE INDEX IF NOT EXISTS idx_bm_user_flag ON bookmarks(user_flag) WHERE user_flag IS NOT NULL;
