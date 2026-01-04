import { useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import { MessageBubble } from './message-bubble';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isGroup?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * Virtualized message list for performance
 * Handles infinite scroll for loading older messages
 */
function MessageList({
  messages,
  currentUserId,
  isGroup = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);

  // Virtual list for performance with many messages
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  // Scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    // New message added
    if (messages.length > prevLengthRef.current) {
      const isNearBottom = parent.scrollHeight - parent.scrollTop - parent.clientHeight < 100;

      // Auto-scroll only if user is near bottom or sent the message
      if (isNearBottom) {
        parent.scrollTop = parent.scrollHeight;
      }
    }

    prevLengthRef.current = messages.length;
  }, [messages.length]);

  // Load more when scrolling to top
  const handleScroll = useCallback(() => {
    const parent = parentRef.current;
    if (!parent || !hasMore || isLoadingMore) return;

    // Load more when within 100px of top
    if (parent.scrollTop < 100) {
      onLoadMore?.();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Determine if we should show avatar (first message from user in sequence)
  const shouldShowAvatar = (index: number): boolean => {
    if (!isGroup) return false;

    const current = messages[index];
    const prev = messages[index + 1]; // Messages are newest first

    if (!prev) return true;
    return prev.sender_id !== current.sender_id;
  };

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-2"
    >
      {/* Loading indicator for older messages */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--foreground-muted))]" />
        </div>
      )}

      {/* Virtual list container */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          // Messages come newest-first, display oldest-first
          const index = messages.length - 1 - virtualRow.index;
          const message = messages[index];
          const isOwn = message.sender_id === currentUserId;

          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="py-1"
            >
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showAvatar={shouldShowAvatar(index)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Simple non-virtualized message list for small conversations
 */
function SimpleMessageList({
  messages,
  currentUserId,
  isGroup = false,
}: Omit<MessageListProps, 'hasMore' | 'isLoadingMore' | 'onLoadMore'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  const shouldShowAvatar = (index: number): boolean => {
    if (!isGroup) return false;
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
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              showAvatar={shouldShowAvatar(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

export { MessageList, SimpleMessageList };
