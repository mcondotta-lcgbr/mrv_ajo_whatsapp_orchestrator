// Keyed persistence. Uses chrome.storage.local inside the extension, and falls back to
// localStorage when the page is opened outside the extension (e.g. `vite preview`).
const hasChromeStorage =
  typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local

export function loadKey(key) {
  if (hasChromeStorage) {
    return new Promise((resolve) =>
      chrome.storage.local.get(key, (res) => resolve(res[key] ?? null)),
    )
  }
  try {
    return Promise.resolve(JSON.parse(localStorage.getItem(key)))
  } catch {
    return Promise.resolve(null)
  }
}

export function saveKey(key, data) {
  if (hasChromeStorage) {
    chrome.storage.local.set({ [key]: data })
    return
  }
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function removeKey(key) {
  if (hasChromeStorage) {
    chrome.storage.local.remove(key)
    return
  }
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
