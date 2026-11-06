const ONBOARDING_STORAGE_KEY = "lurph_onboarding_completed";
const EXTENSION_ACCESS_STORAGE_KEY = "lurph_extension_access_enabled";
const PENDING_SELECTION_STORAGE_KEY = "lurph_pending_selection";
const SELECTION_CONTEXT_MENU_ID = "lurph-ask-about-selection";
const MAX_SELECTED_TEXT_CHARS = 12000;
const ALL_SITES_ORIGIN = "<all_urls>";
let onboardingCompleted = false;
let extensionAccessEnabled = false;
let contextMenuUpdateVersion = 0;

async function openSetupTab() {
  return chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
}

function syncSelectionContextMenu(enabled) {
  const updateVersion = ++contextMenuUpdateVersion;
  chrome.contextMenus.remove(SELECTION_CONTEXT_MENU_ID, () => {
    // Reading lastError prevents Chrome from logging the expected error when
    // the item does not exist yet. Recreate only after removal has completed.
    void chrome.runtime.lastError;
    if (
      !enabled ||
      !extensionAccessEnabled ||
      updateVersion !== contextMenuUpdateVersion
    ) {
      return;
    }
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

async function hasAllSitesPermission() {
  try {
    return await chrome.permissions.contains({
      origins: [ALL_SITES_ORIGIN],
    });
  } catch {
    return false;
  }
}

async function syncExtensionAccess() {
  try {
    const stored = await chrome.storage.local.get(EXTENSION_ACCESS_STORAGE_KEY);
    const hasSavedSetting =
      typeof stored[EXTENSION_ACCESS_STORAGE_KEY] === "boolean";
    const chromePermissionGranted = await hasAllSitesPermission();
    const enabled = hasSavedSetting
      ? stored[EXTENSION_ACCESS_STORAGE_KEY] && chromePermissionGranted
      : chromePermissionGranted;

    extensionAccessEnabled = enabled;
    if (!hasSavedSetting || stored[EXTENSION_ACCESS_STORAGE_KEY] !== enabled) {
      await chrome.storage.local.set({
        [EXTENSION_ACCESS_STORAGE_KEY]: enabled,
      });
    }

    syncSelectionContextMenu(enabled);
  } catch (error) {
    extensionAccessEnabled = false;
    syncSelectionContextMenu(false);
    console.error("Could not sync Lurph website access:", error);
  }
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
  syncExtensionAccess();
  syncPanelBehavior();
  if (details.reason === "install") {
    openSetupTab().catch((error) =>
      console.error("Could not open Lurph setup:", error),
    );
  }
});

chrome.runtime.onStartup.addListener(() => {
  syncExtensionAccess();
  syncPanelBehavior();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes[ONBOARDING_STORAGE_KEY]) {
    onboardingCompleted = changes[ONBOARDING_STORAGE_KEY].newValue === true;
    chrome.sidePanel
      .setPanelBehavior({
        openPanelOnActionClick: onboardingCompleted,
      })
      .catch((error) =>
        console.error("Could not update Lurph side-panel behavior:", error),
      );
  }

  if (changes[EXTENSION_ACCESS_STORAGE_KEY]) {
    // Turn access off synchronously in the worker before doing async checks.
    if (changes[EXTENSION_ACCESS_STORAGE_KEY].newValue !== true) {
      extensionAccessEnabled = false;
      syncSelectionContextMenu(false);
    }
    syncExtensionAccess();
  }
});

chrome.permissions.onRemoved.addListener(async () => {
  const stillGranted = await hasAllSitesPermission();
  if (!stillGranted) {
    extensionAccessEnabled = false;
    await chrome.storage.local
      .set({
        [EXTENSION_ACCESS_STORAGE_KEY]: false,
      })
      .catch(() => {});
    await chrome.storage.local
      .remove(PENDING_SELECTION_STORAGE_KEY)
      .catch(() => {});
    syncSelectionContextMenu(false);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== SELECTION_CONTEXT_MENU_ID) return;

  const selectedText =
    typeof info.selectionText === "string"
      ? info.selectionText.trim().slice(0, MAX_SELECTED_TEXT_CHARS)
      : "";
  if (!selectedText) return;

  // Open immediately in the context-menu user gesture. Do not await storage or
  // permission checks first, otherwise Chrome may reject sidePanel.open().
  const openPromise =
    tab?.id !== undefined
      ? chrome.sidePanel.open({ tabId: tab.id })
      : chrome.sidePanel.open({ windowId: tab?.windowId });

  // Verify the persisted master switch and live Chrome grant before passing
  // any selected webpage text to the UI. This also handles a stale menu click
  // while the service worker is waking or a permission has just been revoked.
  Promise.all([
    chrome.storage.local.get(EXTENSION_ACCESS_STORAGE_KEY),
    hasAllSitesPermission(),
  ])
    .then(async ([stored, permissionGranted]) => {
      if (
        stored?.[EXTENSION_ACCESS_STORAGE_KEY] !== true ||
        !permissionGranted
      ) {
        await syncExtensionAccess();
        return;
      }

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
      await chrome.storage.local.set({
        [PENDING_SELECTION_STORAGE_KEY]: selection,
      });
    })
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
syncExtensionAccess();
syncPanelBehavior();
