import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Toaster } from '@/components/ui/toast';
import { useInitializeWebSocket } from '@/features/auth/hooks';

/**
 * Root route - wraps entire application
 * Provides global layout and providers
 */
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  // Initialize WebSocket connection on app load if authenticated
  useInitializeWebSocket();

  return (
    <>
      <Outlet />
      <Toaster />
      {/* Dev tools only in development */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </>
  );
}
