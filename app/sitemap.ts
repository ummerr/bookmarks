import type { MetadataRoute } from 'next'
import { listPromptIds } from '@/lib/db'

const BASE = 'https://prompts.ummerr.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/prompts`,                   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/dataset`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/tools/image-to-prompt`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/insights`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/methodology`,               lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/state-of-prompting/sora`,   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  let prompts: MetadataRoute.Sitemap = []
  try {
    const ids = await listPromptIds()
    prompts = ids.map(({ id, updated_at }) => ({
      url: `${BASE}/prompts/${id}`,
      lastModified: updated_at ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch {
    // DB unreachable at build time — ship static routes only rather than failing the build.
  }

  return [...staticRoutes, ...prompts]
}
