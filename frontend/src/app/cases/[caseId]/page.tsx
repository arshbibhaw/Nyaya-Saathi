"use client";

import { useState, useEffect, use, useRef } from "react";
import { format } from "date-fns";
import { ArrowLeft, MessageSquare, ClipboardList, FileText, CheckCircle2, AlertCircle, BookOpen, Paperclip, Send, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import * as api from "@/lib/api";
import type { Case, ActionPlan, EvidenceResponse } from "@/lib/types";

type Tab = "overview" | "action-plan" | "evidence" | "chat";

export default function CaseWorkspace({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("action-plan");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  // Action Plan state
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Evidence state
  const [evidenceList, setEvidenceList] = useState<EvidenceResponse[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load case data
  useEffect(() => {
    async function loadCase() {
      try {
        const data = await api.getCase(caseId);
        setCaseData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  // Load action plan when tab is active
  useEffect(() => {
    if (activeTab === "action-plan" && !actionPlan && !planLoading) {
      setPlanLoading(true);
      api.getActionPlan(caseId)
        .then(plan => setActionPlan(plan))
        .catch(e => console.error("Failed to load action plan:", e))
        .finally(() => setPlanLoading(false));
    }
  }, [activeTab, caseId, actionPlan, planLoading]);

  // Load chat history when tab is active
  useEffect(() => {
    if (activeTab === "chat" && messages.length === 0) {
      api.fetchMessages(caseId)
        .then(msgs => {
          const formatted = msgs.map(m => ({
            role: m.role === "user" ? "user" : "ai",
            text: m.content,
          }));
          if (formatted.length === 0) {
            formatted.push({
              role: "ai",
              text: `Hello! I'm your legal navigator. I've reviewed your case${caseData?.domain ? ` regarding ${caseData.domain}` : ''}. How can I help you? Feel free to ask about your legal rights, next steps, or request a draft document.`
            });
          }
          setMessages(formatted);
        })
        .catch(e => console.error("Failed to load messages:", e));
    }
  }, [activeTab, caseId, messages.length, caseData?.domain]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Chat handler with streaming
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setSending(true);

    try {
      // Add placeholder for AI response
      setMessages(prev => [...prev, { role: "ai", text: "" }]);

      await api.sendChatMessageStream(
        caseId,
        userMsg,
        // onChunk
        (chunk: string) => {
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === "ai") {
              updated[lastIdx] = { ...updated[lastIdx], text: updated[lastIdx].text + chunk };
            }
            return updated;
          });
        },
        // onSources
        (_sources) => {
          // Sources are displayed inline if needed
        }
      );
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === "ai" && updated[lastIdx].text === "") {
          updated[lastIdx] = { ...updated[lastIdx], text: "Sorry, I encountered an error. Please try again." };
        }
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  // Evidence upload handler
  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const result = await api.uploadEvidence(caseId, file);
        setEvidenceList(prev => [...prev, result]);
      } catch (err) {
        console.error("Evidence upload failed:", err);
      }
    }
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Get priority badge
  const getPriorityBadge = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case "high":
      case "critical":
        return <Badge variant="destructive">{urgency} Priority</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{urgency} Priority</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{urgency} Priority</Badge>;
      default:
        return <Badge variant="outline">{urgency || "Unknown"} Priority</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!caseData) {
    return <div className="p-8 text-center text-slate-500">Case not found.</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <Link href="/dashboard" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 size-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {caseData.title || caseData.domain || "Legal Matter"}
                </h1>
                {getPriorityBadge(caseData.urgency)}
              </div>
              <p className="text-sm text-slate-500 max-w-2xl">
                {caseData.summary || caseData.description || caseData.issue || "No description available."}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium">ID: {caseId.split('-')[0].toUpperCase()}</span>
              <span>•</span>
              <span>{format(new Date(caseData.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="mt-8 flex gap-6 border-b border-slate-200">
            {[
              { id: "overview", label: "Overview", icon: BookOpen },
              { id: "action-plan", label: "Action Plan", icon: ClipboardList },
              { id: "evidence", label: "Evidence", icon: FileText },
              { id: "chat", label: "Navigator Chat", icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Case Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Domain</p>
                        <p className="text-sm text-slate-900">{caseData.domain || "Not classified"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Issue</p>
                        <p className="text-sm text-slate-900">{caseData.issue || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Subcategory</p>
                        <p className="text-sm text-slate-900">{caseData.subcategory || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Urgency</p>
                        <p className="text-sm text-slate-900 capitalize">{caseData.urgency || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                        <p className="text-sm text-slate-900">{caseData.status}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Location</p>
                        <p className="text-sm text-slate-900 capitalize">{caseData.location || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.description || caseData.summary || "No description provided."}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Case Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="relative mt-1 flex flex-col items-center">
                          <div className="size-2 rounded-full bg-blue-600" />
                        </div>
                        <div className="pb-2">
                          <p className="text-sm font-medium text-slate-900">Case created</p>
                          <p className="text-xs text-slate-500">{format(new Date(caseData.created_at), 'MMM d, yyyy h:mm a')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Action Plan Tab */}
          {activeTab === "action-plan" && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommended Actions</h2>
                {planLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                  </div>
                ) : actionPlan && actionPlan.steps.length > 0 ? (
                  actionPlan.steps.map((step, idx) => (
                    <Card key={idx} className={`border-l-4 shadow-sm ${
                      step.status === 'done' || step.status === 'completed' ? 'border-l-emerald-500 bg-slate-50/50' : 
                      idx === 0 ? 'border-l-blue-600 bg-white' : 
                      'border-l-slate-300 bg-white opacity-80'
                    }`}>
                      <CardContent className="p-5 flex gap-4">
                        <div className="mt-0.5">
                          {step.status === 'done' || step.status === 'completed' ? (
                            <CheckCircle2 className="size-5 text-emerald-500" />
                          ) : idx === 0 ? (
                            <div className="flex size-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                              {step.step}
                            </div>
                          ) : (
                            <div className="flex size-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">
                              {step.step}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${step.status === 'done' || step.status === 'completed' ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                            {step.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-8 text-center text-slate-500">
                      <ClipboardList className="size-8 mx-auto mb-3 text-slate-300" />
                      <p>No action plan generated yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              <div>
                <Card className="bg-slate-900 text-white border-none shadow-md">
                  <CardContent className="p-6">
                    <AlertCircle className="size-8 text-blue-400 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Need help executing this?</h3>
                    <p className="text-slate-300 text-sm mb-6">Your AI Navigator can draft complaints, write emails, or explain legal terms.</p>
                    <Button onClick={() => setActiveTab('chat')} className="w-full bg-white text-slate-900 hover:bg-slate-100">
                      Chat with Navigator
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === "evidence" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Uploaded Evidence</h2>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={handleEvidenceUpload}
                  />
                  <Button variant="outline" size="sm" disabled={uploading}>
                    {uploading ? (
                      <><Loader2 className="mr-2 size-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="mr-2 size-4" /> Upload Evidence</>
                    )}
                  </Button>
                </div>
              </div>

              {evidenceList.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {evidenceList.map((ev) => (
                    <Card key={ev.id} className="shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded bg-blue-50 p-2">
                              <FileText className="size-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900">{ev.file_name}</p>
                              <p className="text-xs text-slate-500">{ev.mime_type}</p>
                            </div>
                          </div>
                        </div>
                        {ev.extracted_entities && (
                          <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Extracted Entities</p>
                            <ul className="space-y-1">
                              {ev.extracted_entities.dates?.length > 0 && (
                                <li className="text-sm text-slate-700">📅 Dates: {ev.extracted_entities.dates.join(", ")}</li>
                              )}
                              {ev.extracted_entities.amounts?.length > 0 && (
                                <li className="text-sm text-slate-700">💰 Amounts: {ev.extracted_entities.amounts.join(", ")}</li>
                              )}
                              {ev.extracted_entities.parties?.length > 0 && (
                                <li className="text-sm text-slate-700">👤 Parties: {ev.extracted_entities.parties.join(", ")}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={handleEvidenceUpload}
                  />
                  <Paperclip className="size-8 text-slate-300 mb-4" />
                  <h3 className="text-sm font-semibold text-slate-900">No evidence uploaded yet</h3>
                  <p className="mt-1 text-xs text-slate-500">Upload PDFs, screenshots, or images. Our AI will extract key information.</p>
                  <Button variant="outline" className="mt-6 pointer-events-none">
                    Select Files
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[600px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm whitespace-pre-wrap ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border border-border text-foreground rounded-bl-none shadow-sm'
                    }`}>
                      {msg.text || (sending && i === messages.length - 1 ? (
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" />
                          <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      ) : "")}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-slate-200 p-3 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                  <Input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question or request a draft..."
                    className="flex-1 rounded-full pl-4 pr-12 bg-slate-50"
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || sending} className="absolute right-1 top-1 bottom-1 h-auto w-8 rounded-full bg-blue-600 hover:bg-blue-700">
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
