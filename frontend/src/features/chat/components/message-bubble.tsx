import { cn, formatMessageTime } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

/**
 * Individual message bubble
 * Displays message content, time, and read status
 */
function MessageBubble({ message, isOwn, showAvatar = false }: MessageBubbleProps) {
  return (
    <div className={cn('flex items-end gap-2', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Avatar for received messages */}
      {showAvatar && !isOwn && (
        <UserAvatar name={message.sender?.username || 'User'} size="sm" />
      )}

      {/* Spacer when no avatar */}
      {!showAvatar && !isOwn && <div className="w-8" />}

      {/* Message content */}
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            : 'bg-[hsl(var(--secondary))]'
        )}
      >
        {/* Sender name for group messages */}
        {showAvatar && !isOwn && message.sender && (
          <p className="mb-1 text-xs font-medium text-[hsl(var(--primary))]">
            {message.sender.username}
          </p>
        )}

        {/* Message text */}
        <p className="break-words text-sm">{message.content}</p>

        {/* Time and status */}
        <div className={cn('mt-1 flex items-center gap-1', isOwn ? 'justify-end' : 'justify-start')}>
          <span
            className={cn(
              'text-xs',
              isOwn ? 'text-[hsl(var(--primary-foreground))]/70' : 'text-[hsl(var(--foreground-muted))]'
            )}
          >
            {formatMessageTime(message.created_at)}
          </span>

          {/* Read status for own messages */}
          {isOwn && (
            <span className="text-[hsl(var(--primary-foreground))]/70">
              {message.is_read ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { MessageBubble };
