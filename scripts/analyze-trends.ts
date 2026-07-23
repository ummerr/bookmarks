import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local if DATABASE_URL not already set
if (!process.env.DATABASE_URL) {
  const envPath = join(new URL(".", import.meta.url).pathname, "..", ".env.local");
  try {
    const envFile = readFileSync(envPath, "utf-8");
    for (const line of envFile.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  } catch {}
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: "require", prepare: false });

// Mirror of components/prompts/constants.ts MODEL_FAMILIES
const MODEL_FAMILIES: { label: string; patterns: string[] }[] = [
  { label: "Midjourney",       patterns: ["midjourney", "mj"] },
  { label: "Flux",             patterns: ["flux"] },
  { label: "Stable Diffusion", patterns: ["stable diffusion", "sdxl", "sd3", "sd "] },
  { label: "DALL-E",           patterns: ["dall-e", "dalle"] },
  { label: "Firefly",          patterns: ["firefly"] },
  { label: "Ideogram",         patterns: ["ideogram"] },
  { label: "Leonardo",         patterns: ["leonardo"] },
  { label: "Kling",            patterns: ["kling"] },
  { label: "Runway",           patterns: ["runway", "gen-2", "gen-3", "gen 2", "gen 3"] },
  { label: "Sora",             patterns: ["sora"] },
  { label: "Pika",             patterns: ["pika"] },
  { label: "Hailuo",           patterns: ["hailuo", "minimax"] },
  { label: "Luma",             patterns: ["luma", "dream machine"] },
  { label: "Veo",              patterns: ["veo"] },
  { label: "Wan",              patterns: ["wan"] },
  { label: "Seedance",         patterns: ["seedance"] },
  { label: "Higgsfield",       patterns: ["higgsfield"] },
  { label: "ElevenLabs",       patterns: ["elevenlabs"] },
  { label: "Suno",             patterns: ["suno"] },
  { label: "Udio",             patterns: ["udio"] },
  { label: "ChatGPT",          patterns: ["chatgpt", "gpt-4", "gpt4"] },
  { label: "Claude",           patterns: ["claude"] },
  { label: "Nano Banana",      patterns: ["nano banana", "gemini"] },
  { label: "Meshy",            patterns: ["meshy"] },
];

function modelToFamily(model: string | null): string {
  if (!model) return "Unknown";
  const lower = model.toLowerCase();
  return MODEL_FAMILIES.find((f) => f.patterns.some((p) => lower.includes(p)))?.label ?? model;
}

// Timestamp / multi-shot syntax regexes (mirror lib/db.ts:14-28)
const RX = {
  bracketTs:    /\[\d+s(?:-\d+s)?\]/i,                    // [0s], [0s-3s]
  shotLabel:    /\bshot\s*\d+/i,                           // Shot 1, Shot 2
  cutLabel:     /\bcut\s*\d+/i,
  parenSeg:     /\(\s*\d+\s*[-–]\s*\d+\s*s\s*\)/i,         // (0-5s), (5–12s)
  shotSwitch:   /\b(shot switch|cut to)\b/i,
};

function isMultiShot(text: string): boolean {
  if (!text) return false;
  if ((text.match(/\[\d+s(?:-\d+s)?\]/gi) ?? []).length >= 2) return true;
  if ((text.match(/\bshot\s*\d+/gi) ?? []).length >= 2) return true;
  if ((text.match(/\bcut\s*\d+/gi) ?? []).length >= 2) return true;
  if ((text.match(/\bscene\s*\d+/gi) ?? []).length >= 2) return true;
  if ((text.match(/\bclip\s*\d+/gi) ?? []).length >= 2) return true;
  if ((text.match(/\b(first|second|third|fourth)\s+shot\b/gi) ?? []).length >= 2) return true;
  if (/\bmulti[-\s]?(shot|scene|clip|cut)\b/i.test(text)) return true;
  return false;
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return `${((n / d) * 100).toFixed(1)}%`;
}

function hr(title: string) {
  console.log("\n" + "═".repeat(72));
  console.log(title);
  console.log("═".repeat(72));
}

type Row = {
  id: string;
  detected_model: string | null;
  extracted_prompt: string | null;
  reference_type: string | null;
  requires_reference: boolean | null;
  prompt_themes: unknown;
  bookmarked_at: Date | null;
};

