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
import { ref, onMounted } from 'vue';
import { useBlogStore } from '~/stores/blog';
import type { Post } from '~/stores/blog';

// Initialize Nuxt composables
const config = useRuntimeConfig();
const route = useRoute();

// Initialize store and state
const blogStore = useBlogStore();
const recentPosts = ref<Post[]>([]);
const loading = ref<boolean>(true);
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

// Mock data function for static generation
const mockStaticPosts = () => {
  return [
    {
      id: 1,
      title: 'Bienvenido al Blog',
      slug: 'bienvenido-al-blog',
      excerpt: 'Este es un ejemplo de entrada de blog generada estáticamente.',
      content: '<p>Este es un ejemplo de contenido de blog generado estáticamente.</p>',
      featured_image: '/images/placeholder.jpg',
      featured: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reading_time: 2,
      author_id: 1,
      category_id: 1,
      author: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        bio: 'Administrador del blog',
        avatar: '/images/placeholder-avatar.jpg'
      },
      category: {
        id: 1,
        name: 'General',
        slug: 'general',
        description: 'Categoría general'
      },
      tags: [
        {
          id: 1,
          name: 'Blog',
          slug: 'blog',
          description: 'Artículos de blog'
        }
      ]
    },
    {
      id: 2,
      title: 'Cómo utilizar Nuxt 3',
      slug: 'como-utilizar-nuxt-3',
      excerpt: 'Aprende a utilizar Nuxt 3 para crear sitios web estáticos.',
      content: '<p>Nuxt 3 es un framework potente para crear sitios web estáticos y aplicaciones web.</p>',
      featured_image: '/images/placeholder.jpg',
      featured: false,
      published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      reading_time: 5,
      author_id: 1,
      category_id: 2,
      author: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        bio: 'Administrador del blog',
        avatar: '/images/placeholder-avatar.jpg'
      },
      category: {
        id: 2,
        name: 'Tecnología',
        slug: 'tecnologia',
        description: 'Artículos sobre tecnología'
      },
      tags: [
        {
          id: 2,
          name: 'Nuxt',
          slug: 'nuxt',
          description: 'Artículos sobre Nuxt'
        }
      ]
    }
  ];
};

// Get static mode from plugin
const { $isStatic } = useNuxtApp();

// Use Nuxt's async data for both client and SSR/SSG compatibility
const { data: postsData, pending, error: fetchError } = await useAsyncData(
  'home-posts',
  async () => {
    // In static mode, return mock data
    if ($isStatic && $isStatic()) {
      return mockStaticPosts();
    }
    
    try {
      // For normal operation, use a safe tenant/subdomain approach
      let tenant = 'taita'; // Default tenant
      
      if (process.client) {
        // Client-side tenant detection
        const hostname = window?.location?.hostname || '';
        const subdomain = hostname.split('.')[0];
        tenant = ['localhost', '127.0.0.1', 'www', ''].includes(subdomain)
          ? 'taita'
          : subdomain;
      }
      
      // Configure tenant
      blogStore.setTenant(tenant);
      
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
    // For static generation, ensure we don't depend on request context
    server: true,
    lazy: false
  }
);

// Reactive references for template
loading.value = pending.value;
error.value = fetchError.value ? 'No se pudieron cargar las publicaciones. Por favor, intente de nuevo más tarde.' : null;
recentPosts.value = postsData.value || [];
</script>

<!-- Removed legacy CSS variables styles - now using Tailwind classes with dark mode support -->
