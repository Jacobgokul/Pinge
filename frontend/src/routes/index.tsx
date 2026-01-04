import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Index route - redirects based on auth state
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      throw redirect({ to: '/chat' });
    }
    throw redirect({ to: '/login' });
  },
});
