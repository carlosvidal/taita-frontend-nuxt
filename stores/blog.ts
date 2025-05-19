import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRuntimeConfig, useRouter } from '#app';
import { useNuxtApp } from '#imports';
import { useAuthStore } from '~/composables/useAuth'; // Added auth store import

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

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const useBlogStore = defineStore('blog', () => {
  const config = useRuntimeConfig();
  
  // State with TypeScript types
  const posts = ref<Post[]>([]);
  const featuredPosts = ref<Post[]>([]);
  const currentPost = ref<Post | null>(null);
  const categories = ref<Category[]>([]);
  const currentCategory = ref<Category | null>(null);
  const tags = ref<Tag[]>([]);
  const currentTag = ref<Tag | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const currentTenant = ref<string>('taita');
  
  // Dependencies
  const { $http } = useNuxtApp();
  const router = useRouter();

  // Computed properties with explicit return types
  const apiBaseUrl = computed<string>(() => {
    return config.public.apiBaseUrl || 'https://taita-api.onrender.com/api';
  });
  
  const imageBaseUrl = computed<string>(() => 
    config.public.imageBaseUrl || 'https://taita-api.onrender.com'
  );

  // Set initial tenant
  currentTenant.value = 'taita'; // Default tenant
  
  // Debug log only in development
  if (process.dev) {
    console.log('API Configuration:', {
      apiBaseUrl: apiBaseUrl.value,
      currentTenant: currentTenant.value,
      publicConfig: config.public
    });
  }

  // Getters
  const getCategoryBySlug = computed(() => (slug: string) => {
    return categories.value.find(cat => cat.slug === slug) || null;
  });

  const getTagBySlug = computed(() => (slug: string) => {
    return tags.value.find(tag => tag.slug === slug) || null;
  });

  const getPostBySlug = computed(() => (slug: string) => {
    return posts.value.find(post => post.slug === slug) || null;
  });

  const getPostsByCategory = computed(() => (categoryId: number) => {
    return posts.value.filter(post => post.category_id === categoryId);
  });

  const getPostsByTag = computed(() => (tagId: number) => {
    return posts.value.filter(post => 
      post.tags?.some((tag: Tag) => tag.id === tagId)
    );
  });

  const getRelatedPosts = computed(() => (post: Post, limit = 3) => {
    if (!post) return [];
    
    // Get posts with the same category (excluding the current post)
    const relatedByCategory = posts.value.filter(p => 
      p.id !== post.id && 
      p.category_id === post.category_id
    );
    
    // Get posts with the same tags (excluding the current post)
    const relatedByTags = posts.value.filter(p => 
      p.id !== post.id &&
      p.tags?.some(tag => 
        post.tags?.some(pt => pt.id === tag.id)
      )
    );
    
    // Combine and deduplicate
    const combined = [...new Set([...relatedByCategory, ...relatedByTags])];
    
    // Return limited results
    return combined.slice(0, limit);
  });

  const getPopularTags = computed(() => {
    return [...tags.value]
      .sort((a, b) => (b.posts_count || 0) - (a.posts_count || 0))
      .slice(0, 10);
  });

  const getPopularCategories = computed(() => {
    return [...categories.value]
      .sort((a, b) => (b.posts_count || 0) - (a.posts_count || 0))
      .slice(0, 5);
  });

  // Actions
  const setTenant = (tenant: string) => {
    currentTenant.value = tenant;
  };

  const fetchPosts = async (params: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const query = new URLSearchParams();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Add query parameters with default values for public posts
      const defaultParams = {
        status: 'published',
        orderBy: 'published_at',
        order: 'desc',
        include: 'category,tags,author',
        ...params
      };
      
      // Add all parameters to the query
      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
      
      // Add tenant to query params if available
      const tenantToUse = currentTenant.value || 'taita'; // Default to 'taita' if no tenant is set
      query.append('tenant', tenantToUse);
      
      const url = `${apiBaseUrl.value}/posts?${query.toString()}`;
      console.log('Solicitando posts desde:', url);
      
      // For public endpoints, don't include credentials to avoid CORS issues
      const response = await $fetch<{ data: Post[] }>(url, {
        method: 'GET',
        headers,
        credentials: 'omit',
      });
      
      console.log('Respuesta de la API:', response);
      return response?.data || [];
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      error.value = 'No se pudieron cargar las publicaciones. Por favor, intente nuevamente más tarde.';
      
      // Log the full error for debugging purposes
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response._data
        });
      }
      
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchPost = async (slug: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const query = new URLSearchParams();
      
      // Agregar el tenant actual si está disponible
      if (currentTenant.value) {
        query.append('tenant', currentTenant.value);
      }
      
      const response = await $fetch<{ data: Post }>(
        `${apiBaseUrl}/posts/${slug}?${query.toString()}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      currentPost.value = response.data;
      return response.data;
    } catch (err: any) {
      console.error('Error fetching post:', err);
      error.value = err.message || 'Error al cargar la publicación';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async (params: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Usamos el plugin HTTP personalizado que ya maneja el tenant
      const response = await $fetch<{ data: Category[] }>('/categories', {
        method: 'GET',
        params,
        credentials: 'include'
      });
      
      console.log('Respuesta de categorías:', response);
      categories.value = response.data || [];
      return response.data || [];
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      error.value = err.message || 'Error al cargar las categorías';
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCategory = async (slug: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const query = new URLSearchParams();
      
      // Agregar el tenant actual si está disponible
      if (currentTenant.value) {
        query.append('tenant', currentTenant.value);
      }
      
      const response = await $fetch<{ data: Category }>(
        `${apiBaseUrl}/categories/${slug}?${query.toString()}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Actualizar la categoría en la lista de categorías
      const index = categories.value.findIndex(cat => cat.id === response.data.id);
      if (index !== -1) {
        categories.value[index] = response.data;
      } else {
        categories.value.push(response.data);
      }
      
      return response.data;
    } catch (err: any) {
      console.error('Error fetching category:', err);
      error.value = err.message || 'Error al cargar la categoría';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTags = async (params: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Usamos el plugin HTTP personalizado que ya maneja el tenant
      const response = await $fetch<{ data: Tag[] }>('/tags', {
        method: 'GET',
        params: {
          ...params,
          page: params.page || 1,
          per_page: params.per_page || 10,
          sort: params.sort || 'newest'
        },
        credentials: 'include'
      });
      
      console.log('Respuesta de etiquetas:', response);
      tags.value = response.data;
      return response.data;
    } catch (err: any) {
      console.error('Error fetching tags:', err);
      error.value = err.message || 'Error al cargar las etiquetas';
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchPostsByTag = async (tagSlug: string, params: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const query = new URLSearchParams();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Add authentication token if available
      const authStore = useAuthStore();
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
      }
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
      
      // Add tenant to query params instead of headers
      if (currentTenant.value) {
        query.append('tenant', currentTenant.value);
      }
      
      const url = `${apiBaseUrl.value}/tags/${tagSlug}/posts?${query.toString()}`;
      console.log('Fetching posts by tag from:', url);
      
      const response = await $fetch<{ data: Post[] }>(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      return response.data || [];
    } catch (err: any) {
      console.error('Error fetching posts by tag:', err);
      error.value = err.message || 'Error al cargar las publicaciones por etiqueta';
      
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        const authStore = useAuthStore();
        await authStore.logout();
        const router = useRouter();
        await router.push('/login');
      }
      
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchPostsByCategory = async (categorySlug: string, params: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const query = new URLSearchParams();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Add tenant header if available
      const subdomain = process.client ? window.location.hostname.split('.')[0] : '';
      if (subdomain && !['localhost', '127.0.0.1', 'www', ''].includes(subdomain)) {
        headers['X-Tenant'] = subdomain;
      }
      
      // Add authentication token if available
      const authStore = useAuthStore();
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
      }
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
      
      // Add tenant to query params
      if (currentTenant.value) {
        query.append('tenant', currentTenant.value);
      }
      
      const url = `${apiBaseUrl.value}/categories/${categorySlug}/posts?${query.toString()}`;
      console.log('Fetching posts by category from:', url);
      
      const response = await $fetch<{ data: Post[] }>(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      return response.data || [];
    } catch (err: any) {
      console.error('Error fetching posts by category:', err);
      error.value = err.message || 'Error al cargar las publicaciones por categoría';
      
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        const authStore = useAuthStore();
        await authStore.logout();
        const router = useRouter();
        await router.push('/login');
      }
      
      return [];
    } finally {
      loading.value = false;
    }
  };

  const searchPosts = async (query: string, params: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const queryParams = new URLSearchParams({
        q: query,
        ...params,
      });
      
      // Agregar el tenant actual si está disponible
      if (currentTenant.value) {
        queryParams.append('tenant', currentTenant.value);
      }
      
      const response = await $fetch<{ data: Post[] }>(
        `${apiBaseUrl.value}/search?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response?.data || [];
    } catch (err: any) {
      console.error('Error searching posts:', err);
      error.value = err.message || 'Error al buscar publicaciones';
      
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        const authStore = useAuthStore();
        await authStore.logout();
        const router = useRouter();
        await router.push('/login');
      }
      
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Fetch a single tag by slug
  const fetchTag = async (slug: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const query = new URLSearchParams();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Add authentication token if available
      const authStore = useAuthStore();
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
      }
      
      // Add tenant to query params instead of headers
      if (currentTenant.value) {
        query.append('tenant', currentTenant.value);
      }
      
      const url = `${apiBaseUrl.value}/tags/${slug}?${query.toString()}`;
      console.log('Fetching tag from:', url);
      
      const response = await $fetch<{ data: Tag }>(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      currentTag.value = response.data;
      return response.data;
    } catch (err: any) {
      console.error('Error fetching tag:', err);
      error.value = err.message || 'Error al cargar la etiqueta';
      
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        const authStore = useAuthStore();
        await authStore.logout();
        const router = useRouter();
        await router.push('/login');
      }
      
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Helper para obtener la URL completa de una imagen
  const getImageUrl = (path?: string): string => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${imageBaseUrl}${path}`;
  };

  // Helper para formatear fechas
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
      console.error('Error formateando fecha:', e);
      return '';
    }
  };

  return {
    // State
    posts,
    featuredPosts,
    categories,
    tags,
    currentPost,
    loading,
    error,
    currentTenant,
    apiBaseUrl,
    imageBaseUrl,
    
    // Getters
    getPostBySlug,
    getPostsByCategory,
    getPostsByTag,
    getRelatedPosts,
    getCategoryBySlug,
    getTagBySlug,
    getPopularTags,
    getPopularCategories,
    
    // Actions
    setTenant,
    fetchPosts,
    fetchPost,
    fetchCategories,
    fetchCategory,
    fetchTags,
    fetchTag,
    fetchPostsByCategory,
    fetchPostsByTag,
    searchPosts,
    
    // Helpers
    getImageUrl,
    formatDate,
  };
});
