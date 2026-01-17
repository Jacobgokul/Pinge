import { Link } from '@tanstack/react-router';
import { Moon, Sun, Monitor, LogOut, User, Bell, Shield, Palette, ChevronRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { useLogout } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

/**
 * Settings view with modern card-based design
 */
function SettingsView() {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useThemeStore();
  const logout = useLogout();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 sm:px-6">
        <div className="pb-6 space-y-6">
          {/* Profile section */}
          <Link
            to="/settings"
            className="block bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5 transition-all duration-200 hover:border-[hsl(var(--primary)/0.3)] hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <UserAvatar name={user?.username || 'User'} size="xl" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold truncate">{user?.username}</h2>
                <p className="text-sm text-[hsl(var(--foreground-muted))] flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {user?.email}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
            </div>
          </Link>

          {/* Theme section */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Appearance</h3>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Choose your theme</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200',
                    theme === option.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--secondary))]'
                  )}
                >
                  <option.icon
                    className={cn(
                      'h-6 w-6 transition-colors',
                      theme === option.value
                        ? 'text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--foreground-muted))]'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      theme === option.value && 'text-[hsl(var(--primary))]'
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings list */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
            {/* Notifications */}
            <SettingsItem
              icon={Bell}
              iconBg="bg-[hsl(var(--accent-pink))]"
              title="Notifications"
              description="Manage your alerts"
            />

            {/* Privacy */}
            <SettingsItem
              icon={Shield}
              iconBg="bg-[hsl(var(--accent-purple))]"
              title="Privacy & Security"
              description="Control your data"
              isLast
            />
          </div>

          {/* Account section */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
            <SettingsItem
              icon={User}
              iconBg="bg-[hsl(var(--accent-gold))]"
              title="Account"
              description="Manage your account settings"
              isLast
            />
          </div>

          {/* Logout button */}
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl border-[hsl(var(--destructive)/0.3)] hover:bg-[hsl(var(--destructive)/0.1)] hover:border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] font-semibold"
            onClick={logout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>

          {/* Version info */}
          <p className="text-center text-sm text-[hsl(var(--foreground-muted))]">
            Pinge v1.0.0
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  isLast?: boolean;
}

function SettingsItem({ icon: Icon, iconBg, title, description, isLast = false }: SettingsItemProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-4 p-4 transition-colors hover:bg-[hsl(var(--secondary))]',
        !isLast && 'border-b border-[hsl(var(--border))]'
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 text-left">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
    </button>
  );
}

export { SettingsView };
