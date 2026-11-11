export const EXTENSION_ACCESS_STORAGE_KEY = "lurph_extension_access_enabled";
export const ALL_SITES_ORIGIN = "<all_urls>";

function getChromeApi() {
  return globalThis.chrome;
}

export async function hasAllSitesHostPermission() {
  const chromeApi = getChromeApi();
  if (!chromeApi?.permissions?.contains) return false;

  try {
    return await chromeApi.permissions.contains({
      origins: [ALL_SITES_ORIGIN],
    });
  } catch {
    return false;
  }
}

export async function readExtensionSettings() {
  const chromeApi = getChromeApi();
  if (!chromeApi?.storage?.local) {
    return { extensionAccess: false };
  }

  const stored = await chromeApi.storage.local.get(EXTENSION_ACCESS_STORAGE_KEY);
  return {
    extensionAccess: stored[EXTENSION_ACCESS_STORAGE_KEY] === true,
  };
}

/** True only when the user has enabled Lurph and granted Chrome site access. */
export async function canReadWebsiteContent() {
  const settings = await readExtensionSettings();
  if (!settings.extensionAccess) return false;
  return hasAllSitesHostPermission();
}
