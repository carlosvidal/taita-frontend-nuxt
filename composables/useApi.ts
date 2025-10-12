// composables/useApi.ts
import { useRuntimeConfig } from '#app';

export const useApi = () => {
  const config = useRuntimeConfig();
  const { $http } = useNuxtApp();
  const baseURL = config.public.apiBaseUrl || 'https://taita-api.onrender.com/api';
  const imageBaseUrl = config.public.imageBaseUrl || 'https://taita-api.onrender.com';

  // Función genérica para hacer peticiones
  const fetchFromApi = async (endpoint: string, options: any = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      };

      // Añadir tenant al header si está disponible
      const subdomain = process.client ? window.location.hostname.split('.')[0] : '';
      if (subdomain && !['localhost', '127.0.0.1', 'www', ''].includes(subdomain)) {
        headers['X-Tenant'] = subdomain;
      }

      // Añadir token de autenticación si está disponible
      const authStore = useAuthStore();
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
      }

      const response = await $fetch(endpoint, {
        baseURL,
        ...options,
        headers,
        credentials: 'include', // Importante para CORS con credenciales
      });

      return response;
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Manejar errores de autenticación
      if (error.response?.status === 401) {
        const authStore = useAuthStore();
        await authStore.logout();
        const router = useRouter();
        await router.push('/login');
      }
      
      throw error;
    }
  };

  // Métodos específicos para el blog
  const getPosts = async (params = {}) => {
    return fetchFromApi('/posts', {
      params: {
        limit: 10,
        include: 'category,tags,author',
        status: 'published',
        orderBy: 'published_at',
        order: 'desc',
        ...params
      }
    });
  };

  const getPost = async (slug: string) => {
    return fetchFromApi(`/posts/${slug}`);
  };

  const getCategories = async () => {
    try {
      // Add subdomain to the request if available
      const subdomain = window.location.hostname.split('.')[0];
      const headers = {};
      
      if (subdomain && !['localhost', '127.0.0.1', 'www', ''].includes(subdomain)) {
        headers['X-Taita-Subdomain'] = subdomain;
      }
      
      return await fetchFromApi('/categories/public', { headers });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  const getTags = async () => {
    return fetchFromApi('/tags');
  };

  const getMenu = async () => {
    try {
      // Add subdomain to the request if available
      const subdomain = process.client ? window.location.hostname.split('.')[0] : '';
      const headers: Record<string, string> = {};

      if (subdomain && !['localhost', '127.0.0.1', 'www', ''].includes(subdomain)) {
        headers['X-Taita-Subdomain'] = subdomain;
      }

      console.log('[useApi] Fetching menu with subdomain:', subdomain);
      const result = await fetchFromApi('/menu/public', { headers });
      console.log('[useApi] Menu fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('[useApi] Error fetching menu:', error);
      throw error;
    }
  };

  const getPostsByCategory = async (categorySlug: string) => {
    return fetchFromApi(`/categories/${categorySlug}/posts`);
  };

  const getPostsByTag = async (tagSlug: string) => {
    return fetchFromApi(`/tags/${tagSlug}/posts`);
  };

  const getCategory = async (slug: string) => {
    try {
      // Add subdomain to the request if available
      const subdomain = window.location.hostname.split('.')[0];
      const headers = {};
      
      if (subdomain && !['localhost', '127.0.0.1', 'www', ''].includes(subdomain)) {
        headers['X-Taita-Subdomain'] = subdomain;
      }
      
      return await fetchFromApi(`/categories/public/${slug}`, { headers });
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  };

  const getTag = async (slug: string) => {
    try {
      const headers: Record<string, string> = {};
      const subdomain = process.client ? window.location.hostname.split('.')[0] : '';
      
      if (subdomain && !['localhost', '127.0.0.1', 'www', ''].includes(subdomain)) {
        headers['X-Tenant'] = subdomain;
      }
      
      // Add authentication token if available
      const authStore = useAuthStore();
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
      }
      
      return await fetchFromApi(`/tags/${slug}`, { headers });
    } catch (error) {
      console.error('Error fetching tag:', error);
      throw error;
    }
  };

  // Método para construir URLs de imágenes
  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (!path) return '';
    return path.startsWith('http') ? path : `${imageBaseUrl}${path}`;
  };

  return {
    // Core methods
    fetchFromApi,

    // Post methods
    getPosts,
    getPost,

    // Category methods
    getCategories,
    getCategory,

    // Tag methods
    getTags,
    getTag,

    // Menu methods
    getMenu,

    // Relationship methods
    getPostsByCategory,
    getPostsByTag,
    
    // Search
    searchPosts: async (query: string, params: Record<string, any> = {}) => {
      try {
        const searchParams = new URLSearchParams({
          q: query,
          ...params
        });
        
        // Add tenant to query params if available
        const subdomain = process.client ? window.location.hostname.split('.')[0] : '';
        if (subdomain && !['localhost', '127.0.0.1', 'www', ''].includes(subdomain)) {
          searchParams.append('tenant', subdomain);
        }
        
        return await fetchFromApi(`/search?${searchParams.toString()}`);
      } catch (error) {
        console.error('Error searching posts:', error);
        throw error;
      }
    },
    
    // Utilities
    getImageUrl,
    formatDate: (dateString: string, locale = 'es-ES'): string => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    },
  };
};

export default useApi;
