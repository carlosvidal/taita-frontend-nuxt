// This plugin runs only on the client side to handle tenant configuration
import { useBlogStore } from '~/stores/blog';

export default defineNuxtPlugin((nuxtApp) => {
  // Only run on client-side
  if (!process.client) return;
  
  const blogStore = useBlogStore();
  
  const detectTenant = () => {
    try {
      const hostname = window.location.hostname;
      // Si el hostname es una IP que empieza con 192., retorna 'demo'
      if (/^192\./.test(hostname)) return 'demo';
      const subdomain = hostname.split('.')[0].toLowerCase();
      // Skip common subdomains and IP addresses
      const ignoredSubdomains = [
        'www', 'app', 'staging', 'test', 'dev', 'beta', 'admin',
        'localhost', '127.0.0.1', '0.0.0.0', '::1'
      ];
      // Check if the subdomain is a valid tenant
      if (!ignoredSubdomains.includes(subdomain) && subdomain !== '') {
        console.log(`[Tenant] Setting tenant from subdomain: ${subdomain}`);
        return subdomain;
      }
      // Fallback to default tenant
      console.log('[Tenant] Using default tenant: taita');
      return 'taita';
    } catch (error) {
      console.error('[Tenant] Error detecting tenant:', error);
      return 'taita';
    }
  };
  
  // Set initial tenant
  const initialTenant = detectTenant();
  blogStore.setTenant(initialTenant);
  
  // Watch for route changes in case of SPA navigation
  nuxtApp.hook('page:finish', () => {
    const newTenant = detectTenant();
    if (newTenant !== blogStore.currentTenant) {
      blogStore.setTenant(newTenant);
    }
  });
  
  // Add debug info in development
  if (process.dev) {
    console.log('[Tenant] Initialized with tenant:', initialTenant);
    console.log('[Tenant] API Base URL:', blogStore.apiBaseUrl);
  }
});
