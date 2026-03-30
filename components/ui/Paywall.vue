<template>
  <div class="paywall relative">
    <!-- Gradient fade over truncated content -->
    <div v-if="showExcerpt && excerpt" class="relative">
      <div class="reading-content" v-html="excerpt"></div>
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
    </div>

    <!-- Paywall CTA -->
    <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center mt-4">
      <!-- Subscribers-only content -->
      <template v-if="visibility === 'SUBSCRIBERS'">
        <svg class="w-10 h-10 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Contenido para suscriptores</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Regístrate gratis para leer este artículo completo.
        </p>
        <SubscribeForm placeholder="tu@email.com" button-text="Suscribirme gratis" />
        <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Ya suscrito?
          <nuxt-link to="/subscribe" class="text-blue-600 hover:underline">Solicitar enlace de acceso</nuxt-link>
        </p>
      </template>

      <!-- Premium content -->
      <template v-else-if="visibility === 'PREMIUM'">
        <svg class="w-10 h-10 text-amber-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3l3.057-3 3.943 2.5L16 0l3 3-1 5.5 2 4.5-3 2v5l-5 2-5-2v-5l-3-2 2-4.5L5 3z" />
        </svg>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Contenido Premium</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Este artículo es exclusivo para miembros premium.
        </p>
        <nuxt-link
          to="/subscribe"
          class="inline-block px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          Hazte Premium
        </nuxt-link>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import SubscribeForm from '~/components/ui/SubscribeForm.vue';

defineProps<{
  visibility: 'SUBSCRIBERS' | 'PREMIUM';
  excerpt?: string;
  showExcerpt?: boolean;
}>();
</script>
