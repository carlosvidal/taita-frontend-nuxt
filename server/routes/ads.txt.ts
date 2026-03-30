/**
 * Dynamic ads.txt endpoint.
 * Serves per-subdomain ads.txt for AdSense verification.
 *
 * - Always includes Taita's platform publisher ID
 * - PRO blogs also include the author's own publisher ID
 *
 * Google crawls https://subdomain.taita.blog/ads.txt
 */
export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  const runtimeConfig = useRuntimeConfig()

  // Extract subdomain
  let subdomain = 'demo'
  const parts = host.split('.')
  if (parts.length >= 3 && parts[0] !== 'www') {
    subdomain = parts[0]
  }

  // Platform publisher ID (Taita's own)
  const platformPubId = process.env.VITE_TAITA_ADSENSE_ID || ''

  // Fetch blog settings to check for author's AdSense ID
  let authorPubId = ''
  try {
    const apiBase = runtimeConfig.public?.apiBase || 'https://backend.taita.blog/api'
    const settings: any = await $fetch(`${apiBase}/settings/public`, {
      headers: { 'X-Taita-Subdomain': subdomain },
      timeout: 5000,
    })

    if (settings?.plan === 'PRO' && settings?.adsensePublisherId) {
      authorPubId = settings.adsensePublisherId
    }
  } catch {
    // If settings fetch fails, just serve platform ads.txt
  }

  // Build ads.txt content
  const lines: string[] = []

  if (platformPubId) {
    // Extract pub ID number from "ca-pub-XXXX" format
    const pubNum = platformPubId.replace('ca-pub-', 'pub-')
    lines.push(`google.com, ${pubNum}, DIRECT, f08c47fec0942fa0`)
  }

  if (authorPubId && authorPubId !== platformPubId) {
    const authorPubNum = authorPubId.replace('ca-pub-', 'pub-')
    lines.push(`google.com, ${authorPubNum}, DIRECT, f08c47fec0942fa0`)
  }

  // If no publisher IDs configured, return a placeholder
  if (lines.length === 0) {
    lines.push('# No ad accounts configured')
  }

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400') // Cache 24h

  return lines.join('\n') + '\n'
})
