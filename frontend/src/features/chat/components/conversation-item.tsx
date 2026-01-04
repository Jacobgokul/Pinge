import { cn, formatRelativeTime } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/avatar';

interface ConversationItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isActive?: boolean;
  isGroup?: boolean;
  onClick?: () => void;
}

/**
 * Single conversation item in the list
 */
function ConversationItem({
  name,
  avatar,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
  isOnline = false,
  isActive = false,
  isGroup = false,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg p-3 text-left',
        'transition-colors hover:bg-[hsl(var(--secondary))]',
        isActive && 'bg-[hsl(var(--secondary))]'
      )}
    >
      {/* Avatar */}
      <UserAvatar
        name={name}
        src={avatar}
        size="md"
        status={isGroup ? undefined : (isOnline ? 'online' : 'offline')}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-medium">{name}</h3>
          {lastMessageTime && (
            <span className="text-xs text-[hsl(var(--foreground-muted))]">
              {formatRelativeTime(lastMessageTime)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="truncate text-sm text-[hsl(var(--foreground-muted))]">
            {lastMessage || 'No messages yet'}
          </p>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span
              className={cn(
                'ml-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
                'bg-[hsl(var(--primary))] text-xs font-medium text-[hsl(var(--primary-foreground))]'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export { ConversationItem };
