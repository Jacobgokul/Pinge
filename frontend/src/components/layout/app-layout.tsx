import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { MessageSquare, Users, UsersRound, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Navigation items
const navItems = [
  { to: '/chat', icon: MessageSquare, label: 'Chats' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/groups', icon: UsersRound, label: 'Groups' },
  { to: '/settings', icon: Settings, label: 'Settings' },
] as const;

/**
 * Main app layout with sidebar navigation
 * Responsive: drawer on mobile, fixed sidebar on desktop
 */
function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-[hsl(var(--background))]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col',
          'bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]',
          'transform transition-transform duration-200 ease-in-out',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
          <span className="text-xl font-bold text-[hsl(var(--primary))]">Pinge</span>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                  'transition-colors hover:bg-[hsl(var(--secondary))]',
                  isActive
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-[hsl(var(--foreground-secondary))]'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[hsl(var(--border))] p-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={user?.username || 'User'} size="sm" status="online" />
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-[hsl(var(--foreground-muted))] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-4 border-b border-[hsl(var(--border))] px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">Pinge</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

export { AppLayout };
