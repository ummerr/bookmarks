# evals

Side-by-side classifier evaluation output.

## Layout

- `runs/<ts>-<label>.json` — raw per-variant classifier output.
- `runs/<ts>-report.md` — diff report: per-field agreement %, null counts, side-by-side disagreement rows.

## Run

```bash
npx tsx scripts/sxs.ts              # default n=50, seed=0.42
npx tsx scripts/sxs.ts --n=100
npx tsx scripts/sxs.ts --n=20 --seed=0.7
```

## Add a variant

Edit `VARIANTS` in `scripts/sxs.ts`. A variant is `{ label, systemPrompt, model? }`. The `seed` makes `random()` deterministic so every variant sees the same sample and re-runs reproduce.

## No golden set yet

Agreement-first. Once disagreement patterns stabilise, persist judged-correct labels into `evals/golden.json` — not before.
