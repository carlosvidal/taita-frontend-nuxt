// Plugin to handle static site generation mode
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // Determine if we're in static generation mode
  const isStatic = process.env.NUXT_PUBLIC_STATIC === 'true'
  
  // Add a flag to the Nuxt context that can be used throughout the app
  nuxtApp.provide('isStatic', isStatic)
  
  if (process.dev) {
    console.log(`[static-mode] Static generation mode is ${isStatic ? 'enabled' : 'disabled'}`)
  }
  
  // Return an accessible composable
  return {
    provide: {
      isStatic: () => isStatic
    }
  }
})
