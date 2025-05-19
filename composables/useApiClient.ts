import type { FetchOptions } from 'ofetch';
import { useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';
import { ApiError } from '~/utils/errorHandler';

interface ApiClientOptions extends FetchOptions {
  withTenant?: boolean;
  withAuth?: boolean;
}

// Default API client options
const defaultApiOptions: ApiClientOptions = {
  withTenant: true,
  withAuth: true
};

export const useApiClient = (baseURL: string, options: ApiClientOptions = {}) => {
  const config = useRuntimeConfig();
  const mergedOptions = { ...defaultApiOptions, ...options };

  // Default headers
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  // Skip if we're in SSR and no baseURL is provided
  if (!baseURL && process.server) {
    console.warn('No baseURL provided for API client');
  }
  
  // Create a new fetch instance with default options
  const $api = $fetch.create({
    baseURL,
    headers: { ...defaultHeaders },
    credentials: 'include',
    async onRequest({ options }) {
      // Add auth token if available and required
      if (mergedOptions.withAuth && process.client) {
        try {
          // Get token from localStorage directly to avoid circular dependency
          const token = localStorage.getItem('auth_token');
          if (token) {
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${token}`
            };
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error);
        }
      }
      
      // Add tenant if needed
      if (mergedOptions.withTenant && config.public.tenant) {
        options.headers = {
          ...options.headers,
          'X-Tenant': config.public.tenant
        };
      }
    },
    async onResponseError({ response }) {
      // Handle 401 Unauthorized
      if (process.client && response?.status === 401) {
        try {
          // Clear auth data from localStorage directly
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          
          // Redirect to login
          const router = useRouter();
          if (router) {
            await router.push('/login');
          }
        } catch (error) {
          console.error('Error handling 401:', error);
        }
      }
      
      // Re-throw the error with more context
      const errorMessage = response?._data?.message || response?.statusText || 'API Error';
      throw new ApiError({
        statusCode: response?.status || 500,
        statusMessage: errorMessage,
        data: response?._data
      });
    }
  });

  // Add HTTP methods with type safety
  const api = {
    // GET request
    async get<T = any>(url: string, options: FetchOptions = {}) {
      return $api<T>(url, { method: 'GET', ...options });
    },
    
    // POST request
    async post<T = any>(url: string, body?: any, options: FetchOptions = {}) {
      return $api<T>(url, { method: 'POST', body, ...options });
    },
    
    // PUT request
    async put<T = any>(url: string, body?: any, options: FetchOptions = {}) {
      return $api<T>(url, { method: 'PUT', body, ...options });
    },
    
    // PATCH request
    async patch<T = any>(url: string, body?: any, options: FetchOptions = {}) {
      return $api<T>(url, { method: 'PATCH', body, ...options });
    },
    
    // DELETE request
    async delete<T = any>(url: string, options: FetchOptions = {}) {
      return $api<T>(url, { method: 'DELETE', ...options });
    },
    
    // File upload helper
    async upload<T = any>(
      url: string, 
      file: File, 
      fieldName = 'file',
      data: Record<string, any> = {},
      options: FetchOptions = {}
    ) {
      const formData = new FormData();
      formData.append(fieldName, file);

      // Append additional data to form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      return $api<T>(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...options.headers,
          'Content-Type': 'multipart/form-data',
        },
        ...options,
      });
    },
    
    // Raw fetch instance for custom requests
    raw: $api
  };
  
  return api;
};

// Create a default instance with runtime config
export const useDefaultApiClient = () => {
  const config = useRuntimeConfig();
  return useApiClient(config.public.apiBaseUrl);
};
