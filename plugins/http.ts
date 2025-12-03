// plugins/http.ts
import { defineNuxtPlugin } from '#app';
import { useRuntimeConfig, useRouter } from '#imports';
import { useAuthStore } from '~/composables/useAuth';

// Type declarations for the plugin
declare module '#app' {
  interface NuxtApp {
    $http: typeof globalThis.$fetch;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $http: typeof globalThis.$fetch;
  }
}

type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  retry?: number | boolean;
  credentials?: RequestCredentials;
  [key: string]: any;
};

type FetchResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  _data: T;
};

type FetchError = Error & {
  response?: {
    status: number;
    statusText: string;
    _data: any;
  };
};

interface PluginInjects {
  $http: typeof globalThis.$fetch;
  $api: typeof globalThis.$fetch;
}

// Only define the plugin once
let httpInstance: typeof globalThis.$fetch | null = null;

export default defineNuxtPlugin<PluginInjects>((nuxtApp) => {
  // Return early if already initialized
  if (nuxtApp.$http) {
    return {};
  }

  const config = useRuntimeConfig();
  const router = useRouter();
  const authStore = useAuthStore();
  
  // URL base de la API
  const baseURL = (config.public.apiBaseUrl as string) || 'https://backend.taita.blog/api';
  
  // Return existing instance if available
  if (httpInstance) {
    nuxtApp.provide('http', httpInstance);
    return {};
  }
  
  // Create a custom fetch instance with default options
  const apiFetch = $fetch.create({
    baseURL,
    credentials: 'include', // Importante para CORS con credenciales
    retry: 1, // Reintentar una vez en caso de error
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    async onRequest({ options }) {
      try {
        // Obtener el token de autenticación si existe
        const token = authStore.token || useCookie('auth_token').value;
        
        // Configurar headers comunes
        const headers: Record<string, string> = {
          ...(options.headers as Record<string, string> || {}),
        };
        
        // Añadir token de autenticación si existe
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Añadir tenant basado en el subdominio
        if (process.client) {
          const subdomain = window.location.hostname.split('.')[0];
          if (subdomain && !['localhost', '127.0.0.1', 'www', ''].includes(subdomain)) {
            headers['X-Tenant'] = subdomain;
          }
        }
        
        options.headers = headers;
      } catch (error) {
        console.error('Error en la configuración de la petición:', error);
      }
    },
    async onResponseError({ response }) {
      // Manejar errores comunes
      if (!response) {
        console.error('No se pudo conectar con el servidor');
        return;
      }
      
      // Manejar 401 Unauthorized
      if (response.status === 401) {
        try {
          await authStore.logout();
          
          // Redirigir a login si no está ya en esa ruta
          if (process.client && router.currentRoute.value.path !== '/login') {
            await router.push('/login');
          }
        } catch (error) {
          console.error('Error al manejar la sesión expirada:', error);
        }
      }
      
      // Manejar otros errores comunes
      if (response.status >= 500) {
        console.error('Error del servidor:', response.statusText);
      } else if (response.status >= 400) {
        console.error('Error en la petición:', response.statusText);
      }
      
      // Propagar el error para que pueda ser manejado por el llamador
      const error = new Error(response.statusText) as FetchError;
      error.response = {
        status: response.status,
        statusText: response.statusText,
        _data: (response as any)._data
      };
      throw error;
    },
    onRequestError({ error }) {
      console.error('Error en la petición:', error);
      throw error;
    }
  });

  // Store the instance
  httpInstance = apiFetch;
  
  // Provide the instance to the app
  nuxtApp.provide('http', apiFetch);
  
  // No need to return provide object when using nuxtApp.provide()
  return {};
});