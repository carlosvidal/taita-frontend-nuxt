<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="space-y-8 px-4 py-8">
      <div class="animate-pulse space-y-4">
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
      </div>
      
      <!-- Skeleton for posts -->
      <div class="space-y-12">
        <div v-for="i in 3" :key="`post-skeleton-${i}`" class="border-b border-gray-200 dark:border-gray-700 pb-8">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mx-4 my-8 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Featured Posts -->
      <section class="px-4 py-8">
        <div v-if="Array.isArray(recentPosts) && recentPosts.length > 0" class="max-w-4xl mx-auto space-y-16">
          <ArticleCardHorizontal v-for="post in recentPosts" :key="post.id" :post="post" />
        </div>
        
        <div v-else class="text-center py-16">
          <p class="text-gray-600 dark:text-gray-400 italic">No hay publicaciones disponibles en este momento.</p>
        </div>
        
        <div class="text-center mt-16">
          <NuxtLink 
            to="/blog" 
            class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Ver todas las entradas →
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlogStore } from '~/stores/blog';
import type { Post } from '~/stores/blog';

// Initialize Nuxt composables
const config = useRuntimeConfig();

// Initialize store
const blogStore = useBlogStore();

// Detect tenant once for use in useAsyncData keys
const { getTenant } = useTenant();
const tenant = getTenant();
blogStore.setTenant(tenant);

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

// Get static mode from plugin
const { $isStatic } = useNuxtApp();

// Use Nuxt's async data for both client and SSR/SSG compatibility
const { data: recentPosts, pending: loading, error: fetchError } = await useAsyncData(
  `home-posts-${tenant}`,
  async () => {
    try {
      // Fetch recent posts
      const response = await blogStore.fetchPosts({
        limit: 5,
        include: 'category,tags,author',
        status: 'published',
        orderBy: 'published_at',
        order: 'desc'
      });

      // Handle both direct and paginated responses
      return Array.isArray(response) ? response : (response?.data || []);
    } catch (err: any) {
      console.error('Error loading posts:', err);
      if (err.response) {
        console.error('Detalles del error:', {
          status: err.response.status,
          data: err.response.data,
          url: err.response.config?.url
        });
      }
      return [];
    }
  },
  {
    server: true,
    lazy: false
  }
);

// Computed error message for template compatibility
const error = computed(() => fetchError.value?.message || null);
</script>

<!-- Removed legacy CSS variables styles - now using Tailwind classes with dark mode support -->
