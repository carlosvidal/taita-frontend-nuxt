import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      // Exclude problematic files from being processed
      external: ['/__nuxt/.mjs'],
      output: {
        // Ensure proper handling of dynamic imports
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    },
    // Disable sourcemaps in production
    sourcemap: process.env.NODE_ENV !== 'production',
    // Increase build timeout if needed
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    exclude: ['/__nuxt/.mjs']
  },
  // Add any other Vite-specific configurations here
  plugins: []
});
