# Twitter Bookmarks Dashboard — Technical One-Pager

**Live:** `bookmarks.ummerr.com`

---

## Overview

Personal tool that ingests Twitter/X bookmarks, auto-classifies them using Claude Haiku, and exposes them in a searchable, filterable dashboard.

---

## Architecture

```
Browser → Next.js (App Router) → Supabase (Postgres)
                ↓
          Anthropic API (Claude Haiku)
```

Hosted on Vercel Hobby (serverless). Database on Supabase managed Postgres.

---

## Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | Next.js 15 (App Router), React, Tailwind v4   |
| Backend  | Next.js API Routes (serverless)               |
| Database | Supabase (Postgres + GIN full-text index)     |
| AI       | Claude Haiku (`claude-haiku-4-5-20251001`)    |
| Language | TypeScript throughout                         |

---

## Data Model

Single `bookmarks` table in Postgres:

| Column                          | Type        | Notes                        |
| ------------------------------- | ----------- | ---------------------------- |
| `id`                            | UUID        | PK, auto-generated           |
| `tweet_id`                      | TEXT        | Unique, deduplication key    |
| `tweet_text`                    | TEXT        | Cleaned (t.co links stripped)|
| `author_handle` / `author_name` | TEXT        | From archive                 |
| `tweet_url`                     | TEXT        | Canonical x.com link         |
| `media_urls`                    | JSONB       | Array of image URLs          |
| `category`                      | TEXT        | Enum-constrained (see below) |
| `confidence`                    | FLOAT       | 0–1, from AI                 |
| `rationale`                     | TEXT        | One-line AI explanation      |
| `is_thread` / `thread_tweets`   | BOOL / JSONB| Thread support               |
| `bookmarked_at`                 | TIMESTAMPTZ | From source data             |

**Indexes:** category, tweet_id, author, GIN full-text on `tweet_text`. `updated_at` maintained via Postgres trigger.

---

## API Routes

| Route                    | Method | Purpose                          |
| ------------------------ | ------ | -------------------------------- |
| `/api/bookmarks`         | GET    | Paginated fetch (filter, search, sort) |
| `/api/bookmarks/counts`  | GET    | Category counts for sidebar      |
| `/api/bookmarks/[id]`    | PATCH  | Inline re-categorize             |
| `/api/ingest`            | POST   | Bulk upsert parsed bookmarks     |
| `/api/classify`          | POST   | Batch AI classification          |

---

## AI Classification

**Model:** Claude Haiku — optimised for speed and cost.
**Method:** Batch prompt — all unclassified tweets sent in one request, response is a parsed JSON array.
**Confidence threshold:** `< 0.7` → falls back to `uncategorized`.

### Categories

| Category              | Covers                                        |
| --------------------- | --------------------------------------------- |
| `tech_ai_product`     | AI/ML, dev tools, startups, tech news         |
| `career_productivity` | Career, productivity, professional development|
| `prompts`             | Prompt engineering, LLM techniques            |
| `uncategorized`       | Low-confidence or ambiguous                   |

---

## Ingestion Flow

1. User uploads `bookmarks.js` (Twitter archive) or a CSV at `/import`
2. `lib/parser.ts` handles both formats — strips JS assignment wrapper (`window.YTD…`), extracts fields, normalises URLs
3. Parsed records `POST` to `/api/ingest` → Supabase upsert keyed on `tweet_id`
4. User triggers **Classify All** → `/api/classify` → Claude Haiku → results written back to DB

---

## Frontend

- **Dashboard** (`/`) — 2-column card grid, sidebar with category counts, full-text search, sort by newest / oldest / confidence / author, paginated at 30/page with load-more
- **Import** (`/import`) — file upload, parse preview, classify trigger
- State managed locally with `useState` / `useCallback`; no external state library

---

## Key Files

```
app/page.tsx                    # Dashboard
app/import/page.tsx             # Import UI
app/api/classify/route.ts       # AI classification endpoint
app/api/ingest/route.ts         # Bulk ingest endpoint
app/api/bookmarks/route.ts      # Paginated fetch + filtering
lib/classifier.ts               # Claude Haiku batch logic
lib/parser.ts                   # Twitter archive + CSV parser
lib/types.ts                    # Shared TypeScript types
supabase/migrations/001_*.sql   # Schema, indexes, trigger
```

---

## Environment Variables

| Variable                       | Purpose              |
| ------------------------------ | -------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anon key    |
| `ANTHROPIC_API_KEY`            | Claude API key       |
