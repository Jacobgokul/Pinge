import { useEffect, useCallback } from 'react';
import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { wsManager } from '@/services/websocket/manager';
import { chatService } from './services';
import type { DirectMessage } from './types';

// WebSocket event type from backend
interface NewDirectMessageEvent {
  event: string;
  data: {
    message_id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    sent_at: string;
    total_unread: number;
  };
}

/**
 * Hook for fetching direct messages with pagination
 */
export function useDirectMessages(contactId: string | null) {
  return useInfiniteQuery({
    queryKey: contactId ? QUERY_KEYS.MESSAGES.DIRECT(contactId) : ['messages', 'direct', null],
    queryFn: async ({ pageParam = 0 }) => {
      if (!contactId) return [];
      return chatService.getDirectMessages(contactId, 50, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 50) {
        return allPages.length * 50;
      }
      return undefined;
    },
    enabled: !!contactId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for fetching unread count summary
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: QUERY_KEYS.MESSAGES.UNREAD_COUNT,
    queryFn: chatService.getUnreadCount,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for sending direct messages
 */
export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatService.sendDirectMessage,
    onSuccess: (newMessage) => {
      // Update the messages cache - add to BEGINNING of first page (API returns newest first)
      // After reversing for display, this will appear at the bottom (newest)
      const queryKey = QUERY_KEYS.MESSAGES.DIRECT(newMessage.receiver_id);
      queryClient.setQueryData(queryKey, (oldData: { pages: DirectMessage[][]; pageParams: number[] } | undefined) => {
        if (!oldData) return { pages: [[newMessage]], pageParams: [0] };
        return {
          ...oldData,
          pages: [[newMessage, ...oldData.pages[0]], ...oldData.pages.slice(1)],
        };
      });

      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.UNREAD_COUNT });
    },
  });
}

/**
 * Hook for marking messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => chatService.markContactAsRead(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.UNREAD_COUNT });
    },
  });
}

/**
 * Hook for real-time message updates via WebSocket
 * Automatically updates the messages cache when new messages arrive
 */
export function useMessageSubscription(_activeContactId?: string | null) {
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback(
    (event: NewDirectMessageEvent) => {
      if (event.event !== 'new_direct_message') return;

      const { data } = event;

      // Convert to DirectMessage format
      const newMessage: DirectMessage = {
        message_id: data.message_id,
        sender_id: data.sender_id,
        receiver_id: '', // We are the receiver
        content: data.content,
        is_read: false,
        sent_at: data.sent_at,
      };

      // Update messages cache for this contact
      const queryKey = QUERY_KEYS.MESSAGES.DIRECT(data.sender_id);
      queryClient.setQueryData(queryKey, (oldData: { pages: DirectMessage[][]; pageParams: number[] } | undefined) => {
        if (!oldData) return { pages: [[newMessage]], pageParams: [0] };

        // Check if message already exists (prevent duplicates)
        const allMessages = oldData.pages.flat();
        if (allMessages.some(msg => msg.message_id === newMessage.message_id)) {
          return oldData; // Don't add duplicate
        }

        // Add to beginning (newest first in API order)
        return {
          ...oldData,
          pages: [[newMessage, ...oldData.pages[0]], ...oldData.pages.slice(1)],
        };
      });

      // Invalidate unread count to refresh badge
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.UNREAD_COUNT });
    },
    [queryClient]
  );

  useEffect(() => {
    // Subscribe to all incoming WebSocket messages
    const unsubscribe = wsManager.subscribe('new_direct_message', handleNewMessage as (data: unknown) => void);
    return unsubscribe;
  }, [handleNewMessage]);
}
