<template>
  <article class="flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 h-full">
    <NuxtLink :to="`/blog/${post.slug}`" class="block flex-1 flex flex-col">
      <!-- Featured Image -->
      <div class="h-48 w-full overflow-hidden">
        <img 
          v-if="post.featured_image"
          :src="getImageUrl(post.featured_image)" 
          :alt="post.title"
          class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div v-else class="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span class="text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 flex-1 flex flex-col">
        <!-- Category -->
        <div v-if="post.category" class="mb-3">
          <NuxtLink 
            :to="`/category/${post.category.slug}`"
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
            @click.stop
          >
            {{ post.category.name }}
          </NuxtLink>
        </div>

        <!-- Title -->
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {{ post.title }}
        </h3>

        <!-- Excerpt -->
        <p class="text-gray-600 dark:text-gray-300 flex-1 line-clamp-3 mb-4">
          {{ post.excerpt || 'Sin descripción disponible' }}
        </p>

        <!-- Author and Date -->
        <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="sr-only">{{ post.author?.name || 'Autor' }}</span>
              <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <span class="text-gray-600 dark:text-gray-300 font-medium">
                  {{ post.author?.name?.charAt(0) || 'A' }}
                </span>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ post.author?.name || 'Anónimo' }}
              </p>
              <div class="flex space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <time :datetime="post.published_at">
                  {{ formatDate(post.published_at) }}
                </time>
                <span aria-hidden="true">·</span>
                <span>{{ post.reading_time || '3 min' }} de lectura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import { useBlogStore } from '~/stores/blog';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const blogStore = useBlogStore();

// Helper to format date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to get full image URL
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (!path) return '';
  return path.startsWith('http') ? path : `${blogStore.imageBaseUrl}${path}`;
};
</script>
