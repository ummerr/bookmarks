/**
 * Runs in MAIN world. Hooks both fetch AND XMLHttpRequest —
 * Twitter uses XHR for its GraphQL API calls.
 */
;(function () {
  console.log('[BM] intercept.js loaded')

  // ── Shared parser ─────────────────────────────────────────────────────────
  function extractTweets(data) {
    const tweets = []
    try {
      const timeline =
        data?.data?.bookmark_timeline_v2?.timeline ??
        data?.data?.bookmarks_timeline?.timeline ??
        data?.data?.bookmark_timeline?.timeline ??
        null

      if (!timeline) return tweets

      const entries =
        (timeline.instructions ?? [])
          .find((i) => i.type === 'TimelineAddEntries')
          ?.entries ?? []

      for (const entry of entries) {
        const result = entry?.content?.itemContent?.tweet_results?.result
        if (!result) continue

        const tweet = result.__typename === 'TweetWithVisibilityResults'
          ? result.tweet : result

        const legacy = tweet?.legacy
        const userResult = tweet?.core?.user_results?.result
        const userLegacy = userResult?.legacy
        if (!legacy || !userLegacy) continue

        const tweet_id = legacy.id_str

        // Twitter moved screen_name + name from legacy → userResult.core in 2025
        const userCore = userResult?.core
        const author_handle = userCore?.screen_name ?? userLegacy.screen_name ?? null
        const author_name = userCore?.name ?? userLegacy.name ?? null

        // For Twitter Blue long tweets, full text is in note_tweet, not legacy
        let tweet_text = tweet?.note_tweet?.note_tweet_results?.result?.text
          ?? legacy.full_text
          ?? legacy.text
          ?? ''
        tweet_text = tweet_text.replace(/https:\/\/t\.co\/\S+/g, '').trim()

        const tweet_url = author_handle
          ? `https://x.com/${author_handle}/status/${tweet_id}`
          : `https://x.com/i/web/status/${tweet_id}`
        const bookmarked_at = legacy.created_at
          ? new Date(legacy.created_at).toISOString() : null

        const mediaItems = legacy.extended_entities?.media ?? legacy.entities?.media ?? []
        const media_urls = mediaItems.map((m) => m.media_url_https).filter(Boolean)
        // Only keep alt text when it looks like a real description/prompt (>15 chars)
        const media_alt_texts = mediaItems.map((m) => {
          const alt = m.ext_alt_text
          return (typeof alt === 'string' && alt.trim().length > 15) ? alt.trim() : null
        })

        tweets.push({ tweet_id, tweet_text, author_handle, author_name, tweet_url, media_urls, media_alt_texts, bookmarked_at })
      }
    } catch (e) {
      console.log('[BM] extractTweets error:', e)
    }
    return tweets
  }

  function handleResponse(url, text) {
    if (!url.toLowerCase().includes('bookmark')) return
    console.log('[BM] Bookmark response from:', url)
    try {
      const data = JSON.parse(text)
      const tweets = extractTweets(data)
      console.log('[BM] Extracted:', tweets.length, 'tweets')
      if (tweets.length > 0) window.postMessage({ type: 'BM_TWEETS', tweets }, '*')
    } catch (e) {
      console.log('[BM] Parse error:', e)
    }
  }

  // ── Hook XMLHttpRequest ───────────────────────────────────────────────────
  const _open = XMLHttpRequest.prototype.open
  const _send = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function (method, url) {
    this._bmUrl = url
    return _open.apply(this, arguments)
  }

  XMLHttpRequest.prototype.send = function () {
    const url = this._bmUrl ?? ''
    if (url.includes('graphql') || url.includes('/api/')) {
      console.log('[BM] XHR:', url)
    }
    this.addEventListener('load', () => {
      // Skip binary responses (video segments etc.)
      if (this.responseType && this.responseType !== 'text' && this.responseType !== '') return
      handleResponse(url, this.responseText)
    })
    return _send.apply(this, arguments)
  }

  // ── Hook fetch (keep as fallback) ─────────────────────────────────────────
  const _fetch = window.fetch.bind(window)
  window.fetch = async function (resource, init) {
    const response = await _fetch(resource, init)
    const url = typeof resource === 'string' ? resource : resource?.url ?? ''
    if (url.includes('graphql') || url.includes('/api/')) {
      console.log('[BM] fetch:', url)
    }
    if (url.toLowerCase().includes('bookmark')) {
      response.clone().json()
        .then((data) => {
          const tweets = extractTweets(data)
          if (tweets.length > 0) window.postMessage({ type: 'BM_TWEETS', tweets }, '*')
        })
        .catch(() => {})
    }
    return response
  }
})()
