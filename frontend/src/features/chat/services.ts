import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { DirectMessage, SendDirectMessagePayload, UnreadSummary } from './types';

/**
 * Chat/Messages API service functions
 */
export const chatService = {
  /**
   * Get direct messages with a contact
   */
  async getDirectMessages(contactId: string, limit = 50, offset = 0): Promise<DirectMessage[]> {
    const response = await apiClient.get<DirectMessage[]>(
      `${API_ENDPOINTS.MESSAGES.GET_DIRECT(contactId)}?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  /**
   * Send a direct message
   */
  async sendDirectMessage(payload: SendDirectMessagePayload): Promise<DirectMessage> {
    const response = await apiClient.post<DirectMessage>(API_ENDPOINTS.MESSAGES.SEND_DIRECT, payload);
    return response.data;
  },

  /**
   * Get unread messages
   */
  async getUnreadMessages(): Promise<DirectMessage[]> {
    const response = await apiClient.get<DirectMessage[]>(API_ENDPOINTS.MESSAGES.UNREAD);
    return response.data;
  },

  /**
   * Get unread message count summary
   */
  async getUnreadCount(): Promise<UnreadSummary> {
    const response = await apiClient.get<UnreadSummary>(API_ENDPOINTS.MESSAGES.UNREAD_COUNT);
    return response.data;
  },

  /**
   * Mark specific messages as read
   */
  async markAsRead(messageIds: string[]): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MESSAGES.MARK_READ, { message_ids: messageIds });
  },

  /**
   * Mark all messages from a contact as read
   */
  async markContactAsRead(contactId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MESSAGES.MARK_READ_CONTACT(contactId));
  },

  /**
   * Mark all messages in a group as read
   */
  async markGroupAsRead(groupId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MESSAGES.MARK_READ_GROUP(groupId));
  },
};
