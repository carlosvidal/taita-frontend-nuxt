import { useBlogStore } from '~/stores/blog'

export default defineNuxtPlugin(async () => {
  const blogStore = useBlogStore()

  try {
    const settings = await blogStore.fetchSettings()
    const gaId = settings?.googleAnalyticsId

    if (!gaId) return

    // Load gtag.js
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)

    // Initialize
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', gaId)
  } catch {
    // Analytics is non-critical, fail silently
  }
})

declare global {
  interface Window {
    dataLayer: any[]
  }
}
