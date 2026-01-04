/**
 * Auth types - matches backend auth_schema.py
 */

// Gender enum matching backend
export type Gender = 'Male' | 'Female' | 'Other';

/**
 * User response from backend
 */
export interface User {
  user_id: string;
  username: string;
  email: string;
  gender: Gender;
  created_at: string;
  is_active: boolean;
}

/**
 * Login request - uses OAuth2 form
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  gender: Gender;
  country: string;
}

/**
 * Auth response from backend
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
}
