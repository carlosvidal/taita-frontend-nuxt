<template>
  <div class="py-8">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
        Blog
      </h1>
      <p class="mt-3 text-xl text-gray-500 dark:text-gray-300">
        Todas nuestras publicaciones
      </p>
    </div>

    <!-- Filtros -->
    <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Búsqueda -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Buscar publicaciones..."
              @keyup.enter="applyFilters"
            />
          </div>
        </div>

        <!-- Ordenar por -->
        <div class="w-full sm:w-48">
          <select 
            v-model="sortBy"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
            @change="applyFilters"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="popular">Más populares</option>
          </select>
        </div>


        <!-- Botón de búsqueda en móvil -->
        <button
          type="button"
          class="sm:hidden inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="applyFilters"
        >
          Buscar
        </button>
      </div>
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


        <!-- No results -->
        <div v-else-if="!loading && posts.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">No se encontraron publicaciones</h3>
          <p class="mt-1 text-gray-500 dark:text-gray-400">
            No hay publicaciones que coincidan con tu búsqueda. Intenta con otros términos.
          </p>
          <div class="mt-6">
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="resetFilters"
            >
              <ArrowPathIcon class="-ml-1 mr-2 h-4 w-4" />
              Restablecer filtros
            </button>
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
        <!-- Categorías -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Categorías</h2>
            <ul class="space-y-2">
              <li v-for="category in categories" :key="category.id">
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

        <!-- Etiquetas populares -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Etiquetas populares</h2>
            <div class="flex flex-wrap gap-2">
              <NuxtLink 
                v-for="tag in popularTags" 
                :key="tag.id"
                :to="`/tag/${tag.slug}`"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {{ tag.name }}
                <span class="ml-1.5 text-gray-500 dark:text-gray-400">
                  ({{ tag.posts_count || 0 }})
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Publicidad o contenido destacado -->
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
import { ArrowLongLeftIcon, ArrowLongRightIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';
import { ref, computed, onMounted, watch } from 'vue';
import { useBlogStore } from '~/stores/blog';
import { useRuntimeConfig, useRoute, useRouter } from '#imports';

// Initialize Nuxt composables and store
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const blogStore = useBlogStore();

// Estado
const loading = ref(true);
const searchQuery = ref('');
const sortBy = ref('newest');
const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);
const posts = ref<Post[]>([]);
const categories = ref<Category[]>([]);
const popularTags = ref<Tag[]>([]);

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
const fetchPosts = async () => {
  // Only run on client-side
  if (!process.client) {
    posts.value = [];
    return;
  }

  try {
    loading.value = true;
    
    // Determine tenant based on hostname (client-side only)
    const hostname = window?.location?.hostname || '';
    const subdomain = hostname.split('.')[0];
    const tenant = ['localhost', '127.0.0.1', 'www', ''].includes(subdomain) 
      ? 'taita' 
      : subdomain;
    
    // Configure tenant
    blogStore.setTenant(tenant);
    
    const params: Record<string, any> = {
      page: currentPage.value,
      per_page: perPage.value,
      search: searchQuery.value || undefined,
      sort: sortBy.value,
      include: 'category,tags,author',
      status: 'published',
      orderBy: 'published_at',
      order: 'desc'
    };
    
    console.log('Fetching posts with params:', params);
    
    const response = await blogStore.fetchPosts(params);
    
    // Handle both array and paginated response
    if (Array.isArray(response)) {
      posts.value = response;
      totalItems.value = response.length;
    } else if (response && typeof response === 'object') {
      if ('data' in response) {
        posts.value = Array.isArray(response.data) ? response.data : [];
        totalItems.value = typeof response.total === 'number' ? response.total : 0;
        currentPage.value = typeof response.current_page === 'number' ? response.current_page : 1;
        perPage.value = typeof response.per_page === 'number' ? response.per_page : 10;
      } else if (Object.keys(response).length > 0) {
        // Handle case where response is an object but not in expected paginated format
        posts.value = [response];
        totalItems.value = 1;
      } else {
        posts.value = [];
        totalItems.value = 0;
      }
    } else {
      console.error('Unexpected response format:', response);
      posts.value = [];
      totalItems.value = 0;
    }
    
  } catch (error: any) {
    console.error('Error al cargar las publicaciones:', error);
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        url: error.response.config?.url
      });
    }
    posts.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await blogStore.fetchCategories();
    console.log('Categories response:', response);
    
    // Handle both array and paginated response
    if (Array.isArray(response)) {
      categories.value = response;
    } else if (response && 'data' in response) {
      categories.value = response.data || [];
    } else {
      console.error('Unexpected categories response format:', response);
      categories.value = [];
    }
  } catch (error) {
    console.error('Error al cargar las categorías:', error);
    categories.value = [];
  }
};

const fetchPopularTags = async () => {
  try {
    const response = await blogStore.fetchTags({ 
      popular: true, 
      limit: 10,
      page: 1,
      per_page: 10,
      sort: 'popular'
    });
    
    console.log('Popular tags response:', response);
    
    // Handle both array and paginated response
    if (Array.isArray(response)) {
      popularTags.value = response;
    } else if (response && 'data' in response) {
      popularTags.value = response.data || [];
    } else {
      console.error('Unexpected tags response format:', response);
      popularTags.value = [];
    }
  } catch (error) {
    console.error('Error al cargar las etiquetas populares:', error);
    popularTags.value = [];
  }
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  
  currentPage.value = page;
  updateRoute();
};

const applyFilters = () => {
  currentPage.value = 1; // Reset to first page when filters change
  updateRoute();
};

const resetFilters = () => {
  searchQuery.value = '';
  sortBy.value = 'newest';
  currentPage.value = 1;
  updateRoute();
};

const updateRoute = () => {
  const query: Record<string, any> = {};
  
  if (searchQuery.value) query.q = searchQuery.value;
  if (sortBy.value !== 'newest') query.sort = sortBy.value;
  if (currentPage.value > 1) query.page = currentPage.value;
  
  router.replace({ query });
};

const parseRouteQuery = () => {
  const { q, sort, page } = route.query;
  
  if (q) searchQuery.value = q as string;
  if (sort) sortBy.value = sort as string;
  if (page) currentPage.value = parseInt(page as string, 10) || 1;
};

// Watchers
watch([currentPage, searchQuery, sortBy], () => {
  fetchPosts();});

// Lifecycle hooks
onMounted(async () => {
  parseRouteQuery();
  await Promise.all([
    fetchPosts(),
    fetchCategories(),
    fetchPopularTags()
  ]);
});

// Watch for route changes
watch(() => route.query, () => {
  parseRouteQuery();
  fetchPosts();
}, { deep: true });
</script>
