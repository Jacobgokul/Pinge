import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ErrorBoundary } from 'react-error-boundary';

import { queryClient } from '@/lib/query-client';
import { routeTree } from './routeTree.gen';
import { PageError, PageLoader } from '@/components/common';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useThemeStore, applyTheme } from '@/stores/theme.store';

import '@/styles/globals.css';

// Create router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: PageLoader,
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Apply theme on load
const theme = useThemeStore.getState().theme;
applyTheme(theme);

// Subscribe to theme changes
useThemeStore.subscribe((state) => {
  applyTheme(state.theme);
});

// Root element
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={PageError}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
