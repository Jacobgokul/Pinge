import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state placeholder
 * Shows when a list or section has no content
 */
function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-[hsl(var(--secondary))] p-4">
          <Icon className="h-8 w-8 text-[hsl(var(--foreground-muted))]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[hsl(var(--foreground-muted))]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { EmptyState };
