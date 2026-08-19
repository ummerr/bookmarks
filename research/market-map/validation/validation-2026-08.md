# Market Map — Multi-Agent Claim Validation, August 2026

**Status: Round 1 applied (2026-08-19). Round 2 pending** — 8 of 13 critique agents were cut off by a session usage limit (resets 12:50pm PT) and will be resumed from cache; see "Round 2 scope" below.

## How this was run

Two agent fleets, zero external API cost (all subagents, web-search-verified, no reliance on model memory):

- **Validation** — typed critique agents: 6 section-scoped fact verifiers, 1 adversarial skeptic (hypotheses/control points), 1 internal-consistency critic (cross-file, no web), 1 source auditor (on a curl link-check of all SOURCES), 1 completeness critic with up to 3 gap-fill agents.
- **Enrichment** — 6 panel-scoped researchers filling `facts` (valuation / raised / key VCs / users / ARR / as-of) for the 49 companies that lacked them.
- **Recency rule** enforced in every prompt: a time-varying figure (ARR, users, valuation-as-current, prices, ranks) counts as *confirmed* only with a corroborating source ≤90 days old; older corroboration → *stale*, and the value carries its true as-of month (renders amber on the page via `isStale`). Dated events need contemporaneous coverage plus a supersedence check.

Raw structured findings: `findings-round1-2026-08-19.json`, `enrichment-round1-2026-08-19.json`. This round builds on the 3-agent refresh already logged in `audit-2026-08-19.md`.

## Round 1 results (completed agents: panels 1–3 verifier, consistency critic; 3 of 6 enrichment panels)

**60 findings: 35 confirmed · 9 corrected · 1 stale · 15 unverifiable · 0 refuted.**

### Corrections applied (old → new, with source)

| Location | Was | Now | Why / source |
|---|---|---|---|
| Google Asset Studio note | "~70M Gemini assets in Q4 2025 **PMax alone**" | "across **AI Max + PMax**" | Google's exact wording spans both products; "alone" modified Q4 (blog.google, Feb 11 2026) |
| Runway note | "last reported ~$90M mid-2025" | "trackers est. ~$300M annualized by late 2025" | $90M was stale (Jun 2025) and unsupported by the research corpus — possible cross-contamination from Kling's Q1 figure; Sacra/Getlatka est. ~$300M by Oct 2025 |
| Meshy (map, model table, ARR chart, bet) | "~$40M ARR", "~35x multiple" | "~$30M ARR", "~50x multiple" | The cited source (TechFundingNews, Jul 21 2026) and research file 2 both say ~$30M — the $40M misquoted our own source |
| Kling evidence tier + §01 prose | "audited" / "best-audited number in the industry" | "company-stated" / "best-grounded… listed company's **(unaudited interim)** filings" | Both Kuaishou IR releases are explicitly titled "unaudited" |
| Kling §01 trajectory | Q1 "~$500M ARR" → Q2 "$475M" read as a decline ("continuing but decelerating") | consistent quarterly-annualized basis: **~$360M (Q1) → ~$475M (Q2)** | The two figures used different bases; on one basis it's growth |
| Kling overseas share (§01) | flat "75%" | "~70–75% (as of Q1)" | Harmonized to the hedged range the report itself uses elsewhere; not restated in the Q2 release |
| Kling spin-out (×2) | "among **38 investors**" | "among the investors" | The "38" count appears nowhere in the research corpus |
| Magnific ARR-chart note | "Bootstrapped and profitable" | "no VC rounds… parent Freepik EQT-majority-owned since 2020" | Research flagged "bootstrapped" as marketing framing |
| §11 open source | "H3 put open weights at **#2** overall" | "**#3** overall" | Stale within the page after Wan 3.0's Aug 19 debut (#1) pushed rankings down |
| Sora economics (§01) | "estimated ~$1M/day of inference" | "estimated anywhere from $1M to $15M a day… (both third-party estimates)" | Research documents a 15x spread across estimates; page had silently picked the low end |
| §08 NRR | "Synthesia and HeyGen compound with 140%+ NRR" | "Synthesia compounds at 140%+ NRR and HeyGen at break-even" | The NRR figure is a Synthesia-only disclosure |
| §01 music card | "UMG and WMG converted suits against Udio **and Suno**" | "WMG and BMG settled with Suno… **UMG's suit against Suno is still live**" | Contradicted the report's own repeated "UMG suit live" |
| §14 Icon | pivot presented as alive | "…followed by a reported March 2026 shutdown" | Harmonized with the moat matrix's shutdown listing (techstartups.com, Mar 5 2026); status contested |
| Leaderboard half-life (4 spots) | mixed "weeks" vs "one to two quarters" vs "quarterly" | harmonized: "one to two quarters through 2025, now compressing toward weeks" | Same fact stated two different ways 7+ times |
| Decart facts cite | cite 23 (Bloomberg $6B article) | cite 48 (Calcalist ~$7B) | The headline figure is ~$7B; the cite pointed at the superseded $6B report |
| SOURCES #34 date | "Jul 7, 2026" | "Aug 13, 2026" + label "(board action Jul 7)" | Entry conflated event date with filing date |
| Figma Weave note | "shareable AI workflows in Figma Community" | "shareable AI workflows inside Figma" | "Community" distribution specifically could not be corroborated |
| §09 fal | "~$400M reported" | "~$400M est." | Aligned with the ARR chart's "estimate" badge for the same number |

