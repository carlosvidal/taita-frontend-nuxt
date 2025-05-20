<template>
  <article class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg overflow-hidden transition-shadow duration-300">
    <div class="md:flex">
      <!-- Image -->
      <div class="md:flex-shrink-0 md:w-48 h-48 md:h-auto">
        <NuxtLink :to="`/blog/${post.slug}`" class="block h-full">
          <img 
            v-if="post.featured_image"
            :src="getImageUrl(post.featured_image)" 
            :alt="post.title"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <div v-else class="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span class="text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
        </NuxtLink>
      </div>

      <!-- Content -->
      <div class="p-6 flex-1 flex flex-col">
        <div class="flex-1">
          <!-- Category -->
          <div v-if="post.category" class="mb-2">
            <NuxtLink 
              :to="`/category/${post.category.slug}`"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
              @click.stop
            >
              {{ post.category.name }}
            </NuxtLink>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            <NuxtLink :to="`/post/${post.slug}`" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {{ post.title }}
            </NuxtLink>
          </h3>

          <!-- Excerpt -->
          <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {{ post.excerpt || 'Sin descripción disponible' }}
          </p>
        </div>

        <!-- Meta -->
        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
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
            
            <NuxtLink 
              :to="`/post/${post.slug}`" 
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-100 dark:hover:bg-indigo-800"
            >
              Leer más
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
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
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper to get full image URL
const getImageUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${blogStore.imageBaseUrl}${path}`;
};
</script>
