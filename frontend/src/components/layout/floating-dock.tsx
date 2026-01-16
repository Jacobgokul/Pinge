import { Link, useLocation } from '@tanstack/react-router';
import { Home, MessageSquare, Users, UsersRound, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  badgeKey?: 'chat' | 'notifications';
}

const navItems: NavItem[] = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/chat', icon: MessageSquare, label: 'Chats', badgeKey: 'chat' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/groups', icon: UsersRound, label: 'Groups' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badgeKey: 'notifications' },
];

interface FloatingDockProps {
  unreadCount?: number;
  notificationCount?: number;
}

/**
 * Floating dock navigation - macOS style
 * Always visible at bottom of screen
 */
function FloatingDock({ unreadCount = 0, notificationCount = 0 }: FloatingDockProps) {
  const location = useLocation();

  const getBadgeCount = (badgeKey?: 'chat' | 'notifications') => {
    if (badgeKey === 'chat') return unreadCount;
    if (badgeKey === 'notifications') return notificationCount;
    return 0;
  };

  return (
    <nav
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-1.5 p-2.5',
        'bg-[hsl(var(--card))] border border-[hsl(var(--border))]',
        'rounded-[1.25rem] shadow-lg',
        // Responsive sizing
        'sm:gap-2 sm:p-3 sm:rounded-[1.5rem]',
        // Glass effect
        'backdrop-blur-xl'
      )}
      style={{
        boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.to ||
          (item.to !== '/home' && location.pathname.startsWith(item.to));
        const badgeCount = getBadgeCount(item.badgeKey);
        const showBadge = badgeCount > 0;

        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'relative flex items-center justify-center',
              'w-11 h-11 sm:w-12 sm:h-12',
              'rounded-xl sm:rounded-[0.875rem]',
              'transition-all duration-200 ease-out',
              isActive
                ? 'bg-gradient-primary text-white shadow-md dock-item-active'
                : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5 sm:w-[1.375rem] sm:h-[1.375rem]" />

            {/* Notification badge */}
            {showBadge && (
              <span
                className={cn(
                  'absolute -top-1 -right-1',
                  'min-w-[1.125rem] h-[1.125rem] px-1',
                  'flex items-center justify-center',
                  'bg-[hsl(var(--accent-coral))] rounded-full',
                  'text-[0.625rem] font-bold text-white',
                  'ring-2 ring-[hsl(var(--card))]'
                )}
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export { FloatingDock };
