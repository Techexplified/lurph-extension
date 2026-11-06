export const EXTENSION_ACCESS_STORAGE_KEY = "lurph_extension_access_enabled";
export const PERMISSION_LEVEL_STORAGE_KEY = "lurph_permission_level";
export const DEFAULT_PERMISSION_LEVEL = "read";
export const ALL_SITES_ORIGIN = "<all_urls>";

const VALID_PERMISSION_LEVELS = new Set(["read", "create", "full"]);

function getChromeApi() {
  return globalThis.chrome;
}

export function normalizePermissionLevel(value) {
  if (VALID_PERMISSION_LEVELS.has(value)) return value;
  if (value === "Read content") return "read";
  if (value === "Create content") return "create";
  if (value === "Full access") return "full";
  return DEFAULT_PERMISSION_LEVEL;
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
    return {
      extensionAccess: false,
      permissionLevel: DEFAULT_PERMISSION_LEVEL,
    };
  }

  const stored = await chromeApi.storage.local.get([
    EXTENSION_ACCESS_STORAGE_KEY,
    PERMISSION_LEVEL_STORAGE_KEY,
  ]);

  return {
    extensionAccess: stored[EXTENSION_ACCESS_STORAGE_KEY] === true,
    permissionLevel: normalizePermissionLevel(
      stored[PERMISSION_LEVEL_STORAGE_KEY],
    ),
  };
}

/** True only when the user has enabled Lurph and granted Chrome site access. */
export async function canReadWebsiteContent() {
  const settings = await readExtensionSettings();
  if (!settings.extensionAccess) return false;
  return hasAllSitesHostPermission();
}

/** Permission policy helpers for webpage-writing features as they are added. */
export async function canCreateWebsiteContent() {
  const settings = await readExtensionSettings();
  if (!settings.extensionAccess || !(await hasAllSitesHostPermission())) {
    return false;
  }
  return settings.permissionLevel === "create" || settings.permissionLevel === "full";
}

/** Permission policy helper for future webpage controls/click interactions. */
export async function canInteractWithWebsite() {
  const settings = await readExtensionSettings();
  if (!settings.extensionAccess || !(await hasAllSitesHostPermission())) {
    return false;
  }
  return settings.permissionLevel === "full";
}
