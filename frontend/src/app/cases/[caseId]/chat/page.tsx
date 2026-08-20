"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronRight, ClipboardList, Info } from "lucide-react";

import { useChat } from "@/hooks/use-chat";
import { useCaseStore } from "@/store/case-store";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { FileUpload } from "@/components/evidence/file-upload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ChatNavigatorPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const { messages, isTyping, error, send, scrollRef } = useChat(caseId);
  const { activeCase, loadCase } = useCaseStore();
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadCase(caseId);
  }, [caseId, loadCase]);

  return (
    <div className="flex h-full max-h-full">
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Messages List */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-32"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <AnimatePresence initial={false}>
              {messages.length === 0 && !isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center opacity-50"
                >
                  <p className="text-muted-foreground">
                    Describe your situation or answer the questions to build your case.
                  </p>
                </motion.div>
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
            
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-background/80 p-4 backdrop-blur-xl shrink-0 absolute bottom-0 w-full md:w-[calc(100%-16rem-320px)] xl:w-[calc(100%-16rem-384px)] left-0 md:left-64 z-10">
          <div className="mx-auto max-w-3xl">
            <ChatInput
              onSend={send}
              isTyping={isTyping}
              onAttachClick={() => setUploadDialogOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Context Sidebar (Right) */}
      <div className="hidden w-80 shrink-0 flex-col border-l border-border/50 bg-sidebar/30 backdrop-blur-md md:flex xl:w-96 overflow-y-auto pb-20">
        <div className="p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Case Context
          </h3>

          <div className="space-y-6">
            {/* Metadata */}
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="size-4 text-primary" />
                <h4 className="font-medium text-sm">Status & Domain</h4>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Domain</span>
                  <span className="font-medium">{activeCase?.domain || "Analyzing..."}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize text-primary">
                    {(activeCase?.status || "open").replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {activeCase ? new Date(activeCase.created_at).toLocaleDateString() : "--"}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Quick Actions</h4>
              <div className="flex flex-col gap-2">
                <Link href={`/cases/${caseId}/plan`}>
                  <Button variant="outline" className="w-full justify-between glass-hover">
                    <span className="flex items-center gap-2">
                      <ClipboardList className="size-4 text-accent" />
                      View Action Plan
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Button>
                </Link>
                <Link href={`/cases/${caseId}/documents`}>
                  <Button variant="outline" className="w-full justify-between glass-hover">
                    <span className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      Generate Documents
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Evidence Summary */}
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">Evidence Uploaded</h4>
                <Button variant="ghost" size="xs" className="h-6 text-xs text-primary" onClick={() => setUploadDialogOpen(true)}>
                  Upload New
                </Button>
              </div>
              
              <div className="text-center py-4 border-2 border-dashed border-border/60 rounded-lg">
                 <p className="text-xs text-muted-foreground">No evidence uploaded yet.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FileUpload 
              caseId={caseId} 
              onUploadSuccess={() => {
                // Could refresh evidence list here
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
