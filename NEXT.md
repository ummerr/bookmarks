# NEXT — where I left off

> Keep the campfire lit. Update this at the END of every session so the next one is a warm start. (Seeded 2026-07-23 from the Build-to-Think audit + live state — replace with your own notes as you go.)

## Status
- **Flagship, shipped & live** — prompts.ummerr.com (password-gated). 277 commits, 139 tests, 7 runtime deps, $0. Chrome extension → Haiku triage → Sonnet extraction → curated gen-media prompt dataset.
- **Omni + Flow reaction report** at rev. 8 (199-post scored corpus, private/unlisted/`noindex`) — the artifact a Google gen-media PM actually uses.
- **/market-map is validated, enriched, and live** as of 2026-08-19 — 352-finding multi-agent audit applied, 65/74 companies carry sourced facts lines, researcher-voice rewrite + mention index shipped. Tree CLEAN, all pushed through `cb52362`.

## The next ONE thing
→ **Validate sources 53–57** (the post-audit ByteDance-to-#1 Momentum re-rank: Seedance API "reportedly >RMB 1B/mo / ~$1.7B annualized" via 36Kr-lineage, Krea 30M+ users). They shipped evidence-flagged but AFTER the 352-finding audit closed — one small verification pass brings them to the same standard. Everything needed is in `research/market-map/validation/validation-2026-08.md` (method + residual-exposure list).

## ⚠️ Gotchas
- The **10s Vercel Hobby timeout** is the antagonist of the whole architecture — long classification jobs run **client-side** with `localStorage` persistence, not on the server. Don't reintroduce a long server loop.
- `scripts/check-facts.ts` is wired to `prebuild` — a blocklist of strings the project got burned by (`veo 4`, `flova`, …). **Add an entry every time a fabricated claim ships**; the build should fail on it.
- Freeze the scoring rubric before re-scoring the corpus, and report the delta on a stable window (so "sentiment improved" is distinguishable from "we changed how we count").

## Done since
- *(2026-08-19, later)* **Full multi-agent market-map validation + enrichment COMPLETE** — two Workflow fleets (6 section verifiers, adversarial skeptic, consistency critic, source auditor, recheck agent, completeness critic + 6 enrichment researchers): 352 findings (291 confirmed / 32 corrected / 12 stale / 2 refuted), all applied; 65/74 companies now carry sourced facts lines (valuation · raised · VCs · users/ARR · as-of, amber when >90d stale). Headline fixes: vLLM-Omni refutes "no vLLM-of-diffusion" (H8 → supported), ElevenLabs $600M ARR, Decart sub-40ms / chosen over a higher NVIDIA offer, Suno-BMG license≠settlement, CapCut 300M+ MAU, Moonvalley absorbed into Reka AI. Ran concurrently with a voice rewrite (bet→thesis, Durable/Fragile/Unproven) via cross-session coordination. Report + changelog: research/market-map/validation/validation-2026-08.md.
- *(2026-08-19)* Market-map daily audit rerun (3 agents + link check): Wan 3.0 took AA T2V #1 from Gemini, Kling Q2 filed (RMB 850M+, >200% YoY → ~$475M run-rate, replacing ~$500M/+300%), Decart talks escalated to ~$7B near-signing, fixed "Wan 2.6 open" and "Hunyuan3D 3.0" errors. Log: research/market-map/validation/audit-2026-08-19.md. Build green.
- *(2026-07-11)* Refreshed Omni report + Flow brief to rev. 8 (199-post corpus). — then the tree went quiet with 23 files uncommitted.

## Auto session log
- **2026-07-23** — session ended: 24 file(s) dirty, 0 commit(s) unpushed. Last touched: `.gitignore`. <!-- campfire:2026-07-23 -->
- **2026-08-17** — session ended: 3 file(s) dirty, 0 commit(s) unpushed. Last touched: `components/Nav.tsx`. <!-- campfire:2026-08-17 -->
- **2026-08-18** — session ended: 1 file(s) dirty, 0 commit(s) unpushed. Last touched: `research/`. <!-- campfire:2026-08-18 -->
- **2026-08-19** — session ended: 17 file(s) dirty, 0 commit(s) unpushed. Last touched: `NEXT.md`. <!-- campfire:2026-08-19 -->
