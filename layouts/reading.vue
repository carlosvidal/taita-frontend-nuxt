<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Layout for reading pages (series, posts, pages)
// These pages have their own header and footer
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
