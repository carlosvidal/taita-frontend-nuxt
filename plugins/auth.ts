import { defineNuxtPlugin } from '#app';
import { useAuth } from '~/composables/useAuth';

declare global {
  interface Window {
    $auth?: any;
  }
  interface NuxtApp {
    $auth?: any;
  }
}

// Create a dummy auth instance for SSR or error cases
function createDummyAuth() {
  return {
    user: null,
    token: null,
    isInitialized: false,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    initAuth: () => {},
    setAuth: () => {},
    clearAuth: () => {},
    login: () => Promise.reject('Auth not initialized'),
    logout: () => Promise.resolve(),
    register: () => Promise.reject('Auth not initialized'),
    forgotPassword: () => Promise.reject('Auth not initialized'),
    resetPassword: () => Promise.reject('Auth not initialized'),
    fetchUser: () => Promise.reject('Auth not initialized'),
    hasRole: () => false,
    hasAnyRole: () => false,
    hasAllRoles: () => false,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false
  };
}

export default defineNuxtPlugin((nuxtApp) => {
  // Check if already provided in this plugin instance
  if (nuxtApp.$auth) {
    return { provide: { auth: nuxtApp.$auth } };
  }

  // Only initialize on client side
  if (!process.client) {
    const dummyAuth = createDummyAuth();
    nuxtApp.$auth = dummyAuth;
    return { provide: { auth: dummyAuth } };
  }
  
  // Check if already initialized in window
  if (window.$auth) {
    nuxtApp.$auth = window.$auth;
    return { provide: { auth: window.$auth } };
  }

  try {
    const auth = useAuth();
    
    // Initialize auth state
    auth.initAuth();
    
    // Make it available globally
    window.$auth = auth;
    
    // Store in Nuxt app context
    nuxtApp.$auth = auth;
    
    return { provide: { auth } };
  } catch (error) {
    console.error('Failed to initialize auth plugin:', error);
    
    // Return a dummy auth instance in case of error
    const dummyAuth = createDummyAuth();
    window.$auth = dummyAuth;
    nuxtApp.$auth = dummyAuth;
    
    return { provide: { auth: dummyAuth } };
  }
});
