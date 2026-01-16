import { createFileRoute } from '@tanstack/react-router';
import { Bell, UserPlus, Newspaper } from 'lucide-react';
import { useContactRequests } from '@/features/contacts/hooks';
import { ContactRequestItem } from '@/features/contacts/components/contact-request-item';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_app/notifications')({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: contactRequests, isLoading } = useContactRequests();

  const pendingRequests = contactRequests?.filter(r => r.status === 'Pending') || [];

  return (
    <div className="container-app py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
        </div>
        <p className="text-[hsl(var(--foreground-muted))]">
          Stay updated with contact requests and activity
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {/* Contact Requests Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-[hsl(var(--accent-coral))]" />
            <h2 className="text-lg font-semibold">Contact Requests</h2>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[hsl(var(--accent-coral))] text-white">
                {pendingRequests.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-[hsl(var(--secondary))] animate-pulse"
                />
              ))}
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <ContactRequestItem key={request.request_id} request={request} />
              ))}
            </div>
          ) : (
            <EmptySection
              icon={UserPlus}
              title="No pending requests"
              description="When someone sends you a contact request, it will appear here"
            />
          )}
        </section>

        {/* Feeds Section - Placeholder */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-[hsl(var(--accent-cyan))]" />
            <h2 className="text-lg font-semibold">Activity Feed</h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--foreground-muted))]">
              Coming Soon
            </span>
          </div>

          <EmptySection
            icon={Newspaper}
            title="Activity feed coming soon"
            description="See updates from your contacts and groups in one place"
            variant="muted"
          />
        </section>
      </div>
    </div>
  );
}

interface EmptySectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  variant?: 'default' | 'muted';
}

function EmptySection({ icon: Icon, title, description, variant = 'default' }: EmptySectionProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed',
        variant === 'muted'
          ? 'border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.3)]'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mb-3',
          variant === 'muted'
            ? 'bg-[hsl(var(--secondary))]'
            : 'bg-[hsl(var(--secondary))]'
        )}
      >
        <Icon className="w-6 h-6 text-[hsl(var(--foreground-muted))]" />
      </div>
      <h3 className="font-medium text-[hsl(var(--foreground))] mb-1">{title}</h3>
      <p className="text-sm text-[hsl(var(--foreground-muted))] text-center max-w-xs">
        {description}
      </p>
    </div>
  );
}