async function run() {
  console.log("Pulling prompt rows...");
  const rows = (await sql<Row[]>`
    SELECT id, detected_model, extracted_prompt, reference_type, requires_reference,
           prompt_themes, bookmarked_at
    FROM bookmarks
    WHERE category = 'prompts'
  `) as unknown as Row[];

  console.log(`Loaded ${rows.length} prompt rows.`);

  const monthOf = (d: Date | null) =>
    d ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}` : "unknown";

  // ── 1. Model share over time ────────────────────────────────────────────
  hr("1. MODEL FAMILY SHARE BY MONTH (last 6 months with data)");
  const monthModel = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (!r.detected_model || !r.bookmarked_at) continue;
    const m = monthOf(r.bookmarked_at);
    const fam = modelToFamily(r.detected_model);
    if (!monthModel.has(m)) monthModel.set(m, new Map());
    const inner = monthModel.get(m)!;
    inner.set(fam, (inner.get(fam) ?? 0) + 1);
  }
  const months = [...monthModel.keys()].filter((m) => m !== "unknown").sort().slice(-6);
  const allFams = new Set<string>();
  for (const m of months) for (const f of monthModel.get(m)!.keys()) allFams.add(f);
  const famList = [...allFams];

  // header
  console.log(["FAMILY".padEnd(18), ...months.map((m) => m.padStart(10))].join(""));
  // rank by last-month count
  const lastMonth = months.at(-1);
  famList.sort((a, b) => (monthModel.get(lastMonth!)?.get(b) ?? 0) - (monthModel.get(lastMonth!)?.get(a) ?? 0));
  for (const fam of famList) {
    const cells = months.map((m) => {
      const inner = monthModel.get(m)!;
      const total = [...inner.values()].reduce((s, n) => s + n, 0);
      const n = inner.get(fam) ?? 0;
      return total ? `${n} (${((n / total) * 100).toFixed(0)}%)`.padStart(10) : "—".padStart(10);
    });
    console.log([fam.padEnd(18), ...cells].join(""));
  }

  // ── 2. Timestamp-syntax adoption ─────────────────────────────────────────
  hr("2. TIMESTAMP / MULTI-SHOT SYNTAX ADOPTION BY MONTH");
  const monthBuckets = new Map<string, { total: number; bracketTs: number; shotLabel: number; parenSeg: number; shotSwitch: number; multi: number }>();
  for (const r of rows) {
    if (!r.bookmarked_at) continue;
    const text = r.extracted_prompt ?? "";
    if (!text) continue;
    const m = monthOf(r.bookmarked_at);
    const b = monthBuckets.get(m) ?? { total: 0, bracketTs: 0, shotLabel: 0, parenSeg: 0, shotSwitch: 0, multi: 0 };
    b.total++;
    if (RX.bracketTs.test(text)) b.bracketTs++;
    if (RX.shotLabel.test(text) || RX.cutLabel.test(text)) b.shotLabel++;
    if (RX.parenSeg.test(text)) b.parenSeg++;
    if (RX.shotSwitch.test(text)) b.shotSwitch++;
    if (isMultiShot(text)) b.multi++;
    monthBuckets.set(m, b);
  }
  const tsMonths = [...monthBuckets.keys()].filter((m) => m !== "unknown").sort().slice(-6);
  console.log(["MONTH".padEnd(10), "N".padStart(8), "[Xs]".padStart(12), "Shot N".padStart(12), "(X-Ys)".padStart(12), "shot-switch".padStart(14), "multi-shot".padStart(14)].join(""));
  for (const m of tsMonths) {
    const b = monthBuckets.get(m)!;
    console.log([
      m.padEnd(10),
      String(b.total).padStart(8),
      `${b.bracketTs} (${pct(b.bracketTs, b.total)})`.padStart(12),
      `${b.shotLabel} (${pct(b.shotLabel, b.total)})`.padStart(12),
      `${b.parenSeg} (${pct(b.parenSeg, b.total)})`.padStart(12),
      `${b.shotSwitch} (${pct(b.shotSwitch, b.total)})`.padStart(14),
      `${b.multi} (${pct(b.multi, b.total)})`.padStart(14),
    ].join(""));
  }

  // ── 3. Seedance-specific slice ───────────────────────────────────────────
  hr("3. SEEDANCE SLICE (all-time)");
  const seedance = rows.filter((r) => modelToFamily(r.detected_model) === "Seedance");
  console.log(`Seedance rows: ${seedance.length} of ${rows.length} (${pct(seedance.length, rows.length)})`);
  if (seedance.length) {
    const themeCounts = new Map<string, number>();
    const refCounts = new Map<string, number>();
    let lenSum = 0;
    let lenN = 0;
    let multi = 0;
    let hasRef = 0;
    for (const r of seedance) {
      const text = r.extracted_prompt ?? "";
      if (text) { lenSum += text.length; lenN++; if (isMultiShot(text)) multi++; }
      if (r.requires_reference) hasRef++;
      if (r.reference_type) refCounts.set(r.reference_type, (refCounts.get(r.reference_type) ?? 0) + 1);
      const themes = Array.isArray(r.prompt_themes) ? r.prompt_themes : [];
      for (const t of themes) if (typeof t === "string") themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
    }
    console.log(`  avg prompt length:     ${lenN ? Math.round(lenSum / lenN) : 0} chars`);
    console.log(`  multi-shot rate:       ${multi}/${seedance.length} (${pct(multi, seedance.length)})`);
    console.log(`  requires_reference:    ${hasRef}/${seedance.length} (${pct(hasRef, seedance.length)})`);
    console.log(`  top themes:            ${[...themeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, n]) => `${t}(${n})`).join(", ")}`);
    console.log(`  reference types:       ${[...refCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}(${n})`).join(", ")}`);
  }

  // ── 4. Emerging model names (last 60 days vs prior) ──────────────────────
  hr("4. EMERGING detected_model VALUES (appear only in last 60 days)");
  const cutoff = Date.now() - 60 * 24 * 3600 * 1000;
  const recent = new Map<string, number>();
  const older = new Set<string>();
  for (const r of rows) {
    if (!r.detected_model || !r.bookmarked_at) continue;
    const key = r.detected_model.toLowerCase();
    if (r.bookmarked_at.getTime() >= cutoff) recent.set(key, (recent.get(key) ?? 0) + 1);
    else older.add(key);
  }
  const emerging = [...recent.entries()].filter(([k]) => !older.has(k)).sort((a, b) => b[1] - a[1]);
  if (emerging.length === 0) console.log("  (none)");
  for (const [name, n] of emerging.slice(0, 25)) {
    console.log(`  ${name.padEnd(30)} ${String(n).padStart(4)}   family=${modelToFamily(name)}`);
  }

  // ── 5. Reference-type shift ──────────────────────────────────────────────
  hr("5. REFERENCE-TYPE SHIFT (last 30d vs prior 90d)");
  const now = Date.now();
  const d30 = now - 30 * 24 * 3600 * 1000;
  const d120 = now - 120 * 24 * 3600 * 1000;
  const recentRT = new Map<string, number>();
  const priorRT = new Map<string, number>();
  let recentTotal = 0;
  let priorTotal = 0;
  for (const r of rows) {
    if (!r.reference_type || !r.bookmarked_at) continue;
    const t = r.bookmarked_at.getTime();
    if (t >= d30) { recentRT.set(r.reference_type, (recentRT.get(r.reference_type) ?? 0) + 1); recentTotal++; }
    else if (t >= d120) { priorRT.set(r.reference_type, (priorRT.get(r.reference_type) ?? 0) + 1); priorTotal++; }
  }
  console.log(`  last 30d:   ${recentTotal} rows with reference_type`);
  console.log(`  prior 90d:  ${priorTotal} rows with reference_type`);
  const allRT = new Set([...recentRT.keys(), ...priorRT.keys()]);
  console.log(["TYPE".padEnd(22), "recent".padStart(14), "prior".padStart(14), "delta".padStart(10)].join(""));
  for (const rt of allRT) {
    const r = recentRT.get(rt) ?? 0;
    const p = priorRT.get(rt) ?? 0;
    const rPct = recentTotal ? (r / recentTotal) * 100 : 0;
    const pPct = priorTotal ? (p / priorTotal) * 100 : 0;
    console.log([
      rt.padEnd(22),
      `${r} (${rPct.toFixed(1)}%)`.padStart(14),
      `${p} (${pPct.toFixed(1)}%)`.padStart(14),
      `${(rPct - pPct >= 0 ? "+" : "")}${(rPct - pPct).toFixed(1)}pp`.padStart(10),
    ].join(""));
  }

  await sql.end();
}

run().catch((err) => {
  console.error("Analysis failed:", err);
  process.exit(1);
});
