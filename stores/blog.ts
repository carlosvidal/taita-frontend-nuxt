import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
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

// Default values for server-side rendering
const defaultConfig = {
  apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://taita-api.onrender.com/api',
  apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://taita-api.onrender.com/api',
  imageUrl: process.env.NUXT_PUBLIC_IMAGE_URL || 'https://taita-api.onrender.com',
  siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Taita Blog',
  tenantDomain: process.env.NUXT_PUBLIC_TENANT_DOMAIN || 'taita',
  tenant: process.env.NUXT_PUBLIC_TENANT || 'taita'
};

// Helper function to safely access runtime config
const useSafeConfig = () => {
  // During SSR or build time, use default config with process.env overrides
  if (process.server) {
    return {
      ...defaultConfig,
      ...(process.env.NUXT_PUBLIC_API_BASE && { apiBase: process.env.NUXT_PUBLIC_API_BASE }),
      ...(process.env.NUXT_PUBLIC_API_URL && { apiUrl: process.env.NUXT_PUBLIC_API_URL }),
      ...(process.env.NUXT_PUBLIC_IMAGE_URL && { imageUrl: process.env.NUXT_PUBLIC_IMAGE_URL }),
      ...(process.env.NUXT_PUBLIC_SITE_NAME && { siteName: process.env.NUXT_PUBLIC_SITE_NAME }),
      ...(process.env.NUXT_PUBLIC_TENANT && { tenant: process.env.NUXT_PUBLIC_TENANT })
    };
  }
  
  // In client-side, use runtime config or fallback to defaults
  try {
    const config = useRuntimeConfig();
    return {
      ...defaultConfig,
      ...(config.public || {})
    };
  } catch (e) {
    console.error('Error accessing runtime config:', e);
    return defaultConfig;
  }
};

export const useBlogStore = defineStore('blog', () => {
  // Initialize Nuxt app and config
  const nuxtApp = process.client ? useNuxtApp() : null;
  const authStore = useAuthStore();
  const config = useSafeConfig();

  // State
  const posts = ref<Post[]>([]) as Ref<Post[]>;
  const featuredPosts = ref<Post[]>([]);
  const categories = ref<Category[]>([]) as Ref<Category[]>;
  const tags = ref<Tag[]>([]) as Ref<Tag[]>;
  const currentPost = ref<Post | null>(null) as Ref<Post | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const perPage = ref(10);
  const totalItems = ref(0);
  const currentTenant = ref(config.tenantDomain);
  const apiBaseUrl = ref(`${config.apiBase}/${config.tenantDomain}`);
  const imageBaseUrl = ref(config.imageUrl);

  // Update URLs when config changes
  const updateUrls = () => {
    try {
      let baseUrl = config.apiBase || '';
      
      // Ensure baseUrl doesn't end with a slash
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      // Set the API base URL with tenant
      if (currentTenant.value) {
        apiBaseUrl.value = `${baseUrl}/${currentTenant.value}`;
      } else {
        apiBaseUrl.value = baseUrl;
      }
      
      // Set the image base URL
      imageBaseUrl.value = config.imageUrl || '';
      
      if (process.dev) {
        console.log('[BlogStore] Updated URLs:', {
          apiBaseUrl: apiBaseUrl.value,
          imageBaseUrl: imageBaseUrl.value,
          tenant: currentTenant.value,
          config: config
        });
      }
    } catch (error) {
      console.error('[BlogStore] Error updating URLs:', error);
    }
  };
  
  // Initialize URLs
  if (process.client) {
    // Only update URLs on client side
    updateUrls();
  } else {
    // For SSR, set default URLs
    apiBaseUrl.value = config.apiBase;
    imageBaseUrl.value = config.imageUrl;
  }

  // Getters
  const recentPosts = computed(() => {
    return [...posts.value]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 5);
  });

  // Fetch posts with pagination and filters
  const fetchPosts = async (params: Record<string, any> = {}): Promise<PaginatedResponse<Post>> => {
    // Skip API calls during SSR for static generation
    if (process.server) {
      if (process.dev) {
        console.log('[BlogStore] Skipping fetchPosts during SSR/SSG');
      }
      return {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: params.perPage || 10,
        total: 0,
        from: 0,
        to: 0,
        path: '',
        first_page_url: '',
        last_page_url: '',
        next_page_url: null,
        prev_page_url: null
      } as PaginatedResponse<Post>;
    }

    loading.value = true;
    error.value = null;

    try {
      const query = new URLSearchParams();
      
      // Add pagination
      if (params.page) query.append('page', params.page);
      if (params.perPage) query.append('per_page', params.perPage);
      
      // Add filters
      if (params.category) query.append('category', params.category);
      if (params.tag) query.append('tag', params.tag);
      if (params.search) query.append('search', params.search);
      if (params.featured) query.append('featured', 'true');
      
      // Add sorting
      if (params.sortBy) query.append('sort_by', params.sortBy);
      if (params.sortOrder) query.append('sort_order', params.sortOrder);

      if (process.dev) {
        console.log(`[BlogStore] Fetching posts from: ${apiBaseUrl.value}/posts?${query.toString()}`);
      }

      const response = await $fetch<PaginatedResponse<Post>>(
        `${apiBaseUrl.value}/posts?${query.toString()}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Add timeout for the request
          timeout: 10000,
          // Add retry logic
          retry: 2,
          retryDelay: 1000,
        }
      );

      posts.value = response.data || [];
      currentPage.value = response.current_page || 1;
      totalPages.value = response.last_page || 1;
      perPage.value = response.per_page || 10;
      totalItems.value = response.total || 0;

      return response;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch posts';
      console.error('[BlogStore] Error fetching posts:', errorMsg, err);
      error.value = errorMsg;
      
      // Return empty data on error
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
