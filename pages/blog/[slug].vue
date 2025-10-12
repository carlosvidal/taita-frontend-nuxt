<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors">
    <!-- Minimal header -->
    <header class="border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-4xl mx-auto px-6 py-6">
        <nav class="flex items-center justify-between">
          <nuxt-link
            to="/blog"
            class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to blog
          </nuxt-link>
          <div class="flex items-center gap-4">
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>

    <!-- Loading state -->
    <div v-if="loading" class="max-w-4xl mx-auto px-6 py-16">
      <div class="animate-pulse space-y-8">
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-6 py-16">
      <div class="text-center">
        <p class="text-xl text-gray-600 dark:text-gray-400">{{ error }}</p>
        <button
          @click="fetchPost"
          class="mt-4 px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>

    <!-- Post content -->
    <article v-else-if="post" class="max-w-4xl mx-auto px-6 py-16">
      <!-- Post title -->
      <h1 class="reading-content text-5xl md:text-6xl font-bold mb-6">
        {{ post.title }}
      </h1>

      <!-- Post meta -->
      <div class="post-meta flex flex-wrap items-center gap-4 text-sm">
        <div v-if="post.author" class="flex items-center gap-2">
          <img
            v-if="post.author.avatar"
            :src="getImageUrl(post.author.avatar)"
            :alt="post.author.name"
            class="w-10 h-10 rounded-full object-cover"
          />
          <span class="font-medium">{{ post.author.name }}</span>
        </div>
        <time :datetime="post.published_at" class="text-gray-600 dark:text-gray-400">
          {{ formatDate(post.published_at) }}
        </time>
        <span v-if="post.reading_time" class="text-gray-600 dark:text-gray-400">
          {{ post.reading_time }} min read
        </span>
      </div>

      <!-- Featured image -->
      <div v-if="post.featured_image" class="my-12">
        <img
          :src="getImageUrl(post.featured_image)"
          :alt="post.title"
          class="w-full h-auto rounded-lg"
        />
      </div>

      <!-- Category and tags -->
      <div v-if="post.category || post.tags?.length" class="post-taxonomy mb-12">
        <nuxt-link
          v-if="post.category && post.category.slug !== 'sin-categoria'"
          :to="`/category/${post.category.slug}`"
          class="post-category"
        >
          {{ post.category.name }}
        </nuxt-link>
        <nuxt-link
          v-for="tag in post.tags"
          :key="tag.id"
          :to="`/tag/${tag.slug}`"
          class="post-tag"
        >
          {{ tag.name }}
        </nuxt-link>
      </div>

      <!-- Post content with reading-optimized styles -->
      <div class="reading-content" v-html="post.content"></div>

      <!-- Author bio -->
      <div v-if="post.author?.bio" class="author-bio">
        <div class="author-bio-content">
          <img
            v-if="post.author.avatar"
            :src="getImageUrl(post.author.avatar)"
            :alt="post.author.name"
            class="author-avatar"
          />
          <div class="author-info">
            <h3 class="author-name">About {{ post.author.name }}</h3>
            <p class="author-description">{{ post.author.bio }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div class="flex justify-between items-center">
          <nuxt-link
            v-if="prevPost"
            :to="`/blog/${prevPost.slug}`"
            class="group flex items-center gap-2 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous post</span>
          </nuxt-link>
          <div v-else></div>

          <nuxt-link
            v-if="nextPost"
            :to="`/blog/${nextPost.slug}`"
            class="group flex items-center gap-2 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span>Next post</span>
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </nuxt-link>
          <div v-else></div>
        </div>
      </nav>
    </article>

    <!-- Minimal footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 mt-24">
      <div class="max-w-4xl mx-auto px-6 py-8">
        <p class="text-center text-sm text-gray-600 dark:text-gray-400">
          © {{ new Date().getFullYear() }} All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Use reading layout (no header/footer from default layout)
definePageMeta({
  layout: 'reading'
});
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '~/stores/blog';
import { useColorMode } from '@vueuse/core';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();
const colorMode = useColorMode();

const loading = ref(true);
const error = ref<string | null>(null);
const post = ref<any>(null);
const prevPost = ref<any>(null);
const nextPost = ref<any>(null);

const slug = computed(() => route.params.slug as string);
const isDark = computed(() => colorMode.value === 'dark');

const toggleDarkMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
};

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const apiBase = 'https://taita-api.onrender.com';
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const fetchPost = async () => {
  try {
    loading.value = true;
    error.value = null;

    const postData = await blogStore.fetchPost(slug.value);
    if (!postData) {
      throw new Error('Post not found');
    }

    post.value = postData;

    // Set page title
    useHead({
      title: post.value.meta_title || post.value.title,
      meta: [
        { name: 'description', content: post.value.meta_description || post.value.excerpt },
        { property: 'og:title', content: post.value.meta_title || post.value.title },
        { property: 'og:description', content: post.value.meta_description || post.value.excerpt },
        { property: 'og:type', content: 'article' },
        { property: 'og:image', content: post.value.featured_image ? getImageUrl(post.value.featured_image) : '' },
      ],
    });

  } catch (err: any) {
    console.error('Error fetching post:', err);
    error.value = err.message || 'Failed to load post';
  } finally {
    loading.value = false;
  }
};

watch(() => route.params.slug, async (newSlug) => {
  if (newSlug) {
    await fetchPost();
  }
});

onMounted(async () => {
  if (slug.value) {
    await fetchPost();
  } else {
    error.value = 'No post slug specified';
    loading.value = false;
  }
});
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Ensure proper spacing in the reading content */
:deep(.reading-content) {
  /* Content styles are inherited from reading-theme.css */
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  :deep(.reading-content code) {
    background-color: rgb(45, 45, 45);
  }

  :deep(.reading-content pre) {
    background-color: rgb(29, 29, 29);
  }
}
</style>
