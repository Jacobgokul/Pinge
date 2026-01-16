import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  Mail,
  Calendar,
  User as UserIcon,
  Edit3,
  Shield,
  Bell,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 sm:px-6">
        <div className="pb-6 space-y-6">
          {/* Profile header card */}
          <div className="bg-gradient-primary rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar with edit button */}
              <div className="relative">
                <UserAvatar name={user?.username || 'User'} size="2xl" />
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold">{user?.username}</h2>
                <p className="text-white/80 flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                    {user?.gender}
                  </span>
                  {user?.is_active && (
                    <span className="px-3 py-1 rounded-full bg-[hsl(var(--success))] text-sm font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Edit button */}
              <Button
                variant="secondary"
                className="rounded-xl bg-white/20 hover:bg-white/30 border-0 text-white"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Profile info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard
              icon={UserIcon}
              iconBg="bg-[hsl(var(--accent-cyan))]"
              label="Username"
              value={user?.username || 'Not set'}
            />
            <InfoCard
              icon={Mail}
              iconBg="bg-[hsl(var(--accent-coral))]"
              label="Email"
              value={user?.email || 'Not set'}
            />
            <InfoCard
              icon={Calendar}
              iconBg="bg-[hsl(var(--accent-purple))]"
              label="Member since"
              value={user?.created_at ? formatDate(user.created_at) : 'Unknown'}
            />
            <InfoCard
              icon={Shield}
              iconBg="bg-[hsl(var(--accent-gold))]"
              label="Account status"
              value={user?.is_active ? 'Active' : 'Inactive'}
              valueColor={user?.is_active ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}
            />
          </div>

          {/* Quick actions */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickAction
                icon={Edit3}
                label="Edit Profile"
                gradient="bg-gradient-primary"
              />
              <QuickAction
                icon={Bell}
                label="Notifications"
                gradient="bg-gradient-pink"
              />
              <QuickAction
                icon={Shield}
                label="Privacy"
                gradient="bg-gradient-purple"
              />
              <Link to="/settings" className="block">
                <QuickAction
                  icon={UserIcon}
                  label="Settings"
                  gradient="bg-gradient-accent"
                />
              </Link>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
}

function InfoCard({ icon: Icon, iconBg, label, value, valueColor }: InfoCardProps) {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-4 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[hsl(var(--foreground-muted))]">{label}</p>
        <p className={cn('font-semibold truncate', valueColor)}>{value}</p>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  gradient: string;
}

function QuickAction({ icon: Icon, label, gradient }: QuickActionProps) {
  return (
    <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.8)] transition-colors">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', gradient)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
