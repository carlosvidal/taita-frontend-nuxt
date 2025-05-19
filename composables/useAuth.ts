import { ref, computed, onMounted } from 'vue';
import { defineStore } from 'pinia';
import type { User } from '~/types/auth';
import { useRouter } from 'vue-router';

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error setting localStorage:', e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }
};

// Default user object
const defaultUser: User = {
  id: '',
  name: '',
  email: '',
  email_verified_at: null,
  created_at: '',
  updated_at: '',
  roles: [],
  permissions: []
};

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!token.value);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const router = useRouter();

  // Initialize from localStorage
  const initAuth = (): void => {
    if (isInitialized.value) return;
    
    try {
      const storedToken = safeLocalStorage.getItem('auth_token');
      const storedUser = safeLocalStorage.getItem('auth_user');
      
      if (storedToken) {
        token.value = storedToken;
      }
      
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
        } catch (e) {
          console.error('Failed to parse user data from localStorage', e);
          clearAuth();
        }
      }
      
      isInitialized.value = true;
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearAuth();
    }
  };
  
  // Initialization is now handled by the auth plugin
  // to ensure proper timing and error handling

  // Set authentication data
  const setAuth = (userData: User, authToken: string): void => {
    user.value = { ...defaultUser, ...userData };
    token.value = authToken;
    error.value = null;
    
    safeLocalStorage.setItem('auth_token', authToken);
    safeLocalStorage.setItem('auth_user', JSON.stringify(user.value));
  };

  // Clear authentication data
  const clearAuth = (): void => {
    user.value = null;
    token.value = null;
    error.value = null;
    
    safeLocalStorage.removeItem('auth_token');
    safeLocalStorage.removeItem('auth_user');
    
    // Redirect to login if we're not already there
    if (process.client && router.currentRoute.value.path !== '/login') {
      router.push('/login');
    }
  };

  // Login method
  const login = async (credentials: { email: string; password: string }): Promise<{ data: any; error: string | null }> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await $fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Login failed');
      }
      
      if (response.data?.user && response.data?.token) {
        setAuth(response.data.user, response.data.token);
        return { data: response.data, error: null };
      }
      
      throw new Error('Invalid response from server');
    } catch (err: any) {
      const errorMessage = err.response?._data?.message || err.message || 'An error occurred during login';
      error.value = errorMessage;
      return { data: null, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Logout method
  const logout = async (): Promise<void> => {
    try {
      // Only try to call the logout endpoint if we have a token
      if (token.value) {
        await $fetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearAuth();
    }
  };

  // Register method
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ data: any; error: string | null }> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await $fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Registration failed');
      }
      
      if (response.data?.user && response.data?.token) {
        setAuth(response.data.user, response.data.token);
        return { data: response.data, error: null };
      }
      
      throw new Error('Invalid response from server');
    } catch (err: any) {
      const errorMessage = err.response?._data?.message || err.message || 'An error occurred during registration';
      error.value = errorMessage;
      return { data: null, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<{ data: any; error: string | null }> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await $fetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to send reset link');
      }
      
      return { data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?._data?.message || err.message || 'An error occurred';
      error.value = errorMessage;
      return { data: null, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Reset password
  const resetPassword = async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ data: any; error: string | null }> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await $fetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to reset password');
      }
      
      return { data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?._data?.message || err.message || 'An error occurred';
      error.value = errorMessage;
      return { data: null, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch current user
  const fetchUser = async (): Promise<User | null> => {
    if (!token.value) return null;
    
    try {
      const response = await $fetch('/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch user data');
      }
      
      user.value = response.data;
      safeLocalStorage.setItem('auth_user', JSON.stringify(user.value));
      
      return user.value;
    } catch (error) {
      console.error('Error fetching user data:', error);
      clearAuth();
      return null;
    }
  };

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) || false;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  // Check if user has all of the specified roles
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    return user.value?.permissions?.includes(permission) || false;
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    
    // Actions
    initAuth,
    setAuth,
    clearAuth,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    fetchUser,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
});

// Composable to use the auth store
export const useAuth = () => {
  const store = useAuthStore();
  
  // Initialize auth if not already done
  // This is now handled by the auth plugin
  
  return store;
};

// Default export for backward compatibility
export default useAuth;
