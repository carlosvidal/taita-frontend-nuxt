import { navigateTo } from '#app';
import { useAuth } from '~/composables/useAuth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();
  const config = useRuntimeConfig();
  
  // Skip middleware on server
  if (process.server) return;
  
  // Initialize auth state if not already done
  if (!auth.isAuthenticated && auth.token) {
    try {
      await auth.fetchUser();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      auth.clearAuth();
    }
  }
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const requiredRoles = to.meta.roles as string[] | undefined;
  const requiredPermissions = to.meta.permissions as string[] | undefined;
  
  // Redirect logic for guest routes
  if (requiresGuest && auth.isAuthenticated) {
    return navigateTo('/dashboard');
  }
  
  // Redirect logic for protected routes
  if (requiresAuth) {
    // Redirect to login if not authenticated
    if (!auth.isAuthenticated) {
      return navigateTo({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      });
    }
    
    // Check for required roles
    if (requiredRoles?.length && !auth.hasAnyRole(requiredRoles)) {
      return navigateTo('/unauthorized');
    }
    
    // Check for required permissions
    if (requiredPermissions?.length && !auth.hasAnyPermission(requiredPermissions)) {
      return navigateTo('/unauthorized');
    }
  }
  
  // Handle email verification
  if (to.meta.requiresVerifiedEmail && auth.user && !auth.user.email_verified_at) {
    return navigateTo('/verify-email');
  }
  
  // Handle 2FA if required
  if (to.meta.requiresTwoFactor && auth.user && !auth.user.two_factor_enabled) {
    return navigateTo('/two-factor-challenge');
  }
});
