<template>
  <div class="min-h-screen bg-white">
    <!-- Loading state -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Serie no encontrada</h1>
        <p class="text-gray-600 mb-8">La serie que buscas no existe.</p>
        <NuxtLink to="/blog" class="text-blue-600 hover:underline">Ver todos los posts</NuxtLink>
      </div>
    </div>

    <!-- Series content -->
    <article v-else-if="series" class="reading-container">
      <!-- Header -->
      <header class="reading-header">
        <div class="reading-header-content">
          <NuxtLink to="/blog" class="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver al blog
          </NuxtLink>
        </div>
      </header>

      <!-- Main content -->
      <main class="reading-main">
        <!-- Cover Image -->
        <div v-if="series.cover_image || series.coverImage" class="featured-image-container">
          <img :src="getImageUrl(series.cover_image || series.coverImage)" :alt="series.title"
            class="featured-image" />
        </div>

        <!-- Series badge -->
        <div class="mb-4">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Serie · {{ series.posts?.length || 0 }} artículos
          </span>
        </div>

        <!-- Title -->
        <h1 class="reading-title">{{ series.title }}</h1>

        <!-- Meta information -->
        <div class="reading-meta">
          <span v-if="series.author" class="author-name">por {{ series.author.name }}</span>
        </div>

        <!-- Description -->
        <div v-if="series.description" class="series-description">
          {{ series.description }}
        </div>

        <!-- Posts list -->
        <div v-if="series.posts && series.posts.length > 0" class="posts-list">
          <h2 class="posts-list-title">Artículos de esta serie</h2>

          <div class="posts-grid">
            <article v-for="(post, index) in series.posts" :key="post.id" class="post-card">
              <NuxtLink :to="`/blog/${post.slug}`" class="post-card-link">
                <!-- Sequence number badge -->
                <div class="post-sequence-badge">
                  {{ post.sequence_number || index + 1 }}
                </div>

                <!-- Featured image -->
                <div v-if="post.featured_image || post.image" class="post-card-image">
                  <img :src="getImageUrl(post.featured_image || post.image)" :alt="post.title" loading="lazy" />
                </div>

                <div class="post-card-content">
                  <!-- Category badge -->
                  <div v-if="post.category && post.category.slug !== 'sin-categoria'" class="post-category">
                    {{ post.category.name }}
                  </div>

                  <h3 class="post-card-title">{{ post.title }}</h3>

                  <p v-if="post.excerpt" class="post-card-excerpt">
                    {{ post.excerpt }}
                  </p>

                  <div class="post-card-meta">
                    <time v-if="post.published_at" :datetime="post.published_at">
                      {{ formatDate(post.published_at) }}
                    </time>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <p>Esta serie aún no tiene artículos publicados.</p>
        </div>
      </main>

      <!-- Footer -->
      <footer class="reading-footer">
        <div class="footer-content">
          <p>&copy; {{ new Date().getFullYear() }} {{ blogName }}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;
const config = useRuntimeConfig();

// Obtener el nombre del blog
const blogName = ref('Mi Blog');

// Función para obtener URL de imagen
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; // Cloudinary URLs
  }
  const apiBase = config.public.apiBase || 'https://taita-api.onrender.com';
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Función para formatear fechas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Get subdomain for tenant
const getSubdomain = () => {
  if (process.server) {
    const headers = useRequestHeaders();
    const host = headers.host || '';
    if (host.includes('localhost') || host.includes('127.0.0.1') || host.match(/^192\.168\.\d+\.\d+/)) {
      return 'demo';
    }
    const parts = host.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      return parts[0];
    }
    return 'demo';
  } else if (process.client) {
    const host = window.location.hostname;
    if (host.includes('localhost') || host.includes('127.0.0.1') || host.match(/^192\.168\.\d+\.\d+/)) {
      return 'demo';
    }
    const parts = host.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      return parts[0];
    }
    return 'demo';
  }
  return 'demo';
};

const subdomain = getSubdomain();

// Fetch series data
const { data: series, pending, error } = await useFetch(`/series/public/${slug}`, {
  baseURL: config.public.apiBase || 'https://taita-api.onrender.com',
  headers: {
    'X-Taita-Subdomain': subdomain
  },
  params: {
    tenant: subdomain
  }
});

// Set page meta
if (series.value) {
  useHead({
    title: series.value.title,
    meta: [
      { name: 'description', content: series.value.description || '' },
      { property: 'og:title', content: series.value.title },
      { property: 'og:description', content: series.value.description || '' },
      { property: 'og:image', content: series.value.cover_image ? getImageUrl(series.value.cover_image) : '' }
    ]
  });
}
</script>

<style scoped>
/* Reutilizar estilos del reading-theme.css */
.reading-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.reading-header {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  z-index: 100;
  padding: 1rem 0;
}

.reading-header-content {
  max-width: var(--reading-width, 960px);
  margin: 0 auto;
  padding: 0 1.5rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary, #6b7280);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
}

.back-button:hover {
  color: var(--color-text-primary, #1a1a1a);
}

.reading-main {
  flex: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

.featured-image-container {
  margin: 0 0 3rem 0;
}

.featured-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.reading-title {
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 1.5rem 0;
  color: var(--color-text-primary, #1a1a1a);
}

.reading-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #6b7280);
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.author-name {
  font-style: italic;
}

.series-description {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--color-text-secondary, #6b7280);
  margin-bottom: 3rem;
  font-style: italic;
}

.posts-list {
  margin-top: 4rem;
}

.posts-list-title {
  font-family: var(--font-serif, Georgia, serif);
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 2rem;
  color: var(--color-text-primary, #1a1a1a);
}

.posts-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

.post-card {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  position: relative;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.post-sequence-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--color-text-primary, #1a1a1a);
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  z-index: 10;
}

.post-card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f3f4f6;
}

.post-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card:hover .post-card-image img {
  transform: scale(1.05);
}

.post-card-content {
  padding: 1.5rem;
}

.post-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6366f1;
  background: #eef2ff;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.post-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary, #1a1a1a);
}

.post-card-excerpt {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text-secondary, #6b7280);
  margin-bottom: 1rem;
}

.post-card-meta {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #9ca3af);
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: var(--color-text-secondary, #6b7280);
}

.reading-footer {
  border-top: 1px solid var(--color-border, #e5e7eb);
  padding: 2rem 1.5rem;
  margin-top: 4rem;
}

.footer-content {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #6b7280);
}

@media (max-width: 640px) {
  .reading-main {
    padding: 1.5rem 1rem;
  }

  .reading-title {
    font-size: 1.75rem;
  }

  .posts-list-title {
    font-size: 1.5rem;
  }
}
</style>
