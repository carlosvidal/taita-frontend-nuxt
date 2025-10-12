<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Columna 1: Acerca de -->
        <div>
          <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">
            Acerca de
          </h3>
          <p class="mt-4 text-base text-gray-500 dark:text-gray-300">
            Un blog moderno construido con Nuxt 3 y Tailwind CSS. Comparte tus pensamientos, historias y conocimientos con el mundo.
          </p>
        </div>

        <!-- Columna 2: Navegación -->
        <div>
          <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">
            Navegación
          </h3>
          <ul class="mt-4 space-y-2">
            <li>
              <NuxtLink 
                to="/" 
                class="text-base text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Inicio
              </NuxtLink>
            </li>
            <li v-for="category in categories" :key="`footer-${category.id}`">
              <NuxtLink 
                :to="`/category/${category.slug}`"
                class="text-base text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Contacto -->
        <div>
          <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">
            Contacto
          </h3>
          <ul class="mt-4 space-y-2">
            <li class="flex">
              <a href="mailto:contacto@taita.blog" class="text-base text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                contacto@taita.blog
              </a>
            </li>
            <li class="flex">
              <a href="https://github.com/tu-usuario/taita-blog" target="_blank" rel="noopener noreferrer" class="text-base text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Derechos de autor -->
      <div class="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 flex justify-between">
        <p class="text-base text-gray-400">
          &copy; {{ new Date().getFullYear() }} Taita Blog. Todos los derechos reservados.
        </p>
        <div class="flex space-x-6">
          <a href="#" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Twitter</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">GitHub</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Powered by Taita -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <a
          href="https://taita.blog"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <span>Powered by</span>
          <img src="~/assets/taita-logo.svg" alt="Taita.blog" class="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBlogStore } from '~/stores/blog';

const blogStore = useBlogStore();
const categories = ref([]);

// Obtener categorías al montar el componente
onMounted(async () => {
  try {
    categories.value = await blogStore.fetchCategories();
  } catch (error) {
    console.error('Error al cargar las categorías:', error);
  }
});
</script>
