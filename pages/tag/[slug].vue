<template>
  <div class="py-8">
    <!-- Header de la etiqueta -->
    <div class="mb-8 text-center">
      <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100 mb-4">
        <TagIcon class="h-4 w-4 mr-2" />
        Etiqueta
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
        {{ tag?.name || 'Cargando...' }}
      </h1>
      <p v-if="tag?.description" class="mt-3 text-xl text-gray-500 dark:text-gray-300 max-w-3xl mx-auto">
        {{ tag.description }}
      </p>
    </div>

    <!-- Contenido principal -->
    <div class="grid gap-8 lg:grid-cols-3">
      <!-- Lista de publicaciones -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Loading state -->
        <div v-if="loading" class="space-y-6">
          <div v-for="i in 3" :key="`skeleton-${i}`" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div class="animate-pulse">
              <div class="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div class="p-6">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex items-center">
                    <div class="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div class="ml-3">
                      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div class="mt-1 h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No hay publicaciones -->
        <div v-else-if="!loading && posts.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay publicaciones con esta etiqueta</h3>
          <p class="mt-1 text-gray-500 dark:text-gray-400">
            No se encontraron publicaciones con la etiqueta "{{ tag?.name || 'seleccionada' }}".
          </p>
          <div class="mt-6">
            <NuxtLink 
              to="/blog" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ver todas las publicaciones
            </NuxtLink>
          </div>
        </div>

        <!-- Lista de publicaciones -->
        <div v-else class="space-y-6">
          <ArticleCardHorizontal 
            v-for="post in posts" 
            :key="post.id" 
            :post="post"
          />
        </div>

        <!-- Paginación -->
        <div v-if="!loading && posts.length > 0" class="mt-8">
          <nav class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 sm:px-0">
            <!-- Botón Anterior -->
            <div class="-mt-px w-0 flex-1 flex">
              <button
                :disabled="currentPage === 1"
                :class="{
                  'border-transparent text-gray-300 dark:text-gray-500 cursor-not-allowed': currentPage === 1,
                  'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400': currentPage > 1
                }"
                class="border-t-2 pt-4 pr-1 inline-flex items-center text-sm font-medium"
                @click="goToPage(currentPage - 1)"
              >
                <ArrowLongLeftIcon class="mr-3 h-5 w-5" aria-hidden="true" />
                Anterior
              </button>
            </div>

            <!-- Números de página -->
            <div class="hidden md:-mt-px md:flex">
              <template v-for="page in visiblePages" :key="page">
                <button
                  v-if="page === '...'"
                  class="border-transparent text-gray-500 dark:text-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
                  disabled
                >
                  ...
                </button>
                <button
                  v-else
                  :class="{
                    'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300': currentPage === page,
                    'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-400': currentPage !== page
                  }"
                  class="border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
                  @click="goToPage(page as number)"
                >
                  {{ page }}
                </button>
              </template>
            </div>

            <!-- Botón Siguiente -->
            <div class="-mt-px w-0 flex-1 flex justify-end">
              <button
                :disabled="currentPage >= totalPages"
                :class="{
                  'border-transparent text-gray-300 dark:text-gray-500 cursor-not-allowed': currentPage >= totalPages,
                  'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400': currentPage < totalPages
                }"
                class="border-t-2 pt-4 pl-1 inline-flex items-center text-sm font-medium"
                @click="goToPage(currentPage + 1)"
              >
                Siguiente
                <ArrowLongRightIcon class="ml-3 h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Acerca de la etiqueta -->
        <div v-if="tag" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Acerca de esta etiqueta</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              {{ tag.description || 'No hay descripción disponible para esta etiqueta.' }}
            </p>
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{{ tag.posts_count || 0 }} publicaciones</span>
            </div>
          </div>
        </div>

        <!-- Etiquetas relacionadas -->
        <div v-if="relatedTags.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Etiquetas relacionadas</h2>
            <div class="flex flex-wrap gap-2">
              <NuxtLink 
                v-for="relatedTag in relatedTags" 
                :key="relatedTag.id"
                :to="`/tag/${relatedTag.slug}`"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {{ relatedTag.name }}
                <span class="ml-1 text-gray-500 dark:text-gray-400">
                  ({{ relatedTag.posts_count || 0 }})
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Categorías populares -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Categorías populares</h2>
            <ul class="space-y-2">
              <li v-for="category in popularCategories" :key="category.id">
                <NuxtLink 
                  :to="`/category/${category.slug}`"
                  class="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {{ category.name }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {{ category.posts_count || 0 }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Suscripción al boletín -->
        <div class="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-6">
          <h3 class="text-lg font-medium text-indigo-800 dark:text-indigo-200 mb-2">¿Te gusta lo que lees?</h3>
          <p class="text-indigo-700 dark:text-indigo-300 mb-4">
            Suscríbete a nuestro boletín para recibir las últimas publicaciones directamente en tu bandeja de entrada.
          </p>
          <form class="space-y-3">
            <div>
              <label for="email" class="sr-only">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
              />
            </div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLongLeftIcon, ArrowLongRightIcon, TagIcon } from '@heroicons/vue/24/outline';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '~/stores/blog';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();

