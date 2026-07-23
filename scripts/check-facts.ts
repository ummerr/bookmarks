import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = join(new URL(".", import.meta.url).pathname, "..");
const SCAN_DIR = join(ROOT, "app", "state-of-prompting");

// Strings we've been burned on. Add an entry every time a fabricated claim ships.
// Scope is app/state-of-prompting/** — legitimate mentions in SKILL.md postmortems,
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
for (const file of walk(SCAN_DIR)) {
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

if (hits > 0) {
  console.error(`\ncheck-facts: ${hits} forbidden reference(s) found in app/state-of-prompting/. Build aborted.`);
  process.exit(1);
}
