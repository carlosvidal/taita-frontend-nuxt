<template>
  <div class="max-w-md mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold mb-2">Suscríbete</h1>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Accede a contenido exclusivo directamente en tu correo.
    </p>

    <!-- Success message -->
    <div v-if="success" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
      <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <h2 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">Revisa tu correo</h2>
      <p class="text-sm text-green-700 dark:text-green-300">
        Te enviamos un enlace de acceso a <strong>{{ submittedEmail }}</strong>
      </p>
    </div>

    <!-- Subscribe form -->
    <form v-else @submit.prevent="handleSubscribe" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="tu@email.com"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre (opcional)</label>
        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="Tu nombre"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 px-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {{ isLoading ? 'Enviando...' : 'Suscribirme' }}
      </button>

      <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
        Sin spam. Te enviaremos un enlace mágico para acceder.
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
const { subscribe } = useSubscriber();

const email = ref('');
const name = ref('');
const isLoading = ref(false);
const error = ref('');
const success = ref(false);
const submittedEmail = ref('');

const handleSubscribe = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    await subscribe(email.value, name.value || undefined);
    submittedEmail.value = email.value;
    success.value = true;
  } catch (err: any) {
    error.value = err.data?.error || 'Error al procesar tu suscripción. Intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>
