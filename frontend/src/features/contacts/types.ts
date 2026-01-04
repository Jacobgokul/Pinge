/**
 * Contact types - matches backend contact_schema.py
 */

import type { Gender } from '@/features/auth/types';

// Contact request status
export type ContactRequestStatus = 'Pending' | 'Accepted' | 'Rejected';

/**
 * Contact response from backend
 */
export interface Contact {
  contact_id: string;
  username: string;
  email: string;
  gender: Gender;
  country: string;
  connected_since: string;
}

/**
 * Contact request response from backend
 */
export interface ContactRequest {
  request_id: string;
  sender_username: string;
  sender_email: string;
  receiver_username: string;
  receiver_email: string;
  status: ContactRequestStatus;
  created_at: string;
}

/**
 * Send contact request payload
 */
export interface SendContactRequestPayload {
  receiver_email: string;
}
