chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open the bundled extension page. Unauthenticated users land on sign-in;
    // after authentication, the app starts the first-run onboarding sequence.
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
  }
})

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
})
