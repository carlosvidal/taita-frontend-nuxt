// Tipos globales para Nuxt
declare module '#app' {
  interface NuxtApp {
    $api: typeof import('ofetch')['$fetch']
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: typeof import('ofetch')['$fetch']
  }
}

export {}
