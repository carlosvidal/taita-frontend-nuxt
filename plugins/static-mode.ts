// Plugin to handle static site generation mode
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // Determine if we're in static generation mode
  const isStaticMode = process.env.NUXT_PUBLIC_STATIC === 'true'
  
  if (process.dev) {
    console.log(`[static-mode] Static generation mode is ${isStaticMode ? 'enabled' : 'disabled'}`)
  }
  
  // Return an accessible composable with a different name to avoid conflicts
  return {
    provide: {
      staticMode: isStaticMode
    }
  }
})
