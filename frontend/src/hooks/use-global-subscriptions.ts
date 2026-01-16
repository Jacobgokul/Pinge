import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { wsManager } from '@/services/websocket/manager';

/**
 * Global WebSocket subscriptions for real-time updates
 * Should be used at the app layout level to ensure updates work everywhere
 */
export function useGlobalSubscriptions() {
  const queryClient = useQueryClient();

  // Handle new direct messages - update unread count globally
  const handleNewMessage = useCallback(
    (event: { event: string; data: unknown }) => {
      if (event.event !== 'new_direct_message') return;

      // Invalidate unread count to refresh everywhere
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.UNREAD_COUNT });
    },
    [queryClient]
  );

  // Handle new group messages
  const handleNewGroupMessage = useCallback(
    (event: { event: string; data: { group_id: string } }) => {
      if (event.event !== 'new_group_message') return;

      const { group_id } = event.data;

      if (group_id) {
        // Invalidate group messages to refresh the chat
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS.MESSAGES(group_id) });
      }

      // Invalidate unread count to refresh badges
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.UNREAD_COUNT });

      // Invalidate groups list to update any indicators
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS.LIST });
    },
    [queryClient]
  );

  // Handle contact request updates
  const handleContactRequest = useCallback(
    (event: { event: string; data: unknown }) => {
      if (event.event !== 'new_contact_request' && event.event !== 'contact_request_accepted') return;

      // Invalidate contact requests to refresh notifications
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS.REQUESTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS.LIST });
    },
    [queryClient]
  );

  useEffect(() => {
    // Subscribe to all relevant events
    const unsubMessage = wsManager.subscribe('new_direct_message', handleNewMessage as (data: unknown) => void);
    const unsubGroupMessage = wsManager.subscribe('new_group_message', handleNewGroupMessage as (data: unknown) => void);
    const unsubContactRequest = wsManager.subscribe('new_contact_request', handleContactRequest as (data: unknown) => void);
    const unsubContactAccepted = wsManager.subscribe('contact_request_accepted', handleContactRequest as (data: unknown) => void);

    return () => {
      unsubMessage();
      unsubGroupMessage();
      unsubContactRequest();
      unsubContactAccepted();
    };
  }, [handleNewMessage, handleNewGroupMessage, handleContactRequest]);
}
