<template>
  <div class="py-8">
    <!-- Header de la categoría -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
        {{ category?.name || 'Cargando...' }}
      </h1>
      <p v-if="category?.description" class="mt-3 text-xl text-gray-500 dark:text-gray-300 max-w-3xl mx-auto">
        {{ category.description }}
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
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay publicaciones en esta categoría</h3>
          <p class="mt-1 text-gray-500 dark:text-gray-400">
            No se encontraron publicaciones en la categoría "{{ category?.name || 'seleccionada' }}".
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
        <!-- Acerca de la categoría -->
        <div v-if="category" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Acerca de esta categoría</h2>
            <div v-if="category.featured_image" class="mb-4">
              <img 
                :src="getImageUrl(category.featured_image)" 
                :alt="category.name"
                class="w-full h-32 object-cover rounded-md"
              />
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              {{ category.description || 'No hay descripción disponible para esta categoría.' }}
            </p>
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{{ category.posts_count || 0 }} publicaciones</span>
            </div>
          </div>
        </div>

        <!-- Otras categorías -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Otras categorías</h2>
            <ul class="space-y-2">
              <li v-for="cat in otherCategories" :key="cat.id">
                <NuxtLink 
                  :to="`/category/${cat.slug}`"
                  class="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {{ cat.name }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {{ cat.posts_count || 0 }}
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
// Use unique key to prevent component reuse when navigating between dynamic routes
definePageMeta({
  key: route => `/category/${route.params.slug}`
});

import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/vue/24/outline';
import { ref, computed, watch } from 'vue';
import { useBlogStore } from '~/stores/blog';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();

// Detect tenant once for use in useAsyncData keys
const { getTenant } = useTenant();
const tenantId = getTenant();
blogStore.setTenant(tenantId);

// Pagination state (user-driven, remains as refs)
const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);

// Parse initial route query
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
parseRouteQuery();

// Fetch category data via useAsyncData
const { data: categoryData, error: categoryError } = await useAsyncData(
  `category-${tenantId}-${route.params.slug}`,
  async () => {
    const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug;

    if (slug === 'sin-categoria') {
      navigateTo('/blog');
      return { category: null, allCategories: [] };
    }

    const [categories] = await Promise.all([
      blogStore.fetchCategories()
    ]);

    const foundCategory = categories.find((cat: any) => cat.slug === slug);

    if (!foundCategory) {
      navigateTo('/404');
      return { category: null, allCategories: categories };
    }

    return { category: foundCategory, allCategories: categories };
  },
  {
    server: true,
    lazy: false,
    watch: [() => route.params.slug]
  }
);

// Derived refs from categoryData
const category = computed(() => categoryData.value?.category || null);
const allCategories = computed(() => categoryData.value?.allCategories || []);

// Fetch posts via useAsyncData
const { data: posts, pending: loading, error: fetchError, refresh: refreshPosts } = await useAsyncData(
  `category-posts-${tenantId}-${route.params.slug}`,
  async () => {
    const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug;
    if (!slug) return [];

    try {
      const params: Record<string, any> = {
        page: currentPage.value,
        per_page: perPage.value,
      };

      const response = await blogStore.fetchPostsByCategory(slug, params);
      totalItems.value = response.total || 0;
      return response.data || [];
    } catch (err) {
      console.error('Error al cargar las publicaciones de la categoría:', err);
      return [];
    }
  },
  {
    server: true,
    lazy: false,
    watch: [() => route.params.slug, currentPage]
  }
);

// Computed
const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value));
const otherCategories = computed(() => {
  if (!category.value) return [];
  return allCategories.value.filter((cat: any) =>
    cat.id !== category.value?.id && cat.slug !== 'sin-categoria'
  );
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    const startPage = Math.max(1, Math.min(
      currentPage.value - Math.floor(maxVisiblePages / 2),
      totalPages.value - maxVisiblePages + 1
    ));
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages.value);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages.value) {
      if (endPage < totalPages.value - 1) pages.push('...');
      pages.push(totalPages.value);
    }
  }

  return pages;
});

// Métodos
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
  router.replace({ query });
};

// Helper para obtener la URL completa de una imagen
const getImageUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${blogStore.imageBaseUrl}${path}`;
};

// Watch for query changes (pagination via browser back/forward)
watch(() => route.query, (newQuery, oldQuery) => {
  if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
    parseRouteQuery();
    // useAsyncData's watch on currentPage will auto-refresh
  }
}, { deep: true });
</script>
