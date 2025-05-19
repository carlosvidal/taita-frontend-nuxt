import type { ApiResponse } from './blog';

declare global {
  interface Window {
    $api: typeof import('../composables/useApi')['useApi'];
  }
}

// Extend the NuxtApp interface to include $api
declare module '#app' {
  interface NuxtApp {
    $api: ReturnType<typeof import('../composables/useApi')['useApi']>;
  }
}

// Extend Vue's ComponentCustomProperties
// This makes $api available in the template
// and in the setup() function via this.$api
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: ReturnType<typeof import('../composables/useApi')['useApi']>;
  }
}

export {};
