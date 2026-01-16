import { createFileRoute, Link } from '@tanstack/react-router';
import {
  MessageSquare,
  Users,
  UsersRound,
  ArrowRight,
  Bell,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { useContacts, useContactRequests } from '@/features/contacts/hooks';
import { useGroups } from '@/features/groups/hooks';
import { useUnreadCount } from '@/features/chat/hooks';

export const Route = createFileRoute('/_app/home')({
  component: HomePage,
});

function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { data: contacts } = useContacts();
  const { data: contactRequests } = useContactRequests();
  const { data: groups } = useGroups();
  const { data: unreadData } = useUnreadCount();

  const totalUnread = (unreadData?.total_unread || 0) + (unreadData?.total_group_unread || 0);
  const contactsCount = contacts?.length || 0;
  const groupsCount = groups?.length || 0;
  const pendingRequests = contactRequests?.length || 0;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="container-app py-6 sm:py-8">
      {/* Header with greeting */}
      <header className="mb-8">
        <div className="flex items-center gap-4">
          <Link to="/settings">
            <UserAvatar name={user?.username || 'User'} size="xl" />
          </Link>
          <div>
            <p className="text-sm text-[hsl(var(--foreground-muted))]">{getGreeting()}</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{user?.username || 'User'}</h1>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {/* Main Stats Card - Spans 2 columns */}
        <div className="col-span-2 bg-gradient-primary rounded-[1.5rem] p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Your Activity</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl sm:text-4xl font-bold">{contactsCount}</p>
                <p className="text-sm opacity-80">Contacts</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold">{groupsCount}</p>
                <p className="text-sm opacity-80">Groups</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold">{totalUnread}</p>
                <p className="text-sm opacity-80">Unread</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Chat Card */}
        <Link
          to="/chat"
          className="col-span-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[1.25rem] p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-[hsl(var(--primary)/0.3)] group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Messages</h3>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">
            {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
          </p>
          <ArrowRight className="w-5 h-5 text-[hsl(var(--foreground-muted))] mt-3 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Contacts Card */}
        <Link
          to="/contacts"
          className="col-span-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[1.25rem] p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-[hsl(var(--primary)/0.3)] group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-pink flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Contacts</h3>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">
            {pendingRequests > 0 ? `${pendingRequests} pending` : `${contactsCount} friends`}
          </p>
          <ArrowRight className="w-5 h-5 text-[hsl(var(--foreground-muted))] mt-3 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Groups Card */}
        <Link
          to="/groups"
          className="col-span-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[1.25rem] p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-[hsl(var(--primary)/0.3)] group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center mb-4">
            <UsersRound className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Groups</h3>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{groupsCount} groups</p>
          <ArrowRight className="w-5 h-5 text-[hsl(var(--foreground-muted))] mt-3 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Notifications Card */}
        <div className="col-span-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[1.25rem] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
            </div>
            {pendingRequests > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--primary))] text-white text-xs font-semibold">
                {pendingRequests}
              </span>
            )}
          </div>
          <h3 className="font-semibold mb-1">Notifications</h3>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">
            {pendingRequests > 0 ? 'New requests' : 'Nothing new'}
          </p>
        </div>

        {/* Activity Summary - Spans 2 columns on large screens */}
        <div className="col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[1.25rem] p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--success)/0.1)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <h3 className="font-semibold">Quick Stats</h3>
              <p className="text-sm text-[hsl(var(--foreground-muted))]">Your messaging overview</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <StatItem label="Total Chats" value={contactsCount + groupsCount} />
            <StatItem label="Contacts" value={contactsCount} />
            <StatItem label="Groups" value={groupsCount} />
            <StatItem label="Unread" value={totalUnread} highlight={totalUnread > 0} />
          </div>
        </div>
      </div>

      {/* Welcome Message for new users */}
      {contactsCount === 0 && groupsCount === 0 && (
        <div className="mt-6 bg-gradient-to-r from-[hsl(var(--accent-coral)/0.1)] to-[hsl(var(--accent-cyan)/0.1)] border border-[hsl(var(--border))] rounded-[1.25rem] p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Welcome to Pinge!</h3>
          <p className="text-[hsl(var(--foreground-muted))] mb-4">
            Start by adding contacts or creating a group to begin messaging.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/contacts"
              className="px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Add Contacts
            </Link>
            <Link
              to="/groups"
              className="px-4 py-2 bg-[hsl(var(--secondary))] rounded-xl font-medium hover:bg-[hsl(var(--secondary)/0.8)] transition-colors"
            >
              Create Group
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="text-center p-3 rounded-xl bg-[hsl(var(--secondary)/0.5)]">
      <p
        className={cn(
          'text-2xl font-bold',
          highlight && 'text-[hsl(var(--primary))]'
        )}
      >
        {value}
      </p>
      <p className="text-xs text-[hsl(var(--foreground-muted))]">{label}</p>
    </div>
  );
}
