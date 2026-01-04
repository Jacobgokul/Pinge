import { useRef, useEffect } from 'react';
import { cn, formatMessageTime } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/avatar';
import type { GroupMessage } from '../types';

interface GroupMessageListProps {
  messages: GroupMessage[];
  currentUserId: string;
}

/**
 * Message list for group chats
 * Shows sender name and avatar for messages from others
 */
function GroupMessageList({ messages, currentUserId }: GroupMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  // Determine if we should show avatar (first message from user in sequence)
  const shouldShowAvatar = (index: number): boolean => {
    const current = messages[index];
    const prev = messages[index - 1];
    if (!prev) return true;
    return prev.sender_id !== current.sender_id;
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-2">
      <div className="flex flex-col gap-1">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === currentUserId;
          const showAvatar = shouldShowAvatar(index);

          return (
            <GroupMessageBubble
              key={message.message_id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
            />
          );
        })}
      </div>
    </div>
  );
}

interface GroupMessageBubbleProps {
  message: GroupMessage;
  isOwn: boolean;
  showAvatar: boolean;
}

/**
 * Individual group message bubble
 */
function GroupMessageBubble({ message, isOwn, showAvatar }: GroupMessageBubbleProps) {
  return (
    <div className={cn('flex items-end gap-2', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Avatar for received messages */}
      {showAvatar && !isOwn && (
        <UserAvatar name={message.sender_name} size="sm" />
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
        {showAvatar && !isOwn && (
          <p className="mb-1 text-xs font-medium text-[hsl(var(--primary))]">
            {message.sender_name}
          </p>
        )}

        {/* Message text */}
        <p className="break-words text-sm">{message.content}</p>

        {/* Time */}
        <div className={cn('mt-1 flex items-center gap-1', isOwn ? 'justify-end' : 'justify-start')}>
          <span
            className={cn(
              'text-xs',
              isOwn ? 'text-[hsl(var(--primary-foreground))]/70' : 'text-[hsl(var(--foreground-muted))]'
            )}
          >
            {formatMessageTime(message.sent_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

export { GroupMessageList };
