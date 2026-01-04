import { create } from 'zustand';

/**
 * Chat state for managing active conversations
 */
interface ChatState {
  // Currently active conversation
  activeContactId: string | null;
  activeGroupId: string | null;

  // Users currently typing in conversations
  // Map<conversationId, userId[]>
  typingUsers: Record<string, string[]>;

  // Actions
  setActiveContact: (contactId: string | null) => void;
  setActiveGroup: (groupId: string | null) => void;
  clearActive: () => void;

  // Typing indicators
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  clearTypingUsers: (conversationId: string) => void;
}

/**
 * Chat store for UI state
 * Not persisted - resets on page reload
 */
export const useChatStore = create<ChatState>((set) => ({
  activeContactId: null,
  activeGroupId: null,
  typingUsers: {},

  setActiveContact: (contactId) =>
    set({
      activeContactId: contactId,
      activeGroupId: null, // Clear group when selecting contact
    }),

  setActiveGroup: (groupId) =>
    set({
      activeGroupId: groupId,
      activeContactId: null, // Clear contact when selecting group
    }),

  clearActive: () =>
    set({
      activeContactId: null,
      activeGroupId: null,
    }),

  addTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];

      // Don't add duplicate
      if (current.includes(userId)) {
        return state;
      }

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, userId],
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter((id) => id !== userId),
        },
      };
    }),

  clearTypingUsers: (conversationId) =>
    set((state) => {
      const { [conversationId]: _, ...rest } = state.typingUsers;
      return { typingUsers: rest };
    }),
}));
