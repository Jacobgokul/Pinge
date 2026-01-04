import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/features/auth/types';

/**
 * Auth state interface
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (accessToken: string, user: User | null) => void;
  setUser: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

/**
 * Auth store with persistence
 * Stores user info and JWT token in localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (accessToken, user) =>
        set({
          accessToken,
          user,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
