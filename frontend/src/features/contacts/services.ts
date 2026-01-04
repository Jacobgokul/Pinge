import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Contact, ContactRequest, SendContactRequestPayload } from './types';

/**
 * Contacts API service functions
 */
export const contactsService = {
  /**
   * Get all contacts
   */
  async getContacts(): Promise<Contact[]> {
    const response = await apiClient.get<Contact[]>(API_ENDPOINTS.CONTACTS.LIST);
    return response.data;
  },

  /**
   * Send a contact request by email
   */
  async sendRequest(payload: SendContactRequestPayload): Promise<void> {
    await apiClient.post(API_ENDPOINTS.CONTACTS.SEND_REQUEST, payload);
  },

  /**
   * Get pending contact requests
   */
  async getRequests(): Promise<ContactRequest[]> {
    const response = await apiClient.get<ContactRequest[]>(API_ENDPOINTS.CONTACTS.REQUESTS);
    return response.data;
  },

  /**
   * Accept a contact request
   */
  async acceptRequest(requestId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.CONTACTS.ACCEPT(requestId));
  },

  /**
   * Reject a contact request
   */
  async rejectRequest(requestId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.CONTACTS.REJECT(requestId));
  },

  /**
   * Remove a contact
   */
  async removeContact(contactId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CONTACTS.REMOVE(contactId));
  },
};
