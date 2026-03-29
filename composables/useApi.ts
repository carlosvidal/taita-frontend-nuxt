// composables/useApi.ts
import { useRuntimeConfig } from '#app';
import { useTenant } from '~/composables/useTenant';

export const useApi = () => {
  const config = useRuntimeConfig();
  const { $http } = useNuxtApp();
  const baseURL = config.public.apiBaseUrl || 'https://backend.taita.blog/api';
  const imageBaseUrl = config.public.imageBaseUrl || 'https://backend.taita.blog';

  const getTenantHeaders = (): Record<string, string> => {
    try {
      const { getTenant } = useTenant();
      const tenant = getTenant();
      if (tenant && !['localhost', '127.0.0.1', 'www', ''].includes(tenant)) {
        return {
          'X-Taita-Subdomain': tenant,
          'X-Tenant': tenant,
        };
      }
    } catch {
      // fallback if useTenant is not available
    }
    return {};
  };

  // Función genérica para hacer peticiones
  const fetchFromApi = async (endpoint: string, options: any = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getTenantHeaders(),
        ...options.headers,
      };

      // Añadir token de autenticación si está disponible
      const authStore = useAuthStore();
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
      }

      const response = await $fetch(endpoint, {
        baseURL,
        ...options,
        headers,
        credentials: 'include',
      });

      return response;
    } catch (error: any) {
      console.error('API Error:', error);

      if (error.response?.status === 401) {
        const authStore = useAuthStore();
        await authStore.logout();
        if (import.meta.client) {
          const router = useRouter();
          await router.push('/login');
        }
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
    return fetchFromApi('/categories/public');
  };

  const getTags = async () => {
    return fetchFromApi('/tags');
  };

  const getMenu = async () => {
    return fetchFromApi('/menu/public');
  };

  const getPostsByCategory = async (categorySlug: string) => {
    return fetchFromApi(`/categories/${categorySlug}/posts`);
  };

  const getPostsByTag = async (tagSlug: string) => {
    return fetchFromApi(`/tags/${tagSlug}/posts`);
  };

  const getCategory = async (slug: string) => {
    return fetchFromApi(`/categories/public/${slug}`);
  };

  const getTag = async (slug: string) => {
    return fetchFromApi(`/tags/${slug}`);
  };

  // Método para construir URLs de imágenes
  const getImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${imageBaseUrl}${path}`;
  };

  return {
    fetchFromApi,
    getPosts,
    getPost,
    getCategories,
    getCategory,
    getTags,
    getTag,
    getMenu,
    getPostsByCategory,
    getPostsByTag,
    searchPosts: async (query: string, params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams({
        q: query,
        ...params
      });
      return fetchFromApi(`/search?${searchParams.toString()}`);
    },
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
