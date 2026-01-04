import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toast container - renders notifications
 * Uses Sonner library for toast notifications
 * Place this once in your app root
 */
function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            'group flex items-center gap-3 w-full p-4 rounded-lg shadow-lg',
            'bg-[hsl(var(--card))] border border-[hsl(var(--border))]',
            'text-[hsl(var(--foreground))]',
          ].join(' '),
          title: 'text-sm font-semibold',
          description: 'text-sm text-[hsl(var(--foreground-muted))]',
          actionButton: [
            'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
            'text-xs font-medium px-3 py-1.5 rounded-md',
          ].join(' '),
          cancelButton: [
            'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
            'text-xs font-medium px-3 py-1.5 rounded-md',
          ].join(' '),
          success: 'border-l-4 border-l-[hsl(var(--success))]',
          error: 'border-l-4 border-l-[hsl(var(--destructive))]',
          warning: 'border-l-4 border-l-[hsl(var(--warning))]',
          info: 'border-l-4 border-l-[hsl(var(--primary))]',
        },
      }}
    />
  );
}

// Re-export toast function for easy imports
export { toast } from 'sonner';
export { Toaster };
