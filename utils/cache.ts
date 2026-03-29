/**
 * getCachedData helper for useAsyncData.
 * Returns cached data if it's less than maxAge seconds old.
 * Usage: useAsyncData('key', fetcher, { getCachedData: cachedData(60) })
 */
export const cachedData = (maxAgeSeconds: number = 60) => {
  return (key: string, nuxtApp: any) => {
    const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    if (!cached) return undefined

    // Check expiration
    const expiresAt = nuxtApp.payload._cache?.[key]
    if (expiresAt && Date.now() > expiresAt) return undefined

    return cached
  }
}

/**
 * Mark data with expiration timestamp after fetch.
 * Call in transform option of useAsyncData.
 */
export const setCacheExpiry = (key: string, nuxtApp: any, maxAgeMs: number = 60000) => {
  if (!nuxtApp.payload._cache) nuxtApp.payload._cache = {}
  nuxtApp.payload._cache[key] = Date.now() + maxAgeMs
}
