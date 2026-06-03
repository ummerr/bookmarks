# Gemini Omni & Google Flow: Open-Web Reaction Report — Week-over-Week

**Scope:** how Google's Gemini Omni / Omni Flash and the **Google Flow** product surface (launched 2026-05-19 at Google I/O) have been received across the open web — sentiment plus capability, competitive positioning, benchmark/leaderboard standing, pricing & access, plus international, professional/cultural, and technical angles. This revision re-pulls and re-scores the live bookmark corpus end-to-end and reframes the read **week-over-week** (launch wave vs. post-launch).
**Compiled:** 2026-05-24 · **Revised:** 2026-06-03 (rev. 7 — corpus 98→132, re-pulled + re-scored across May 19–Jun 2 in one consistent pass; week-over-week split; Flow-surface deep-read; June-3 open-web freshness sweep over the rev-6 deep-dive).
**Method:** 132 curated X posts (May 19–Jun 2; 134 pulled, 2 off-topic excluded) re-pulled from the live bookmarks DB and re-scored in one consistent Sonnet-subagent pass (per the no-paid-API rule) for sentiment toward Omni, a Flow-reference tag, and an 8-way theme tag per post — plus a June-3 open-web freshness sweep against the rev-6 reads (9 source clusters + the 4-agent first-hand Reddit deep-dive of ~140 threads). No app code touched; live site/build unaffected. Deep open-web sections (leaderboards, structured head-to-heads, Reddit deep-dive) carry forward from the 2026-05-27 read and are date-stamped where spot-checked on June 3.
**Companion:** the one-page exec brief at `/flow-brief` distills this report into a verdict + product asks; this report is the long-form evidence base behind it.

---

## Executive Summary

### 1. The verdict held: strongly positive, and flat into week 2.

Across **132 curated posts (May 19–Jun 2)**, sentiment is **68.9% positive, +81 net** — and it **did not decay**. Week 1 (the I/O launch wave, 117 posts) ran 69.2% positive / +72; week 2 (post-launch, 15 posts) ran 66.7% positive / +9. A ~2.5-point dip on a small late base is *noise, not backlash* — there was no second-week reversal. The corpus is heavily front-loaded (117 of 132 in week 1), so week-2 percentages rest on a thin base, but the direction is unambiguous: the launch read survived contact with the following week.

### 2. The editing reframe is now the consensus — and ~45% of all posts.

"Nano Banana for video" — Omni's strength is *editing existing media*, not generating from scratch — is the single dominant narrative: **editing-praise is 59 of 132 posts (≈45%)**, the largest theme by far. Launch-day "weaker than Seedance" disappointment flipped within ~48–72 hours to "it's not a generator, it's an editor," and that frame stayed elevated every day after. The reframe even got first-party amplification: VP Josh Woodward posted the editing-as-moat framing himself on May 29.

### 3. Flow is the best-loved surface — 75% positive.

The **48 posts that explicitly name Google Flow / @FlowbyGoogle run 75.0% positive (+34 net)** vs 68.9% for the corpus overall. The app-layer surface outperforms the model in isolation: complaints (quota, censorship, the 10s cap, raw generation quality) cluster on the *model*, while Flow-named posts skew toward feature delight — the **Agent** workflow and the new **Character (personality)** feature, which is landing internationally (JP, ES, AR, FR).

### 4. A creator-monetization flywheel started forming in week 2.

Week 1 was "this is magic" discovery; week 2 shifted toward **monetization and how-to**. Concrete earnings claims routing through Flow + Omni appeared: *"printing $9,400/month"* (@shmidtqq), *"$14,200 from 15-second videos"* (@Lummox_eth). Small N, but it's the earliest sign of the distribution thesis turning into a creator-economy loop rather than just hype.

### 5. Three open wounds — still unhealed as of June 3.

**API:** still unshipped, still "coming weeks," no date — which blocks devs *and* blind-vote leaderboard entry, so "trails Seedance on raw quality" stays unrebutted. **Over-censorship bug `b/515000564`:** still open; harmless prompts rejected, actively pushing refused users to Kling. **Quota:** the May 28 adjustment (2× Ultra Omni gens, failed generations no longer charged, Flash-Lite free) was a *partial* walk-back of the I/O nerf — real, but not a restoration; the cancel narrative isn't fully dead.

### 6. Raw quality and "world model" remain the credibility ceiling.

Every same-prompt structured test still lands Seedance 2.0 ahead on raw from-scratch generation, motion, and physics; the 10-second Flash cap reads as a weak look for 2026 against Seedance (15s) and Sora 2 Pro (25s). The "world model" claim stays disputed — energy-gaining marbles, morphing hero ships, failed object tracking — read by simulation-literate critics as *learned motion statistics, not enforced physical law*. The verdict that stuck: *"a superb cinematographer with a weak memory."*

---

## Week-over-Week

**The headline of this revision: sentiment held flat.** The launch spike did not give way to a second-week backlash — a common pattern for hyped model launches that did *not* happen here.

| Window | N | pos% | neu% | mixed% | neg% | NET |
|--------|---|------|------|--------|------|-----|
| May 19–27 (launch wave) | 117 | 69.2% | 12.8% | 10.3% | 7.7% | +72 |
| May 28–Jun 2 (post-launch) | 15 | 66.7% | 13.3% | 13.3% | 6.7% | +9 |

Positive share dips only ~2.5 points; negative share actually ticks *down* (7.7% → 6.7%). The corpus is front-loaded — 117 of 132 posts land in week 1, the I/O wave — so the week-2 read is directional on a small base, not statistically heavy. What changed is the *content mix*, not the polarity.

**What shifted week-over-week (theme counts):**

| Theme | Week 1 (May 19–27) | Week 2 (May 28–Jun 2) |
|-------|---|---|
| editing-praise | 52 | 7 |
| flow-feature | 19 | 3 |
| vs-competitor | 17 | 0 |
| generation-critique | 14 | 1 |
| monetization | 1 | 2 |
| quota-complaint | 4 | 0 |
| censorship-bug | 2 | 1 |
| other | 8 | 1 |

- **Week 1 = discovery + the reframe.** The "this is magic / Nano Banana for video" framing, the launch-day Seedance comparison (all 17 `vs-competitor` posts land in week 1), and the bulk of editing-praise.
- **Week 2 = monetization + tutorials, consensus intact.** `vs-competitor` and `quota-complaint` vanish; `monetization` *doubles* off a tiny base (1→2). The Flow-named subset actually nudges *up* week-over-week (74% → 78% positive). Week 2 is creators teaching each other how to earn with the tool, with the editing-praise consensus carried forward — not re-litigated.

