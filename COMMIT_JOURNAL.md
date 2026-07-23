# The Bookmarks Project: A Developer's Journal

**199 commits. 28 days. 21,410 lines added. One person vs. the free tier.**

---

## The Numbers

| Stat | Value |
|------|-------|
| First commit | Feb 28, 2026 |
| Latest commit | Mar 27, 2026 |
| Total commits | 199 |
| Lines added | 21,410 |
| Lines deleted | 7,249 |
| Busiest day | Mar 27 (46 commits) |
| Second busiest | Mar 26 (43 commits) |
| Days with 0 commits | Most of them, honestly |

---

## Act I: "It's Finally Working" (Feb 28 – Mar 3)

The project begins the way all great projects begin: with a `create-next-app` scaffold and a commit message that radiates pure relief.

> `19892b2` — **it's finally working**

This is the commit of a person who has been staring at a screen for hours. No description of *what* is working. Just gratitude that *something* is.

Over the next few days, the foundation goes in: a Prompts page with AI sub-classification, reference-image workflow categories (R2I, R2V), and the first attempts at a classification pipeline. The vision is already ambitious — a curated dataset of generative media prompts, classified by AI, browsable by humans.

**Commits:** 5
**Vibe:** cautious optimism

---

## Act II: The Great Migration (Mar 7)

Six commits on March 7, and they tell a whole story:

> `53f0284` — **Migrate from SQLite to Supabase Postgres for Vercel deployment**
> `ee54975` — **Fix: lazy-init postgres client to prevent build-time failure**
> `ab31a56` — **Update extension with Vercel deployment URL**
> `48923e5` — **Fix extension localhost references, auto-migrate stored URL to Vercel**

Translation: "I tried to deploy and everything broke." The classic SQLite-to-Postgres migration arc. You think it'll be easy. It is never easy. There's always a build-time connection attempt you didn't expect and a localhost URL hardcoded somewhere you forgot about.

Also on this day: the classifier gets upgraded to `claude-sonnet-4-6`. Bringing out the big guns early.

**Commits:** 6
**Vibe:** "why did I use SQLite in the first place"

---

## Act III: Feature Explosion (Mar 8 – 10)

This is the weekend where the project goes from "a thing that exists" to "a thing with opinions."

**Mar 8** (11 commits): Model family grouping, filter panel redesign, prompt themes, mobile responsiveness, a rebrand to "ummerr," and moving AI actions to a `/tools` page. Also the prompt text limit goes from 1,200 to 3,000 characters because apparently people write *novels* as image prompts.

**Mar 9** (19 commits): Stats page with donut charts. Random page with spacebar shortcut (the "Tinder for prompts" prototype, before it was called that). The Import page gets removed. The dashboard becomes "Bookmarks." URL rewrites so `prompts.ummerr.com` works. The classifier learns to recognize image/video prompts from *any* tool, even unknown ones. There's a theme query bug that will haunt this project for weeks.

**Mar 10** (18 commits): OG image generation. Password-protecting the tools page. Then immediately reverting the password protection. Then reverting the OG image. Then re-adding a different OG image. A filter that hides categories with zero counts. Media thumbnails that break because of dynamic Tailwind classes. The `jsonb_array_length` function appears for the first time, casting a long shadow.

The OG image commit-revert-recommit cycle is *chef's kiss*. Two reverts in one day. The kind of day where you push to prod, check it on your phone, say "no," and `git revert` before anyone notices.

**Commits:** 48
**Vibe:** manic productivity with occasional self-correction

---

## Act IV: The Classifier Wars (Mar 12 – 14)

The AI classifier becomes the project's main character. And like all main characters, it causes problems.

**Mar 12**: Reddit ingestion gets added. First it uses OAuth credentials. Then it switches to scraping `old.reddit.com` with a browser User-Agent because the OAuth flow is too much. The reclassify batch gets reduced to 5 prompts because Vercel's 10-second timeout is an ever-present antagonist.

**Mar 13**: The Prompt Studio is born and immediately replaced with a simpler Prompt Rewriter. The studio lasted exactly two commits.

