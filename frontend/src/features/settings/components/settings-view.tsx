import { Moon, Sun, Monitor, LogOut, User, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { useLogout } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

/**
 * Settings view with theme and account options
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
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Profile section */}
        <section className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex items-center gap-4">
            <UserAvatar name={user?.username || 'User'} size="xl" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{user?.username}</h2>
              <p className="text-sm text-[hsl(var(--foreground-muted))]">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </section>

        {/* Theme section */}
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <Label className="mb-3 block">Theme</Label>
            <div className="flex gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                    theme === option.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]'
                  )}
                >
                  <option.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications section */}
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              Notification settings coming soon
            </p>
          </div>
        </section>

        {/* Privacy section */}
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
            <h3 className="font-semibold">Privacy & Security</h3>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              Privacy settings coming soon
            </p>
          </div>
        </section>

        <Separator className="my-6" />

        {/* Logout */}
        <Button variant="destructive" className="w-full" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export { SettingsView };
