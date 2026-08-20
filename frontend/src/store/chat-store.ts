import { create } from "zustand";
import type { ChatMessage } from "@/lib/types";
import { sendChatMessage } from "@/lib/api";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;

  sendMessage: (caseId: string, content: string) => Promise<void>;
  loadMessages: (caseId: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  isTyping: false,
  error: null,

  sendMessage: async (caseId, content) => {
    // Optimistic UI — add user message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isTyping: true,
      error: null,
    }));

    try {
      const res = await sendChatMessage(caseId, content);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        citations: res.citations,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isTyping: false,
      }));
    } catch (err) {
      set({
        isTyping: false,
        error: err instanceof Error ? err.message : "Failed to send message",
      });
    }
  },

  loadMessages: async () => {
    // TODO: Implement when backend has chat history endpoint
    // For now, start with empty messages
    set({ messages: [], error: null });
  },

  clearMessages: () => set({ messages: [], error: null }),
}));
