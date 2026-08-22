"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Copy, Scale, User, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex w-full gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn("mt-1 size-8 shrink-0", isUser ? "bg-primary/20" : "bg-accent/20")}>
        <AvatarFallback className="bg-transparent">
          {isUser ? <User className="size-4 text-primary" /> : <Scale className="size-4 text-accent" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "relative flex max-w-[85%] flex-col gap-2 rounded-2xl px-5 py-3.5 text-sm md:max-w-[75%]",
          isUser
            ? "rounded-tr-none bg-primary text-primary-foreground"
            : "rounded-tl-none border border-border/50 bg-card/60 backdrop-blur-md"
        )}
      >
        {!isUser && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={copyToClipboard}
            className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
            title="Copy message"
          >
            <Copy className="size-3 text-muted-foreground" />
          </Button>
        )}

        <div className={cn("prose prose-sm max-w-none break-words", isUser ? "prose-invert" : "dark:prose-invert")}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border/20 pt-3">
            <span className="flex items-center text-xs font-medium text-muted-foreground w-full mb-1">
              <BookOpen className="mr-1.5 size-3" />
              Legal Sources
            </span>
            {message.citations.map((cite, i) => (
              <Badge key={i} variant="outline" className="bg-background/40 text-xs hover:bg-background/60">
                {cite.act} • {cite.section}
              </Badge>
            ))}
          </div>
        )}

        <div
          className={cn(
            "mt-1 text-[10px] opacity-50",
            isUser ? "text-right" : "text-left"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}
