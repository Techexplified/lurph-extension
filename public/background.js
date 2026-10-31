const ONBOARDING_STORAGE_KEY = 'lurph_onboarding_completed'
let onboardingCompleted = false

async function openSetupTab() {
  return chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
}

async function syncPanelBehavior() {
  try {
    const stored = await chrome.storage.local.get(ONBOARDING_STORAGE_KEY)
    onboardingCompleted = stored[ONBOARDING_STORAGE_KEY] === true
    // The toolbar should open the side panel only after setup is complete.
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: onboardingCompleted })
  } catch (error) {
    console.error('Could not sync Lurph side-panel behavior:', error)
  }
}

// Register listeners synchronously, before any async work.
chrome.runtime.onInstalled.addListener((details) => {
  syncPanelBehavior()
  if (details.reason === 'install') {
    openSetupTab().catch((error) => console.error('Could not open Lurph setup:', error))
  }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[ONBOARDING_STORAGE_KEY]) {
    onboardingCompleted = changes[ONBOARDING_STORAGE_KEY].newValue === true
    chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: onboardingCompleted,
    }).catch((error) => console.error('Could not update Lurph side-panel behavior:', error))
  }
})

// Before setup is complete, clicking the toolbar icon reopens the sign-in/setup tab.
// Once complete, Chrome handles the icon click through setPanelBehavior.
chrome.action.onClicked.addListener((tab) => {
  if (onboardingCompleted) {
    // Keep the call synchronous with the toolbar click in case behavior changed
    // before Chrome finished applying the stored panel behavior.
    chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
      console.error('Could not open Lurph side panel:', error)
      openSetupTab().catch((fallbackError) => console.error('Could not open Lurph setup:', fallbackError))
    })
    return
  }

  openSetupTab().catch((error) => console.error('Could not open Lurph setup:', error))
})

// Restore behavior when the service worker starts after Chrome restarts.
syncPanelBehavior()
