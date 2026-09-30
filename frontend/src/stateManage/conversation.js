import { create } from "zustand";

const useConversation = create((set) => ({
  selectConversation: null,
  setSelectConversation: (selectConversation) => set({ selectConversation }),
  messages: [],
  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),

  // ── Typing ──
  typingUsers: {}, // { [conversationId]: senderId }
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
}));

export default useConversation;
