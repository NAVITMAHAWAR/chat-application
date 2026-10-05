import { create } from "zustand";

const useConversation = create((set, get) => ({
  selectConversation: null,
  setSelectConversation: (selectConversation) => set({ selectConversation }),

  messages: [],
  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),

  typingUsers: {},
  setTyping: (conversationId, senderId) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: senderId },
    })),
  clearTyping: (conversationId) =>
    set((state) => {
      const next = { ...state.typingUsers };
      delete next[conversationId];
      return { typingUsers: next };
    }),

  // ── Unread counts: { [userId or conversationId]: number } ──
  unreadCounts: {},
  setUnreadCounts: (unreadCounts) => set({ unreadCounts }),
  incrementUnread: (conversationKey) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationKey]: (state.unreadCounts[conversationKey] || 0) + 1,
      },
    })),
  clearUnread: (conversationKey) =>
    set((state) => {
      const next = { ...state.unreadCounts };
      delete next[conversationKey];
      return { unreadCounts: next };
    }),
  totalUnread: () =>
    Object.values(get().unreadCounts).reduce((a, b) => a + b, 0),
}));

export default useConversation;
