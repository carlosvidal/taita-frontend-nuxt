<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
    <!-- Header -->
    <Header />
    
    <!-- Main Content -->
    <main class="flex-1">
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
  @apply bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100;
}

/* Ensure proper font rendering */
html {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>