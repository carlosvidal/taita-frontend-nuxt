import { useBlogStore } from '~/stores/blog'

/**
 * Ads plugin — loads AdSense script based on blog plan and settings.
 *
 * FREE plan: loads Taita's platform AdSense publisher ID
 * PRO plan:  loads the author's own AdSense publisher ID (if configured)
 *
 * Premium subscribers see no ads (handled at component level via useSubscriber).
 */
export default defineNuxtPlugin(async () => {
  const blogStore = useBlogStore()

  try {
    const settings = await blogStore.fetchSettings()

    // Determine which AdSense ID to use
    let publisherId: string | null = null

    if (settings?.plan === 'PRO') {
      // PRO blogs use their own AdSense ID
      publisherId = settings.adsensePublisherId || null
    } else {
      // FREE blogs use Taita's platform AdSense ID
      if (settings?.adsEnabled !== false) {
        publisherId = import.meta.env.VITE_TAITA_ADSENSE_ID || null
      }
    }

    if (!publisherId) return

    // Store publisher ID for AdSlot components to use
    useState('adsPublisherId', () => publisherId)
    useState('adsPlan', () => settings?.plan || 'FREE')

    // Load AdSense script
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement('script')
      script.async = true
      script.crossOrigin = 'anonymous'
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
      document.head.appendChild(script)
    }
  } catch {
    // Ads are non-critical, fail silently
  }
})