### Confirmed highlights (sample of the 35)

Canva/Leonardo + free Affinity; Adobe AI-first ARR >$500M +3x (Q2 FY26 earnings); Flow unification + 140+ countries (understated — actually ~187); Magnific $230M ARR with ~half from video (Fortune); Krea 2 open weights; Weavy >$200M (Calcalist); OpenArt $70M/8M MAU (Sacra); Lovart's ex-ByteDance founder; citation integrity clean (all 27 page Cite ids + 15 facts.cite ids resolve).

### Stale / unverifiable — flagged, not changed

- **Canva "third-party model shelf"** — not corroborated in round 1; re-verify in round 2.
- **Meta Advantage+ full-automation rollout "still pending"** — last evidence Jul 8 ("coming weeks"); plausible, unconfirmed for mid-Aug. (Sibling audit also kept it.)
- **Kling spin-out $18B / source 41's Bloomberg URL slug says "raises-2-billion"** vs label "~$3B" — round size vs slug tension unresolved; research called the $15–18B range rumor-grade. Re-verify.
- ~~**FLUX 3 Video "#2 text-to-video"**~~ — RESOLVED (Aug 19, direct fetch): FLUX 3 Video is absent from the AA text-to-video board, so the rank is an Arena rank; entry now reads "#2 on Arena text-to-video (not yet listed on AA)". The AA top 10 shows Gemini as the only non-Chinese entry — "9 of 10 Chinese" holds.
- **Sony v. Suno timeline** ("no ruling before 2027, motions due April") — unsourced; research expected a summer-2026 ruling. Re-verify.
- ~~**Wan open-weights stops at 2.2**~~ — RESOLVED (Aug 19, direct fetch of huggingface.co/Wan-AI): no release newer than Wan 2.2 has published weights; the claim stands.
- "9 of 10 top video models Chinese" — verified by the Aug 19 sibling audit; the consistency critic flagged it only because the Aug 17 research corpus still said 8 of 10.

## Enrichment applied (round 1: workspaces, gaming/enterprise, orchestration panels)

New `facts` lines (valuation · raised · key VCs · users/ARR · as-of, honest vintage dates → amber when >90 days): **Google Flow** (1.5B+ creations claimed), **Figma Weave** (acq. >$200M; $4M seed — Entrée Capital, Designer Fund), **Recraft** ($42M — Accel, Khosla, Madrona; 4M+ users, May 2025 vintage), **Lovart** (no disclosed funding; 10M+ users / ~$30M annualized, both company-claimed; a circulating $300M ARR claim was rejected as uncorroborated), **Rodin/Deemos** (CNY 100Ms Jun 2026 — Cathay Capital, Shanghai SSCI), **Inworld** (>$500M — Aug 2023 vintage; Lightspeed, M12, Samsung Next), **Scenario** ($11M, Jan 2023 — renders stale), **Hidden Door** ($9M — Northzone, Makers Fund), **Tavus** (~$250M secondary est.; $64M — CRV, Sequoia, Scale), **Sync** (~$5.5M — GV, YC), **Argil** (€4.9M — EQT Ventures, Seedcamp), **Replicate** (acq. Cloudflare, terms undisclosed), **Vercel AI Gateway** (200K+ teams claimed), **Baseten/Modal/Together** ($13B / $4.65B / $8.3B, Jul 2026).

Skipped with reason (product lines of giants, no separable metrics): Google Genie, NVIDIA Cosmos, Ubisoft/EA internal, Gemini Notebook (rebranded from NotebookLM Jul 16, 2026 — the "30M users" note is a round-2 verification target), Adobe Firefly Assistant. Source URLs for every figure: `enrichment-round1-2026-08-19.json`.

## Round 2 scope (resumes after the usage-limit reset)

- Validation: verifiers V2 (map panels 4–8), V3 (model tables incl. leaderboard re-check), V4 (Momentum 25 + stack), V5/V6 (page prose incl. hero & economics tiles), adversarial skeptic (10 hypotheses, control points), source auditor (dead/moved links: globenewswire 000; label spot-checks), completeness critic + gap fills.
- Enrichment: ads-commerce, film-video, social/music panels (Creatify, Typeface, Jasper, Photoroom, Smartly, Moonvalley, Lightricks, Promise, Flawless, Deepdub, Viggle, Character.AI, Udio, Cartesia, KLAY, Descript…).
- The unverifiable list above feeds the round-2 verifier prompts (a dedicated V7-rechecks agent covers them).
- **Constraint:** this session's web-search budget is exhausted (200/200 — consumed by the round-1 fleets). Round 2 in this session would run WebFetch-only (degraded discovery). Cleanest path: run round 2 in a fresh session (fresh search budget) using the round-2 scope above — the failed agents produced no cache worth preserving — or raise CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION.

## Verification

`npm run build` passes after all round-1 changes (check-facts prebuild gate now scans app/market-map and validates all Cite/facts.cite ids against SOURCES).
