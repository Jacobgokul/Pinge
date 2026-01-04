import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Use /api prefix to go through Vite proxy in dev, or direct URL in production
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Axios instance configured for the Pinge API
 * Automatically attaches auth token and handles 401 responses
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request interceptor - attach auth token
 */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Get token from localStorage (set by auth store)
  const authStorage = localStorage.getItem('auth-storage');

  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    } catch {
      // Invalid JSON in storage, ignore
    }
  }

  return config;
});

/**
 * Response interceptor - unwrap data and handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps responses in { success: true, data: payload }
    // Unwrap the data property for convenience
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },

  (error: AxiosError) => {
    // Unauthorized - clear auth and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }

    // Extract error message from response
    const message = (error.response?.data as { detail?: string })?.detail || error.message;
    return Promise.reject(new Error(message));
  }
);

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
