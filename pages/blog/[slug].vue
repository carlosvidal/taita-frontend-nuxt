<template>
  <div class="py-8">
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mt-6"></div>
        <div class="space-y-2 mt-6">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 class="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error al cargar la publicación</h2>
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        <button 
          @click="fetchPost"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Post content -->
    <div v-else-if="post" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <article class="prose dark:prose-invert max-w-none">
        <!-- Featured Image -->
        <div v-if="post.featured_image" class="mb-8 rounded-lg overflow-hidden">
          <img 
            :src="getImageUrl(post.featured_image)" 
            :alt="post.title" 
            class="w-full h-auto max-h-96 object-cover"
          />
        </div>
        
        <!-- Title -->
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ post.title }}
        </h1>
        
        <!-- Meta -->
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          <div class="flex items-center">
            <span class="mr-2">Por</span>
            <div class="flex items-center">
              <span v-if="post.author?.avatar" class="h-8 w-8 rounded-full overflow-hidden mr-2">
                <img :src="getImageUrl(post.author.avatar)" :alt="post.author.name" class="h-full w-full object-cover">
              </span>
              <span class="font-medium text-gray-900 dark:text-gray-100">{{ post.author?.name || 'Anónimo' }}</span>
            </div>
            <span class="mx-2">•</span>
            <time :datetime="post.published_at">{{ formatDate(post.published_at) }}</time>
            <span v-if="post.reading_time" class="mx-2">•</span>
            <span v-if="post.reading_time">{{ post.reading_time }} min de lectura</span>
          </div>
        </div>
        
        <!-- Category and Tags -->
        <div class="flex flex-wrap gap-2 mb-8">
          <nuxt-link 
            v-if="post.category"
            :to="`/category/${post.category.slug}`"
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {{ post.category.name }}
          </nuxt-link>
          <nuxt-link 
            v-for="tag in post.tags" 
            :key="tag.id"
            :to="`/tag/${tag.slug}`"
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          >
            {{ tag.name }}
          </nuxt-link>
        </div>
        
        <!-- Content -->
        <div class="prose dark:prose-invert max-w-none" v-html="post.content"></div>
        
        <!-- Author Bio -->
        <div v-if="post.author?.bio" class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div v-if="post.author?.avatar" class="h-16 w-16 rounded-full overflow-hidden mr-4">
              <img :src="getImageUrl(post.author.avatar)" :alt="post.author.name" class="h-full w-full object-cover">
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Escrito por {{ post.author.name }}</h3>
              <p class="mt-1 text-gray-600 dark:text-gray-300">{{ post.author.bio }}</p>
              <div v-if="post.author?.social_links" class="mt-2 flex space-x-4">
                <a 
                  v-for="(url, platform) in post.author.social_links" 
                  :key="platform"
                  :href="url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span class="sr-only">{{ platform }}</span>
                  <i :class="getSocialIcon(platform)" class="h-5 w-5"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      <!-- Navigation -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between">
          <nuxt-link 
            v-if="prevPost" 
            :to="`/blog/${prevPost.slug}`"
            class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon class="h-4 w-4 mr-1" />
            Anterior
          </nuxt-link>
          <div v-else></div>
          
          <nuxt-link 
            v-if="nextPost" 
            :to="`/blog/${nextPost.slug}`"
            class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Siguiente
            <ArrowRightIcon class="h-4 w-4 ml-1" />
          </nuxt-link>
          <div v-else></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '~/stores/blog';
import { ref, onMounted, computed } from 'vue';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();

const loading = ref(true);
const error = ref<string | null>(null);
const post = ref<any>(null);
const prevPost = ref<any>(null);
const nextPost = ref<any>(null);

const slug = computed(() => route.params.slug as string);

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `https://taita-api.onrender.com/storage/${path}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getSocialIcon = (platform: string) => {
  const icons: Record<string, string> = {
    twitter: 'i-mdi-twitter',
    facebook: 'i-mdi-facebook',
    instagram: 'i-mdi-instagram',
    linkedin: 'i-mdi-linkedin',
    github: 'i-mdi-github',
    website: 'i-mdi-web',
  };
  return icons[platform.toLowerCase()] || 'i-mdi-link';
};

const fetchPost = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Fetch the post
    const postData = await blogStore.fetchPost(slug.value);
    if (!postData) {
      throw new Error('No se encontró la publicación');
    }
    
    post.value = postData;
    
    // Set page title and meta tags
    useHead({
      title: post.value.meta_title || post.value.title,
      meta: [
        { name: 'description', content: post.value.meta_description || post.value.excerpt },
        // Add Open Graph meta tags for social sharing
        { property: 'og:title', content: post.value.meta_title || post.value.title },
        { property: 'og:description', content: post.value.meta_description || post.value.excerpt },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: `https://${window.location.host}${route.fullPath}` },
        { property: 'og:image', content: post.value.featured_image ? getImageUrl(post.value.featured_image) : '' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: post.value.meta_title || post.value.title },
        { name: 'twitter:description', content: post.value.meta_description || post.value.excerpt },
        { name: 'twitter:image', content: post.value.featured_image ? getImageUrl(post.value.featured_image) : '' },
      ],
    });
    
    // Fetch previous and next posts (you'll need to implement these methods in your store)
    // For now, we'll just set them to null
    prevPost.value = null;
    nextPost.value = null;
    
  } catch (err: any) {
    console.error('Error fetching post:', err);
    error.value = err.message || 'No se pudo cargar la publicación. Por favor, intente nuevamente más tarde.';
  } finally {
    loading.value = false;
  }
};

// Watch for route changes
watch(() => route.params.slug, async (newSlug) => {
  if (newSlug) {
    await fetchPost();
  }
});

// Fetch post on component mount
onMounted(async () => {
  if (slug.value) {
    await fetchPost();
  } else {
    error.value = 'No se especificó un slug de publicación';
    loading.value = false;
  }
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
