# GenMedia Market Map — Slice 3: Foundation Model Landscape
**As of: August 17, 2026.** Compiled from ~36 web searches (Jan–Aug 2026 sources prioritized). All claims cite source + date where found; items marked *(estimate)* or *(unverified)* accordingly. Note: several sources are secondary/blog aggregators; primary sources (company newsrooms, Artificial Analysis, TechCrunch, VentureBeat, the-decoder) are flagged where used.

---

## 0. The headline structural events of H1 2026

1. **OpenAI exited consumer/API video.** Sora app + web discontinued **April 26, 2026**; Sora 2 API sunsets **September 24, 2026**. Announced March 24, 2026. Reasons reported: GPU cost, weak monetization (~$2.1M lifetime revenue reported by one secondary source — treat that figure as reported-but-unaudited), copyright friction, IPO-driven pivot to coding/enterprise. The Disney/Sora partnership (~$1B) unwound with it. Sources: [OpenAI Help Center](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation), [the-decoder](https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/), [TechCrunch, 2026-03-24](https://techcrunch.com/2026/03/24/openais-sora-was-the-creepiest-app-on-your-phone-now-its-shutting-down/), [eMarketer](https://www.emarketer.com/content/openai-discontinue-sora-app-disney-exits-partnership). **Investor takeaway: the best-known Western consumer video brand exited; OpenAI kept image (GPT Image 2, #1) but ceded video.**
2. **"Omni" unification became the dominant architecture story.** Google Gemini Omni (I/O, May 19, 2026), Kling 3.0 Omni (Feb 2026), MiniMax H3 (July 2026), BFL FLUX 3 (July 2026), NVIDIA Cosmos 3 (June 2026) — all single models spanning text/image/video/audio (some add action/robotics). Specialized single-task stacks are being absorbed.
3. **Chinese labs took most of the video-quality frontier.** Per Artificial Analysis text-to-video (with audio) arena, 8 of the top 10 are Chinese models as of Aug 2026 ([howaiworks summary of AA arena](https://howaiworks.ai/blog/best-ai-video-generator); leaderboard: [artificialanalysis.ai/video](https://artificialanalysis.ai/video/leaderboard/text-to-video)).

---

## 1. Frontier multimodal / general models with media generation

### Google DeepMind — Gemini Omni / Veo 3.1 / Imagen 4 / Nano Banana line
- **Gemini Omni** announced at I/O 2026 (May 19): unified family — text/image/audio/video in, physics-aware video out, **conversational video editing** (iterative plain-English edits without re-prompting). **Gemini Omni Flash** shipped same day across Gemini app, Flow, **YouTube Shorts**, AI Studio/Gemini API; a further Flash update announced June 30, 2026. Sources: [buildfastwithai](https://www.buildfastwithai.com/blogs/gemini-omni-google-ai-video-model-review), [presenc.ai I/O coverage](https://presenc.ai/research/google-io-2026-gemini-omni-flash).
- **Quality:** **Gemini Omni Flash is #1 on Artificial Analysis text-to-video (with audio) arena, Elo ~1,245** as of Aug 2026; one source says it "holds all four AA Video Arena boards" ([buildmvpfast, July 2026](https://www.buildmvpfast.com/api-costs/ai-video)). *(Leaderboard positions shift weekly; verify at publication.)*
- **Pricing:** Omni Flash **$0.10/sec ($6/min)**. Veo 3.1 tiers: **Lite $0.05/sec (720p, native audio)**, Fast ~$0.10–0.15/sec, Standard up to ~$0.40–0.75/sec depending on audio/resolution ([veo3gen/costgoat/buildfastwithai pricing pages, 2026](https://costgoat.com/pricing/google-veo)). Veo 3.1 (Oct 14, 2025): 8s clips, 720p–4K, native audio. **No Veo 4 exists as of mid-2026** — Omni appears to be the successor track ([veo3gen, July 2026](https://www.veo3gen.app/blog/veo-4-pricing-comparison-google-vs-alternatives)).
- **Image:** "Nano Banana 2" (Gemini 3.1 Flash Image Preview) — **#3 on AA text-to-image, Elo ~1,326**; API $0.045 (512px) to $0.151 (4K), 50% off via Batch ([aifreeapi pricing guide](https://www.aifreeapi.com/en/posts/nano-banana-2-pricing)). Imagen 4 Fast at **$0.02/image** is the cheapest quality tier on the market ([rogue-marketing, May 2026](https://the-rogue-marketing.github.io/google-nano-banana-imagen-4-image-generation-pricing-may-2026/)).
- **Distribution moat:** Gemini app, Flow, YouTube Shorts, Workspace, Cloud/Vertex — widest of any player. Closed weights throughout.

### OpenAI — GPT Image 2; video exited
- **GPT Image 2** ("ChatGPT Images 2.0"), launched **April 21, 2026**: **#1 on all three major text-to-image leaderboards (AA Elo ~1,375)**, 2K native resolution, multilingual text rendering, first image model with a "thinking" mode ([llm-stats](https://llm-stats.com/leaderboards/best-ai-for-image-generation), [tech-insider](https://tech-insider.org/best-ai-image-generator-2026/)). API: **$0.03 (1K) / $0.05 (2K) / $0.08 (4K) per image** ([unifically](https://unifically.com/blogs/gpt-image-2)). Closed weights.
- **Sora 2** (before sunset): $0.10/sec 720p standard, Pro $0.30–0.70/sec by resolution, Batch −50% ([eesel](https://www.eesel.ai/blog/sora-2-pricing), [costgoat](https://costgoat.com/pricing/sora)). Jan 10, 2026: generation restricted to Plus/Pro subscribers. Full exit per §0. Voice/TTS continues but was not a 2026 focus in sources found.

### Microsoft — MAI-Image line (new entrant, fast riser)
- MAI-Image-1 (Oct 2025, debut #9) → MAI-Image-2 (Mar 2026, #3) → MAI-Image-2.5 (May 2026, #3; #2 in image editing) → **MAI-Image-2.6 (Aug 2026, #2 overall on Arena, behind only GPT-Image-2; +79 Elo over 2.5)** ([Microsoft AI newsroom](https://microsoft.ai/news/introducing-mai-image-2-5/), [Neowin, Aug 2026](https://www.neowin.net/news/microsofts-new-maiimage26-outperforms-all-rivals-except-gptimage2-on-arena-leaderboard/)). Distribution: Copilot/Bing. Closed weights. Signals Microsoft reducing OpenAI dependence in media.

### xAI — Grok Imagine (Aurora)
- Grok Imagine = image gen + editing + image-to-video + video editing inside Grok/X apps. Originally used BFL FLUX.1 (Aug 2024); **the BFL partnership ended** — xAI's own **Aurora** (Flux-architecture-derived, per secondary sources) now powers it ([Sifted](https://sifted.eu/articles/xai-black-forest-labs-grok-musk)). **Grok Imagine Video 1.5**: 5–30s generations, very fast; **claimed #1 on image-to-video 720p arena as of May 2026** ([imagine.art guide](https://www.imagine.art/blogs/xai-grok-imagine-video-1-5-guide)) *(single-source; AA current boards show Chinese models on top — flag conflict)*. API via xAI + aggregators; free/paid daily caps on X. Differentiation: speed, permissiveness, X distribution.

### Meta — Movie Gen never shipped as a product; Vibes is the play; FLUX inside
- Movie Gen (30B, 16s 1080p + audio) remains research-only; no public API as of mid-2026. Consumer access = **Vibes** feed (launched Sept 25, 2025) in Meta AI app; lightweight Movie Gen variants power Reels "Backdrop"/AI Studio effects ([felloai](https://felloai.com/meta-ai-video-generator/), [nemovideo](https://www.nemovideo.com/blog/meta-ai-video-generator)). Direct chat video gen still not GA as of May 2026. **Meta is a major BFL customer: reported $140M multi-year agreement** ([Sacra](https://sacra.com/c/black-forest-labs/)) — i.e., Meta partially *buys* image frontier rather than shipping its own.

### ByteDance — Seedance / Seedream (see §2/§3) — frontier-tier, China-first distribution (Jimeng, Doubao, CapCut) with Ark platform API.
### Alibaba — Wan + Qwen-Image (see §2/§3) + led Shengshu's $290M round (Apr 2026).
### Tencent — Hunyuan (see §2/§3): the largest open-weights image model (80B) + open video line.

---

## 2. Video models (the most contested modality)

**Leaderboard snapshot (AA text-to-video with audio, Aug 2026):** 1. Gemini Omni Flash (~1245) · 2. MiniMax H3 (~1238) · 3. Dreamina Seedance 2.0 (~1223) · … Veo 3.1 has slid to ~11th. Top-to-11th spread only ~150 Elo — adjacent ranks within noise ([AA via howaiworks, Aug 2026](https://howaiworks.ai/blog/best-ai-video-generator)). Open-weights (with audio): MiniMax H3 (~1237) far ahead of LTX-2.3 Fast (976) / Pro (958).

| Model | Version / date | Max length / res | Native audio | Weights | API price (public) |
|---|---|---|---|---|---|
| Google Gemini Omni Flash | May 19 / Jun 30, 2026 | n/d (conversational editing) | Yes | Closed | $0.10/sec |
| MiniMax Hailuo H3 | Jul 31, 2026 | 15s, 2K/24fps, stereo | Yes | **Open (restricted license)** | ~1/3 of rivals per SaaSCity *(est.)* |
| ByteDance Seedance 2.5 | ann. Jun 23, 2026 | **30s one-pass**, 4K (2.0: 4K 10-bit) | Yes | Closed | $0.05 (Lite) / $0.15 (Fast) / $0.40 (Std) per sec |
| Kuaishou Kling 3.0 / Omni | Feb 4, 2026 | 15s, **native 4K/60fps**, lip-sync 3 new langs | Yes | Closed | Pro $0.112/sec (mute) / $0.168 (audio); Turbo ~$0.11–0.14 |
| Runway Gen-4.5 | Dec 11, 2025 (audio/long-form update) | **1-minute multi-shot**, native 4K claim | Yes | Closed | n/f in this pass |
| Google Veo 3.1 | Oct 14, 2025 | 8s, up to 4K | Yes | Closed | $0.05–0.75/sec by tier |
| Alibaba Wan 2.6 / 2.5 | Dec 2025 | 10s, 1080p (4K preview) | Yes | **2.6 weights on HF** (open line officially stops at 2.2 per one source — conflict, see note) | Wan 2.6 ~$0.05/sec *(est. from "$0.50/10s")* |
| Alibaba Wan 3.0 | Beta Aug 6, 2026 | **30s native**, 1080p + audio | Yes | **Closed** | beta |
| Vidu Q3 (Shengshu) | Jan 2026; global R2V Apr 13, 2026 | 16s native AV | Yes | Closed | n/f |
| PixVerse V6 | Mar 30, 2026 | 15s 1080p multi-shot, 20+ camera controls | Yes | Closed | n/f |
| Lightricks LTX-2 | Open-sourced Jan 6, 2026 | 10s, **native 4K/50fps** | Yes | **Fully open** (free commercial <$10M ARR) | runs on 1×RTX 4090 |
| Luma Ray3 / Ray3.14 | update Jan 26, 2026 | 16-bit HDR (first); Ray3 Modify v2v | n/f | Closed | n/f |
| OpenAI Sora 2 | sunsetting Sep 24, 2026 | 20s-class, 1080p | Yes | Closed | $0.10–0.70/sec (until sunset) |
| Pika 2.5 | latest as of May 2026 (no 3.0) | 1–10s, Pikaframes keyframing | n/f | Closed | n/f |
| Tencent HunyuanVideo 1.5 | lightweight, 1080p | — | n/f | **Open** | self-host |
| BFL FLUX 3 Video | Early Access Jul 23, 2026 | **20s with audio** | Yes | Gated now; open "Dev" planned late 2026 | gated |
| Moonvalley Marey | in Adobe Firefly Boards (Sep 2025) | first/last-frame control; "licensed-data-only" positioning | n/f | Closed | via Adobe/partners |
| Grok Imagine Video 1.5 | 2026 | short clips, 720p, 5–30s generation time | n/f | Closed | xAI API |

Notes & conflicts:
- **Wan open-weights conflict:** Alibaba Cloud blog + VibeDex say Wan 2.6 weights are on Hugging Face; Morphic's Wan 3.0 page claims the open line stops at Wan 2.2. Most likely: partial/delayed opens per version. *(Flagged, unresolved.)*
- Runway claims Gen-4.5 topped Video Arena at launch (Dec 2025, [the-decoder](https://the-decoder.com/runway-unveils-first-general-world-model-alongside-major-gen-4-5-upgrades/), [TechCrunch](https://techcrunch.com/2025/12/11/runway-releases-its-first-world-model-adds-native-audio-to-latest-video-model)); by Aug 2026 it no longer leads — 8 months of turnover.
- **Genmo (Mochi) and Haiper: no substantive 2026 news surfaced in searches — likely dormant/quiet** *(absence of evidence, flagged as such)*.
- Meta Movie Gen: research only (§1).

**Video pricing envelope (Jul 2026): $0.05–$0.75/sec; a 10s clip runs $0.50 (Wan) to $7.50 (Veo 3.1 Standard)** ([buildmvpfast API cost tracker](https://www.buildmvpfast.com/api-costs/ai-video)). Native audio is now table stakes: every frontier release since late 2025 (Veo 3.x, Kling 2.6+, Wan 2.5+, Seedance, LTX-2, Gen-4.5, H3, Vidu Q3, PixVerse V6) generates synchronized audio in-pass.

---

## 3. Image models

**AA text-to-image Elo, Aug 2026:** 1. GPT Image 2 high (1375) · 2. Reve 2.1 (1328) · 3. Nano Banana 2 (1326) · 4. GPT Image 1.5 high (1316) · 5. MAI-Image-2.5 (1311) — and MAI-Image-2.6 took Arena #2 in Aug ([llm-stats](https://llm-stats.com/leaderboards/best-ai-for-image-generation), [Neowin](https://www.neowin.net/news/microsofts-new-maiimage26-outperforms-all-rivals-except-gptimage2-on-arena-leaderboard/)). *(Two arenas — AA and LMArena-style "Arena" — differ slightly on #2/#3; flagged.)*

- **GPT Image 2 (OpenAI)** — see §1. #1 with widening lead; $0.03–0.08/image.
- **Reve 2.0/2.1** — June 2026, 4K, layout-first (posters/typography/packaging mockups); took **#2** on Arena T2I ([tryonr](https://tryonr.com/reve-2-0), [therundown](https://www.therundown.ai/p/ideogram-and-reve-rethink-how-ai-images-get-made)). Notable: a small independent lab holding a podium spot.
- **Google** — Nano Banana 2 (#3) + Imagen 4 Fast ($0.02/img cost floor). Closed.
- **Microsoft MAI-Image-2.6** — Arena #2, Aug 2026. Closed; Copilot distribution.
- **Black Forest Labs FLUX.2** (Nov 25, 2025): 4 tiers — **Pro** (~$0.03/MP API), **Flex** (~$0.06/MP on Replicate), **Dev** (32B open weights, best open T2I + single/multi-ref editing per BFL), **Klein** (Apache 2.0, sub-second on consumer GPUs) ([bfl.ai/blog/flux-2](https://bfl.ai/blog/flux-2), [VentureBeat](https://venturebeat.com/technology/black-forest-labs-launches-open-source-flux-2-klein-to-generate-ai-images-in)). Revenue: API + enterprise licenses + platform deals incl. **$140M Meta** ([Sacra](https://sacra.com/c/black-forest-labs/)); Adobe uses Kontext. **FLUX 3** (July 23, 2026) folds image into an omni model (§1/§2).
- **Midjourney** — V8.0 alpha Mar 17, 2026; V8.1 Apr 14 (default Jun 10–Jul 23; ~4–5× faster, native 2K via --hd); **V8.2 default from Jul 24, 2026** (aesthetics/personalization) ([midjourney updates](https://updates.midjourney.com/v8-1-is-now-the-default-model/), [docs](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)). Video remains **V1** (June 2025; 4×5s 480p/24fps image-to-video) — no V2 video found. Still no official API; closed weights; subscription-only. Not on blind arenas (opted out historically), so leaderboard-invisible but retains aesthetics-led community.
- **Ideogram 4.0** — layout-focused, agentic iteration; **Ideogram open-sourced 4.0** ([latent.space AINews](https://www.latent.space/p/ainews-reve-2-and-ideogram-4-layouts)) *(single-source; verify weights license before quoting)*. Typography leader historically.
- **Recraft V4.1** — May 14, 2026; design/brand-asset focus (vector, style control) ([teamday roundup](https://www.teamday.ai/blog/best-ai-image-models-2026)).
- **ByteDance Seedream 5.0** — announced Jun 23, 2026 at Volcano Engine keynote, **not independently demoed yet** ([kie.ai](https://kie.ai/blog/seedance-2-5-release-deep-dive)) — announced ≠ shipped.
- **Tencent HunyuanImage 3.0** — open-sourced Sep 28, 2025: **80B MoE (13B active), largest open image model**; **3.0-Instruct (Jan 26, 2026)** added reasoning + image-to-image ([HF](https://huggingface.co/tencent/HunyuanImage-3.0), [comfyui-wiki](https://comfyui-wiki.com/en/news/2025-09-27-tencent-open-source-hunyuan-image-3-0)).
- **Qwen-Image 2512 (Alibaba)** — cited as strongest open-weight in one eval (3.872 on an unnamed scale) ([vibedex](https://vibedex.ai/blog/wan-26-review-2026)) *(weak sourcing)*.
- **Stability AI** — **no significant 2026 model news surfaced in any search**. SD3.5 line appears stagnant at the frontier; Stable Audio continues (see §4). *(Status: faded from frontier — inference from absence, flagged.)*
- **Kling Image 3.0 / Omni** (Feb 2026) — Kuaishou now competes in image too ([Kuaishou IR](https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-30-model-ushering-era-where-everyone-can-be)).

---

## 4. Audio / music / voice

**Music — the story is licensing, not capability:**
- **Settlements:** UMG×Udio (Oct 29, 2025), WMG×Suno (Nov 26, 2025). **Sony has settled with neither.** ([Billboard](https://www.billboard.com/pro/what-suno-udio-licensing-deals-mean-future-ai-music/), [Chartlex tracker](https://www.chartlex.com/blog/business/music-industry-ai-lawsuits-tracker-2026)).
- **Suno**: Warner deal forces licensed v5/v6 models in 2026, deprecation of old models, paid download gating; **BMG deal added Aug 12, 2026** ([Forbes](https://www.forbes.com/sites/cathyolson/2026/08/12/ai-music-generator-suno-inks-latest-music-label-licensing-deal/)). April 2026 reporting described a "stalemate" phase ([OpusClip](https://www.opus.pro/blog/ai-music-news-april-2026)).
- **Udio**: pivoting to a walled-garden fan-engagement platform with UMG (creations can't leave the platform) — effectively exiting open-ended generation ([Billboard](https://www.billboard.com/pro/what-suno-udio-licensing-deals-mean-future-ai-music/)).
- **KLAY**: first AI music co licensed by **all three majors** (Nov 2025) — licensed-first entrants may leapfrog.
- **ElevenLabs Music** (Aug 2025): **$0.15/generated minute** API — an API-first wedge Suno/Udio lack ([flexprice](https://flexprice.io/blog/elevenlabs-pricing-breakdown)).
- **Google Lyria 3**: music generation wired into Gemini Live API ([aimlapi roundup](https://aimlapi.com/blog/best-text-to-speech-ai)) *(thin sourcing)*.

**Voice/TTS:**
- **ElevenLabs** — Eleven v3 ~$0.10/1k chars API; tiers $6/$22/$99/mo. Broadest product surface (TTS, dubbing, SFX, music, agents). ([quiq](https://quiq.com/blog/elevenlabs-pricing/))
- **Cartesia Sonic 3 / 3.5** — Sonic 3 GA Jan 11, 2026: ~90ms TTFA (40ms Turbo), voice-agent latency leader; on AWS SageMaker JumpStart Feb 2026. **Sonic 3.5: #1 naturalness on AA Speech Arena**, sub-90ms, 42 languages ([Together AI model page](https://www.together.ai/models/cartesia-sonic-35), [AWS](https://aws.amazon.com/about-aws/whats-new/2026/02/cartesia-sonic-3-on-sagemaker-jumpstart)). *(Minor date conflict: one source says "late 2025" release vs Jan 11, 2026 — likely announce vs GA.)*
- **MiniMax Speech 2.6** — HD (expressive, 40+ languages, aggressive price) and Turbo (<250ms) ([famulor comparison](https://www.famulor.io/blog/cartesia-sonic-elevenlabs-and-minimax-the-ultimate-comparison-for-ai-voice-agents-and-famulors-strategic-advantage)).
- **Kyutai / OpenAI voice / Stability Audio** — no notable 2026 developments surfaced in this pass *(gap, not verified absence)*.

---

## 5. 3D models
([Tripo blog](https://www.tripo3d.ai/blog/meshy-alternative), [3DAI Studio comparison](https://www.3daistudio.com/blog/best-3d-model-generation-apis-2026), [Medium comparison, Jul 2026](https://marcellinusprevailer.com/meshy-vs-tripo-ai-vs-rodin-vs-hunyuan-3d-best-ai-3d-generator-2077dd4d4533) — mostly vendor-adjacent sources; treat rankings as directional.)

- **Tripo 2.5** — speed + topology leader: Smart Mesh clean low-poly in ~2s (vs 5–8min Meshy, ~15min Rodin); rigging for bipeds *and* multi-legged creatures; 3D-printing integration.
- **Meshy** — most consistently production-ready: clean meshes, strong texturing, Blender/Unity/Unreal export; Auto Rig bipeds only.
- **Rodin Gen-2 (Deemos)** — 10B params, premium quality ceiling, premium price, no rigging module.
- **Tencent Hunyuan3D (3.0)** — best open-source; near-proprietary fidelity; biped+quadruped binding (face-count limits).
- **TRELLIS.2 (Microsoft)** — open research line continues; no rigging.
- **World Labs Marble** overlaps 3D via Gaussian-splat + collision-mesh export (§6). **NVIDIA Edify, CSM, Luma 3D: no 2026 news surfaced** *(gap)*.
- 3D remains **workflow-dominated, not leaderboard-dominated** — no omni model has absorbed rigging/retopo; the long tail here is durable.

---

## 6. World models / interactive simulation (the hottest new category)

- **Google Genie 3** — introduced Aug 2025; **public "Project Genie" launched Jan 29, 2026** for **AI Ultra subscribers, US-only**: real-time navigable worlds, 24fps, 720p, consistency for a few minutes. No Genie 4. ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie/), [DeepMind](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/))
- **Runway GWM-1** (Dec 11, 2025) — first "General World Model," autoregressive atop Gen-4.5, real-time 720p/24fps for multi-minute sessions, action-controllable (camera pose, robot commands, audio). Three SKUs: **Worlds / Avatars / Robotics**; plan to merge into one model. ([Runway research](https://runwayml.com/research/introducing-runway-gwm-1), [TechCrunch](https://techcrunch.com/2025/12/11/runway-releases-its-first-world-model-adds-native-audio-to-latest-video-model)) — note Runway explicitly bridging media → robotics revenue.
- **World Labs (Fei-Fei Li)** — **Marble** (first commercial product, Nov 12, 2025): text/image/video/layout → explorable 3D worlds; exports **Gaussian splats + collision meshes** (viewing *and* simulation); deep editing; **World API announced**; **$1B round closed Feb 18, 2026, incl. $200M from Autodesk** ([TechCrunch](https://techcrunch.com/2025/11/12/fei-fei-lis-world-labs-speeds-up-the-world-model-race-with-marble-its-first-commercial-product/), [techtimes on the Feb round + June taxonomy](https://www.techtimes.com/articles/317927/20260606/feifei-lis-world-labs-splits-world-model-three-types-marble-targets-simulation-linchpin.htm)).
- **Decart** — DOS (GPU layer) + Lucy (live world-editing/try-on) + **Oasis 3** (flagship interactive world model; photorealistic *interactive driving simulation*, June 10, 2026); **$300M raise May 2026 at ~$4B**; runs on **Amazon Trainium** ([TechCrunch](https://techcrunch.com/2026/06/10/decarts-new-world-model-can-simulate-hours-of-photorealistic-driving-with-some-caveats/), [decart.ai](https://decart.ai/)).
- **Odyssey** — Odyssey-2 (Oct 2025), causal autoregressive frame-streaming "interactive movie"; Pro and Max variants since ([worldsimulator roundup](https://worldsimulator.ai/blog/articles/best-ai-world-models)).
- **NVIDIA Cosmos 3** (June 1, 2026) — "first fully open omnimodel" for physical AI: text/image/video/ambient-sound/**action**, mixture-of-transformers; **Cosmos Coalition** launched with Black Forest Labs, Runway, LTX, Skild AI, Agile Robots, Generalist ([NVIDIA newsroom](https://nvidianews.nvidia.com/news/nvidia-launches-cosmos-3-the-open-frontier-foundation-model-for-physical-ai)). NVIDIA is arming the ecosystem with open world models the way Llama armed LLMs.
- **DeepMind SIMA** — no fresh 2026 news surfaced *(gap)*.
- Investor lens: world models are where media, gaming, and robotics budgets converge; every major raise in this slice in 2026 ($1B World Labs, $300M Decart, $290M Shengshu) touches it.

---

## 7. Specialized media models — absorbed vs surviving

- **Lip sync / avatars:** **Sync (ex-Sync Labs)** = quality + developer-API leader, powers other platforms, 3–8s processing; **Tavus** = real-time conversational stack (Phoenix-4 render, Raven-1 perception, Sparrow-1 dialogue; <500ms end-to-end); **Hedra Character-3** = expressive character animation, but flagged **deprecated in LiveKit's plugin catalog** — squeeze evidence; HeyGen LiveAvatar / Anam active. Real-time production-grade lip sync expected late 2026. ([crazyrouter, May 2026](https://crazyrouter.com/en/blog/ai-lip-sync-tools-comparison-may-2026-apis-avatars-dubbing), [toughtongue](https://www.toughtongueai.com/blog/best-virtual-avatar-solutions-2026)). Meanwhile Kling 3.0/Wan 2.6/H3 do native lip-sync in-model — the standalone niche is compressing toward real-time/interactive use cases.
- **Upscaling:** **Topaz Labs** — killed perpetual licenses Oct 2025 ($29/mo or $149/yr); Gigapixel 8 "Bloom" diffusion upscaler (8×). **Magnific** — acquired/absorbed by **Freepik, which rebranded the creative suite around Magnific**; Precision mode for photo-faithful work. Market wisdom: two-upscaler stack (faithful vs creative). ([topazlabs](https://www.topazlabs.com/learn/bloom-vs-magnific), [aitooltier](https://aitooltier.com/tools/magnific-ai)). Surviving because frontier models still cap at 2K–4K and workflows need fidelity control.
- **Character animation:** **Viggle 2.5** (early 2026) — JST-1 physics-aware motion transfer onto any character; huge short-form creator adoption ([flowith](https://flowith.io/blog/viggle-2-5-controllable-ai-character-animation-accessible-every-creator/)). Cartwheel (3D character motion): no 2026 news surfaced *(gap)*.
- **Video-to-video / editing:** Runway **Aleph** and Luma **Ray3 Modify** are in Adobe Firefly Boards ([Adobe blog, Sep 24, 2025](https://blog.adobe.com/en/publish/2025/09/24/firefly-boards-launches-globally-now-with-runway-aleph-moonvalley-marey-models-new-powerful-ideation-features-flexible-offers)) — Adobe as neutral multi-model distributor is a key channel for mid-tier labs. But MiniMax H3 is **#1 on AA Video Editing** as an omni model — absorption pressure again.
- **SFX**: ElevenLabs SFX + in-video native audio everywhere → standalone SFX shrinking to sound-design niches *(assessment)*.

---

## Synthesis signals

**1. Quality convergence at the frontier is real and measured.** AA video arena: ~150 Elo covers #1–#11, adjacent ranks within noise (Aug 2026). Image is the exception: GPT Image 2's lead is *widening*. Practical consequence: video model choice is now driven by **price, length, control surfaces, licensing, and distribution**, not raw quality — a commoditization signal for pure model vendors.

**2. Omni absorption is the dominant trend; the long tail survives only where workflows are deep.** In 18 months: native audio went from absent to universal in video; lip-sync, video editing, image editing, camera control all folded into frontier models (Gemini Omni conversational editing, Kling 3.0 Omni, H3's 9-image/3-video/3-audio referencing, FLUX 3 adding video+audio+action to an image lab, Cosmos 3 adding everything+action). Specialized survivors share a property the omni models don't touch: **hard workflow integration or real-time constraints** — 3D (rigging/retopo/engine export), fidelity upscaling, real-time avatars (<500ms), physics-accurate simulation. Pure single-capability API vendors (standalone lip-sync, SFX, frame interpolation) are being squeezed (Hedra deprecation listing as an early datapoint).

**3. Open-vs-closed gap, by modality:**
- **Video: nearly closed.** MiniMax H3 open weights sit #2 overall — the first time an open(ish) video model is frontier. Caveat: license excludes US/EU/UK/KR local deployment, so it's "open for China + rest-of-world," a new geopolitical flavor of open. Truly permissive open (LTX-2, Apache-ish; Hunyuan; Wan ≤2.2) trails frontier by a clear tier (~260+ Elo for LTX-2.3).
- **Image: small gap.** FLUX.2 Dev is the open standard, near-frontier; Hunyuan 80B and (reportedly) Ideogram 4.0 open too. But note the pattern: **Alibaba (Wan 3.0), BFL (FLUX 3), MiniMax (license carve-outs) are all closing or gating their newest tiers** — open weights increasingly a trailing-edge/distribution strategy, not a frontier strategy.
- **Audio/music: closed and license-gated** (labels, not weights, are the moat). **3D: open (Hunyuan3D/TRELLIS) is genuinely competitive.** **World models: NVIDIA Cosmos 3 is the open anchor; everyone else closed.**

**4. No single model wins every workload — heterogeneity persists, but consolidates into ~3 archetypes.** (a) Distribution-owned omni models (Google across Gemini/YouTube; Microsoft MAI in Copilot; Meta Vibes; ByteDance Jimeng/CapCut; Kuaishou; xAI/X) — winning consumer volume; (b) independent pro-grade labs (Runway, BFL, Luma, Moonvalley, Reve, Recraft, ElevenLabs, Cartesia) — surviving via craft, control, APIs, and neutral channels like Adobe Firefly and fal/Replicate-style aggregators; (c) open/China-first labs (Alibaba, Tencent, MiniMax, Lightricks) — winning on price and self-hosting. The Sora shutdown is the cautionary tale: frontier quality + no distribution economics = exit. Conversely Runway and BFL show the escape route independents are betting on: **pivot the media model into robotics/world-model data engines** (GWM Robotics, FLUX 3 action prediction on Audi lines, Cosmos Coalition membership).

**5. Leaderboard half-life is ~1–2 quarters.** Gen-4.5 topped the arena in Dec 2025; by Aug 2026 Gemini Omni Flash leads and Veo 3.1 is 11th. Any static "best model" claim in the market map should carry a dated-as-of stamp.

**Key unverified gaps for follow-up:** Suno v6 ship status & valuation; Stability AI corporate status; Runway 2026 funding; full Adobe Firefly partner-model roster; Cartwheel/CSM/NVIDIA Edify 3D status; OpenAI voice roadmap; confirmation of Ideogram 4.0 weights license; resolution of Wan 2.6 open-weights conflict.
