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

// Create a dummy API for SSR or error cases
function createDummyApi() {
  return {
    // Basic API methods
    get: () => Promise.reject('API not initialized'),
    post: () => Promise.reject('API not initialized'),
    put: () => Promise.reject('API not initialized'),
    delete: () => Promise.reject('API not initialized'),
    
    // Specific API endpoints
    getPosts: () => Promise.reject('API not initialized'),
    getPost: () => Promise.reject('API not initialized'),
    getCategories: () => Promise.reject('API not initialized'),
    getCategory: () => Promise.reject('API not initialized'),
    
    // Auth methods
    login: () => Promise.reject('API not initialized'),
    register: () => Promise.reject('API not initialized'),
    logout: () => Promise.reject('API not initialized'),
    
    // User methods
    getCurrentUser: () => Promise.reject('API not initialized'),
    updateProfile: () => Promise.reject('API not initialized'),
    
    // Helper properties
    isInitialized: false,
    error: null
  };
}

export default defineNuxtPlugin((nuxtApp) => {
  // Skip if already initialized
  if (nuxtApp.$api) {
    return {};
  }

  // Only initialize on client side
  if (!process.client) {
    const dummyApi = createDummyApi();
    nuxtApp.$api = dummyApi;
    return { provide: { api: dummyApi } };
  }

  // Check if already initialized in window
  if (window.$api) {
    nuxtApp.$api = window.$api;
    return { provide: { api: window.$api } };
  }

  try {
    // Create an instance of the API
    const api = useApi();
    
    // Make it available globally
    window.$api = api;
    
    // Store in Nuxt app context
    nuxtApp.$api = api;
    
    return { provide: { api } };
  } catch (error) {
    console.error('Failed to initialize API:', error);
    
    // Return a dummy API in case of error
    const dummyApi = createDummyApi();
    window.$api = dummyApi;
    nuxtApp.$api = dummyApi;
    
    return { provide: { api: dummyApi } };
  }
});
