<script setup lang="ts">
import { useTenant } from '~/composables/useTenant'
import { useBlogStore } from '~/stores/blog'

const props = defineProps<{ error: { statusCode: number; message?: string } }>()

const { getTenant } = useTenant()
const tenant = getTenant()
const blogStore = useBlogStore()

// Check if this tenant's blog actually exists
const blogExists = ref(true)

if (import.meta.client) {
  try {
    const settings = await blogStore.fetchSettings()
    blogExists.value = !!settings?.name
  } catch {
    blogExists.value = false
  }
}

const isNotFound = computed(() => props.error.statusCode === 404)
const isServerError = computed(() => props.error.statusCode >= 500)

const blogHomeUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.protocol}//${window.location.host}/`
  }
  return '/'
})

const handleClearError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-lg w-full text-center">

      <!-- Blog exists but page not found (404) -->
      <template v-if="isNotFound && blogExists">
        <div class="text-8xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Page not found
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          @click="handleClearError"
          class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Back to blog home
        </button>
      </template>

      <!-- Blog doesn't exist (invalid subdomain) -->
      <template v-else-if="isNotFound && !blogExists">
        <div class="text-8xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          This blog doesn't exist
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          <strong>{{ tenant }}.taita.blog</strong> is not a registered blog.
        </p>
        <p class="text-gray-500 dark:text-gray-500 mb-8">
          Want your own blog? Create one in minutes.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://taita.blog"
            class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Create your blog with Taita
          </a>
          <a
            href="https://demo.taita.blog"
            class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            See a demo
          </a>
        </div>
      </template>

      <!-- Server error (500) -->
      <template v-else>
        <div class="text-8xl font-bold text-gray-200 dark:text-gray-800 mb-4">{{ error.statusCode }}</div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Something went wrong
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          We're having trouble loading this page. Please try again.
        </p>
        <button
          @click="handleClearError"
          class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Try again
        </button>
      </template>

      <!-- Taita branding -->
      <div class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        <a href="https://taita.blog" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <img src="~/assets/taita-logo.svg" alt="Taita" class="h-4 w-auto opacity-50 dark:hidden" />
          <img src="~/assets/taita-logo-darkmode.svg" alt="Taita" class="h-4 w-auto opacity-50 hidden dark:block" />
          <span>Powered by Taita Blog</span>
        </a>
      </div>

    </div>
  </div>
</template>
