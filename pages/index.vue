<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="space-y-8">
      <div class="animate-pulse space-y-4">
        <div class="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div class="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
      
      <!-- Skeleton for posts -->
      <div class="space-y-12">
        <div v-for="i in 3" :key="`post-skeleton-${i}`" class="post-preview">
          <div class="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Featured Posts -->
      <section class="posts-list">
        <div v-if="Array.isArray(recentPosts) && recentPosts.length > 0" class="space-y-16">
          <article v-for="post in recentPosts" :key="post.id" class="post-preview">
            <div class="post-meta">
              <time :datetime="post.published_at" class="post-date">
                {{ formatDate(post.published_at) }}
              </time>
              <span v-if="post.category" class="post-category">
                {{ post.category.name }}
              </span>
            </div>
            
            <h2 class="post-title">
              <NuxtLink :to="`/blog/${post.slug}`">{{ post.title }}</NuxtLink>
            </h2>
            
            <div class="post-excerpt" v-html="post.excerpt"></div>
            
            <div class="post-read-more">
              <NuxtLink :to="`/blog/${post.slug}`" class="read-more">
                Leer más →
              </NuxtLink>
            </div>
          </article>
        </div>
        
        <div v-else class="no-posts">
          <p>No hay publicaciones disponibles en este momento.</p>
        </div>
        
        <div class="pagination">
          <NuxtLink to="/blog" class="older-posts">
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
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
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

<style scoped>
.posts-list {
  margin: var(--spacing-lg) 0;
}

.post-preview {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.post-meta {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-sm);
  display: flex;
  gap: 1rem;
}

.post-date {
  color: var(--color-text-light);
}

.post-category {
  color: var(--color-accent);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
}

.post-title {
  font-size: 2rem;
  margin: var(--spacing-xs) 0 var(--spacing-sm);
  line-height: 1.2;
}

.post-title a {
  border: none;
  color: var(--color-text);
}

.post-title a:hover {
  color: var(--color-accent);
  border: none;
}

.post-excerpt {
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
  line-height: 1.7;
}

.post-excerpt :deep(p) {
  margin-bottom: var(--spacing-sm);
}

.post-read-more {
  margin-top: var(--spacing-md);
}

.read-more {
  font-family: var(--font-sans);
  font-weight: 600;
  color: var(--color-accent);
  border: none;
  padding: 0.25rem 0;
  display: inline-block;
  transition: all 0.2s ease;
}

.read-more:hover {
  color: var(--color-text);
  padding-left: 0.5rem;
}

.pagination {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.older-posts {
  font-family: var(--font-sans);
  font-weight: 600;
  color: var(--color-accent);
  border: none;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-accent);
  border-radius: 3px;
  transition: all 0.2s ease;
}

.older-posts:hover {
  background-color: var(--color-accent);
  color: white;
}

.error-message {
  background-color: #fef2f2;
  color: #b91c1c;
  padding: 1rem;
  margin: var(--spacing-md) 0;
  border-left: 3px solid #dc2626;
}

.no-posts {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--color-text-light);
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .post-title {
    font-size: 1.75rem;
  }
  
  .post-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
