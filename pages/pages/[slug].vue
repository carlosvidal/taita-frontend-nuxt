<template>
  <div class="min-h-screen bg-white">
    <!-- Loading state -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
        <p class="text-gray-600 mb-8">La página que buscas no existe.</p>
        <NuxtLink to="/" class="text-blue-600 hover:underline">Volver al inicio</NuxtLink>
      </div>
    </div>

    <!-- Page content -->
    <article v-else-if="page" class="reading-container">
      <!-- Header -->
      <header class="reading-header">
        <div class="reading-header-content">
          <NuxtLink to="/" class="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Inicio
          </NuxtLink>
        </div>
      </header>

      <!-- Main content -->
      <main class="reading-main">
        <!-- Featured Image -->
        <div v-if="page.image" class="featured-image-container">
          <img :src="getImageUrl(page.image)" :alt="page.title" class="featured-image" />
        </div>

        <!-- Title -->
        <h1 class="reading-title">{{ page.title }}</h1>

        <!-- Meta information -->
        <div class="reading-meta">
          <time v-if="page.published_at" :datetime="page.published_at">
            {{ formatDate(page.published_at) }}
          </time>
          <span v-if="page.author" class="author-name">por {{ page.author.name }}</span>
        </div>

        <!-- Excerpt -->
        <div v-if="page.excerpt" class="reading-excerpt">
          {{ page.excerpt }}
        </div>

        <!-- Content -->
        <div class="reading-content" v-html="page.content"></div>
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

// Obtener el nombre del blog del subdominio
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

// Fetch page data
const { data: page, pending, error } = await useFetch(`/api/pages-public/${slug}`, {
  baseURL: config.public.apiBase || 'https://taita-api.onrender.com',
  headers: {
    'X-Blog-Identifier': useRequestHeaders(['host']).host || 'demo.taita.blog'
  }
});

// Set page meta
if (page.value) {
  useHead({
    title: page.value.title,
    meta: [
      { name: 'description', content: page.value.excerpt || '' },
      { property: 'og:title', content: page.value.title },
      { property: 'og:description', content: page.value.excerpt || '' },
      { property: 'og:image', content: page.value.image ? getImageUrl(page.value.image) : '' }
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
  max-width: var(--reading-width, 680px);
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
  max-width: var(--reading-width, 680px);
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

.reading-excerpt {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--color-text-secondary, #6b7280);
  margin-bottom: 2rem;
  font-style: italic;
}

.reading-content {
  font-family: var(--font-serif, Georgia, serif);
  font-size: var(--text-base, 1.0625rem);
  line-height: var(--leading-relaxed, 1.625);
  color: var(--color-text-primary, #1a1a1a);
}

.reading-footer {
  border-top: 1px solid var(--color-border, #e5e7eb);
  padding: 2rem 1.5rem;
  margin-top: 4rem;
}

.footer-content {
  max-width: var(--reading-width, 680px);
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
}
</style>