> `2c55c38` — **Add Prompt Studio with inline chip reference system**
> `720b1f3` — **Replace Studio with simple Prompt Rewriter**

RIP Prompt Studio. We barely knew ye.

**Mar 14** (19 commits): Multi-shot prompt detection. A datacard page. Filter bar styling. A Haiku crash when it "omits label/key on var segments." The nav gets rearranged. Images get aspect ratio fixes. An embedded worktree gets accidentally committed and then ignored. It's a busy day.

**Commits:** 30
**Vibe:** building fast, breaking things, fixing things faster

---

## Act V: The Quiet Middle (Mar 15 – 23)

Activity drops. A thread header detection feature. Some filter tweaks. Batch sizes get reduced again. The classifier gets more diagnostics. This is the part of the project where you're actually *using* the thing and finding all the paper cuts.

The commit messages get more specific and tired:

> `f9c2370` — **Add ID mismatch diagnostics to classifyPromptBatch**

This is the commit of someone who has been debugging a classifier that returns IDs in a different order than it received them. You can feel the frustration.

**Commits:** 12
**Vibe:** maintenance mode, with occasional sighs

---

## Act VI: State of Prompting (Mar 25 – 26)

The project pivots from "tool" to "publication." A 10-commit day on March 25 adds a full editorial page: "State of Prompting 2026." Then March 26 explodes with **43 commits** — more than most developers make in a month.

The commit log reads like a live-blog of someone writing an essay while simultaneously building the platform to host it:

> `559410c` — **Replace fake ELO scores with real Artificial Analysis arena data**
> `7e5fadc` — **Add Sora shutdown section with timeline, stat cards, and analysis**
> `c2122d2` — **Add 🪦 RIP Sora 2 to video model cards**
> `02aa6f8` — **Tighten State of Prompting page: 9 findings → 5, cut redundant prose**

The Sora shutdown gets a tombstone emoji. The OG image gets redesigned with "colorful gradient glows." Model aliases are added for Veo, Aurora, and Grok. The classifier switches from Sonnet to Haiku because it's cheaper. Legal copy changes: "all human-sourced" becomes "hand curated" becomes "practitioner-sourced" — each iteration its own commit, each a small crisis of branding.

The site gets repositioned toward ML researchers. Then toward viral X sourcing. The datacard gets overhauled. Inpainting, Audio, and 3D get removed — this is an image and video dataset now. Emojis get added to filter buttons. Then removed. The nav link for "State of Prompting" moves to the right side.

**Commits:** 53
**Vibe:** a person possessed

---

## Act VII: The Reckoning (Mar 27)

**46 commits.** The single busiest day. And it's almost entirely about two things: making the data trustworthy and making the site not crash.

**The `jsonb_array_length` saga reaches its climax:**

> `57991fc` — **Add dataset quality audit: 8 heuristics with visualization**
> `8576035` — **Fix quality audit 500 — parallelize all SQL queries to fit 10s timeout**
> `65eb555` — **Fix jsonb_array_length crash on non-array media_urls**
> `dbcc3eb` — **Fix quality audit: safe jsonb_array_length + disable prepared statements**
> `53d2480` — **Kill jsonb_array_length entirely — use text cast instead**

Five commits to deal with one Postgres function. First it crashes on non-arrays. Then it gets a safety wrapper. Then prepared statements cause issues. Finally: "Kill jsonb_array_length entirely." The nuclear option. The function that haunted Act III finally gets what it deserves.

**The `is_multi_shot` saga:**

> `5c44d25` — **Fix /api/stats 500 — remove is_multi_shot query (not a DB column)**
> `50f5dc6` — **Remove is_multi_shot column from stats query (computed field, not in DB)**

A field that exists in app code but not in the database gets queried in SQL, causing 500 errors. This happens *twice* on the same day. It will be enshrined in project memory as a cautionary tale.

**The "Tinder-style prompt reviewer" arc:**

> `1ed2668` — **Add Tinder-style prompt reviewer for debiasing**
> `40e404c` — **Redesign prompt reviewer — research-grade curation tool**
> `bda0fea` — **Fix review page crash — parse media_urls when returned as string**

Born, redesigned, and crash-fixed in a single day. The development lifecycle of a feature compressed into hours.

