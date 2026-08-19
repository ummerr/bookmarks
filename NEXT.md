# NEXT — where I left off

> Keep the campfire lit. Update this at the END of every session so the next one is a warm start. (Seeded 2026-07-23 from the Build-to-Think audit + live state — replace with your own notes as you go.)

## Status
- **Flagship, shipped & live** — prompts.ummerr.com (password-gated). 277 commits, 139 tests, 7 runtime deps, $0. Chrome extension → Haiku triage → Sonnet extraction → curated gen-media prompt dataset.
- **Omni + Flow reaction report** at rev. 8 (199-post scored corpus, private/unlisted/`noindex`) — the artifact a Google gen-media PM actually uses.
- **⚠️ Working tree is DIRTY as of 2026-07-23** — 23 uncommitted files sitting since 2026-07-11 (12 days). This is the flagship's newest work, unsaved. See "The next ONE thing."

## The next ONE thing
→ **Commit the 23-file working tree — but review, don't blind-commit.** It bundles unrelated work that should land in logical chunks: a **security migration** (`supabase/migrations/010_enable_rls.sql`) + **schema change** (`supabase/schema.sql`), new `evals/`, the `check-facts.ts` prebuild gate + other `scripts/*.ts`, `robots.ts`, `Nav.tsx`/`page.tsx`/classifier edits, and an image-to-prompt tool. Group by concern (RLS+schema together and reviewed carefully; scripts; UI; tool) so the history stays legible and the RLS change is auditable.

## ⚠️ Gotchas
- The **10s Vercel Hobby timeout** is the antagonist of the whole architecture — long classification jobs run **client-side** with `localStorage` persistence, not on the server. Don't reintroduce a long server loop.
- `scripts/check-facts.ts` is wired to `prebuild` — a blocklist of strings the project got burned by (`veo 4`, `flova`, …). **Add an entry every time a fabricated claim ships**; the build should fail on it.
- Freeze the scoring rubric before re-scoring the corpus, and report the delta on a stable window (so "sentiment improved" is distinguishable from "we changed how we count").

## Done since
- *(2026-08-19)* Market-map daily audit rerun (3 agents + link check): Wan 3.0 took AA T2V #1 from Gemini, Kling Q2 filed (RMB 850M+, >200% YoY → ~$475M run-rate, replacing ~$500M/+300%), Decart talks escalated to ~$7B near-signing, fixed "Wan 2.6 open" and "Hunyuan3D 3.0" errors. Log: research/market-map/validation/audit-2026-08-19.md. Build green.
- *(2026-07-11)* Refreshed Omni report + Flow brief to rev. 8 (199-post corpus). — then the tree went quiet with 23 files uncommitted.

## Auto session log
- **2026-07-23** — session ended: 24 file(s) dirty, 0 commit(s) unpushed. Last touched: `.gitignore`. <!-- campfire:2026-07-23 -->
- **2026-08-17** — session ended: 3 file(s) dirty, 0 commit(s) unpushed. Last touched: `components/Nav.tsx`. <!-- campfire:2026-08-17 -->
- **2026-08-18** — session ended: 1 file(s) dirty, 0 commit(s) unpushed. Last touched: `research/`. <!-- campfire:2026-08-18 -->
- **2026-08-19** — session ended: 17 file(s) dirty, 0 commit(s) unpushed. Last touched: `NEXT.md`. <!-- campfire:2026-08-19 -->
