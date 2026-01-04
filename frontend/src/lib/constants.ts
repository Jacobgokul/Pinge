/**
 * Application constants - matches backend API structure
 */

// API endpoints - matching backend routes exactly
export const API_ENDPOINTS = {
  // Auth - /authentication
  AUTH: {
    LOGIN: '/authentication/login',
    REGISTER: '/authentication/register_user',
    LOGOUT: '/authentication/logout',
    ME: '/authentication/me',
    USERS: '/authentication/users',
  },

  // Contacts - /contacts
  CONTACTS: {
    LIST: '/contacts/',
    SEND_REQUEST: '/contacts/send-request',
    REQUESTS: '/contacts/requests',
    ACCEPT: (requestId: string) => `/contacts/accept/${requestId}`,
    REJECT: (requestId: string) => `/contacts/reject/${requestId}`,
    REMOVE: (contactId: string) => `/contacts/${contactId}`,
  },

  // Messages - /messages
  MESSAGES: {
    SEND_DIRECT: '/messages/direct',
    GET_DIRECT: (contactId: string) => `/messages/direct/${contactId}`,
    UNREAD: '/messages/unread',
    UNREAD_COUNT: '/messages/unread/count',
    MARK_READ: '/messages/mark-read',
    MARK_READ_CONTACT: (contactId: string) => `/messages/mark-read/contact/${contactId}`,
  },

  // Groups - /messages/groups
  GROUPS: {
    LIST: '/messages/groups',
    CREATE: '/messages/groups',
    DELETE: (groupId: string) => `/messages/groups/${groupId}`,
    UPDATE: (groupId: string) => `/messages/groups/${groupId}`,
    LEAVE: (groupId: string) => `/messages/groups/${groupId}/leave`,
    MESSAGES: (groupId: string) => `/messages/groups/${groupId}/messages`,
    MEMBERS: (groupId: string) => `/messages/groups/${groupId}/members`,
    REMOVE_MEMBER: (groupId: string, userId: string) => `/messages/groups/${groupId}/members/${userId}`,
    CHANGE_ROLE: (groupId: string, userId: string) => `/messages/groups/${groupId}/members/${userId}/role`,
  },
} as const;

// Query keys for TanStack Query
export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
    USERS: ['auth', 'users'] as const,
  },
  CONTACTS: {
    LIST: ['contacts'] as const,
    REQUESTS: ['contacts', 'requests'] as const,
  },
  MESSAGES: {
    DIRECT: (contactId: string) => ['messages', 'direct', contactId] as const,
    UNREAD: ['messages', 'unread'] as const,
    UNREAD_COUNT: ['messages', 'unread', 'count'] as const,
  },
  GROUPS: {
    LIST: ['groups'] as const,
    MESSAGES: (groupId: string) => ['groups', 'messages', groupId] as const,
    MEMBERS: (groupId: string) => ['groups', 'members', groupId] as const,
  },
} as const;

// WebSocket event types
export const WS_EVENTS = {
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  USER_TYPING: 'user_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  GROUP_MESSAGE: 'group_message',
  GROUP_UPDATE: 'group_update',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  THEME: 'theme-storage',
} as const;
