<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <LayoutHeader />

    <!-- Main Content Container -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- Footer -->
    <LayoutFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogStore } from '~/stores/blog';

const blogStore = useBlogStore();
const blogTitle = ref('Blog');

onMounted(async () => {
  try {
    const settings = await blogStore.fetchSettings();
    blogTitle.value = settings?.title || settings?.name || 'Blog';

    // Update page title and meta tags
    if (typeof document !== 'undefined') {
      document.title = blogTitle.value;

      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', settings?.description || `Bienvenido a ${blogTitle.value}`);
      }
    }
  } catch (error) {
    console.error('[Layout] Error loading blog settings:', error);
  }
});
</script>

<style>
/* Ensure proper transitions for dark mode */
* {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

/* Override any conflicting styles */
body {
  @apply bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100;
}

/* Ensure proper font rendering */
html {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>