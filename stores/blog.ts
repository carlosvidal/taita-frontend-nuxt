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

// Default values for server-side rendering and static generation
const defaultConfig = {
  apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://backend.taita.blog/api',
  apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://backend.taita.blog/api',
  imageUrl: process.env.NUXT_PUBLIC_IMAGE_URL || 'https://backend.taita.blog',
  siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Taita Blog',
  tenantDomain: process.env.NUXT_PUBLIC_TENANT_DOMAIN || 'taita',
  tenant: process.env.NUXT_PUBLIC_TENANT || 'taita',
  staticMode: process.env.NUXT_PUBLIC_STATIC === 'true'
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
  // Static mode global para todo el store
  const nuxtApp = typeof useNuxtApp === 'function' ? useNuxtApp() : null;
  const isStaticMode = (process.server && process.env.NODE_ENV === 'production') || (nuxtApp?.$staticMode ?? defaultConfig.staticMode);
  // Initialize config
  const config = useSafeConfig();
  
  let authStore = null;
  if (process.client) {
    authStore = useAuthStore();
  }

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
  const apiBaseUrl = ref(config.apiBase); // No concatenar tenantDomain al path
  const imageBaseUrl = ref(config.imageUrl);

  // Update URLs when config changes
  const updateUrls = () => {
    try {
      let baseUrl = config.apiBase || '';
      
      // Ensure baseUrl doesn't end with a slash
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      // Set the API base URL (nunca concatena tenant)
      apiBaseUrl.value = baseUrl;
      
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
    // For SSR, set safe defaults (no tenant)
    apiBaseUrl.value = config.apiBase || '';
    imageBaseUrl.value = config.imageUrl || '';
  }

  // Getters
  const recentPosts = computed(() => {
    return [...posts.value]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 5);
  });

  // Fetch posts with pagination and filters
  const fetchPosts = async (params: Record<string, any> = {}): Promise<PaginatedResponse<Post>> => {
    // Check if we're in static generation mode or SSR production mode
    const nuxtApp = typeof useNuxtApp === 'function' ? useNuxtApp() : null;
const isStaticMode = (process.server && process.env.NODE_ENV === 'production') || (nuxtApp?.$staticMode ?? config.staticMode);
    
    // Provide mock data for static generation
    if (isStaticMode) {
      if (process.dev) {
        console.log('[BlogStore] Using mock data for static generation');
      }
      
      // Create consistent mock data for static site generation
      const mockPosts: Post[] = [
        {
          id: 1,
          title: 'Bienvenido al Blog',
          slug: 'bienvenido-al-blog',
          excerpt: 'Este es un ejemplo de entrada de blog generada estáticamente.',
          content: '<p>Este es un ejemplo de contenido de blog generado estáticamente.</p>',
          featured_image: '/images/placeholder.jpg',
          featured: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reading_time: 2,
          author_id: 1,
          category_id: 1,
          author: {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            bio: 'Administrador del blog',
            avatar: '/images/placeholder-avatar.jpg'
          },
          category: {
            id: 1,
            name: 'General',
            slug: 'general',
            description: 'Categoría general'
          },
          tags: [
            {
              id: 1,
              name: 'Blog',
              slug: 'blog',
              description: 'Artículos de blog'
            }
          ],
          meta_title: 'Bienvenido al Blog',
          meta_description: 'Artículo de bienvenida al blog'
        },
        {
          id: 2,
          title: 'Cómo utilizar Nuxt 3',
          slug: 'como-utilizar-nuxt-3',
          excerpt: 'Aprende a utilizar Nuxt 3 para crear sitios web estáticos.',
          content: '<p>Nuxt 3 es un framework potente para crear sitios web estáticos y aplicaciones web.</p>',
          featured_image: '/images/placeholder.jpg',
          featured: false,
          published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          reading_time: 5,
          author_id: 1,
          category_id: 2,
          author: {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            bio: 'Administrador del blog',
            avatar: '/images/placeholder-avatar.jpg'
          },
          category: {
            id: 2,
            name: 'Tecnología',
            slug: 'tecnologia',
            description: 'Artículos sobre tecnología'
          },
          tags: [
            {
              id: 2,
              name: 'Nuxt',
              slug: 'nuxt',
              description: 'Artículos sobre Nuxt'
            },
            {
              id: 3,
              name: 'JavaScript',
              slug: 'javascript',
              description: 'Artículos sobre JavaScript'
            }
          ],
          meta_title: 'Cómo utilizar Nuxt 3',
          meta_description: 'Guía completa para utilizar Nuxt 3'
        }
      ];
      
      // Filter the mock posts based on parameters if needed
      let filteredPosts = [...mockPosts];
      
      // Apply filtering by category if requested
      if (params.category_id) {
        filteredPosts = filteredPosts.filter(post => post.category_id === params.category_id);
      }
      
      // Apply filtering by tag if requested
      if (params.tag_id) {
        filteredPosts = filteredPosts.filter(post => 
          post.tags?.some(tag => tag.id === params.tag_id)
        );
      }
      
      // Apply filtering by featured status if requested
      if (params.featured) {
        filteredPosts = filteredPosts.filter(post => post.featured);
      }
      
      // Apply limiting if requested
      if (params.limit) {
        filteredPosts = filteredPosts.slice(0, parseInt(params.limit));
      }
      
      // Return paginated response with mock data
      return {
        data: filteredPosts,
        current_page: 1,
        last_page: 1,
        per_page: filteredPosts.length,
        total: filteredPosts.length
      };
    }
    
    // For server-side rendering in development
    if (process.server && !isStaticMode) {
      try {
        // Use a simple fetch during SSR
        const response = await $fetch(`${apiBaseUrl.value}/posts`, {
          params: {
            ...params,
            tenant: currentTenant.value
          }
        });
        return response as PaginatedResponse<Post>;
      } catch (error) {
        console.error('[BlogStore] Error fetching posts during SSR:', error);
        // Return empty data on error during SSR
        return {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: params.limit || 10,
          total: 0
        } as PaginatedResponse<Post>;
      }
    }

    // For client-side rendering
    loading.value = true;
    error.value = null;

    try {
      const query = new URLSearchParams();
      
      // Add pagination
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.per_page) query.append('per_page', params.per_page.toString());
      
      // Add filters
      if (params.category_id) query.append('category_id', params.category_id.toString());
      if (params.tag_id) query.append('tag_id', params.tag_id.toString());
      if (params.search) query.append('search', params.search.toString());
      if (params.featured) query.append('featured', params.featured.toString());
      if (params.status) query.append('status', params.status.toString());
      
      // Add includes
      if (params.include) query.append('include', params.include.toString());
      
      // Add sorting
      if (params.orderBy) query.append('orderBy', params.orderBy.toString());
      if (params.order) query.append('order', params.order.toString());
      
      if (process.dev) {
        console.log(`[BlogStore] Fetching posts from: ${apiBaseUrl.value}/posts?${query.toString()}`);
      }

      // Si el tenant es una IP 192.x.x.x, usar 'demo'
let tenantValue = currentTenant.value || 'demo';
if (/^192\./.test(tenantValue)) tenantValue = 'demo';
query.set('tenant', tenantValue);
      const response = await $fetch<PaginatedResponse<Post>>(
        `${apiBaseUrl.value}/posts/public?${query.toString()}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Taita-Subdomain': tenantValue,
          },
          timeout: 10000,
        }
      );

      // Update store with fetched data
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

  // Fetch a single post by slug
  const fetchPost = async (slug: string): Promise<Post | null> => {
    // Use static data in static mode
    if (isStaticMode) {
      // Find post in mock data
      const mockPosts = [
        {
          id: 1,
          title: 'Bienvenido al Blog',
          slug: 'bienvenido-al-blog',
          excerpt: 'Este es un ejemplo de entrada de blog generada estáticamente.',
          content: '<p>Este es un ejemplo de contenido de blog generado estáticamente.</p>',
          featured_image: '/images/placeholder.jpg',
          featured: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reading_time: 2,
          author_id: 1,
          category_id: 1,
          author: {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            bio: 'Administrador del blog',
            avatar: '/images/placeholder-avatar.jpg'
          },
          category: {
            id: 1,
            name: 'General',
            slug: 'general',
            description: 'Categoría general'
          },
          tags: [
            {
              id: 1,
              name: 'Blog',
              slug: 'blog',
              description: 'Artículos de blog'
            }
          ],
          meta_title: 'Bienvenido al Blog',
          meta_description: 'Artículo de bienvenida al blog'
        },
        {
          id: 2,
          title: 'Cómo utilizar Nuxt 3',
          slug: 'como-utilizar-nuxt-3',
          excerpt: 'Aprende a utilizar Nuxt 3 para crear sitios web estáticos.',
          content: '<p>Nuxt 3 es un framework potente para crear sitios web estáticos y aplicaciones web.</p>',
          featured_image: '/images/placeholder.jpg',
          featured: false,
          published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          reading_time: 5,
          author_id: 1,
          category_id: 2,
          author: {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            bio: 'Administrador del blog',
            avatar: '/images/placeholder-avatar.jpg'
          },
          category: {
            id: 2,
            name: 'Tecnología',
            slug: 'tecnologia',
            description: 'Artículos sobre tecnología'
          },
          tags: [
            {
              id: 2,
              name: 'Nuxt',
              slug: 'nuxt',
              description: 'Artículos sobre Nuxt'
            }
          ],
          meta_title: 'Cómo utilizar Nuxt 3',
          meta_description: 'Guía completa para utilizar Nuxt 3'
        }
      ];
      
      const post = mockPosts.find(p => p.slug === slug);
      return post || null;
    }
    
    try {
      // Make API request to get the post
      const response = await $fetch<Post>(`${apiBaseUrl.value}/posts/public/${slug}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Taita-Subdomain': currentTenant.value || 'demo',
        },
        params: {
          include: 'category,tags,author',
          tenant: currentTenant.value || 'demo'
        }
      });
      
      // Update currentPost in the store
      currentPost.value = response;
      
      return response;
    } catch (err: any) {
      console.error(`[BlogStore] Error fetching post ${slug}:`, err);
      error.value = `Error fetching post: ${err.message || 'Unknown error'}`;
      return null;
    }
  };

  // Fetch all categories
  const fetchCategories = async (): Promise<Category[]> => {
    // Use static data in static mode
    if (isStaticMode) {
      // Mock categories for static mode
      const mockCategories: Category[] = [
        {
          id: 1,
          name: 'General',
          slug: 'general',
          description: 'Categoría general'
        },
        {
          id: 2,
          name: 'Tecnología',
          slug: 'tecnologia',
          description: 'Artículos sobre tecnología'
        }
      ];
      
      categories.value = mockCategories;
      return mockCategories;
    }
    
    try {
      // Make API request to get categories
      // Si el tenant es una IP 192.x.x.x, usar 'demo'
const safeTenant = /^192\./.test(currentTenant.value) ? 'demo' : (currentTenant.value || 'demo');
const response = await $fetch<Category[]>(`${apiBaseUrl.value}/categories/public?tenant=${safeTenant}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // Update categories in the store
      categories.value = response;
      
      return response;
    } catch (err: any) {
      console.error('[BlogStore] Error fetching categories:', err);
      error.value = `Error fetching categories: ${err.message || 'Unknown error'}`;
      return [];
    }
  };

  // Fetch a single category by slug
  const fetchCategory = async (slug: string): Promise<Category | null> => {
    // Use static data in static mode
    if (isStaticMode) {
      // Mock categories for static mode
      const mockCategories: Category[] = [
        {
          id: 1,
          name: 'General',
          slug: 'general',
          description: 'Categoría general'
        },
        {
          id: 2,
          name: 'Tecnología',
          slug: 'tecnologia',
          description: 'Artículos sobre tecnología'
        }
      ];
      
      const category = mockCategories.find(c => c.slug === slug);
      return category || null;
    }
    
    try {
      // Make API request to get the category
      // Si el tenant es una IP 192.x.x.x, usar 'demo'
const safeTenant = /^192\./.test(currentTenant.value) ? 'demo' : (currentTenant.value || 'demo');
const response = await $fetch<Category>(`${apiBaseUrl.value}/categories/public/${slug}?tenant=${safeTenant}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      return response;
    } catch (err: any) {
      console.error(`[BlogStore] Error fetching category ${slug}:`, err);
      error.value = `Error fetching category: ${err.message || 'Unknown error'}`;
      return null;
    }
  };

  // Fetch all tags
  const fetchTags = async (): Promise<Tag[]> => {
    // Use static data in static mode
    if (isStaticMode) {
      // Mock tags for static mode
      const mockTags: Tag[] = [
        {
          id: 1,
          name: 'Blog',
          slug: 'blog',
          description: 'Artículos de blog'
        },
        {
          id: 2,
          name: 'Nuxt',
          slug: 'nuxt',
          description: 'Artículos sobre Nuxt'
        },
        {
          id: 3,
          name: 'JavaScript',
          slug: 'javascript',
          description: 'Artículos sobre JavaScript'
        }
      ];
      
      tags.value = mockTags;
      return mockTags;
    }
    
    try {
      // Make API request to get tags
      // Si el tenant es una IP 192.x.x.x, usar 'demo'
const safeTenant = /^192\./.test(currentTenant.value) ? 'demo' : (currentTenant.value || 'demo');
const response = await $fetch<Tag[]>(`${apiBaseUrl.value}/tags/public?tenant=${safeTenant}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // Update tags in the store
      tags.value = response;
      
      return response;
    } catch (err: any) {
      console.error('[BlogStore] Error fetching tags:', err);
      error.value = `Error fetching tags: ${err.message || 'Unknown error'}`;
      return [];
    }
  };

  // Fetch a single tag by slug
  const fetchTag = async (slug: string): Promise<Tag | null> => {
    // Use static data in static mode
    if (isStaticMode) {
      // Mock tags for static mode
      const mockTags: Tag[] = [
        {
          id: 1,
          name: 'Blog',
          slug: 'blog',
          description: 'Artículos de blog'
        },
        {
          id: 2,
          name: 'Nuxt',
          slug: 'nuxt',
          description: 'Artículos sobre Nuxt'
        },
        {
          id: 3,
          name: 'JavaScript',
          slug: 'javascript',
          description: 'Artículos sobre JavaScript'
        }
      ];
      
      const tag = mockTags.find(t => t.slug === slug);
      return tag || null;
    }
    
    try {
      // Make API request to get the tag
      const safeTenant = /^192\./.test(currentTenant.value) ? 'demo' : (currentTenant.value || 'demo');
      const response = await $fetch<Tag>(`${apiBaseUrl.value}/tags/public/${slug}?tenant=${safeTenant}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      return response;
    } catch (err: any) {
      console.error(`[BlogStore] Error fetching tag ${slug}:`, err);
      error.value = `Error fetching tag: ${err.message || 'Unknown error'}`;
      return null;
    }
  };

  // Fetch posts by category
  const fetchPostsByCategory = async (categorySlug: string, params: Record<string, any> = {}): Promise<PaginatedResponse<Post>> => {
    // Use static data in static mode
    if (isStaticMode) {
      // Mock posts data
      const mockPosts = [
        {
          id: 1,
          title: 'Bienvenido al Blog',
          slug: 'bienvenido-al-blog',
          excerpt: 'Este es un ejemplo de entrada de blog generada estáticamente.',
          content: '<p>Este es un ejemplo de contenido de blog generado estáticamente.</p>',
          featured_image: '/images/placeholder.jpg',
          featured: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reading_time: 2,
          author_id: 1,
          category_id: 1,
          author: {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            bio: 'Administrador del blog',
            avatar: '/images/placeholder-avatar.jpg'
          },
          category: {
            id: 1,
            name: 'General',
            slug: 'general',
            description: 'Categoría general'
          },
          tags: [
            {
              id: 1,
              name: 'Blog',
              slug: 'blog',
              description: 'Artículos de blog'
            }
          ]
        },
        {
          id: 2,
          title: 'Cómo utilizar Nuxt 3',
          slug: 'como-utilizar-nuxt-3',
          excerpt: 'Aprende a utilizar Nuxt 3 para crear sitios web estáticos.',
          content: '<p>Nuxt 3 es un framework potente para crear sitios web estáticos y aplicaciones web.</p>',
          featured_image: '/images/placeholder.jpg',
          featured: false,
          published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          reading_time: 5,
          author_id: 1,
          category_id: 2,
          author: {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            bio: 'Administrador del blog',
            avatar: '/images/placeholder-avatar.jpg'
          },
          category: {
            id: 2,
            name: 'Tecnología',
            slug: 'tecnologia',
            description: 'Artículos sobre tecnología'
          },
          tags: [
            {
              id: 2,
              name: 'Nuxt',
              slug: 'nuxt',
              description: 'Artículos sobre Nuxt'
            }
          ]
        }
      ];
      
      // Filter posts by category slug
      const filteredPosts = mockPosts.filter(post => post.category?.slug === categorySlug);
      
      return {
        data: filteredPosts,
        current_page: 1,
        last_page: 1,
        per_page: filteredPosts.length,
        total: filteredPosts.length
      };
    }
    
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
      
      // Si el tenant es una IP 192.x.x.x, usar 'demo'
const safeTenant = /^192\./.test(currentTenant.value) ? 'demo' : (currentTenant.value || 'demo');
const url = `${apiBaseUrl.value}/categories/public/${categorySlug}/posts?tenant=${safeTenant}&${query.toString()}`;
      // Si el tenant es una IP 192.x.x.x, usar 'demo'
if (params.tenant && /^192\./.test(params.tenant)) params.tenant = 'demo';
const response = await $fetch<PaginatedResponse<Post>>(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      return response;
    } catch (err: any) {
      // query puede no estar definida si falla antes
      const queryString = typeof query !== 'undefined' ? query.toString() : '';
      console.error(`[BlogStore] Error searching posts with query "${queryString}":`, err);
      error.value = `Error searching posts: ${err.message || 'Unknown error'}`;
      
      return {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      };
    } finally {
      loading.value = false;
    }
  };

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
      
      const config = useRuntimeConfig();
      const defaultTenant = config.public.defaultTenant || 'demo';
      const hostname = process.client ? window.location.hostname : '';
      let tenant = hostname.split('.')[0];
      if ((process.server && !hostname) || ['localhost', '127.0.0.1', 'www', ''].includes(tenant)) {
        tenant = defaultTenant;
      }
      
      // Add subdomain as a query parameter
      // Si el tenant es una IP 192.x.x.x, usar 'demo'
const safeTenant = /^192\./.test(currentTenant.value) ? 'demo' : (currentTenant.value || 'demo');
const url = `${apiBaseUrl.value}/tags/public/${tagSlug}/posts?tenant=${safeTenant}&${query.toString()}`;
      const response = await $fetch<any>(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // Estructura defensiva para evitar errores si la respuesta no es la esperada
      let postsArray = [];
      let pagination = { total: 0, current_page: 1, last_page: 1, per_page: 10 };
      if (response && response.data) {
        if (Array.isArray(response.data.posts)) {
          postsArray = response.data.posts;
        } else if (Array.isArray(response.data)) {
          postsArray = response.data;
        }
        if (response.data.pagination) {
          pagination = {
            total: response.data.pagination.total || 0,
            current_page: response.data.pagination.current_page || 1,
            last_page: response.data.pagination.last_page || 1,
            per_page: response.data.pagination.per_page || 10,
          };
        }
      }
      posts.value = postsArray;
      return {
        data: postsArray,
        ...pagination
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

  // Search posts
  const searchPosts = async (query: string, params: Record<string, any> = {}): Promise<PaginatedResponse<Post>> => {
    // Use static data in static mode
    if (isStaticMode) {
      // Mock posts data
      const mockPosts = [
        {
          id: 1,
          title: 'Bienvenido al Blog',
          slug: 'bienvenido-al-blog',
          excerpt: 'Este es un ejemplo de entrada de blog generada estáticamente.',
          content: '<p>Este es un ejemplo de contenido de blog generado estáticamente.</p>',
          featured_image: '/images/placeholder.jpg',
          featured: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reading_time: 2,
          author_id: 1,
          category_id: 1,
          author: {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            bio: 'Administrador del blog',
            avatar: '/images/placeholder-avatar.jpg'
          },
          category: {
            id: 1,
            name: 'General',
            slug: 'general',
            description: 'Categoría general'
          },
          tags: [
            {
              id: 1,
              name: 'Blog',
              slug: 'blog',
              description: 'Artículos de blog'
            }
          ]
        }
      ];
      // Simple search
      const searchTerm = query.toLowerCase();
      const filteredPosts = mockPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt?.toLowerCase().includes(searchTerm) ||
        post.content?.toLowerCase().includes(searchTerm)
      );
      return {
        data: filteredPosts,
        current_page: 1,
        last_page: 1,
        per_page: filteredPosts.length,
        total: filteredPosts.length
      };
    }
    loading.value = true;
    error.value = null;
    try {
      const searchParams = new URLSearchParams({ q: query, ...params });
      const response = await $fetch<PaginatedResponse<Post>>(
        `${apiBaseUrl.value}/public/search?${searchParams.toString()}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Taita-Subdomain': currentTenant.value || 'demo',
          }
        }
      );
      return response;
    } catch (err: any) {
      console.error(`[BlogStore] Error searching posts with query "${query}":`, err);
      error.value = `Error searching posts: ${err.message || 'Unknown error'}`;
      return {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      };
    } finally {
      loading.value = false;
    }
  };

  // Helper to get full image URL
  const getImageUrl = (path?: string): string => {
    if (!path) return '';
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

  // Fetch blog settings
  const fetchSettings = async () => {
    // Use static data in static mode
    if (isStaticMode) {
      return {
        title: 'Mi Blog',
        name: 'Mi Blog',
        description: 'Un blog increíble',
      };
    }

    try {
      const safeTenant = /^192\./.test(currentTenant.value) ? 'demo' : (currentTenant.value || 'demo');
      const response = await $fetch(`${apiBaseUrl.value}/settings/public`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Taita-Subdomain': safeTenant,
        }
      });
      return response;
    } catch (err: any) {
      console.error('[BlogStore] Error fetching settings:', err);
      return {
        title: 'Blog',
        name: 'Blog',
      };
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
    fetchSettings,
    setTenant,

    // Helpers
    getImageUrl,
    formatDate
  };
});
