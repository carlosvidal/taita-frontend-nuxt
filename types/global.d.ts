import type { FetchOptions } from 'ofetch';

declare global {
  // Extender la interfaz global para $api
  interface Window {
    $api: typeof $fetch;
  }

  // Hacer que $api esté disponible globalmente
  const $api: typeof $fetch;

  // Extender NuxtApp para incluir $api
  interface NuxtApp {
    $api: typeof $fetch;
  }
}

// Asegurarnos de que el módulo sea tratado como un módulo
export {};
