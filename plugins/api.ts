import { defineNuxtPlugin } from '#app';
import { useApi } from '~/composables/useApi';

declare module '#app' {
  interface NuxtApp {
    $api?: ReturnType<typeof useApi>;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: ReturnType<typeof useApi>;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (nuxtApp.$api) return {};

  try {
    const api = useApi();
    if (import.meta.client && typeof window !== 'undefined') {
      (window as any).$api = api;
    }
    return { provide: { api } };
  } catch (error) {
    console.error('Failed to initialize API:', error);
    return {};
  }
});
