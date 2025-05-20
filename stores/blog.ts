import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRuntimeConfig } from '#app';
import { useNuxtApp } from '#imports';
import { useAuthStore } from '~/composables/useAuth';

export interface Author {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  social_links?: Record<string, string>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  posts_count?: number;
  featured_image?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  posts_count?: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  featured: boolean;
  published_at: string;
  updated_at: string;
  reading_time?: number;
  author_id: number;
  category_id?: number;
  author?: Author;
  category?: Category;
  tags?: Tag[];
  meta_title?: string;
  meta_description?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const useBlogStore = defineStore('blog', () => {
  // Initialize Nuxt app and config inside the store function
  const nuxtApp = process.client ? useNuxtApp() : null;
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  
  // Default values for server-side rendering
  const defaultConfig = {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '',
      imageUrl: process.env.NUXT_PUBLIC_IMAGE_URL || ''
    }
  };
  
  // Safely get config values
  const safeConfig = process.client ? config.public : defaultConfig.public;

  // State
  const posts = ref<Post[]>([]);
  const featuredPosts = ref<Post[]>([]);
  const categories = ref<Category[]>([]);
  const tags = ref<Tag[]>([]);
  const currentPost = ref<Post | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const perPage = ref(10);
  const totalItems = ref(0);
  const currentTenant = ref('taita');
  const apiBaseUrl = ref('');
  const imageBaseUrl = ref('');

  // Update URLs when config changes
  const updateUrls = () => {
    if (process.client) {
      apiBaseUrl.value = `${safeConfig.apiBase}/${currentTenant.value}`;
      imageBaseUrl.value = safeConfig.imageUrl;
    } else {
      apiBaseUrl.value = `${safeConfig.apiBase}/taita`;
      imageBaseUrl.value = safeConfig.imageUrl;
    }
  };
  
  // Initialize URLs
  updateUrls();

  // Getters
  const recentPosts = computed(() => {
    return [...posts.value]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 5);
  });

  // Actions
  const fetchPosts = async (params: Record<string, any> = {}): Promise<PaginatedResponse<Post>> => {
    loading.value = true;
    error.value = null;
    
    try {
      const query = new URLSearchParams();
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value.toString());
        }
      });
      
      // Get the current hostname to determine the tenant
      const hostname = process.client ? window.location.hostname : '';
      const subdomain = hostname.split('.')[0];
      const tenant = ['localhost', '127.0.0.1', 'www', ''].includes(subdomain) 
        ? 'taita' 
        : subdomain;
      
      // Add subdomain as a query parameter
      query.append('subdomain', tenant);
      
      const url = `${apiBaseUrl.value}/posts?${query.toString()}`;
      const response = await $fetch<{ data: Post[]; meta: any }>(url);
      
      // Update the store
      posts.value = response.data || [];
      
      return {
        data: response.data || [],
        total: response.meta?.total || 0,
        current_page: response.meta?.current_page || 1,
        last_page: response.meta?.last_page || 1,
        per_page: response.meta?.per_page || 10,
      };
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      error.value = 'No se pudieron cargar las publicaciones';
      
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        await authStore.logout();
        await router.push('/login');
      }
      
      return {
        data: [],
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 10,
      };
    } finally {
      loading.value = false;
    }
  };

  // ... (other action implementations remain the same)

  // Fetch posts by tag
  const fetchPostsByTag = async (tagSlug: string, params: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const query = new URLSearchParams();
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value.toString());
        }
      });
      
      // Get the current hostname to determine the tenant
      const hostname = process.client ? window.location.hostname : '';
      const subdomain = hostname.split('.')[0];
      const tenant = ['localhost', '127.0.0.1', 'www', ''].includes(subdomain) 
        ? 'taita' 
        : subdomain;
      
      // Add subdomain as a query parameter
      query.append('subdomain', tenant);
      
      const url = `${apiBaseUrl.value}/tags/public/${tagSlug}/posts?${query.toString()}`;
      console.log('Fetching posts by tag from:', url);
      
      const response = await $fetch<{ 
        data: {
          posts: Post[];
          pagination: {
            total: number;
            current_page: number;
            last_page: number;
            per_page: number;
          };
        };
      }>(url);
      
      // Update the store with the posts
      posts.value = response.data.posts || [];
      
      return {
        data: response.data.posts || [],
        total: response.data.pagination?.total || 0,
        current_page: response.data.pagination?.current_page || 1,
        last_page: response.data.pagination?.last_page || 1,
        per_page: response.data.pagination?.per_page || 10,
      };
    } catch (err: any) {
      console.error('Error fetching posts by tag:', err);
      error.value = 'No se pudieron cargar las publicaciones de la etiqueta';
      
      // Return an empty object with the expected structure in case of error
      return {
        data: [],
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 10
      };
    } finally {
      loading.value = false;
    }
  };

  // Helper to get full image URL
  const getImageUrl = (path?: string): string => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${imageBaseUrl.value}${path}`;
  };

  // Helper to format dates
  const formatDate = (dateString: string, locale = 'es-ES'): string => {
    if (!dateString) return '';
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return new Date(dateString).toLocaleDateString(locale, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  // Set tenant and update API base URL
  const setTenant = (tenant: string) => {
    if (!process.client) return;
    currentTenant.value = tenant;
    updateUrls();
  };

  // Return the store
  return {
    // State
    posts,
    featuredPosts: computed(() => posts.value.filter(post => post.featured)),
    categories,
    tags,
    currentPost,
    loading,
    error,
    currentTenant,
    apiBaseUrl,
    imageBaseUrl,
    
    // Getters
    recentPosts,
    
    // Actions
    fetchPosts,
    fetchPost,
    fetchCategories,
    fetchCategory,
    fetchTags,
    fetchTag,
    fetchPostsByCategory,
    fetchPostsByTag,
    searchPosts,
    setTenant,
    
    // Helpers
    getImageUrl,
    formatDate
  };
});
