# Prompt Observatory

Personal dashboard at `bookmarks.ummerr.com` that ingests Twitter/X bookmarks, auto-classifies them with Claude, and displays them in a searchable, filterable UI focused on AI prompts.

## Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS v4
- **Database**: Supabase (Postgres) via `postgres.js`
- **AI**: Claude Sonnet (prompt classification) + Claude Haiku (bookmark triage)
- **Hosting**: Vercel Hobby (10s function timeout)

## Classification System

Classification runs in two tiers:

### Tier 1: Bookmark Triage (Haiku)
Every imported bookmark is classified into one of four top-level categories:
- `prompts` — any tweet containing an AI prompt (image/video/audio/3D/LLM)
- `tech_ai_product` — tech news, AI/ML, startups, dev tools
- `career_productivity` — career growth, productivity, professional dev
- `uncategorized` — low confidence or doesn't fit above

### Tier 2: Prompt Analysis (Sonnet)
Bookmarks tagged as `prompts` get a deeper pass that extracts:
- **Prompt category** — 19 fine-grained types across image, video, audio, 3D, and text
- **Extracted prompt** — cleaned prompt text stripped of social media noise
- **Detected model** — normalized model name (Midjourney, Flux, Veo, Kling, etc.)
- **Themes** — up to 3 visual themes (person, cinematic, landscape, scifi, etc.)
- **Art styles** — up to 3 styles (photorealistic, anime, oil_painting, etc.)
- **Reference detection** — whether the prompt requires a user-supplied reference image
- **Reference type** — what kind of reference (face, style, subject, pose, scene)

### Reference Detection (Two-Step Process)
The classifier uses a structured two-step decision process to catch reference-to-image prompts that might otherwise be miscategorized:

1. **Step 1 — Check for reference signals first**: bracketed placeholders (`[YOUR IMAGE]`), Midjourney flags (`--sref`, `--cref`), workflow tools (IP-Adapter, ControlNet, InstantID), ComfyUI pipeline signals, character consistency language, and implicit reference instructions
2. **Step 2 — Only if no reference signal**, pick a subject-based category (image_person, image_t2i, etc.)

Post-classification validation enforces consistency: reference categories always have `requires_reference=true`, and missing reference types default to `subject_object`.

### Multi-Shot Detection
Multi-shot video prompts are detected at read time (not stored in DB) by pattern-matching:
- Timestamp syntax: `[0s-3s]`, `[3s-6s]`
- Numbered shots/scenes/clips: "Shot 1", "Scene 2"
- Explicit keywords: "multi-shot", "multi-scene"

Duration is extracted from timestamps when parseable and displayed on prompt cards.

## Setup

### 1. Clone & install
```bash
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Where to find |
|----------|--------------|
| `DATABASE_URL` | Supabase → Project Settings → Database → Transaction pooler |
| `ANTHROPIC_API_KEY` | console.anthropic.com/settings/keys |

### 3. Database
Run the schema in Supabase SQL editor:
```
supabase/schema.sql
```

### 4. Run locally
```bash
npm run dev
```

## Key Files

```
lib/
  classifier.ts         # Two-tier classification with Claude
  db.ts                 # All DB functions, multi-shot detection
  types.ts              # TypeScript types
app/
  prompts/page.tsx      # Main prompt browser with filters
  tools/page.tsx        # Classification tools (reclassify, etc.)
  api/classify/         # Tier 1: bookmark triage
  api/prompts/classify/ # Tier 2: prompt analysis
  api/prompts/reclassify/ # Re-run Tier 2 on all prompts
```
