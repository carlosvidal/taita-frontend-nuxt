/**
 * Composable to detect tenant from subdomain.
 * Works both server-side (from Host header) and client-side (from window.location).
 */
export const useTenant = () => {
  const ignoredSubdomains = [
    'www', 'app', 'staging', 'test', 'dev', 'beta', 'admin',
    'localhost', '127', '0',
  ]

  const extractSubdomain = (hostname: string): string => {
    // IP addresses
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return 'demo'
    if (hostname === 'localhost') return 'demo'

    // Render.com domains
    if (hostname.endsWith('.onrender.com')) {
      const parts = hostname.split('.')
      return parts.length > 2 ? parts[0] : 'demo'
    }

    // Regular domains: extract first part
    const parts = hostname.split('.')
    if (parts.length > 2) {
      const sub = parts[0].toLowerCase()
      if (!ignoredSubdomains.includes(sub)) return sub
    }

    return 'demo'
  }

  const getTenant = (): string => {
    // Server-side: read from request headers
    if (import.meta.server) {
      const event = useRequestEvent()
      if (event) {
        const host = event.node.req.headers.host || event.node.req.headers['x-forwarded-host'] || ''
        const hostname = (Array.isArray(host) ? host[0] : host).split(':')[0]
        return extractSubdomain(hostname)
      }
      return 'demo'
    }

    // Client-side: read from window.location
    return extractSubdomain(window.location.hostname)
  }

  return { getTenant, extractSubdomain }
}
