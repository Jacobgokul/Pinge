import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configuration
 * Handles caching, refetching, and error handling for server state
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,

      // Keep unused data in cache for 30 minutes
      gcTime: 1000 * 60 * 30,

      // Retry failed requests once
      retry: 1,

      // Don't refetch when window regains focus
      refetchOnWindowFocus: false,

      // Don't refetch on reconnect automatically
      refetchOnReconnect: false,
    },
    mutations: {
      // Don't retry mutations
      retry: 0,
    },
  },
});
