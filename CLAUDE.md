# CLAUDE.md

## Critical Rule

**DO NOT BREAK THE BUILD.** This site is live and shared with important people. Every code change must be verified with `npm run build` before considering work complete.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind v4
- DB: postgres.js connected to Supabase Postgres
- Deployed on Vercel Hobby (free) — 10s function timeout

## Build & Verify

```bash
npm run build
```

Always run this after making changes. If the build fails, fix it before moving on.

## Key Conventions

- All DB functions are in `lib/db.ts`, fully async, using postgres.js tagged templates
- `is_multi_shot` is computed in app code, NOT a database column — never query it in SQL
- JSONB fields are returned as objects by Postgres — no JSON.parse needed
- API routes must complete within 10s (Vercel Hobby limit)
- Don't delete nav links without asking the user first