The one genuinely new week-2 negative is the **censorship/region story persisting** (@ai_for_success on India gating, May 27; @bitcloud's "switch back to Kling" list, May 28) — the same open wound, not a fresh quality rejection.

---

## The Narrative Arc: From "Worse Than Seedance" to "It's a Video Editor"

**The central story of Omni's reception is a perception shift, not a static verdict.** First-wave reactions judged Omni as a text-to-video *generator* and found it wanting against Kling/Seedance; within ~48–72 hours the frame flipped — people realized it is fundamentally a *video-editing* model, and sentiment recovered. This arc shows up in the curated corpus, the open-web structured tests, and (most dramatically) in a single 3,557-upvote Reddit thread on May 25 that consolidated the editing-as-moat reframe across the AI-video-enthusiast subs. Two weeks on, the reframe is settled.

**Corpus:** 132 curated X posts spanning 2026-05-19 to 2026-06-02, re-pulled from the live bookmark DB and re-scored in one consistent Sonnet-subagent pass toward sentiment about Omni specifically (134 pulled; 2 word-collision contaminants dropped — see Methodology).

**Overall (N=132):** Positive 68.9% · Neutral 12.9% · Mixed 10.6% · Negative 7.6% · **NET +81**.

| Sentiment | Count | % |
|-----------|-------|-----|
| Positive | 91 | 68.9% |
| Neutral | 17 | 12.9% |
| Mixed | 14 | 10.6% |
| Negative | 10 | 7.6% |

**Sentiment by day**

| Day | N | + | – | ~ | ± | Net | % Positive |
|-----|---|---|---|---|---|-----|------------|
| May 19 | 13 | 10 | 2 | 1 | 0 | +8 | 77% |
| May 20 | 16 | 9 | 3 | 4 | 0 | +6 | 56% |
| May 21 | 11 | 7 | 1 | 2 | 1 | +6 | 64% |
| May 22 | 20 | 14 | 0 | 3 | 3 | +14 | 70% |
| May 23 | 25 | 16 | 1 | 4 | 4 | +15 | 64% |
| May 24 | 4 | 3 | 0 | 0 | 1 | +3 | 75% |
| May 25 | 6 | 5 | 0 | 1 | 0 | +5 | 83% |
| May 26 | 11 | 8 | 1 | 0 | 2 | +7 | 73% |
| May 27 | 11 | 9 | 1 | 0 | 1 | +8 | 82% |
| May 28 | 3 | 1 | 1 | 0 | 1 | 0 | 33% |
| May 29 | 4 | 3 | 0 | 1 | 0 | +3 | 75% |
| May 30 | 2 | 1 | 0 | 0 | 1 | +1 | 50% |
| May 31 | 1 | 0 | 0 | 1 | 0 | 0 | 0% |
| Jun 1 | 4 | 4 | 0 | 0 | 0 | +4 | 100% |
| Jun 2 | 1 | 1 | 0 | 0 | 0 | +1 | 100% |
| **Total** | **132** | **91** | **10** | **17** | **14** | **+81** | **68.9%** |

**The editing-vs-generation reframe, by day**

| Day | editing-praise | generation-critique | vs-competitor | flow-feature |
|-----|---|---|---|---|
| May 19 | 5 | 1 | 3 | 4 |
| May 20 | 4 | 1 | 6 | 3 |
| May 21 | 4 | 3 | 2 | 2 |
| May 22 | 10 | 2 | 1 | 4 |
| May 23 | 11 | 5 | 2 | 2 |
| May 24 | 2 | 1 | 0 | 1 |
| May 25 | 5 | 0 | 0 | 0 |
| May 26 | 4 | 1 | 2 | 2 |
| May 27 | 7 | 0 | 1 | 1 |
| May 28 | 0 | 1 | 0 | 1 |
| May 29 | 4 | 0 | 0 | 0 |
| May 30 | 1 | 0 | 0 | 1 |
| May 31 | 1 | 0 | 0 | 0 |
| Jun 1 | 1 | 0 | 0 | 0 |
| Jun 2 | 0 | 0 | 0 | 1 |

**Reading the arc.** On May 19–20 the comparative judgments are the most negative ("nowhere close," "not even a fair fight") and `vs-competitor` peaks (6 posts on May 20). The counter-frame lands almost immediately — editing-praise climbs to 10–11/day on May 22–23 and never falls back to the launch-day mix. By the back half of week 1 the comparison framing has burned off (`vs-competitor` is gone after May 27) and what remains is editing-praise plus Flow-feature delight. Honest caveats: (a) `generation-critique` is non-monotonic — it spikes May 23 (5 posts, incl. @marmaduke091's *"Why is Gemini Omni so bad?"*); (b) the late-window N is small (May 28–Jun 2 totals just 15 posts); (c) the May 28 dip to 33% positive is three posts (one quota/censorship gripe, one mixed JP physics critique), not a trend.

**Representative quotes**

*Early — "Omni is worse" (May 19–20):*
> "Disappointed. Google's Gemini Omni Flash feels even weaker than Seedance 2.0." — [@lepadphone](https://x.com/lepadphone/status/2056760304386843100), May 19
> "Put it side-by-side with Seedance 2.0… it's not even a fair fight." — [@JSFILMZ0412](https://x.com/JSFILMZ0412/status/2056864860240011411), May 19
> "Google has all of YouTube to train on, unlimited compute, top talent — still Gemini Omni is nowhere close 😭" — [@shiri_shh](https://x.com/shiri_shh/status/2057112500609699900), May 20

*The pivot (May 20–22):*
> "Nobody is talking about this but Google Omni is insane at video editing… everyone is comparing it to Seedance and missing the point. Seedance is for generating from scratch. Omni is for editing videos that already exist." — [@Mho_23](https://x.com/Mho_23/status/2057151867927601413), May 20
> "Je me suis complètement trompé sur Google OMNI… On est sur le nano banana de la vidéo et le comparer à seedance était une grossière erreur de jugement." — [@sat0oshi](https://x.com/sat0oshi/status/2057045171250811165) (FR), May 20
> "Omni is pretty nuts. It is NOT Seedance. Any input in/out… quite literally industrial light & magic." — [@bilawalsidhu](https://x.com/bilawalsidhu/status/2057300479340695960), May 21
> "This is not a T2V model! Everyone is typing prompts to generate from scratch and sharing the bad results — that's not the point." — [@WolfRiccardo](https://x.com/WolfRiccardo/status/2057918363641459051), May 22
> "很多人没意识到 Gemini Omni 跟其他视频 AI 根本不是一回事…能原生编辑视频…这才叫视频编辑的质变。" — [@Soranlan](https://x.com/Soranlan/status/2057956692806267335) (CN), May 22

*Late skeptics persist (May 23, May 26):*
> "Why is Gemini Omni so bad? Demis Hassabis introduced this model 'as a step to AGI', but I don't see that at all." — [@marmaduke091](https://x.com/marmaduke091/status/2057987333622727129), May 23
> "The Chinese are still ahead (sorry). I think Google can really do well if they focus on both the model and the app layer." — [@Presidentlin](https://x.com/Presidentlin/status/2059139759373475994), May 26
> "this video was created in Google Flow. I tried it in the Gemini app and as usual it got stuck, then hit the usage limit without giving any output." — [@HarshithLucky3](https://x.com/HarshithLucky3/status/2059263488137285638), May 26

*The reframe consolidates (May 25–27):*
> "gemini omni has been underrated… its real strength is editing and modifying existing media, similar to nano banana — better at editing than generating from scratch." — [@haider1](https://x.com/haider1/status/2059303549339582643), May 26
> "Google Gemini Omni is widely underrated. This is just the Flash model, so it's only going to get better." — [@rourke_heath](https://x.com/rourke_heath/status/2058994443022385376), May 25
> "Google Flow is now powered by Gemini Omni… It keeps the movement, audio and character intact whilst making edits." — [@jerrod_lew](https://x.com/jerrod_lew/status/2059243368706957733), May 26
> "Gemini Omni is insanely impressive. People are unlocking new creative ways to use it." — [@minchoi](https://x.com/minchoi/status/2059478373777236278), May 27

*Week 2 — Character feature + monetization (May 28–Jun 2):*
> "Google Flowの『キャラクター機能』を試しました…一貫性の対象が『見た目 → 所作 → 人格』へと深層化している。" (Flow's new Character feature lets you register a *personality*, not just looks — consistency deepens from appearance → behavior → persona.) — [@kenichiota0711](https://x.com/kenichiota0711/status/2059787131888017799) (JP), May 28
> "THIS GUY IS PRINTING $9,400/MONTH… > upload raw clip to google flow > omni flash: matches physics and light in one pass." — [@shmidtqq](https://x.com/shmidtqq/status/2061456413436547471), Jun 1
> "He earned $14,200 from 15-second videos… open the Google Flow interface… select the Omni Flash model powered by Veo." — [@Lummox_eth](https://x.com/Lummox_eth/status/2061415752633078211), Jun 1
> "GOOGLE FLOW PERMITE CREAR PERSONAJES DE IA CONSISTENTES Y GRATIS. Variaciones, movimientos y transferencia de escenas." — [@aresotik](https://x.com/aresotik/status/2061889448753627249) (ES), Jun 2

**Why this isn't just influencer hype.** The curated corpus skews positive (it's the user's bookmarks of mostly AI-creator accounts — see Caveats), and on the broad open web Reddit/HN remained more negative overall. But the *specific* claim the arc lands on — that editing, not generation, is Omni's strength — is exactly what every independent structured test concluded (Curious Refuge, JXP, AtlasCloud, MindStudio, r/AIGenArt). The perception shift is therefore a real signal about the model's nature, not merely sentiment drift.

---

## Methodology

**Source clusters (9):** official+press · Reddit+HN · YouTube/long-form reviews · broad X · benchmarks/leaderboards · newsletters/analysts · international/non-English · professional & creative-industry/culture · technical/research-grade.

**Verification/freshness passes:** pricing/quota reconciliation (incl. the May 28 quota walk-back) · first-hand Reddit pull (via `.json` endpoints) · freshest-news sweep · primary-source spot-checks on leaderboards + Google blog + bug-tracker thread, re-checked **2026-06-03**.

**Sentiment scoring pass (this rev):** 132 relevant curated X posts (May 19–Jun 2; 134 pulled, 2 contaminants dropped), including Google Flow references, dumped from the bookmarks DB and re-scored in one consistent Sonnet-subagent pass (per the no-paid-API rule) for sentiment toward Omni, a `flow_ref` tag, and an 8-way `theme` tag per post. Raw input: `evals/runs/_flow-scoring-input.json`. Scoring output: `evals/runs/_flow-scored.json` + `_flow-scored-summary.md`. The two dropped contaminants: `@cgarciae88` (Gemini being "omni-present" across Gmail/Maps/Docs — the LLM, not the Omni *video* model) and `@aiwithaly` (an "Omni Flash" KitKat ad made on a different third-party product). Posts that *compare against* Seedance/Kling/Sora while genuinely discussing Google Omni are kept and tagged `vs-competitor`.

**Reddit deep-dive (4 agents, first-hand):** ~140 threads read directly via Reddit's `.json` endpoints (curl + browser UA; WebFetch/WebSearch are blocked for reddit.com), across four lenses — quality/competitive, Google/Gemini sentiment & quota, creator/pro/ethics, and freshness/trend. Scores are a 2026-05-27 snapshot (Reddit fuzzes them), spot-checked June 3.

**Consensus rule.** A finding is **high confidence only if independently corroborated across ≥2 distinct source clusters.** Single-source claims are labeled medium/low.

**Caveats.** Live-retrieval reliance (model postdates training cutoff; all claims dated ~May 19–Jun 2, 2026). Launch-echo recency — sentiment is volatile, no settled retrospectives exist. Surface bias — forums over-represent strong opinions; we report sentiment by surface. The bookmark corpus is curated (the user's bookmarks of mostly AI-creator accounts) and skews more positive than the broad web; it is also heavily front-loaded into week 1 (117 of 132), so week-2 percentages rest on a small base. **LLM-vs-video conflation:** "Gemini 3.5 Flash" (Google's LLM) has its own strong arena scores — excluded; they do not belong to Omni Flash (video). "Kling 3.0 Omni" is a separate ByteDance/Kuaishou product line, not Google's Omni — they share a word, not a model.

---

## Overall Sentiment, by Surface

| Surface | Net read | Notes |
|---|---|---|
| Official + tech press | Cautiously impressed; "waiting for proof" | Promotional → skeptical (non-disclosure of pricing details, no API). |
| Newsletters / analysts | Measured: bullish on strategy, bearish on raw quality | "New architecture + distribution moat, but fidelity trails Seedance/Sora/Kling." |
| Hacker News | Net-skeptical to mixed (~45/35/20 neg/mixed/pos) | Physics overclaim picked apart by sim/VFX pros. |
| Reddit (first-hand, ~140 threads) | Mixed-to-negative on Gemini app; mixed-to-positive on Omni-the-model | **Usage-limit/pricing rage dominated** through May 27 (3,400 aggregate upvotes across cancel threads); the *model* runs mixed with the same arc — and **rebounded** May 25 on a single 3,557-upvote "Omni is for editing" thread. Working-pro subs still silent. |
| X / Twitter (broad) | Genuinely split | Multi-voiced criticism + functional-backlash wave. |
| YouTube reviewers | Optimistic on concept, underwhelmed on fidelity | "Solid mid-to-upper tier," below Seedance; editing is "the real product." |
| International (CN/JP/KR/IN/EU/LatAm) | Positive on concept, locally skeptical on quality | Same "Seedance generates, Omni edits" verdict; loud regional access gripes; documented EU consumer-rights refund successes. |
| — Curated posts (132, rev 7) | **Net positive (68.9%), flat W1→W2** | Rosiest surface (creator selection bias); within it, sentiment runs 56–82% across launch week and holds into week 2 (see *Week-over-Week*). |

**Flow as a surface — the best-received slice.** Posts that explicitly name Google Flow / @FlowbyGoogle skew meaningfully more positive than the model in isolation:

| Group | N | % positive | NET |
|---|---|---|---|
| Flow-named subset (@FlowbyGoogle / "Flow") | 48 | **75.0%** | +34 |
| Overall corpus | 132 | 68.9% | +81 |

Flow-subset breakdown: 36 positive / 4 neutral / 6 mixed / 2 negative. Complaints target quota and clip length, not the interface — *"flow has improved a lot with omni"* ([@Dheepanratnam](https://x.com/Dheepanratnam/status/2057719129918915007), May 22), *"Google Flow is much better"* ([@bennash](https://x.com/bennash/status/2057830298222501983), May 22), *"flow is just amazing, with OMNI in it it's unstoppable"* ([@sat0oshi](https://x.com/sat0oshi/status/2058091301543825609), May 23). The two negative Flow references are the May 26 quota-lockout complaint (@HarshithLucky3) and the India/region-gating refusal (@ai_for_success). Net: Flow is the hero surface.

**Theme counts (relevant only, N=132)**

| Theme | Count |
|-------|-------|
| editing-praise | 59 |
| flow-feature | 22 |
| vs-competitor | 17 |
| generation-critique | 15 |
| other | 9 |
| quota-complaint | 4 |
| censorship-bug | 3 |
| monetization | 3 |

The dominant narrative is **editing praise** (59/132 ≈ 45%) — the "Nano Banana for video" framing. The second cluster is **Flow-feature** delight (Agent mode, Characters/Scenes, character consistency). The main negatives are the **10-second cap / generation-from-scratch weakness** (`generation-critique` + `vs-competitor`) and **regional gating / refusals / quota** (`censorship-bug` + `quota-complaint`).

---

## Capability Breakdown

*(Capability findings carry forward from the 2026-05-27 open-web read; no first-party capability changes shipped May 28–Jun 2 beyond the quota adjustment in Pricing & Access.)*

**High confidence (multi-cluster):**
- **Conversational multi-turn editing = the headline strength.** Describe a change; it reworks that element while preserving scene/character continuity. Praised everywhere; structurally unique (competitors require full regeneration). The "Omni is Nano Banana for video" frame is now universal across X, Reddit, comfyui, and the trade press.
- **The new Flow Character feature (week 2 signal):** register a *personality*, not just a look — consistency deepens from appearance → behavior → persona ([@kenichiota0711](https://x.com/kenichiota0711/status/2059787131888017799), JP, May 28; echoed in ES/AR/FR). This is the freshest capability talking-point and is landing internationally.
- **Object-class continuity rule:** community-documented heuristic — Omni multi-turn editing holds when the swapped object's motion class matches the original (car→bear: held; car→helicopter: regenerated from scratch). A prompting rule, not a first-party disclosure.
- **Native synchronized audio shipped** (sfx/narration/music in one pass, ~200ms sync). **Audio/speech *editing* of clips deliberately withheld** (deepfake/election-year safety).
- **10-second clip cap** (Flash tier), framed by Google as a deployment choice, not an architecture limit — first-party framing, unverified.
- **Forced, non-optional SynthID watermark** (+ C2PA Content Credentials) on every output.
- **Single-model multimodality** — text+image+audio+video reasoned over jointly; seen as a real differentiator.
- **Physics/"world model" — disputed.** Concrete violations documented across HN, X, YouTube, analysts, Reddit, Japanese hands-on, and the r/AIGenArt structured test ("a superb cinematographer with a weak memory"). World-knowledge / historical-era detail, by contrast, is genuinely strong (Omni won a multi-model "1920s era" test).
- **Text rendering — contested.** Strong on English/Latin (ReviewsTown: "best in class"); weak on dense non-Latin in absolute terms (JXP: 11/46 hiragana correct; dense Chinese fails). **But** Japanese reviewers rate Omni's Japanese rendering *above Seedance's* (which produced mojibake). Net: good Latin, shaky dense-CJK, possibly still ahead of Seedance for Japanese.

**Medium / single-source:**
- **~4-turn editing ceiling** before motion/character drift compounds; object tracking reliable to ~3 elements (JXP; echoed by AtlasCloud and r/AIGenArt). No source explains *why* it degrades at ~4 turns.
- **~720p, ~10s**, optimized for speed over fidelity. **10s is below the emerging competitive floor:** Seedance 2.0 ships 4–15s, Sora 2 Pro ships up to 25s on web. Industry roundups treat 10+s as "baseline expectation, not differentiation."
- **Image/audio *output*, avatars, general features are partial** at launch — "create anything from any input" is aspirational vs. the narrower video-out rollout. No 3D output found.

---

## Competitive Positioning & Structured Head-to-Heads

*(Structured-test results carry forward from the 2026-05-27 read; re-checked June 3 with no new same-prompt benchmark displacing them.)*

**Positioning consensus:**
- **vs Veo (Google's own):** *alongside, not replacing.* Veo = cinematic/broadcast specialist (higher fidelity, longer chainable shots); Omni = Gemini-native conversational editing.
- **vs Seedance 2.0 (ByteDance):** the dominant comparison. Seedance leads raw quality/motion/physics; Omni leads editing + workflow + single-pass audio. Seedance scores ~1/5 on conversational editing.
- **vs Sora 2 (OpenAI):** Sora 2 stronger on complex-scene physics and longer single clips (Pro ~25s vs 10s). The Sora-audience pivot — r/SoraAi shifted from "Omni is the heir to the throne" to *"Gemini Omni is missing something… personality"* ("audio from speech sound like AI voices from 2-3 years ago"). Audio/dialogue quality is a real complaint vector. *(Freshness note: OpenAI is sunsetting **consumer** Sora, opening this lane — the gap to watch is audio/personality.)*
- **vs Kling 3.0 / Wan 2.7 (China):** Kling wins high-volume/credit economics; Wan 2.7 is the closest unified-multimodal analogue. Kling also benefits directly from Omni's censorship false-positives (refused users routed to Kling). **Note:** "Kling 3.0 Omni" (ByteDance/Kuaishou's Pro tier) is a separately-named product — not Google's — and displaced Veo 3.1 at #3 on Artificial Analysis T2V.
- **vs LTX 2.3 / local open models:** r/comfyui 1tk0h1g (146↑, May 21) ran an RTX 4060Ti local LTX 2.3 setup against Omni on a mech action prompt and concluded *"Every model beats Omni."* The local-AI community is unimpressed.

**Structured tests (concrete results):**

| Test | Method | Result |
|---|---|---|
| **Curious Refuge** "Pro tests" | 4 same-prompt head-to-heads (Omni vs Seedance ±Luma/Kling) | **Seedance 3, Omni 1.** Omni lost explosion/transformation/lip-sync; **won the 1920s-era test** (best era detail). |
| **JXP** "22 tests, 3 failures" | 22 prompts ×2, 5 categories (Omni-only) | 86% success; avg 48s; 4-turn editing ceiling; failures = Japanese text (11/46 hiragana), dense Chinese, unpredictable policy blocks. **8.4/10.** |
| **Mateo S. Filipovic** "48 hours" | Same 8 projects across Omni/Seedance/Kling, 4 scored rounds | Quality → **Seedance**; Speed/iteration → **Omni**; Cost → **Kling**; Workflow → **Omni**. Verdict: 3-tool stack. |
| **AtlasCloud** | 3 sequential edits of one scene | Identity/posture held across 3 turns. Omni multi-turn 3/5 vs Seedance ref-based 4/5 — but Seedance "can't maintain across editing sessions." |
| **MindStudio / Analyst Uttam** | 8-dimension tables | Audio/prompt-adherence/editing → **Omni**; quality/motion/character/cinematic/style → **Seedance**. |
| **r/AIGenArt "World Model" test** (May 24) | Same brief vs Kling 3.0 Pro and Seedance 2.0; same seed frame | **Kling & Seedance held object continuity across cuts; Omni morphed the hero ship between exterior shots, front-loaded dialogue, failed object tracking on simultaneous explosions.** *"A superb cinematographer with a weak memory."* |
| **r/GeminiAI multi-turn rule** (May 25) | 2 weeks of multi-turn edits, classified by motion-class similarity | **Object-class continuity rule:** within-class swap → composited; cross-class swap → regenerated. Empirical, reproducible. |
| **r/comfyui LTX 2.3 same-prompt** (May 21) | Local LTX 2.3 on RTX 4060Ti vs Omni, mech action prompt | LTX 2.3 wins; *"Every model beats Omni"* in top comment. Damaging for the world-model framing. |

**How solid is "trails Seedance, leads on editing"?** *Correct in direction, soft on rigor.* Every source agrees; the only clean tally (Curious Refuge 3-1) and the leaderboards back it. **No large-N blind-vote number for Omni exists** (no API), and the strongest "tables" are star ratings, not blind scoring. The editing-lead is the best-supported part because it is structural — though its real ceiling is the 4-turn drift and the cross-motion-class regeneration cliff.

---

## Benchmark / Leaderboard Standing (read 2026-05-27, re-checked 2026-06-03)

- **Omni is STILL NOT listed on any public video leaderboard** — verified on Artificial Analysis (T2V + I2V) and arena.ai/LMArena (T2V + I2V) on 2026-05-27, re-checked June 3. It can't enter yet: blind arenas need API access, which remains unshipped.
- **Google published no numeric benchmarks**; the model card explicitly defers evals (T2VA, I2VA, R2VA, editing, image-gen) to the API rollout.

| Board | #1 | #2 | #3 |
|---|---|---|---|
| Artificial Analysis — T2V (with audio) | Dreamina Seedance 2.0 720p (1,214) | HappyHorse-1.0 (1,209) | **Kling 3.0 Omni 1080p (Pro) (1,105)** |
| Artificial Analysis — I2V | Dreamina Seedance 2.0 720p (1,180) | HappyHorse-1.0 (1,170) | Veo 3.1 Fast (1,093) |
| arena.ai (LMArena) — T2V | dreamina-seedance-2.0-720p (1457±9) | happyhorse-1.0 (1435±9) | veo-3.1-audio-1080p (1372±11) |

*(Reminder: "Kling 3.0 Omni" is ByteDance/Kuaishou's product line — same word, different model. Not Google's Omni Flash.)*

---

## Pricing & Access

**Subscription tiers (US; include Omni for paid tiers):** AI Plus **$7.99** (2× usage, 200 Flow/Whisk credits) · AI Pro **$19.99** (4×, 1,000 credits) · AI Ultra **$99.99** base (5×) · AI Ultra premium **$200** (20×, + Project Genie). The "$249.99" in some coverage is the *discontinued* old Ultra price. Two parallel quota systems (compute multipliers **and** a separate Flow/Whisk credit pool) caused the cross-source confusion.

**The May 28 quota walk-back (new this rev).** Following Pichai's May 23 *"progress soon"* line, Google shipped a partial adjustment on **May 28**: **2× Ultra Omni generations**, **failed generations no longer charged against quota**, and **Flash-Lite made free**. This is real relief — but it's a *walk-back of the I/O nerf*, not a restoration of the old monthly credit pools (1,000 Pro / 25,000 Ultra). The cancel narrative cooled but is not dead; week-2 posts still reference quota distrust. Treat quota as **half-healed**.

**Regional pricing/availability:**
- **EU — feature-gated:** personal-video input and custom avatars **blocked** on EU data/AI-regulation grounds. r/GeminiAI *"Gemini in EU is trash now"* (1tkrnp0, 323↑) catalogs missing features and documents a UK consumer-protection refund pathway that worked.
- **Canada:** several r/GeminiAI commenters report the same degradation — *"it became trash a few days ago when they pushed the updates. It's not a EU thing."*
- **China — geofenced:** Omni/Gemini unreachable without VPN/mirror; China rollout "not yet announced."
- **India — region-gated for video-to-video:** *"After having no success with the video editing feature… I finally found out that it's currently not supported in India."* ([@ai_for_success](https://x.com/ai_for_success/status/2059694713545146823), May 27). Subscription pricing is live (AI Pro ~₹6,500/mo, Ultra ~₹19,500/mo) but the editing surface is gated.
- **Japan:** Flow ¥2,900/mo = 1,000 credits (~¥87 per 10s T2V clip; ~¥116 edit) — "quite cheap."

**Other:**
- **Free path:** YouTube Shorts + YouTube Create, and **Omni Flash in Google Flow** for free users (tight allowance; Reddit reports ~50 credits/day, a 10s clip ≈ 30 credits). As of May 28, **Flash-Lite is free**.
- **Region gating:** video-to-video is **geo-blocked in the EEA, UK, Switzerland, India, and some US states**. Avatar feature is **18+, US/non-EEA, English-only**.
- **No public/Vertex API at launch;** "coming weeks," **no firmer date as of 2026-06-03**. Community workarounds route through async REST polling on AI Studio, fal, OpenRouter, AtlasCloud.
- **Over-censorship bug `b/515000564`:** acknowledged by VP Josh Woodward — **still open as of June 3**. Harmless prompts still rejected: *"Google Omni is amazing. Here's six things you can do: 1. Get rejected for looking too much like a celebrity 2. Get rejected for using a bad word… 6. Delete Gemini and switch back to Kling."* ([@bitcloud](https://x.com/bitcloud/status/2059811317897400484), May 28). It is the one wound directly handing creators to a competitor.
- **Quota burn (model-side):** Omni video remains the most quota-expensive action; the *"3 videos per day"* Flash limit drew gripes — *"This '3 videos per day' limit is killing my momentum on experimenting."* ([@AIWarper](https://x.com/AIWarper/status/2057913399196238085), May 22). The May 28 adjustment eases but does not erase this.

---

## International / Regional Reactions

- **Same global verdict, locally re-skinned:** every region independently lands on "Seedance generates, Omni edits." China frames it as home-team Seedance/Wan/Kling defending the lead.
- **China:** positive on the editing concept; consistent caveats on quota burn and that Omni "defaults to English unless explicitly prompted in Chinese." @Presidentlin (May 26) — *"The Chinese are still ahead (sorry)… focus on both the model and the app layer"* — and @VincentLogic (May 23, Chinese) praised Flow's Agent mode generating 14 storyboard frames with a consistent character (*"主角居然没长歪"* — "the protagonist's face didn't even drift").
- **Japan (most critical region):** "good editor, weak generator." Across same-prompt head-to-heads viewers preferred Seedance; physics called "clearly zero-gravity." **But Omni renders Japanese on-screen text far better than Seedance's mojibake** — a real CJK advantage. The new **Character feature** is landing here as the freshest week-2 talking point ([@kenichiota0711](https://x.com/kenichiota0711/status/2059787131888017799), May 28). A mixed JP read persists on raw generation ([@Yokohara_h](https://x.com/Yokohara_h/status/2060052885132722672), May 28).
- **Korea:** uniformly enthusiastic in tech press, framed around "talk to it like a friend"; no local-model comparison.
- **India:** very positive on the concept and creator-framed, but the **video-editing surface is region-gated** (above) — the sharpest India-authored read mirrors the global Seedance verdict while flagging access friction.
- **Spain / LatAm (new this rev):** Flow's free, consistent-character workflow is being taught in Spanish — *"GOOGLE FLOW PERMITE CREAR PERSONAJES DE IA CONSISTENTES Y GRATIS"* ([@aresotik](https://x.com/aresotik/status/2061889448753627249), Jun 2) — a shift from prior revs where LatAm was announcement-relay only.
- **Middle East / Arabic (new this rev):** Flow's Character/Scene workflow surfaced in Arabic-language demos ([@kamelabusamra](https://x.com/kamelabusamra/status/2060787042414391559), May 30), extending the international Flow-feature delight beyond CJK.
- **Europe:** capability interest overshadowed by **regulatory gating** and the broader Gemini-app degradation story. The "Gemini in EU is trash now" thread (323↑) remains the headline EU read.

---

## Professional, Creative-Industry & Cultural Reaction

- **Pro/VFX verdict:** good for **previz, ideation, social, ads** — **not** finished cinematic VFX or long-form. Gated by the 10s/720p cap, the non-removable SynthID watermark, and the missing API. Production work stays on Veo 3.1 / Seedance 2.0 / Sora 2 for now.
- **Pro-sub silence (still):** r/filmmakers, r/editors, r/VideoEditing, r/NewTubers, r/PartneredYoutube, r/postproduction, r/MotionGraphics, r/cgi, r/animation all return **zero** Omni results for the launch window. The "first real AI video editor" framing has won enthusiast hearts but **not pro adoption**. *Working pros are still acting like Omni doesn't exist* — the cultural firewall between the loud operator subs and the silent craft subs held.
- **The creator-monetization flywheel (the fresh week-2 story).** Week 2 produced the first concrete earnings claims routing through Flow + Omni: *"printing $9,400/month"* transforming raw footage into VFX in one pass ([@shmidtqq](https://x.com/shmidtqq/status/2061456413436547471), Jun 1), and *"$14,200 from 15-second videos"* ([@Lummox_eth](https://x.com/Lummox_eth/status/2061415752633078211), Jun 1). Small N (3 `monetization` posts), but it's the earliest evidence the distribution bet is becoming a creator-economy loop — and it routes *through Flow*, not the raw model.
- **Duration as competitive pressure (not user demand):** the 10s cap is named as a production blocker — *"that 10-second cap on Omni Flash is not a good look for 2026"* ([@JSFILMZ0412](https://x.com/JSFILMZ0412/status/2057447064812888177), May 21). Read as competitive-floor pressure (Seedance 15s, Sora 2 Pro 25s).
- **Advertising / GML — the real disruption:** Google Marketing Live's **Asset Studio** (Omni-powered) generates production-quality video assets from natural language. The most-engaged thread in the creator-pro-ethics pulse is r/PPC *"Google ads updates from GML 2026"* (1tkgxff, 43↑/15c, May 22) — *"Creative production is being compressed… The cost of creative variety just dropped significantly."* PPC operators cheering, not pushing back.
- **The "AI slop" debate — bifurcated, rarely pinned to Omni by name.** The doomer side talks about AI video *in general* with Google as accelerant; the operator side (r/AI_UGC_Marketing) reframes slop as a **skill issue**. Labor-displacement anchor stories (*"cut our content team from 6 to 2"*) remain contested in-sub.
- **Ethics / SynthID — Google is winning the watermark PR battle.** **OpenAI and ElevenLabs adopted SynthID** (May 26), making it the de-facto industry standard and defusing the bypass narrative. YouTube's May 26 update clarified AI-disclosure labels won't hurt monetization. **SAG-AFTRA: still silent on Omni.**
- **Likeness guardrails pushing UGC operators offshore.** Omni rejects many face uploads; commenters point to Chinese providers and CapCut as lower-censorship workarounds — the responsible-release posture is pushing the very operators it might win toward less-restricted models.

---

## Technical / Research-Grade Read

- **Architecture — what's actually disclosed:** Google's model card says only *"a transformer-based model with native multimodal support for text, vision, video and audio,"* trained on **TPUs with JAX/ML Pathways.** Output today is video+audio; image/audio *generation* and avatars are partial/"coming."
- **⚠ Correction (re-confirmed):** the widely-repeated **"Gemini-reasoning + Veo + Genie world-model + Nano Banana + diffusion fusion"** is **secondary-press extrapolation, not first-party.** Neither the model card nor the blog confirms Veo/Genie/Nano Banana as components, and Google never says "diffusion." "Nano Banana for video" is positioning shorthand. Treat the fusion narrative as unsubstantiated.
- **"World model" / physics, expert read:** simulation-literate HN critics read the failure modes — discontinuous contact, energy non-conservation, boundary-condition blowups — as **learned motion statistics, not enforced physical law.** Google itself hedges ("*intuitive* understanding"). The structured r/AIGenArt test (May 24) is the cleanest reproducible rejection of the world-model claim to date.
- **Multi-turn drift:** ~4-turn ceiling is empirical (JXP, AtlasCloud, r/AIGenArt). Community heuristic: edits hold within the original object's motion class; cross-class swaps trigger regeneration. Useful prompting rule; mechanism still undisclosed.
- **SynthID robustness:** Google claims survival of resize/crop/JPEG/color shifts; **untested externally for Omni video.** The only public laundering test is image-domain re-diffusion.
- **Evals:** Google deferred *all* of them (T2VA/I2VA/R2VA/editing/image-gen) to API launch; arena placement is blocked by the absent API. Judgment is premature until then.
- **Open technical questions:** is there a real world-model component or just a video transformer? learned-statistics vs. learned-law? the drift mechanism? video-domain watermark robustness? diffusion or not?

---

## Reddit Deep-Dive (first-hand, ~140 threads, 2026-05-27 snapshot, spot-checked 2026-06-03)

A four-agent pass read Reddit directly via `.json` endpoints across four lenses — quality/competitive, Google/quota, creator/pro/ethics, and freshness/trend. The June-3 sweep found no new viral thread displacing the May 25 rebound; the deep-dive below is the 2026-05-27 first-hand read.

### Where the conversation actually lives

The named professional subs — r/filmmakers, r/editors, r/VideoEditing, r/NewTubers, r/PartneredYoutube — return **zero** Omni threads. The debate is concentrated in AI-video enthusiast subs: r/singularity, r/seedance2pro, r/VEO3, r/SoraAi, r/Bard, r/GeminiAI, r/comfyui, r/AIGenArt, r/PromptEngineering, r/aivideos.

### The arc, corroborated first-hand — and a viral rebound

Launch-day framing was *"just a worse generator"* — meme-anchor *"Gemini Omni still can't make someone do a backflip"* (r/singularity, ~744↑). Within the same window it flips to a category reframe.

**Then May 25 produced a single dominating rebound thread:** *"The Strength of Gemini Omni is in video manipulation"* (r/singularity 1tniqkb, **3,557↑, 344 comments**) — a Rourke Heath v.redd.it edit demo that consolidated the "editing is the moat" narrative across r/singularity, r/accelerate, r/VEO3, and r/comfyui simultaneously. The top reply (479↑): *"its strength is in editing/modifying existing media. Nano banana is much better at editing than at generating completely new stuff as well."*

### Daily volume curve, May 19→27

| Date | Posts | Total upvotes |
|---|---|---|
| May 19 (launch) | 9 | 40 |
| May 20 | 57 | 1,141 |
| May 21 | 44 | 787 |
| May 22 | 19 | 198 |
| May 23 | 21 | 135 |
| May 24 | 26 | 141 |
| **May 25** | **42** | **4,118** |
| May 26 | 38 | 383 |
| May 27 | 16 | 34 |

One durable narrative shift ("editing is the moat") on May 25, then re-fade. No new viral thread above 200↑ on May 26–27, and none through the June-3 sweep.

### Audio is a distinct weakness vs Sora 2

r/SoraAi 1tmrzjk (75↑, 42 comments, May 24): *"no background ambience, the characters sound monotone… Sora 2 was magical."* The Sora-audience pivot from "heir to the throne" to "missing personality" is one of the cleaner narrative shifts of the week.

### The Gemini-app quota story (pre-May-28 walk-back)

Twelve biggest cancel/limit threads, summed: roughly **3,400 aggregate upvotes** through May 27 — *"Google Broke Gemini"* (454↑), *"Gemini has nerfed its pro subscribers?"* (351↑), *"Had to cancel and switch to Claude"* (318↑), *"15 prompts in 14 hours. used to be 100. cancelling."* (272↑, May 27). The May 28 adjustment (2× Ultra gens, failed gens not charged, Flash-Lite free) cooled this — but it is a partial walk-back, and quota distrust persists into week 2. The over-censorship bug has a community anchor in the May 23 system-prompt-leak thread (1,363↑).

### Credibility caveat

r/singularity threads still carry visible "Google bot" astroturfing accusations; weight hands-on tester threads over slogans. Dedicated subs (r/GeminiOmniAI, r/GoogleFlow) stayed tiny with no breakout; r/GoogleFlow's recent posts skew to quota-lockout complaints rather than Omni demos.

---

## Reconciliation: rev 6 (May 27, 98 posts) vs rev 7 (Jun 3, 132 posts)

| Rev 6 finding | Rev 7 verdict | Why |
|---|---|---|
| "66.3% pos / 8.2% neg, +57 net" (98 posts, May 19–27) | **Updated: 68.9% pos / 7.6% neg, +81 net** (132 posts, May 19–Jun 2) | +34 posts and +6 days. The headline is now slightly *more* positive and the negative share *lower* — the window widened without softening the read. |
| "Sentiment volatile; week-2 unknown" | **Resolved: sentiment held flat W1→W2** (69.2% → 66.7%, +72 → +9) | No second-week backlash. The launch read survived. This is the central new finding. |
| Flow = 28 of 98 posts, 75% positive | **Confirmed + grew: 48 of 132 posts, 75.0% positive (+34 net)** | Flow remains the best-loved surface at a larger N; its positive share is stable and even nudges up in week 2 (74% → 78%). |
| Editing reframe = dominant story | **Confirmed (hardened); now ≈45% of all posts** | `editing-praise` is 59/132. VP Josh Woodward amplified the framing himself May 29. |
| Themes: editing + quota/censorship wounds | **Refined with new `monetization` cluster** | Week 2 introduced creator-earnings posts ($9.4k/mo, $14.2k) routing through Flow — a new theme absent from rev 6. |
| Pichai's "progress soon" promise — not landed by May 27 | **Partially landed May 28** | 2× Ultra Omni gens, failed gens no longer charged, Flash-Lite free. A partial walk-back, not a restoration. |
| Over-censorship bug `b/515000564` still open May 27 | **Still open June 3** | New week-2 complaints (@bitcloud "switch back to Kling", @ai_for_success India gating). No fix shipped. |
| Public/Vertex API still not shipped | **Still not shipped June 3** | No ship window. Continues to block devs and leaderboard entry. |
| Trails Seedance on raw quality | **Confirmed (unchanged)** | No new same-prompt test displaced the Seedance-leads-on-generation verdict. |
| Working-pro penetration: zero | **Still zero** | r/filmmakers, r/editors, r/VideoEditing — still no Omni threads. |
| Curated corpus rosier than broad web | **Confirmed (still)** | 68.9% pos in bookmarks vs mixed-to-negative across HN/Reddit. |

---

## Open Questions / What to Watch

### 1. First leaderboard placement

Once the API enables arena voting — turns "trails Seedance" from qualitative into measured. **Still blocked** by no-API as of June 3.

### 2. API + pricing

"Coming weeks," no per-second economics yet. **No movement as of June 3.**

### 3. Over-censorship bug fix

Whether the prompt-rejection backlash recedes. **Still open June 3**; week-2 complaints persist and route users to Kling.

### 4. Quota trust restoration

The May 28 walk-back (2× Ultra gens, failed gens uncharged, Flash-Lite free) was partial. **Watch whether real headroom or pay-as-you-go top-ups follow** — half-fixes keep the cancel grievance alive.

### 5. The Flow monetization flywheel

New as of week 2 (3 posts). Watch whether creator-earnings content compounds — it's the leading indicator that distribution is converting to a creator economy.

### 6. The Character (personality) feature

The freshest capability talking point, landing internationally (JP/ES/AR/FR). Watch whether it becomes the durable Flow differentiator vs Sora's audio/personality edge.

### 7. EU feature ungating

Whether personal-video input/avatars arrive in Europe, and when. **No movement.** The UK consumer-rights refund pathway remains the only "win."

### 8. Omni Pro

Teased, no date. The variant expected to close the raw-quality gap.

### 9. Pro-creator adoption

r/filmmakers, r/editors, r/VideoEditing — silent through launch and into week 2. Will the editing-reframe penetrate, or does the 10s/720p cap keep it enthusiast-only?

### 10. The audio/personality complaint

Watch whether the "voices from 2-3 years ago" framing solidifies, or whether Omni Pro / a Veo-style audio update closes the gap with Sora 2.

---

## Source Appendix (by cluster)

**Fresh data (this rev):** corpus input · `evals/runs/_flow-scoring-input.json` · scored · `evals/runs/_flow-scored.json` · summary · `evals/runs/_flow-scored-summary.md` · companion exec brief · `/flow-brief`

**Official / press:** Google blog (Omni) · https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni/ · DeepMind model card · https://deepmind.google/models/model-cards/gemini-omni-flash/ · Google AI Subscriptions · https://blog.google/products-and-platforms/products/google-one/google-ai-subscriptions/ · TechCrunch · https://techcrunch.com/2026/05/19/googles-gemini-omni-turns-images-audio-and-text-into-video-and-thats-just-the-start/ · 9to5Google · https://9to5google.com/2026/05/19/gemini-omni-create-anything-model-video/

**Reddit + HN (first-hand, rev 6):** HN #48196609 · https://news.ycombinator.com/item?id=48196609 · r/singularity *"The Strength of Gemini Omni is in video manipulation"* (3,557↑) · https://www.reddit.com/r/singularity/comments/1tniqkb/ · r/GeminiAI *"Gemini just leaked its system prompt by mistake"* (1,363↑) · https://www.reddit.com/r/GeminiAI/comments/1tlq6er/ · r/GeminiAI *"Google Broke Gemini"* (454↑) · https://www.reddit.com/r/GeminiAI/comments/1tl1l5q/ · r/GeminiAI *"Gemini has nerfed its pro subscribers?"* (351↑) · https://www.reddit.com/r/GeminiAI/comments/1tk3hp2/ · r/GeminiAI *"Gemini in EU is trash now"* (323↑) · https://www.reddit.com/r/GeminiAI/comments/1tkrnp0/ · r/GeminiAI *"Had to cancel and switch to Claude"* (318↑) · https://www.reddit.com/r/GeminiAI/comments/1tnme5b/ · r/GeminiAI *"15 prompts in 14 hours. used to be 100. cancelling."* (272↑) · https://www.reddit.com/r/GeminiAI/comments/1tot09j/

**Reddit deep-dive (structured tests):** r/AIGenArt *"World Model"* test · https://www.reddit.com/r/AIGenArt/comments/1tm940y/ · r/GeminiAI motion-class rule · https://www.reddit.com/r/GeminiAI/comments/1tn3qdv/ · r/comfyui LTX 2.3 local (146↑) · https://www.reddit.com/r/comfyui/comments/1tk0h1g/ · r/SoraAi *"missing something… personality"* (75↑) · https://www.reddit.com/r/SoraAi/comments/1tmrzjk/ · r/PPC GML 2026 (43↑) · https://www.reddit.com/r/PPC/comments/1tkgxff/

**YouTube / reviews & structured tests:** Curious Refuge tests · https://curiousrefuge.com/blog/google-omni-test · JXP · https://www.jxp.com/gemini-omni/blog/gemini-omni-review · Mateo S. Filipovic (48h) · https://mateostarcevicfilipovic.medium.com/gemini-omni-vs-seedance-vs-kling-i-tested-all-three-for-48-hours-025b0fb675d4 · AtlasCloud · https://www.atlascloud.ai/blog/ai-updates/gemini-omni-multi-turn-consistency-editing · MindStudio · https://www.mindstudio.ai/blog/gemini-omni-vs-seedance-video-model-comparison

**Benchmarks (direct, 2026-05-27, re-checked 06-03):** arena.ai T2V · https://arena.ai/leaderboard/text-to-video · I2V · https://arena.ai/leaderboard/image-to-video · Artificial Analysis T2V · https://artificialanalysis.ai/video/leaderboard/text-to-video · I2V · https://artificialanalysis.ai/video/leaderboard/image-to-video

**X / functional backlash:** Google AI Dev Forum (rejection thread `b/515000564`) · https://discuss.ai.google.dev/t/omni-video-editing-instantly-rejects-harmless-prompts-in-flow-and-gemini-app/147152 · piunikaweb (bug) · https://piunikaweb.com/2026/05/20/google-investigating-issue-gemini-omni-flash/

**International:** PANews (CN) · https://www.panewslab.com/en/articles/019e4a28-5ded-774f-919e-f476e8787087 · note.com/genel (JP) · https://note.com/genel/n/n28bc5a5c0cb3 · One Media (FR, EU gating) · https://onemedia.fr/high-tech/google-gemini-omni-flash-video-voix-ia-20-mai-2026/ · AI Matters (KR) · https://aimatters.co.kr/news-report/42508/

**Technical:** DeepMind model card (primary) · (above) · Gemini Omni product page · https://deepmind.google/models/gemini-omni/ · HN physics critiques · https://news.ycombinator.com/item?id=48196609 · SynthID detector · https://deepmind.google/models/synthid/

**Pricing verification:** Google blog — AI subscriptions · (above) · the-decoder · https://the-decoder.com/google-overhauls-its-ai-subscriptions-at-i-o-2026-with-three-tiers-starting-at-10-a-month/ · Google support (limits) · https://support.google.com/gemini/answer/16275805

---

*Compiled from a 132-post Sonnet sentiment-scoring pass (input: `_flow-scoring-input.json`; scored: `_flow-scored.json`) re-pulled May 19–Jun 2, 2026 and re-scored in one consistent pass, plus a June-3 open-web freshness sweep over the rev-6 deep-dive (9 source clusters + 4 verification passes + structured head-to-heads + a 4-agent first-hand Reddit read of ~140 threads). High-confidence findings are corroborated across ≥2 independent clusters. Supersedes the rev-6 read (98 posts, May 19–27). Carried-forward deep sections (leaderboards, structured tests, Reddit deep-dive) are the 2026-05-27 first-hand reads, spot-checked June 3. Corrections re-confirmed: AI Ultra is $99.99/$200 (not $249.99); the May 28 quota adjustment is a partial walk-back, not a restoration; the "Genie/Veo/Nano-Banana fusion" architecture is unsubstantiated secondary-press; Gemini 3.5 Flash (LLM) scores ≠ Omni Flash (video); "Kling 3.0 Omni" is ByteDance/Kuaishou's product line, not Google's. Items still explicitly unverified as of June 3: exact free-tier quota (varies by source/timing), whether `b/515000564` is fixed (evidence says NOT), SynthID video-watermark robustness, and any public/Vertex API ship date.*
