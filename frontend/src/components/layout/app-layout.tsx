import { cn } from '@/lib/utils';
import { FloatingDock } from './floating-dock';
import { useUnreadCount } from '@/features/chat/hooks';
import { useContactRequests } from '@/features/contacts/hooks';
import { useGlobalSubscriptions } from '@/hooks/use-global-subscriptions';

interface AppLayoutProps {
  children: React.ReactNode;
  /** Hide dock for immersive views like chat */
  hideDock?: boolean;
}

/**
 * Main app layout with floating dock navigation
 * Clean, modern design without traditional sidebar
 */
function AppLayout({ children, hideDock = false }: AppLayoutProps) {
  // Global WebSocket subscriptions for real-time updates
  useGlobalSubscriptions();

  // Get real-time unread counts
  const { data: unreadData } = useUnreadCount();
  const { data: contactRequests } = useContactRequests();

  const unreadMessages = (unreadData?.total_unread || 0) + (unreadData?.total_group_unread || 0);
  const pendingRequests = contactRequests?.length || 0;

  return (
    <div className="relative min-h-screen bg-[hsl(var(--background))]">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] bg-orb bg-orb-coral opacity-[0.03]"
          style={{ filter: 'blur(100px)' }}
        />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-orb bg-orb-cyan opacity-[0.03]"
          style={{ filter: 'blur(100px)' }}
        />
      </div>

      {/* Main content */}
      <main
        className={cn(
          'relative z-10 min-h-screen',
          // Add bottom padding for dock
          !hideDock && 'pb-24 sm:pb-28'
        )}
      >
        {children}
      </main>

      {/* Floating navigation dock */}
      {!hideDock && (
        <FloatingDock
          unreadCount={unreadMessages}
          notificationCount={pendingRequests}
        />
      )}
    </div>
  );
}

export { AppLayout };
