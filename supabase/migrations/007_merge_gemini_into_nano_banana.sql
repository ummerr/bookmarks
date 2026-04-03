-- Reverse 006: merge "Gemini" into "Nano Banana" (the preferred label)
-- Only for non-video prompts — Nano Banana is an image model
UPDATE bookmarks
SET detected_model = REPLACE(detected_model, 'Gemini', 'Nano Banana'),
    updated_at = NOW()::TEXT
WHERE detected_model ILIKE '%gemini%'
  AND (prompt_category IS NULL OR prompt_category NOT LIKE 'video_%');

-- For video prompts, "Gemini" should resolve to "Veo" (Google's video model)
UPDATE bookmarks
SET detected_model = REPLACE(detected_model, 'Gemini', 'Veo'),
    updated_at = NOW()::TEXT
WHERE detected_model ILIKE '%gemini%'
  AND prompt_category LIKE 'video_%';
