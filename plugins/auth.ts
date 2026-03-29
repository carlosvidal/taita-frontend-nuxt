import { defineNuxtPlugin } from '#app';
import { useAuth } from '~/composables/useAuth';

declare global {
  interface Window {
    $auth?: any;
  }
}

// Create a dummy auth instance for SSR
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
  if (nuxtApp.$auth) {
    return { provide: { auth: nuxtApp.$auth } };
  }

  // SSR: provide dummy auth (auth is client-side only)
  if (import.meta.server) {
    const dummyAuth = createDummyAuth();
    return { provide: { auth: dummyAuth } };
  }

  // Client: check if already initialized
  if (window.$auth) {
    return { provide: { auth: window.$auth } };
  }

  try {
    const auth = useAuth();
    auth.initAuth();
    window.$auth = auth;
    return { provide: { auth } };
  } catch (error) {
    console.error('Failed to initialize auth plugin:', error);
    const dummyAuth = createDummyAuth();
    window.$auth = dummyAuth;
    return { provide: { auth: dummyAuth } };
  }
});
