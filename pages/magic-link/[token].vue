<template>
  <div class="max-w-md mx-auto px-6 py-16 text-center">
    <!-- Loading -->
    <div v-if="isLoading">
      <div class="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Verificando tu enlace...</p>
    </div>

    <!-- Success -->
    <div v-else-if="success">
      <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 class="text-2xl font-bold mb-2">Bienvenido</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Ya tienes acceso al contenido exclusivo.
      </p>
      <nuxt-link
        to="/blog"
        class="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
      >
        Ir al blog
      </nuxt-link>
    </div>

    <!-- Error -->
    <div v-else-if="error">
      <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 class="text-2xl font-bold mb-2">Enlace inválido</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
      <nuxt-link
        to="/subscribe"
        class="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
      >
        Solicitar nuevo enlace
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { verifyMagicLink } = useSubscriber();

const isLoading = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  const token = route.params.token as string;
  try {
    await verifyMagicLink(token);
    success.value = true;
  } catch (err: any) {
    const msg = err.data?.error || err.message || 'Unknown error';
    if (msg === 'Link already used') {
      error.value = 'Este enlace ya fue utilizado. Solicita uno nuevo.';
    } else if (msg === 'Link expired') {
      error.value = 'Este enlace ha expirado. Solicita uno nuevo.';
    } else {
      error.value = 'Enlace inválido o expirado.';
    }
  } finally {
    isLoading.value = false;
  }
});
</script>
