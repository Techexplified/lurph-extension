const ONBOARDING_STORAGE_KEY = "lurph_onboarding_completed";
const PENDING_SELECTION_STORAGE_KEY = "lurph_pending_selection";
const SELECTION_CONTEXT_MENU_ID = "lurph-ask-about-selection";
const MAX_SELECTED_TEXT_CHARS = 12000;
let onboardingCompleted = false;

async function openSetupTab() {
  return chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
}

function registerSelectionContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create(
      {
        id: SELECTION_CONTEXT_MENU_ID,
        title: "Ask Lurph about this",
        contexts: ["selection"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Could not register the Lurph selection menu:",
            chrome.runtime.lastError.message,
          );
        }
      },
    );
  });
}

async function syncPanelBehavior() {
  try {
    const stored = await chrome.storage.local.get(ONBOARDING_STORAGE_KEY);
    onboardingCompleted = stored[ONBOARDING_STORAGE_KEY] === true;
    // The toolbar should open the side panel only after setup is complete.
    await chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: onboardingCompleted,
    });
  } catch (error) {
    console.error("Could not sync Lurph side-panel behavior:", error);
  }
}

// Register listeners synchronously, before any async work.
chrome.runtime.onInstalled.addListener((details) => {
  registerSelectionContextMenu();
  syncPanelBehavior();
  if (details.reason === "install") {
    openSetupTab().catch((error) =>
      console.error("Could not open Lurph setup:", error),
    );
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[ONBOARDING_STORAGE_KEY]) {
    onboardingCompleted = changes[ONBOARDING_STORAGE_KEY].newValue === true;
    chrome.sidePanel
      .setPanelBehavior({
        openPanelOnActionClick: onboardingCompleted,
      })
      .catch((error) =>
        console.error("Could not update Lurph side-panel behavior:", error),
      );
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== SELECTION_CONTEXT_MENU_ID) return;

  const selectedText =
    typeof info.selectionText === "string"
      ? info.selectionText.trim().slice(0, MAX_SELECTED_TEXT_CHARS)
      : "";
  if (!selectedText) return;

  const selection = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: selectedText,
    title: typeof tab?.title === "string" ? tab.title.slice(0, 300) : "",
    url:
      typeof info.pageUrl === "string"
        ? info.pageUrl.slice(0, 2000)
        : typeof tab?.url === "string"
          ? tab.url.slice(0, 2000)
          : "",
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  // Open immediately in the context-menu user gesture. Do not await storage first,
  // otherwise Chrome may reject sidePanel.open() as an invalid user gesture.
  const openPromise =
    tab?.id !== undefined
      ? chrome.sidePanel.open({ tabId: tab.id })
      : chrome.sidePanel.open({ windowId: tab?.windowId });

  chrome.storage.local
    .set({ [PENDING_SELECTION_STORAGE_KEY]: selection })
    .catch((error) =>
      console.error("Could not pass selected text to Lurph:", error),
    );

  openPromise.catch((error) => {
    console.error("Could not open Lurph for the selected text:", error);
  });
});

// Before setup is complete, clicking the toolbar icon reopens the sign-in/setup tab.
// Once complete, Chrome handles the icon click through setPanelBehavior.
chrome.action.onClicked.addListener((tab) => {
  if (onboardingCompleted) {
    // Keep the call synchronous with the toolbar click in case behavior changed
    // before Chrome finished applying the stored panel behavior.
    chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
      console.error("Could not open Lurph side panel:", error);
      openSetupTab().catch((fallbackError) =>
        console.error("Could not open Lurph setup:", fallbackError),
      );
    });
    return;
  }

  openSetupTab().catch((error) =>
    console.error("Could not open Lurph setup:", error),
  );
});

// Restore behavior when the service worker starts after Chrome restarts.
syncPanelBehavior();