Meanwhile: the `byTheme` JSONB query gets added to the stats API, then removed because it times out on the Hobby tier, then the insights page crashes because it still references it, then the stats API gets made "resilient to failures." The Vercel 10-second timeout is the final boss of this project and it never stops attacking.

**Commits:** 46
**Vibe:** someone who has shown this URL to people and is now in "oh god it has to actually work" mode

---

## Recurring Themes (for your essay)

### 1. The Free Tier as Creative Constraint
The Vercel Hobby plan's 10-second timeout is a character in this story. It forces batch sizes down, kills JSONB lateral joins, eliminates regex queries, and requires parallelizing SQL. Every ambitious feature has to negotiate with this limit. It's like writing a novel where every chapter must fit on a post-it note.

### 2. The Build-Break-Fix Cycle
The ratio of feature commits to fix commits is roughly 1:1. Every feature introduces a bug. Every bug fix reveals an edge case. The `jsonb_array_length` function alone spans 7+ commits across 3 weeks. This isn't failure — this is what building in public actually looks like.

### 3. The Classifier as Co-Author
The Anthropic classifier is both the most powerful and most unreliable component. It gets upgraded, downgraded (Sonnet → Haiku for cost), given diagnostics, given constraints, given "enum constraints," and has its batch size reduced four separate times. It's like managing a brilliant but unpredictable intern.

### 4. The Identity Crisis
The project's self-description changes constantly: "bookmarks" → "prompts" → "curated dataset" → "benchmark" → "research-grade curation tool." The OG meta description alone goes through at least 5 versions. The nav gets rearranged 8+ times. This is a project figuring out what it wants to be while people are already using it.

### 5. The Revert as Wisdom
Two explicit `git revert` commits. Multiple features that get added and immediately redesigned. The Prompt Studio that lasted one commit. The password protection that lasted hours. Knowing when to undo is as important as knowing what to build.

### 6. The 46-Commit Day
March 27 is the day the project meets its audience. The quality audit, the prompt reviewer, the crash fixes, the resilience improvements — this is someone stress-testing their own work and finding every crack. It's not elegant, but it's honest.

---

## Timeline Summary

| Date | Commits | Era |
|------|---------|-----|
| Feb 28 | 2 | Genesis ("it's finally working") |
| Mar 1–3 | 3 | Foundation (classification, categories) |
| Mar 7 | 6 | The Great Migration (SQLite → Postgres) |
| Mar 8 | 11 | Rebrand & Mobile |
| Mar 9 | 19 | Stats, Random, URL Architecture |
| Mar 10 | 18 | OG Images, Filters, The First jsonb Bugs |
| Mar 12 | 9 | Reddit Ingestion, Dark Mode |
| Mar 13 | 2 | RIP Prompt Studio (2026–2026) |
| Mar 14 | 19 | Multi-Shot, Datacard, Aspect Ratios |
| Mar 15–23 | 12 | The Quiet Middle |
| Mar 25 | 10 | State of Prompting Begins |
| Mar 26 | 43 | The Editorial Explosion |
| Mar 27 | 46 | The Reckoning |

---

## Best Commit Messages (Ranked by Comedy)

1. `19892b2` — **it's finally working** (the universal developer prayer, answered)
2. `c2122d2` — **Add 🪦 RIP Sora 2** (a tombstone emoji in a commit message is peak 2026)
3. `53d2480` — **Kill jsonb_array_length entirely** (the villain gets what it deserves)
4. `faf53d2` — **Revert "Password-protect /tools page"** (added and removed in the same day)
5. `720b1f3` — **Replace Studio with simple Prompt Rewriter** (one commit after creating it)
6. `71543be` — **Switch Reddit fetch to old.reddit.com with browser User-Agent** (the scraping arms race)
7. `f4bf0b8` — **Change 'all human-sourced' to 'hand curated'** (an entire commit for two words)
8. `3ef44d0` — **Update stat label from 'AI-generated' to 'synthetic'** (and another one)

---

*Generated from the git history of `bookmarks` — 199 commits across 28 days by someone building a research dataset while the site was already live and people were already watching.*
