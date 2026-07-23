import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

if (!process.env.DATABASE_URL) {
  const envPath = join(new URL('.', import.meta.url).pathname, '..', '.env.local')
  try {
    const envFile = readFileSync(envPath, 'utf-8')
    for (const line of envFile.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch {}
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', prepare: false })

async function main() {
  console.log('\n=== 1. Distribution of prompt_category ===\n')
  const catDist = await sql`
    SELECT prompt_category, COUNT(*)::int AS n
    FROM bookmarks
    WHERE category = 'prompts' AND prompt_category IS NOT NULL
    GROUP BY prompt_category
    ORDER BY n DESC
  `
  const total = catDist.reduce((s, r) => s + (r.n as number), 0)
  for (const r of catDist) {
    const pct = ((r.n as number) / total * 100).toFixed(1)
    console.log(`  ${String(r.prompt_category).padEnd(25)} ${String(r.n).padStart(4)}  ${pct}%`)
  }
  console.log(`  ${'TOTAL'.padEnd(25)} ${String(total).padStart(4)}`)

  console.log('\n=== 2. requires_reference distribution ===\n')
  const refDist = await sql`
    SELECT requires_reference, COUNT(*)::int AS n
    FROM bookmarks
    WHERE category = 'prompts' AND prompt_category IS NOT NULL
    GROUP BY requires_reference
    ORDER BY n DESC
  `
  for (const r of refDist) {
    const pct = ((r.n as number) / total * 100).toFixed(1)
    console.log(`  requires_reference=${String(r.requires_reference).padEnd(5)} ${String(r.n).padStart(4)}  ${pct}%`)
  }

  console.log('\n=== 3. Reference categories only ===\n')
  const refCats = await sql`
    SELECT prompt_category, COUNT(*)::int AS n
    FROM bookmarks
    WHERE category = 'prompts'
      AND prompt_category IN ('image_r2i', 'image_i2i', 'video_r2v', 'video_i2v')
    GROUP BY prompt_category
    ORDER BY n DESC
  `
  const refTotal = refCats.reduce((s, r) => s + (r.n as number), 0)
  for (const r of refCats) {
    console.log(`  ${String(r.prompt_category).padEnd(25)} ${String(r.n).padStart(4)}`)
  }
  console.log(`  reference-category total: ${refTotal}  (${(refTotal / total * 100).toFixed(1)}% of classified prompts)`)

  console.log('\n=== 4. Non-reference rows with reference-signal keywords in text (likely miscategorised) ===\n')
  // Look for reference signals in text where we said no reference
  const suspectPatterns = [
    { label: 'has --cref',           pattern: '%--cref%' },
    { label: 'has --sref',           pattern: '%--sref%' },
    { label: 'has IP-Adapter',       pattern: '%IP-Adapter%' },
    { label: 'has ControlNet',       pattern: '%ControlNet%' },
    { label: 'has "reference image"', pattern: '%reference image%' },
    { label: 'has "uploaded image"', pattern: '%uploaded image%' },
    { label: 'has "input image"',    pattern: '%input image%' },
    { label: 'has "source image"',   pattern: '%source image%' },
    { label: 'has "attached"',       pattern: '%attached%' },
    { label: 'has "starting point"', pattern: '%starting point%' },
    { label: 'has "[SUBJECT]"',      pattern: '%[SUBJECT]%' },
    { label: 'has "[CHARACTER]"',    pattern: '%[CHARACTER]%' },
    { label: 'has ComfyUI',          pattern: '%ComfyUI%' },
    { label: 'has "image to video"', pattern: '%image to video%' },
    { label: 'has "img2img"',        pattern: '%img2img%' },
    { label: 'has "face swap"',      pattern: '%face swap%' },
  ]
  for (const { label, pattern } of suspectPatterns) {
    const rows = await sql`
      SELECT COUNT(*)::int AS n
      FROM bookmarks
      WHERE category = 'prompts'
        AND prompt_category NOT IN ('image_r2i', 'image_i2i', 'video_r2v', 'video_i2v')
        AND (requires_reference = false OR requires_reference IS NULL)
        AND tweet_text ILIKE ${pattern}
    `
    const n = rows[0].n as number
    if (n > 0) console.log(`  ${label.padEnd(28)} ${String(n).padStart(4)} suspects`)
  }

  console.log('\n=== 5. Sample 25 non-reference rows for manual review ===\n')
  const samples = await sql`
    SELECT id, tweet_id, prompt_category, requires_reference, LEFT(tweet_text, 400) AS snippet
    FROM bookmarks
    WHERE category = 'prompts'
      AND prompt_category NOT IN ('image_r2i', 'image_i2i', 'video_r2v', 'video_i2v')
      AND prompt_category IN ('image_t2i', 'image_person', 'video_t2v')
    ORDER BY random()
    LIMIT 25
  `
  for (const r of samples) {
    console.log(`---`)
    console.log(`id=${r.id}  cat=${r.prompt_category}  req_ref=${r.requires_reference}`)
    console.log((r.snippet as string).replace(/\s+/g, ' '))
  }

  await sql.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
