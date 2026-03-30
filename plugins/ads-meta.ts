import { useBlogStore } from '~/stores/blog'

/**
 * SSR-compatible plugin that injects the AdSense meta tag for site verification.
 * This runs on both server and client so Google's crawler sees the meta tag in HTML.
 */
export default defineNuxtPlugin(async () => {
  const blogStore = useBlogStore()

  try {
    const settings = await blogStore.fetchSettings()

    let publisherId: string | null = null

    if (settings?.plan === 'PRO') {
      publisherId = settings.adsensePublisherId || null
    } else {
      if (settings?.adsEnabled !== false) {
        // On server, use process.env; on client, use import.meta.env
        publisherId = process.env.VITE_TAITA_ADSENSE_ID ||
          (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_TAITA_ADSENSE_ID : null) ||
          null
      }
    }

    if (!publisherId) return

    // SSR-safe head injection via useHead
    useHead({
      meta: [
        { name: 'google-adsense-account', content: publisherId },
      ],
    })
  } catch {
    // Non-critical
  }
})
