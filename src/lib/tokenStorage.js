const STORAGE_KEY = 'lurph_auth_tokens'

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local)
}

export async function getTokens() {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    return result[STORAGE_KEY] ?? null
  }

  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export async function setTokens(tokens) {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [STORAGE_KEY]: tokens })
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export async function clearTokens() {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove(STORAGE_KEY)
    return
  }
  localStorage.removeItem(STORAGE_KEY)
}
