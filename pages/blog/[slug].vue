<template>
  <div class="py-8">

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
  </div>
</template>

<script setup lang="ts">
// No custom layout needed - will use default layout with header and footer
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '~/stores/blog';

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
