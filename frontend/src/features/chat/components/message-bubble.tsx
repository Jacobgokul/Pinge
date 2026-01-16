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
 * Individual message bubble with gradient styling
 */
function MessageBubble({ message, isOwn, showAvatar = false }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex items-end gap-2 message-animate',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar for received messages */}
      {showAvatar && !isOwn && (
        <UserAvatar name={message.sender?.username || 'User'} size="sm" />
      )}

      {/* Spacer when no avatar */}
      {!showAvatar && !isOwn && <div className="w-8" />}

      {/* Message content */}
      <div
        className={cn(
          'max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5',
          isOwn
            ? 'bg-gradient-primary text-white rounded-br-md'
            : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-bl-md'
        )}
      >
        {/* Sender name for group messages */}
        {showAvatar && !isOwn && message.sender && (
          <p className="mb-1 text-xs font-semibold text-[hsl(var(--primary))]">
            {message.sender.username}
          </p>
        )}

        {/* Message text */}
        <p className={cn(
          'break-words text-[0.9375rem] leading-relaxed',
          !isOwn && 'text-[hsl(var(--foreground))]'
        )}>
          {message.content}
        </p>

        {/* Time and status */}
        <div
          className={cn(
            'mt-1 flex items-center gap-1.5',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[0.6875rem]',
              isOwn ? 'text-white/70' : 'text-[hsl(var(--foreground-muted))]'
            )}
          >
            {formatMessageTime(message.created_at)}
          </span>

          {/* Read status for own messages */}
          {isOwn && (
            <span className="text-white/70">
              {message.is_read ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { MessageBubble };
