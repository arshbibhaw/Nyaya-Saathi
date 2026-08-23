import { create } from "zustand";
import type { ChatMessage } from "@/lib/types";
import { sendChatMessageStream } from "@/lib/api";

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

    const aiMsgId = `ai-${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg, aiMsg],
      isTyping: true,
      error: null,
    }));

    try {
      await sendChatMessageStream(
        caseId,
        content,
        (chunk) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
            ),
          }));
        },
        (sources) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === aiMsgId ? { ...m, citations: sources } : m
            ),
          }));
        }
      );
      
      set({ isTyping: false });
    } catch (err) {
      set((state) => ({
        isTyping: false,
        error: err instanceof Error ? err.message : "Failed to send message",
        // Remove empty AI message if request failed completely
        messages: state.messages.filter((m) => m.id !== aiMsgId || m.content !== ""),
      }));
    }
  },

  loadMessages: async () => {
    // TODO: Implement when backend has chat history endpoint
    // For now, start with empty messages
    set({ messages: [], error: null });
  },

  clearMessages: () => set({ messages: [], error: null }),
}));
