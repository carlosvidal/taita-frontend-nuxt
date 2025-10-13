<template>
  <header class="bg-white shadow-sm dark:bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900 dark:text-white">
            {{ blogName || 'Blog' }}
          </NuxtLink>
        </div>

        <!-- Menú de navegación -->
        <nav class="hidden sm:ml-6 sm:flex sm:space-x-8">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.id"
            :to="item.url"
            class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            active-class="border-indigo-500 text-gray-900 dark:text-white"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Dark Mode Toggle y Botón móvil -->
        <div class="flex items-center space-x-2">
          <!-- Dark Mode Toggle - visible en desktop -->
          <div class="hidden sm:block">
            <DarkModeToggle />
          </div>
          
          <!-- Botón móvil -->
          <div class="flex items-center sm:hidden">
            <DarkModeToggle class="mr-2" />
            <button 
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-700"
              aria-expanded="false"
            >
              <span class="sr-only">Abrir menú</span>
              <svg 
                class="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Menú móvil -->
    <div
      v-show="isMobileMenuOpen"
      class="sm:hidden"
    >
      <div class="pt-2 pb-3 space-y-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="`mobile-${item.id}`"
          :to="item.url"
          class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          active-class="bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-gray-700"
          @click="isMobileMenuOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogStore } from '~/stores/blog';

const isMobileMenuOpen = ref(false);
const menuItems = ref([]);
const blogStore = useBlogStore();
const blogName = ref('');

onMounted(async () => {
  console.log('[Header] Component mounted, fetching menu...');
  try {
    const api = useApi();
    console.log('[Header] useApi initialized');

    // Get blog settings for the name
    const settings = await blogStore.fetchSettings();
    console.log('[Header] Settings received:', settings);
    console.log('[Header] Settings.title:', settings?.title);
    console.log('[Header] Settings.name:', settings?.name);

    blogName.value = settings?.title || settings?.name || 'Blog';
    console.log('[Header] Blog name set to:', blogName.value);

    const result = await api.getMenu();
    console.log('[Header] Menu API response:', result);
    menuItems.value = result || [];
    console.log('[Header] Menu items set:', menuItems.value.length, 'items');
  } catch (error) {
    console.error('[Header] Error loading menu:', error);
    menuItems.value = [];
  }
});
</script>
