async function openSetupTab() {
  await chrome.tabs.create({
    url: chrome.runtime.getURL("index.html"),
  });
}

// Open the sign-in/setup page after the first installation.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    openSetupTab().catch((error) => {
      console.error("Could not open Lurph setup:", error);
    });
  }
});

// Open Lurph in the Chrome Side Panel when the toolbar icon is clicked.
// Do not await storage checks before configuring this behavior.
chrome.sidePanel
  .setPanelBehavior({
    openPanelOnActionClick: true,
  })
  .catch((error) => {
    console.error("Could not configure Lurph side panel behavior:", error);
  });
