ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS quality_rating smallint;
COMMENT ON COLUMN bookmarks.quality_rating IS '1=cull, 2=maybe, 3=keep, NULL=unreviewed';
CREATE INDEX IF NOT EXISTS idx_bookmarks_quality_rating ON bookmarks(quality_rating) WHERE quality_rating IS NOT NULL;
