/**
 * One-off: reclassify prompts that mention "seedance" but were either
 * untagged or tagged as a different model. Targets the misattribution
 * caused by the LLM picking host platforms (Higgsfield, Yapper, etc.)
 * over the actual generation model.
 *
 * Run: npx tsx scripts/reclassify-seedance.ts
 *   --base=https://bookmarks.ummerr.com  (default)
 *   --dry  (print IDs only, don't POST)
 */

const BASE = process.argv.find((a) => a.startsWith('--base='))?.split('=')[1] ?? 'https://bookmarks.ummerr.com'
const DRY = process.argv.includes('--dry')
const BATCH = 5

interface Prompt {
  id: string
  tweet_text: string | null
  extracted_prompt: string | null
  detected_model: string | null
  thread_tweets?: { tweet_text: string }[] | null
}

function textOf(p: Prompt): string {
  const parts = [p.tweet_text ?? '', p.extracted_prompt ?? '', p.detected_model ?? '']
  if (Array.isArray(p.thread_tweets)) {
    for (const t of p.thread_tweets) parts.push(t.tweet_text ?? '')
  }
  return parts.join(' ').toLowerCase()
}

async function main() {
  console.log(`Fetching prompts from ${BASE}...`)
  const res = await fetch(`${BASE}/api/prompts`)
  if (!res.ok) throw new Error(`Failed to fetch prompts: ${res.status}`)
  const all: Prompt[] = await res.json()
  console.log(`  ${all.length} total prompts`)

  const targets = all.filter((p) => {
    const tagged = (p.detected_model ?? '').toLowerCase().includes('seed')
    return !tagged && textOf(p).includes('seedance')
  })
  console.log(`  ${targets.length} mention "seedance" but aren't tagged as Seedance`)

  if (DRY) {
    for (const p of targets) {
      const txt = (p.tweet_text ?? '').replace(/\s+/g, ' ').slice(0, 80)
      console.log(`  [${p.detected_model ?? '-'}] ${p.id}  ${txt}`)
    }
    return
  }

  const ids = targets.map((p) => p.id)
  let done = 0
  const errors: string[] = []

  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH)
    process.stdout.write(`  batch ${i / BATCH + 1}/${Math.ceil(ids.length / BATCH)} (${chunk.length})... `)
    try {
      const r = await fetch(`${BASE}/api/prompts/reclassify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: chunk }),
      })
      const data = await r.json()
      if (data.error) {
        errors.push(`batch ${i}: ${data.error}`)
        console.log(`error: ${data.error}`)
      } else {
        done += data.classified ?? 0
        console.log(`classified ${data.classified}/${data.batchTotal}`)
      }
      if (Array.isArray(data.errors) && data.errors.length) errors.push(...data.errors)
    } catch (err) {
      errors.push(`batch ${i}: ${String(err)}`)
      console.log(`fetch failed: ${err}`)
    }
    await new Promise((r) => setTimeout(r, 600))
  }

  console.log(`\nDone. Reclassified ${done}/${ids.length}.`)
  if (errors.length) {
    console.log(`Errors (${errors.length}):`)
    for (const e of errors) console.log(`  ${e}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
