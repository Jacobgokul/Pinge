import { cn, formatRelativeTime } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/avatar';
import { UsersRound } from 'lucide-react';

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
 * Single conversation item card
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
        'flex w-full items-center gap-3 rounded-xl p-3 text-left',
        'bg-[hsl(var(--card))] border border-transparent',
        'transition-all duration-200',
        isActive
          ? 'border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] shadow-sm'
          : 'hover:bg-[hsl(var(--secondary))] hover:border-[hsl(var(--border))]'
      )}
    >
      {/* Avatar */}
      <div className="relative">
        {isGroup ? (
          <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center">
            <UsersRound className="w-6 h-6 text-white" />
          </div>
        ) : (
          <UserAvatar
            name={name}
            src={avatar}
            size="md"
            status={isOnline ? 'online' : 'offline'}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn(
            'truncate font-semibold',
            isActive && 'text-[hsl(var(--primary))]'
          )}>
            {name}
          </h3>
          {lastMessageTime && (
            <span className="text-xs text-[hsl(var(--foreground-muted))] shrink-0">
              {formatRelativeTime(lastMessageTime)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            'truncate text-sm',
            unreadCount > 0
              ? 'text-[hsl(var(--foreground))] font-medium'
              : 'text-[hsl(var(--foreground-muted))]'
          )}>
            {lastMessage || 'No messages yet'}
          </p>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span
              className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 shrink-0',
                'bg-gradient-primary text-xs font-semibold text-white'
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
