/**
 * Group types - matches backend message_schema.py
 */

/**
 * Group response from backend
 */
export interface Group {
  group_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

/**
 * Group message response from backend
 */
export interface GroupMessage {
  message_id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  sent_at: string;
}

/**
 * Group member response from backend
 */
export interface GroupMember {
  user_id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Member';
  joined_at: string;
}

/**
 * Create group request
 */
export interface CreateGroupRequest {
  name: string;
  description?: string;
  members?: string[];
}

/**
 * Update group request
 */
export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

/**
 * Send group message payload
 */
export interface SendGroupMessagePayload {
  content: string;
}

/**
 * Add group members request
 */
export interface AddGroupMembersRequest {
  user_ids: string[];
}

/**
 * Change role request
 */
export interface ChangeRoleRequest {
  user_id: string;
  role: 'Admin' | 'Member';
}
