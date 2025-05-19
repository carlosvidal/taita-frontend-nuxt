import { H3Error } from 'h3';
import { useNuxtApp } from '#app';

export class ApiError extends Error {
  statusCode: number;
  statusMessage: string;
  data?: any;
  fatal?: boolean;

  constructor(error: {
    statusCode: number;
    statusMessage: string;
    data?: any;
    fatal?: boolean;
  }) {
    super(error.statusMessage);
    this.name = 'ApiError';
    this.statusCode = error.statusCode;
    this.statusMessage = error.statusMessage;
    this.data = error.data;
    this.fatal = error.fatal ?? false;
  }

  static fromH3Error(error: H3Error): ApiError {
    return new ApiError({
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: error.data,
      fatal: error.fatal
    });
  }
}

/**
 * Handles API errors consistently across the application
 * @param error - The error object from the API call
 * @param defaultMessage - Default error message if none is provided
 * @param showToast - Whether to show a toast notification
 * @returns The error message
 */
export function handleApiError(
  error: any,
  defaultMessage = 'An error occurred',
  showToast = true
): string {
  const toast = useToast?.();
  let errorMessage = defaultMessage;
  let statusCode: number | null = null;

  // Handle different error types
  if (error instanceof ApiError) {
    errorMessage = error.statusMessage || defaultMessage;
    statusCode = error.statusCode;
  } else if (error?.response) {
    // Handle HTTP errors
    const { status, data } = error.response;
    statusCode = status;
    
    if (data?.message) {
      errorMessage = data.message;
    } else if (data?.errors) {
      errorMessage = Object.values(data.errors).flat().join(' ');
    } else if (status === 401) {
      errorMessage = 'You need to be logged in to perform this action';
    } else if (status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (status === 404) {
      errorMessage = 'The requested resource was not found';
    } else if (status >= 500) {
      errorMessage = 'A server error occurred. Please try again later.';
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // Show toast notification if enabled
  if (showToast) {
    try {
      const nuxtApp = process.client ? useNuxtApp() : null;
      const toast = nuxtApp?.$toast || window?.$toast;
      
      if (toast?.error) {
        toast.error({
          title: 'Error',
          description: errorMessage,
          duration: 5000,
        });
      } else if (process.client && !toast) {
        console.warn('Toast plugin not available. Install a toast plugin like vue-toastification or nuxt-toast.');
      }
    } catch (toastError) {
      console.error('Error showing toast:', toastError);
    }
  }

  // Log the error for debugging
  console.error('API Error:', {
    message: errorMessage,
    statusCode,
    error,
  });

  return errorMessage;
}

/**
 * Creates a function to handle API errors for a specific context
 * @param context - The context where the error occurred (e.g., 'fetching posts')
 * @param defaultMessage - Default error message
 * @returns A function that handles the error
 */
export function createErrorHandler(context: string, defaultMessage?: string) {
  return (error: any) => {
    const message = defaultMessage || `An error occurred while ${context}`;
    return handleApiError(error, message);
  };
}

/**
 * Handles form validation errors
 * @param error - The error object from the API
 * @param setFieldError - Function to set field errors (e.g., from FormKit or VeeValidate)
 * @returns Whether the error was a validation error
 */
export function handleValidationError(
  error: any,
  setFieldError: (field: string, message: string) => void
): boolean {
  if (error?.response?.status === 422 && error.response.data?.errors) {
    const { errors } = error.response.data;
    
    // Handle Laravel-style validation errors
    Object.entries(errors).forEach(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : String(messages);
      setFieldError(field, message);
    });
    
    return true;
  }
  
  return false;
}

export default {
  ApiError,
  handleApiError,
  createErrorHandler,
  handleValidationError,
};
