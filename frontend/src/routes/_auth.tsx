import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Auth layout route
 * Redirects authenticated users to main app
 */
export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      throw redirect({ to: '/home' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4 sm:p-6">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--accent-coral) / 0.08), transparent 60%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[50%] h-[40%] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--accent-cyan) / 0.06), transparent 60%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
