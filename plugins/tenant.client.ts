import { useBlogStore } from '~/stores/blog'
import { useTenant } from '~/composables/useTenant'

export default defineNuxtPlugin((nuxtApp) => {
  const blogStore = useBlogStore()
  const { getTenant } = useTenant()

  // Re-detect tenant on SPA navigation (in case URL changes)
  nuxtApp.hook('page:finish', () => {
    const newTenant = getTenant()
    if (newTenant !== blogStore.currentTenant) {
      blogStore.setTenant(newTenant)
    }
  })
})
