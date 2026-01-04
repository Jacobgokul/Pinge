import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';

/**
 * Error fallback for react-error-boundary
 * Shows when a component throws an error
 */
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center" role="alert">
      <div className="mb-4 rounded-full bg-[hsl(var(--destructive))]/10 p-3">
        <AlertTriangle className="h-6 w-6 text-[hsl(var(--destructive))]" />
      </div>
      <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
      <p className="mb-4 max-w-md text-sm text-[hsl(var(--foreground-muted))]">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

/**
 * Full page error state
 */
function PageError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[hsl(var(--background))] p-6">
      <div className="mb-6 rounded-full bg-[hsl(var(--destructive))]/10 p-4">
        <AlertTriangle className="h-10 w-10 text-[hsl(var(--destructive))]" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Oops! Something went wrong</h1>
      <p className="mb-6 max-w-md text-center text-[hsl(var(--foreground-muted))]">
        {error.message || 'We encountered an unexpected error. Please try again.'}
      </p>
      <Button onClick={resetErrorBoundary}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Reload page
      </Button>
    </div>
  );
}

export { ErrorFallback, PageError };
