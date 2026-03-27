import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getBookmarkById } from '@/lib/db'

const CATEGORY_LABELS: Record<string, string> = {
  image_t2i: 'Text to Image',
  image_i2i: 'Image to Image',
  image_r2i: 'Reference to Image',
  image_character_ref: 'Character Ref',
  image_person: 'Person / Portrait',
  image_advertisement: 'Ad / Product',
  image_collage: 'Collage / Grid',
  image_inpainting: 'Inpainting',
  video_t2v: 'Text to Video',
  video_i2v: 'Image to Video',
  video_r2v: 'Reference to Video',
  video_v2v: 'Video to Video',
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const bookmark = await getBookmarkById(id)
  if (!bookmark) return {}

  const prompt = bookmark.extracted_prompt ?? bookmark.tweet_text
  const title = prompt.length > 80 ? `${prompt.slice(0, 80).trimEnd()}… — prompts.ummerr.com` : `${prompt} — prompts.ummerr.com`
  const description = prompt.length > 200 ? `${prompt.slice(0, 200).trimEnd()}…` : prompt
  const ogImage = `https://prompts.ummerr.com/prompts/${id}/opengraph-image`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://prompts.ummerr.com/prompts/${id}`,
      siteName: 'prompts.ummerr.com',
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bookmark = await getBookmarkById(id)
  if (!bookmark) notFound()

  const prompt = bookmark.extracted_prompt ?? bookmark.tweet_text
  const category = bookmark.prompt_category ? (CATEGORY_LABELS[bookmark.prompt_category] ?? bookmark.prompt_category) : null

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-10 md:py-16 flex flex-col gap-8">

        {/* Back */}
        <Link href="/prompts" className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1.5">
          ← Browse prompts
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <span className="rounded-full border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
              {category}
            </span>
          )}
          {bookmark.detected_model && (
            <span className="rounded-full border border-black/[0.1] dark:border-white/10 bg-black/[0.04] dark:bg-white/5 px-2.5 py-0.5 text-xs text-gray-600 dark:text-zinc-300">
              {bookmark.detected_model}
            </span>
          )}
          {bookmark.requires_reference && bookmark.reference_type && (
            <span className="rounded-full border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs text-amber-700 dark:text-amber-300">
              ref · {bookmark.reference_type.replace(/_/g, ' ')}
            </span>
          )}
          {bookmark.is_multi_shot && bookmark.prompt_category?.startsWith('video_') && (
            <span className="rounded-full border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Multi-shot
            </span>
          )}
        </div>

        {/* Media */}
        {bookmark.media_urls.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {bookmark.media_urls.slice(0, 4).map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={bookmark.media_alt_texts?.[bookmark.media_urls.indexOf(url)] ?? ''}
                  className="h-48 w-auto rounded-xl object-cover border border-black/[0.08] dark:border-white/8"
                />
              </a>
            ))}
          </div>
        )}

        {/* Prompt */}
        <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-zinc-100 font-mono leading-relaxed bg-black/[0.03] dark:bg-white/[0.03] rounded-xl p-5 border border-black/[0.06] dark:border-white/6">
          {prompt}
        </pre>

        {/* Source */}
        <div className="flex items-center justify-between gap-4">
          <a
            href={bookmark.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 dark:text-zinc-500 hover:text-[#1DA1F2] transition-colors"
          >
            @{bookmark.author_handle} on X ↗
          </a>
          {bookmark.bookmarked_at && (
            <span className="text-xs text-gray-400 dark:text-zinc-600">
              {new Date(bookmark.bookmarked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
