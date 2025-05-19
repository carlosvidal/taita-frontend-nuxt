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

// Initialize store and state
const blogStore = useBlogStore();
const recentPosts = ref<Array<any>>([]);
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

// Fetch posts when component is mounted
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    
    console.log('Iniciando carga de posts...');
    
    // Configurar el tenant (debería venir de la configuración o del dominio)
    blogStore.setTenant('taita');
    
    // Fetch recent posts
    const posts = await blogStore.fetchPosts({ 
      limit: 5,
      include: 'category,tags,author',
      status: 'published',
      orderBy: 'published_at',
      order: 'desc'
    });
    
    console.log('Posts recibidos:', posts);
    recentPosts.value = Array.isArray(posts) ? posts : [];
    
    if (recentPosts.value.length === 0) {
      console.warn('No se encontraron posts. Verifica la respuesta de la API.');
    }
    
  } catch (err: any) {
    console.error('Error loading posts:', err);
    error.value = 'No se pudieron cargar las publicaciones. Por favor, intente de nuevo más tarde.';
    if (err.response) {
      console.error('Detalles del error:', {
        status: err.response.status,
        data: err.response.data,
        url: err.response.config?.url
      });
      error.value += ` (Error ${err.response.status})`;
    }
    recentPosts.value = [];
  } finally {
    loading.value = false;
  }
});
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
