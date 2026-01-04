import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from './services';
import { wsManager } from '@/services/websocket/manager';

/**
 * Hook for login mutation
 */
export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      // Store token
      setAuth(data.access_token, null);

      // Connect WebSocket for real-time messaging
      wsManager.connect(data.access_token);

      // Fetch user profile
      try {
        const user = await authService.getMe();
        setUser(user);
      } catch {
        // Continue even if user fetch fails
      }

      toast.success('Welcome back!');
      navigate({ to: '/chat' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

/**
 * Hook for registration mutation
 */
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Account created! Please sign in.');
      navigate({ to: '/login' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return () => {
    // Disconnect WebSocket
    wsManager.disconnect();

    logout();
    queryClient.clear();
    navigate({ to: '/login' });
    toast.success('Logged out');
  };
}

/**
 * Hook for fetching current user
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: async () => {
      const user = await authService.getMe();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to initialize WebSocket connection on app load
 * Call this in the root layout/app component
 */
export function useInitializeWebSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Connect WebSocket when authenticated and token exists
  if (isAuthenticated && accessToken && !wsManager.isConnected) {
    wsManager.connect(accessToken);
  }
}
