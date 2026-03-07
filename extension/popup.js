const input = document.getElementById('url-input')
const saveBtn = document.getElementById('save-btn')
const savedMsg = document.getElementById('saved-msg')

// Load saved URL
chrome.storage.sync.get({ dashboardUrl: 'https://bookmarks-seven-drab.vercel.app' }, (res) => {
  input.value = res.dashboardUrl
})

saveBtn.addEventListener('click', () => {
  const url = input.value.trim().replace(/\/$/, '')
  if (!url) return

  chrome.storage.sync.set({ dashboardUrl: url }, () => {
    savedMsg.textContent = '✓ Saved'
    setTimeout(() => { savedMsg.textContent = '' }, 2000)
  })
})
