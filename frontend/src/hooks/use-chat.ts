"use client";

import { useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/store/chat-store";

/**
 * Custom hook for the chat experience.
 *
 * Wraps the chat store with auto-scrolling and convenience helpers.
 */
export function useChat(caseId: string) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isTyping, error, sendMessage, loadMessages, clearMessages } =
    useChatStore();

  // Load messages on mount
  useEffect(() => {
    loadMessages(caseId);
    return () => clearMessages();
  }, [caseId, loadMessages, clearMessages]);

  // Auto-scroll on new messages or typing state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const send = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await sendMessage(caseId, content);
    },
    [caseId, sendMessage],
  );

  return {
    messages,
    isTyping,
    error,
    send,
    scrollRef,
  };
}
