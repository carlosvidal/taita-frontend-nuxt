<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <Header />
    
    <!-- Main Content Container -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <slot />
    </main>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
// Import types if needed
// No additional setup needed as Header and Footer components handle their own data
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