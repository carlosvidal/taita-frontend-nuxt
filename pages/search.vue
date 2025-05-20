<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Buscar</h1>
    <div class="max-w-2xl mx-auto">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Buscar artículos..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="search"
      >
      <button 
        @click="search"
        class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Buscar
      </button>
      
      <div v-if="results.length > 0" class="mt-8 space-y-6">
        <h2 class="text-2xl font-semibold">Resultados de búsqueda</h2>
        <div v-for="post in results" :key="post.id" class="border-b pb-4">
          <h3 class="text-xl font-medium">
            <NuxtLink :to="`/blog/${post.slug}`" class="hover:text-blue-600">
              {{ post.title }}
            </NuxtLink>
          </h3>
          <p class="text-gray-600">{{ post.excerpt }}</p>
        </div>
      </div>
      
      <div v-else-if="searchPerformed" class="mt-8 text-center text-gray-600">
        No se encontraron resultados para "{{ searchQuery }}"
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBlogStore } from '~/stores/blog';

// Initialize store and state
const blogStore = useBlogStore();
const searchQuery = ref('');
const results = ref([]);
const searchPerformed = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const search = async () => {
  if (!searchQuery.value.trim()) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    // Determinar el tenant basado en el hostname
    const hostname = process.client ? window.location.hostname : '';
    const subdomain = hostname.split('.')[0];
    const tenant = ['localhost', '127.0.0.1', 'www', ''].includes(subdomain) 
      ? 'taita' 
      : subdomain;
    
    // Configurar el tenant
    blogStore.setTenant(tenant);
    
    console.log('Buscando con query:', searchQuery.value);
    const response = await blogStore.searchPosts(searchQuery.value, {
      include: 'category,tags,author',
      status: 'published'
    });
    
    console.log('Resultados de búsqueda:', response);
    results.value = Array.isArray(response) ? response : [];
    searchPerformed.value = true;
    
  } catch (err: any) {
    console.error('Error al buscar:', err);
    if (err.response) {
      console.error('Error details:', {
        status: err.response.status,
        data: err.response.data,
        url: err.response.config?.url
      });
      error.value = `Error al buscar: ${err.response.status} ${err.response.statusText}`;
    } else {
      error.value = 'Error al realizar la búsqueda. Por favor, intente de nuevo.';
    }
    results.value = [];
  } finally {
    loading.value = false;
  }
};

useHead({
  title: 'Buscar',
  meta: [
    { name: 'description', content: 'Busca entre nuestros artículos' }
  ]
});
</script>
