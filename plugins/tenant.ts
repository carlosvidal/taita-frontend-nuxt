import { defineNuxtPlugin } from '#app'
import { useBlogStore } from '~/stores/blog'
import { useTenant } from '~/composables/useTenant'

export default defineNuxtPlugin((nuxtApp) => {
  const blogStore = useBlogStore()
  const { getTenant } = useTenant()

  const tenant = getTenant()
  blogStore.setTenant(tenant)

  console.log(`[Tenant] Detected: ${tenant} (${import.meta.server ? 'server' : 'client'})`)
})
