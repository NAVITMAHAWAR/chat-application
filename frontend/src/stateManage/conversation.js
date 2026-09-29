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
}));

export default useConversation;
