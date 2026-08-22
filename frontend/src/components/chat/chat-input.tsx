"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  isTyping: boolean;
  onAttachClick: () => void;
}

export function ChatInput({ onSend, isTyping, onAttachClick }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isTyping) {
      onSend(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "inherit";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex w-full items-end gap-2 rounded-xl border border-border/50 bg-card/50 p-2 backdrop-blur-md focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
        onClick={onAttachClick}
        title="Attach evidence"
      >
        <Paperclip className="size-5" />
      </Button>

      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Press Enter to send)"
        className="max-h-[150px] min-h-[40px] w-full resize-none bg-transparent py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
        rows={1}
      />

      <Button
        type="button"
        size="icon"
        className="shrink-0 rounded-full glow-indigo"
        onClick={handleSend}
        disabled={!input.trim() || isTyping}
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}