// Estado
const loading = ref(true);
const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);
const posts = ref<Post[]>([]);
const tag = ref<Tag | null>(null);
const relatedTags = ref<Tag[]>([]);
const popularCategories = ref<Category[]>([]);

// Computed
const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value));

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // Mostrar todas las páginas si son pocas
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Lógica para mostrar puntos suspensivos
    const startPage = Math.max(1, Math.min(
      currentPage.value - Math.floor(maxVisiblePages / 2),
      totalPages.value - maxVisiblePages + 1
    ));
    
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages.value);
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages.value) {
      if (endPage < totalPages.value - 1) {
        pages.push('...');
      }
      pages.push(totalPages.value);
    }
  }
  
  return pages;
});

// Métodos
const fetchTag = async (slug: string) => {
  try {
    const tags = await blogStore.fetchTags();
    const foundTag = tags.find(t => t.slug === slug);
    
    if (foundTag) {
      tag.value = foundTag;
      document.title = `#${foundTag.name} | Blog`;
      
      // Obtener etiquetas relacionadas (excluyendo la actual)
      relatedTags.value = tags
        .filter(t => t.id !== foundTag.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
    } else {
      // Redirigir a la página 404 si la etiqueta no existe
      throw new Error('Etiqueta no encontrada');
    }
  } catch (error) {
    console.error('Error al cargar la etiqueta:', error);
    navigateTo('/404');
  }
};

const fetchPosts = async () => {
  if (!tag.value) return;
  
  try {
    loading.value = true;
    
    const params: Record<string, any> = {
      page: currentPage.value,
      per_page: perPage.value,
    };
    
    const response = await blogStore.fetchPostsByTag(tag.value.slug, params);
    posts.value = response.data || [];
    totalItems.value = response.total || 0;
    
  } catch (error) {
    console.error('Error al cargar las publicaciones de la etiqueta:', error);
  } finally {
    loading.value = false;
  }
};

const fetchPopularCategories = async () => {
  try {
    const categories = await blogStore.fetchCategories();
    popularCategories.value = categories
      .sort((a, b) => (b.posts_count || 0) - (a.posts_count || 0))
      .slice(0, 5);
  } catch (error) {
    console.error('Error al cargar las categorías populares:', error);
  }
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  
  currentPage.value = page;
  updateRoute();
};

const updateRoute = () => {
  const query: Record<string, any> = {};
  
  if (currentPage.value > 1) {
    query.page = currentPage.value;
  }
  
  // Usamos replace para no agregar una nueva entrada al historial
  router.replace({ query });
};

const parseRouteQuery = () => {
  const { page } = route.query;
  
  if (page) {
    const pageNum = parseInt(page as string, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      currentPage.value = pageNum;
    }
  } else {
    currentPage.value = 1;
  }
};

// Helper para obtener la URL completa de una imagen
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (!path) return '';
  return path.startsWith('http') ? path : `${blogStore.imageBaseUrl}${path}`;
};

// Watchers
watch([currentPage], () => {
  if (tag.value) {
    fetchPosts();
  }
});

// Lifecycle hooks
onMounted(async () => {
  const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug;
  
  // Cargar datos en paralelo
  await Promise.all([
    fetchTag(slug),
    fetchPopularCategories()
  ]);
  
  // Parsear parámetros de la URL después de cargar la etiqueta
  parseRouteQuery();
  
  // Cargar las publicaciones
  await fetchPosts();
});

// Watch for route changes (cuando cambia el slug de la etiqueta)
watch(() => route.params.slug, async (newSlug) => {
  if (!newSlug) return;
  
  const slug = Array.isArray(newSlug) ? newSlug[0] : newSlug;
  
  // Resetear el estado
  currentPage.value = 1;
  tag.value = null;
  
  // Cargar la nueva etiqueta y sus publicaciones
  await fetchTag(slug);
  parseRouteQuery();
  await fetchPosts();
});

// Watch for query changes (paginación)
watch(() => route.query, () => {
  parseRouteQuery();
}, { deep: true });
</script>
