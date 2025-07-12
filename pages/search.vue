<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-8">
      <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center">Buscar Artículos</h1>
      
      <div class="max-w-2xl mx-auto">
        <!-- Search Form -->
        <div class="mb-8">
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buscar artículos..."
              class="w-full px-6 py-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                     transition-colors text-lg"
              @keyup.enter="search"
            >
            <div class="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <button 
            @click="search"
            :disabled="loading || !searchQuery.trim()"
            class="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                   disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                   text-white font-semibold rounded-lg transition-colors duration-200
                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 
                   dark:focus:ring-offset-gray-900"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando...
            </span>
            <span v-else>Buscar</span>
          </button>
        </div>
        
        <!-- Error Message -->
        <div v-if="error" class="mb-8 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <p class="text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
        
        <!-- Search Results -->
        <div v-if="results.length > 0" class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Resultados de búsqueda ({{ results.length }})
          </h2>
          
          <div v-for="post in results" :key="post.id" 
               class="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
            <article class="group">
              <h3 class="text-xl font-semibold mb-2">
                <NuxtLink 
                  :to="`/blog/${post.slug}`" 
                  class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 
                         transition-colors duration-200 group-hover:underline"
                >
                  {{ post.title }}
                </NuxtLink>
              </h3>
              
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                {{ post.excerpt || 'Sin descripción disponible.' }}
              </p>
              
              <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                <span v-if="post.category" class="text-blue-600 dark:text-blue-400 font-medium">
                  {{ post.category.name }}
                </span>
                <span v-if="post.author">
                  Por {{ post.author.name }}
                </span>
                <span v-if="post.published_at">
                  {{ formatDate(post.published_at) }}
                </span>
              </div>
            </article>
          </div>
        </div>
        
        <!-- No Results -->
        <div v-else-if="searchPerformed && !loading" 
             class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron resultados
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            No se encontraron artículos que coincidan con <strong>"{{ searchQuery }}"</strong>. 
            Intenta con términos diferentes.
          </p>
        </div>
        
        <!-- Search Suggestions -->
        <div v-if="!searchPerformed && !loading" 
             class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Busca entre nuestros artículos
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Escribe palabras clave para encontrar los artículos que te interesan.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBlogStore } from '~/stores/blog';

// Error message constants
const ERROR_MESSAGES = {
  DEFAULT: 'Error al realizar la búsqueda. Por favor, intente de nuevo.',
  NETWORK: 'Error de conexión. Por favor, verifique su conexión a internet.'
};

// Initialize store and state
const blogStore = useBlogStore();
const searchQuery = ref('');
const results = ref([]);
const searchPerformed = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', options);
};

const search = async () => {
  // Only run on client-side
  if (!process.client) {
    results.value = [];
    return;
  }
  
  if (!searchQuery.value.trim()) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    // Determine tenant based on hostname (client-side only)
    const hostname = window?.location?.hostname || '';
    const subdomain = hostname.split('.')[0];
    const tenant = ['localhost', '127.0.0.1', 'www', ''].includes(subdomain) 
      ? 'taita' 
      : subdomain;
    
    // Configure tenant
    blogStore.setTenant(tenant);
    
    console.log('Buscando con query:', searchQuery.value);
    const response = await blogStore.searchPosts(searchQuery.value, {
      include: 'category,tags,author',
      status: 'published'
    });
    
    // Handle different response formats
    if (Array.isArray(response)) {
      results.value = response;
    } else if (response && typeof response === 'object' && 'data' in response) {
      results.value = Array.isArray(response.data) ? response.data : [];
    } else {
      results.value = [];
    }
    
    searchPerformed.value = true;
    
  } catch (err) {
    console.error('Error al buscar:', err);
    const errorMessage = 'Error al realizar la búsqueda. Por favor, intente de nuevo.';
    
    console.error('Error al buscar:', err);
    
    // Handle different types of errors
    if (err && typeof err === 'object') {
      // Handle Axios error with response
      if ('response' in err) {
        const status = err.response?.status;
        const statusText = err.response?.statusText || '';
        
        console.error('Error details:', {
          status,
          data: err.response?.data,
          url: err.response?.config?.url
        });
        
        error.value = status 
          ? `Error al buscar: ${status} ${statusText}`.trim()
          : ERROR_MESSAGES.DEFAULT;
      } 
      // Handle network errors
      else if ('request' in err) {
        error.value = ERROR_MESSAGES.NETWORK;
      }
    } else {
      error.value = errorMessage;
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
