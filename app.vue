<template>
  <div class="read-theme">
    <!-- Loading indicator -->
    <ClientOnly>
      <div v-if="isLoading" class="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </ClientOnly>
    
    <!-- Main content -->
    <NuxtLayout>
      <NuxtPage :key="$route.fullPath" @mounted="onPageMounted" />
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
  window.removeEventListener('unhandledrejection', handleError);n});
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

<style>
/* Variables CSS para el tema Read */
:root {
  /* Tipografía */
  --font-serif: 'Libre Baskerville', Georgia, serif;
  --font-sans: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Colores */
  --color-text: #333333;
  --color-text-light: #666666;
  --color-accent: #e63946;
  --color-bg: #ffffff;
  --color-bg-alt: #f8f8f8;
  --color-border: #e0e0e0;
  
  /* Espaciado */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 2rem;
  --spacing-lg: 3rem;
  --spacing-xl: 5rem;
  
  /* Contenedor */
  --container-width: 42rem;
  --container-padding: 1.5rem;
}

/* Estilos base */
.read-theme {
  font-family: var(--font-serif);
  color: var(--color-text);
  background-color: var(--color-bg);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Estilos de tipografía */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

p, ul, ol {
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid var(--color-border);
  transition: border-color 0.2s ease;
}

a:hover {
  border-color: var(--color-accent);
}
</style>

<!-- Fuentes de Google -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet">
