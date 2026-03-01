# Twitter Bookmarks Dashboard

Personal dashboard at `bookmarks.ummerr.com` that ingests Twitter/X bookmarks, auto-classifies them with Claude Haiku, and displays them in a searchable, filterable UI.

## Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS v4
- **Database**: Supabase (Postgres)
- **AI**: Claude Haiku (`claude-haiku-4-5-20251001`)
- **Hosting**: Vercel Hobby

## Setup

### 1. Clone & install
```bash
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

| Variable | Where to find |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `ANTHROPIC_API_KEY` | console.anthropic.com/settings/keys |

### 3. Database
Run the migration in Supabase SQL editor:
```
supabase/migrations/001_create_bookmarks.sql
```

### 4. Run locally
```bash
npm run dev
```

## Usage

### Import bookmarks

1. Go to `/import`
2. Upload your Twitter archive `bookmarks.js` file (from `data/bookmarks.js` in your Twitter data export), or a CSV
3. Click **Classify All with AI** to run Claude Haiku classification

### Dashboard

- Filter by category in the sidebar
- Search full-text
- Sort by date, confidence, or author
- Re-categorize individual bookmarks inline

## File structure

```
app/
  page.tsx              # Main dashboard
  import/page.tsx       # Upload & import
  api/classify/route.ts # POST: run AI classification
  api/ingest/route.ts   # POST: receive bookmarks
components/
  BookmarkCard.tsx
  Sidebar.tsx
  CategoryBadge.tsx
  ClassifyButton.tsx
lib/
  supabase.ts           # Supabase client
  classifier.ts         # Claude Haiku logic
  parser.ts             # JSON/CSV parsers
  types.ts              # TypeScript types
supabase/migrations/
  001_create_bookmarks.sql
```

## Categories

| Category | Description |
|----------|-------------|
| `tech_ai_product` | AI, ML, tech, dev tools, startups |
| `career_productivity` | Career, productivity, professional dev |
| `prompts` | AI prompts, prompt engineering |
| `uncategorized` | Low-confidence or unclassified |
