import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/constants';
import { contactsService } from './services';
import type { Contact, ContactRequest } from './types';

/**
 * Hook for fetching contacts
 */
export function useContacts() {
  return useQuery({
    queryKey: QUERY_KEYS.CONTACTS.LIST,
    queryFn: contactsService.getContacts,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching contact requests
 */
export function useContactRequests() {
  return useQuery({
    queryKey: QUERY_KEYS.CONTACTS.REQUESTS,
    queryFn: contactsService.getRequests,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook for sending a contact request
 */
export function useSendContactRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => contactsService.sendRequest({ receiver_email: email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS.REQUESTS });
      toast.success('Contact request sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send request');
    },
  });
}

/**
 * Hook for accepting a contact request
 */
export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsService.acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS.REQUESTS });
      toast.success('Contact request accepted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept request');
    },
  });
}

/**
 * Hook for rejecting a contact request
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsService.rejectRequest,
    onSuccess: (_, requestId) => {
      queryClient.setQueryData<ContactRequest[]>(QUERY_KEYS.CONTACTS.REQUESTS, (old) =>
        old?.filter((r) => r.request_id !== requestId) || []
      );
      toast.success('Contact request rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject request');
    },
  });
}

/**
 * Hook for removing a contact
 */
export function useRemoveContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsService.removeContact,
    onSuccess: (_, contactId) => {
      queryClient.setQueryData<Contact[]>(QUERY_KEYS.CONTACTS.LIST, (old) =>
        old?.filter((c) => c.contact_id !== contactId) || []
      );
      toast.success('Contact removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove contact');
    },
  });
}
