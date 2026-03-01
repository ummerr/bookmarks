/**
 * Bookmarks Dashboard — content script (isolated world)
 * Injects intercept.js into the page context so it can hook window.fetch.
 * Listens for tweet data posted back via window.postMessage.
 */
;(function () {
  'use strict'

  // ── State ─────────────────────────────────────────────────────────────────
  const PANEL_ID = '__bm_panel__'
  const scraped = new Map() // tweet_id → bookmark data
  let sending = false
  let active = false

  // ── Receive tweets from the page-context interceptor ──────────────────────
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (event.data?.type !== 'BM_TWEETS') return

    let added = 0
    for (const tweet of event.data.tweets) {
      if (!scraped.has(tweet.tweet_id)) {
        scraped.set(tweet.tweet_id, tweet)
        added++
      }
    }
    if (added > 0) updateCount()
  })

  // ── Routing — show panel only on /i/bookmarks ─────────────────────────────
  function onBookmarksPage() {
    return window.location.pathname.startsWith('/i/bookmarks')
  }

  function activate() {
    if (active) return
    active = true
    createPanel()
  }

  function deactivate() {
    if (!active) return
    active = false
    document.getElementById(PANEL_ID)?.remove()
  }

  // Watch for Twitter SPA navigation
  let lastPath = window.location.pathname
  setInterval(() => {
    const path = window.location.pathname
    if (path === lastPath) return
    lastPath = path
    onBookmarksPage() ? activate() : deactivate()
  }, 500)

  if (onBookmarksPage()) activate()

  // Re-inject panel if Twitter's React wipes it
  new MutationObserver(() => {
    if (active && !document.getElementById(PANEL_ID)) createPanel()
  }).observe(document.documentElement, { childList: true, subtree: true })

  // ── Panel UI ──────────────────────────────────────────────────────────────
  function createPanel() {
    if (document.getElementById(PANEL_ID) || !document.body) return

    const panel = document.createElement('div')
    panel.id = PANEL_ID

    const shadow = panel.attachShadow({ mode: 'open' })
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .panel {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 2147483647;
          background: #111;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 14px 16px;
          width: 220px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #fff;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6);
        }
        .header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .dot { color: #1DA1F2; font-size: 16px; }
        .title { font-weight: 600; font-size: 13px; }
        .count { font-size: 12px; color: #a1a1aa; margin-bottom: 12px; }
        button {
          width: 100%; padding: 8px 0;
          background: #1DA1F2; color: #fff; border: none;
          border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit;
        }
        button:hover:not(:disabled) { background: #1a94da; }
        button:disabled { opacity: 0.6; cursor: default; }
        .status { font-size: 11px; color: #a1a1aa; margin-top: 8px; min-height: 14px; line-height: 1.4; }
        .green { color: #4ade80; }
        .red { color: #f87171; }
      </style>
      <div class="panel">
        <div class="header">
          <span class="dot">✦</span>
          <span class="title">Bookmarks</span>
        </div>
        <div class="count" id="count">Scroll to capture bookmarks…</div>
        <button id="send">Send to Dashboard →</button>
        <div class="status" id="status"></div>
      </div>
    `

    shadow.getElementById('send').addEventListener('click', sendToDashboard)
    document.body.appendChild(panel)
    updateCount()
  }

  function updateCount() {
    const el = document.getElementById(PANEL_ID)?.shadowRoot?.getElementById('count')
    if (!el) return
    const n = scraped.size
    el.textContent = n === 0 ? 'Scroll to capture bookmarks…' : `${n} bookmark${n !== 1 ? 's' : ''} captured`
  }

  function setStatus(msg, cls = '') {
    const el = document.getElementById(PANEL_ID)?.shadowRoot?.getElementById('status')
    if (!el) return
    el.textContent = msg
    el.className = 'status ' + cls
  }

  function setBtn(disabled, label) {
    const btn = document.getElementById(PANEL_ID)?.shadowRoot?.getElementById('send')
    if (!btn) return
    btn.disabled = disabled
    btn.textContent = label
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  async function getDashboardUrl() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ dashboardUrl: 'http://localhost:3000' }, (res) => {
        resolve(res.dashboardUrl.replace(/\/$/, ''))
      })
    })
  }

  async function sendToDashboard() {
    if (sending) return
    if (scraped.size === 0) { setStatus('Nothing captured yet — scroll first!', 'red'); return }

    sending = true
    setBtn(true, 'Sending…')
    setStatus('')

    const bookmarks = [...scraped.values()]
    const dashboardUrl = await getDashboardUrl()

    try {
      const res = await fetch(`${dashboardUrl}/api/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmarks),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStatus(`✓ ${data.inserted} added, ${data.skipped} skipped`, 'green')
      setBtn(false, 'Send to Dashboard →')
    } catch (err) {
      setStatus(`✗ ${err.message} — is the dashboard running?`, 'red')
      setBtn(false, 'Retry →')
    } finally {
      sending = false
    }
  }
})()
