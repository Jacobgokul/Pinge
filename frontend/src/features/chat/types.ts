/**
 * Chat/Message types - matches backend message_schema.py
 */

/**
 * Direct message response from backend
 */
export interface DirectMessage {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  sent_at: string;
}

/**
 * Message type for UI components (normalized format)
 */
export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    username: string;
  };
}

/**
 * Send direct message payload
 */
export interface SendDirectMessagePayload {
  receiver_id: string;
  content: string;
}

/**
 * Unread message count per contact
 */
export interface UnreadMessageCount {
  contact_id: string;
  contact_name: string;
  unread_count: number;
  last_message_at: string | null;
}

/**
 * Unread message count per group
 */
export interface GroupUnreadCount {
  group_id: string;
  group_name: string;
  unread_count: number;
  last_message_at: string | null;
}

/**
 * Unread summary response
 */
export interface UnreadSummary {
  total_unread: number;
  contacts_with_unread: UnreadMessageCount[];
  groups_with_unread: GroupUnreadCount[];
  total_group_unread: number;
}

/**
 * Mark as read request
 */
export interface MarkAsReadRequest {
  message_ids: string[];
}
