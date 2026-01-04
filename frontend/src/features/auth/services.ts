import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from './types';

/**
 * Auth API service functions
 */
export const authService = {
  /**
   * Login with email and password
   * Backend uses OAuth2 form data
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', data.email); // OAuth2 uses 'username' field
    formData.append('password', data.password);

    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<{ message: string; user_id: string }> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Get all users (for searching contacts)
   */
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>(API_ENDPOINTS.AUTH.USERS);
    return response.data;
  },

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
