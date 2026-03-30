<template>
  <div v-if="!success" class="subscribe-form">
    <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-2">
      <input
        v-model="email"
        type="email"
        required
        :placeholder="placeholder"
        class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        :disabled="isLoading"
        class="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {{ isLoading ? '...' : buttonText }}
      </button>
    </form>
    <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
  <div v-else class="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3">
    Revisa tu correo para acceder.
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  placeholder?: string;
  buttonText?: string;
}>(), {
  placeholder: 'tu@email.com',
  buttonText: 'Suscribirme',
});

const { subscribe } = useSubscriber();

const email = ref('');
const isLoading = ref(false);
const error = ref('');
const success = ref(false);

const handleSubscribe = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    await subscribe(email.value);
    success.value = true;
  } catch (err: any) {
    error.value = err.data?.error || 'Error. Intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>
