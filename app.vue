<template>
  <div>
    <!-- Loading indicator -->
    <ClientOnly>
      <div v-if="isLoading" class="fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    </ClientOnly>
    
    <!-- Main content -->
    <NuxtLayout>
  <NuxtPage :key="$route.fullPath" />
</NuxtLayout>
    
    <!-- Debug overlay (only in development) -->
    <ClientOnly>
      <div v-if="isDev" class="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-40">
        <div>Tenant: {{ currentTenant || 'default' }}</div>
        <div>Environment: {{ isDev ? 'Development' : 'Production' }}</div>
        <div v-if="initialized">Initialized</div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, useRuntimeConfig } from '#imports';
let blogStore;

// Runtime config
const config = useRuntimeConfig();
const router = useRouter();

// State
const currentTenant = ref('taita'); // Default tenant
const isLoading = ref(true);
const isDev = import.meta.env.DEV;
const initialized = ref(false);

// Detect tenant from hostname or config
const detectTenant = () => {
  try {
    // Return default tenant during SSR/SSG
    if (process.server) {
      // During static generation, use the environment variable directly
      if (process.env.NODE_ENV === 'production') {
        return process.env.NUXT_PUBLIC_TENANT || 'taita';
      }
      // En desarrollo, permite la detección dinámica del tenant
      return process.env.NUXT_PUBLIC_TENANT || 'taita';
    }
    // Client-side tenant detection
    // Check for tenant in URL query parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlTenant = urlParams.get('tenant');
    if (urlTenant) return urlTenant;
    // Get tenant from hostname
    const hostname = window.location.hostname;
    // Si el hostname es una IP que empieza con 192., retorna 'demo'
    if (/^192\./.test(hostname)) return 'demo';
    const tenant = hostname.split('.')[0].toLowerCase();
    // Skip common subdomains
    const ignoredSubdomains = [
      'www', 'app', 'staging', 'test', 'dev', 'beta', 'admin', 'api',
      'localhost', '127.0.0.1', '0.0.0.0', '::1'
    ];
    return !ignoredSubdomains.includes(tenant) && tenant !== '' ? tenant : 'taita';
  } catch (error) {
    console.error('Error detecting tenant:', error);
    return 'taita';
  }
};

// Initialize application
const initializeApp = async () => {
  if (process.server) return;
  try {
    // Importa y usa el store sólo en cliente
    if (process.client) {
      const { useBlogStore } = await import('~/stores/blog');
      blogStore = useBlogStore();
      // Set initial tenant
      const tenant = detectTenant();
      currentTenant.value = tenant;
      blogStore.setTenant(tenant);
    }
    // Mark as initialized
    initialized.value = true;
    if (isDev) {
      console.log('[App] Initialized with tenant:', currentTenant.value);
    }
  } catch (error) {
    console.error('[App] Initialization error:', error);
  } finally {
    // Always hide loading after a short delay for better UX
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  }
};

// Handle page mounted event
const onPageMounted = () => {
  if (isDev) {
    console.log(`[App] Page mounted: ${window.location.pathname}`);
  }
};

// Error handlers
// Global error handler (fuera de setupErrorHandling)
const handleError = (error) => {
  console.error('Application error:', error);
  // Aquí puedes agregar lógica de reporte (Sentry, etc)
};

const setupErrorHandling = () => {
  if (process.server) return;

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleError(event.reason);
  });

  // Global errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error || event);
    handleError(event.error || event);
  });

  // Vue error handler
  const app = useNuxtApp();
  app.vueApp.config.errorHandler = (err, instance, info) => {
    console.error('Vue error:', { err, info });
    handleError(err);
  };
};

// Lifecycle hooks
onMounted(async () => {
  if (process.server) return;
  
  setupErrorHandling();
  await initializeApp();
});

// Cleanup
onBeforeUnmount(() => {
  if (process.server) return;

  // Cleanup event listeners if needed
  window.removeEventListener('error', handleError);
  window.removeEventListener('unhandledrejection', handleError);
});
</script>

<style>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Better focus styles */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>

<!-- Removed legacy CSS variables that conflict with Tailwind dark mode -->

<!-- Fuentes de Google -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet">
