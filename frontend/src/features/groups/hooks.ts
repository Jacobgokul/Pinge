import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/constants';
import { wsManager } from '@/services/websocket/manager';
import { groupsService } from './services';
import type { Group, GroupMessage } from './types';

// WebSocket event type from backend
interface NewGroupMessageEvent {
  event: string;
  data: {
    message_id: string;
    group_id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    sent_at: string;
  };
}

/**
 * Hook for fetching user's groups
 */
export function useGroups() {
  return useQuery({
    queryKey: QUERY_KEYS.GROUPS.LIST,
    queryFn: groupsService.getGroups,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching group messages
 */
export function useGroupMessages(groupId: string | null) {
  return useInfiniteQuery({
    queryKey: groupId ? QUERY_KEYS.GROUPS.MESSAGES(groupId) : ['groups', 'messages', null],
    queryFn: async ({ pageParam = 0 }) => {
      if (!groupId) return [];
      return groupsService.getGroupMessages(groupId, 50, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 50) {
        return allPages.length * 50;
      }
      return undefined;
    },
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for fetching group members
 */
export function useGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: groupId ? QUERY_KEYS.GROUPS.MEMBERS(groupId) : ['groups', 'members', null],
    queryFn: () => groupsService.getMembers(groupId!),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for creating a group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsService.createGroup,
    onSuccess: (newGroup) => {
      queryClient.setQueryData<Group[]>(QUERY_KEYS.GROUPS.LIST, (old) =>
        old ? [...old, newGroup] : [newGroup]
      );
      toast.success('Group created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create group');
    },
  });
}

/**
 * Hook for sending a group message
 */
export function useSendGroupMessage(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => groupsService.sendGroupMessage(groupId, { content }),
    onSuccess: (newMessage) => {
      // Update the cache with the new message
      const queryKey = QUERY_KEYS.GROUPS.MESSAGES(newMessage.group_id);
      queryClient.setQueryData(queryKey, (oldData: { pages: GroupMessage[][]; pageParams: number[] } | undefined) => {
        if (!oldData) return { pages: [[newMessage]], pageParams: [0] };

        // Check if message already exists (prevent duplicates)
        const allMessages = oldData.pages.flat();
        if (allMessages.some(msg => msg.message_id === newMessage.message_id)) {
          return oldData;
        }

        return {
          ...oldData,
          pages: [[newMessage, ...oldData.pages[0]], ...oldData.pages.slice(1)],
        };
      });
    },
  });
}

/**
 * Hook for deleting a group
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsService.deleteGroup,
    onSuccess: (_, groupId) => {
      queryClient.setQueryData<Group[]>(QUERY_KEYS.GROUPS.LIST, (old) =>
        old?.filter((g) => g.group_id !== groupId) || []
      );
      toast.success('Group deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete group');
    },
  });
}

/**
 * Hook for leaving a group
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsService.leaveGroup,
    onSuccess: (_, groupId) => {
      queryClient.setQueryData<Group[]>(QUERY_KEYS.GROUPS.LIST, (old) =>
        old?.filter((g) => g.group_id !== groupId) || []
      );
      toast.success('Left group');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to leave group');
    },
  });
}

/**
 * Hook for adding members to a group
 */
export function useAddGroupMembers(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => groupsService.addMembers(groupId, { user_ids: userIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS.MEMBERS(groupId) });
      toast.success('Members added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add members');
    },
  });
}

/**
 * Hook for removing a member from a group
 */
export function useRemoveGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => groupsService.removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUPS.MEMBERS(groupId) });
      toast.success('Member removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member');
    },
  });
}

/**
 * Hook for real-time group message updates via WebSocket
 */
export function useGroupMessageSubscription() {
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback(
    (event: NewGroupMessageEvent) => {
      if (event.event !== 'new_group_message') return;

      const { data } = event;

      // Convert to GroupMessage format
      const newMessage: GroupMessage = {
        message_id: data.message_id,
        group_id: data.group_id,
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        content: data.content,
        sent_at: data.sent_at,
      };

      // Update messages cache for this group
      const queryKey = QUERY_KEYS.GROUPS.MESSAGES(data.group_id);
      queryClient.setQueryData(queryKey, (oldData: { pages: GroupMessage[][]; pageParams: number[] } | undefined) => {
        if (!oldData) return { pages: [[newMessage]], pageParams: [0] };

        // Check if message already exists (prevent duplicates)
        const allMessages = oldData.pages.flat();
        if (allMessages.some(msg => msg.message_id === newMessage.message_id)) {
          return oldData;
        }

        // Add to beginning (newest first in API order)
        return {
          ...oldData,
          pages: [[newMessage, ...oldData.pages[0]], ...oldData.pages.slice(1)],
        };
      });
    },
    [queryClient]
  );

  useEffect(() => {
    const unsubscribe = wsManager.subscribe('new_group_message', handleNewMessage as (data: unknown) => void);
    return unsubscribe;
  }, [handleNewMessage]);
}
