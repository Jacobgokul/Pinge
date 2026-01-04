import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { AppLayout } from '@/components/layout/app-layout';

/**
 * Protected app layout route
 * Redirects unauthenticated users to login
 */
export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: AppLayoutWrapper,
});

function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
