import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { SOURCES, CATEGORIES } from "../app/market-map/data";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");
const SCAN_DIRS = ["app/state-of-prompting", "app/market-map"].map((d) => join(ROOT, d));

// Strings we've been burned on. Add an entry every time a fabricated claim ships.
// Scope is the SCAN_DIRS above — legitimate mentions in SKILL.md postmortems,
// classifier tests, etc. are fine.
const BLOCKLIST: { pattern: RegExp; reason: string }[] = [
  { pattern: /\bveo\s*4\b/i,    reason: "Veo 4 has not shipped — see .claude/skills/state-of-prompting-refresh/SKILL.md §Veo 4 incident" },
  { pattern: /\bflova\b/i,      reason: "Flova distribution partner was unverified in April 2026 refresh — drop or source from first-party channel" },
  { pattern: /veo3ai\.io/i,     reason: "veo3ai.io is an SEO squat domain, not a Google channel — blacklisted for factual claims" },
  { pattern: /veo4\.com/i,      reason: "veo4.com-style squat domains are not Google channels — blacklisted for factual claims" },
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) out.push(full);
  }
  return out;
}

let hits = 0;

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const lines = readFileSync(file, "utf-8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const { pattern, reason } of BLOCKLIST) {
        const m = lines[i].match(pattern);
        if (m) {
          hits++;
          console.error(`${relative(ROOT, file)}:${i + 1}  "${m[0]}"  — ${reason}`);
        }
      }
    }
  }
}

// Every company thesis must parse into a known tier chip — otherwise ThesisLine
// silently falls back to plain text and the tier legend lies.
const THESIS_RE = /^(Durable|Fragile|Unproven) — .+/
for (const cat of CATEGORIES) {
  for (const c of cat.companies) {
    if (!THESIS_RE.test(c.thesis)) {
      hits++;
      console.error(`data.ts CATEGORIES "${c.name}"  thesis "${c.thesis}" does not match "Durable|Fragile|Unproven — reason"`);
    }
  }
}

// Every Cite id used in the market map (and StatTile cite props) must exist in SOURCES.
const validIds = new Set(SOURCES.map((s) => s.id));
const CITE_RE = /(?:<Cite id|cite)="([^"]+)"/g;
for (const file of walk(join(ROOT, "app", "market-map"))) {
  const src = readFileSync(file, "utf-8");
  for (const m of src.matchAll(CITE_RE)) {
    if (!validIds.has(m[1])) {
      hits++;
      console.error(`${relative(ROOT, file)}  Cite id "${m[1]}" not in SOURCES`);
    }
  }
}
for (const cat of CATEGORIES) {
  for (const c of cat.companies) {
    if (c.facts?.cite && !validIds.has(c.facts.cite)) {
      hits++;
      console.error(`data.ts CATEGORIES "${c.name}"  facts.cite "${c.facts.cite}" not in SOURCES`);
    }
  }
}

if (hits > 0) {
  console.error(`\ncheck-facts: ${hits} problem(s) found. Build aborted.`);
  process.exit(1);
}
