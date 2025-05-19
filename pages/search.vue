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
const searchQuery = ref('');
const results = ref([]);
const searchPerformed = ref(false);
const blogStore = useBlogStore();

const search = async () => {
  if (!searchQuery.value.trim()) return;
  
  try {
    const response = await blogStore.searchPosts(searchQuery.value);
    results.value = response || [];
    searchPerformed.value = true;
  } catch (error) {
    console.error('Error al buscar:', error);
    results.value = [];
  }
};

useHead({
  title: 'Buscar',
  meta: [
    { name: 'description', content: 'Busca entre nuestros artículos' }
  ]
});
</script>
