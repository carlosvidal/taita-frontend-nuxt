<template>
  <div class="read-theme">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <!-- Client-side only components -->
    </ClientOnly>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useBlogStore } from '~/stores/blog';

// Initialize store
const blogStore = useBlogStore();

// Handle client-side initialization
onMounted(() => {
  if (process.client) {
    // Any client-side initialization can go here
    console.log('App mounted on client side');
  }
});
</script>

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
