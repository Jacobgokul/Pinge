import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn, getInitials } from '@/lib/utils';

/**
 * Avatar root container
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * Avatar image
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * Avatar fallback (shown when image fails to load)
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full',
      'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground-secondary))]',
      'text-sm font-medium',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Online status indicator
 */
interface OnlineIndicatorProps {
  status: 'online' | 'offline' | 'away';
  className?: string;
}

function OnlineIndicator({ status, className }: OnlineIndicatorProps) {
  const statusColors = {
    online: 'bg-[hsl(var(--online))]',
    offline: 'bg-[hsl(var(--offline))]',
    away: 'bg-[hsl(var(--away))]',
  };

  return (
    <span
      className={cn(
        'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[hsl(var(--background))]',
        statusColors[status],
        className
      )}
      aria-label={`Status: ${status}`}
    />
  );
}

/**
 * Convenience component combining Avatar with common patterns
 */
interface UserAvatarProps {
  src?: string;
  name: string;
  status?: 'online' | 'offline' | 'away';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

function UserAvatar({ src, name, status, size = 'md', className }: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
      {status && <OnlineIndicator status={status} />}
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback, OnlineIndicator, UserAvatar };
