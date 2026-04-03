-- Merge "Nano Banana" model variants into "Gemini" (same product, old codename)
UPDATE bookmarks
SET detected_model = REPLACE(detected_model, 'Nano Banana', 'Gemini'),
    updated_at = NOW()::TEXT
WHERE detected_model ILIKE '%nano banana%';
