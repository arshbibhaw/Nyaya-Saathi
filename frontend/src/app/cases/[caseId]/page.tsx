"use client";

import { useState, useEffect, use } from "react";
import { format } from "date-fns";
import { ArrowLeft, MessageSquare, ClipboardList, FileText, CheckCircle2, AlertCircle, Clock, BookOpen, ExternalLink, Paperclip, Send } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

type Tab = "overview" | "action-plan" | "evidence" | "chat";

export default function CaseWorkspace({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("action-plan");
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: "ai", text: "Hello! I am your legal navigator. I've reviewed your case regarding the Cyber Financial Fraud. The most urgent step is to report this to the National Cyber Crime portal. Would you like me to help draft a complaint letter to your bank?" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setSending(true);

    try {
      const res = await api.sendChatMessage(caseId, userMsg);
      setMessages(prev => [...prev, { role: "ai", text: res.reply }]);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
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
                  {caseData.category}
                </h1>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{caseData.priority} Priority</Badge>
              </div>
              <p className="text-sm text-slate-500 max-w-2xl">
                {caseData.summary}
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
          
          {/* Action Plan Tab */}
          {activeTab === "action-plan" && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommended Actions</h2>
                {caseData.actionPlan?.map((step: any, idx: number) => (
                  <Card key={idx} className={`border-l-4 shadow-sm ${
                    step.status === 'completed' ? 'border-l-emerald-500 bg-slate-50/50' : 
                    step.status === 'current' ? 'border-l-blue-600 bg-white' : 
                    'border-l-slate-300 bg-white opacity-80'
                  }`}>
                    <CardContent className="p-5 flex gap-4">
                      <div className="mt-0.5">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="size-5 text-emerald-500" />
                        ) : step.status === 'current' ? (
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
                        <h3 className={`font-semibold ${step.status === 'completed' ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                          {step.title}
                        </h3>
                        {step.explanation && (
                          <p className="mt-1 text-sm text-slate-600">{step.explanation}</p>
                        )}
                        {step.link && (
                          <a href={step.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
                            Open Portal <ExternalLink className="ml-1 size-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div>
                <Card className="bg-slate-900 text-white border-none shadow-md">
                  <CardContent className="p-6">
                    <AlertCircle className="size-8 text-blue-400 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Need help executing this?</h3>
                    <p className="text-slate-300 text-sm mb-6">Your AI Navigator can draft complaints, write emails to your bank, or explain legal terms.</p>
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
                <Button variant="outline" size="sm"><Paperclip className="mr-2 size-4" /> Upload New</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {caseData.evidence?.map((ev: any) => (
                  <Card key={ev.id} className="shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded bg-blue-50 p-2">
                            <FileText className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-900">{ev.filename}</p>
                            <p className="text-xs text-slate-500">Uploaded on {ev.date}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Extracted Insights</p>
                        <ul className="space-y-1">
                          {ev.insights?.map((insight: string, i: number) => (
                            <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                              <div className="size-1 rounded-full bg-slate-400" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Legal Sources & Precedents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {caseData.sources?.map((src: any) => (
                      <div key={src.id} className="rounded-md border border-slate-200 p-4 bg-slate-50">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="size-4 text-slate-500" />
                          <span className="font-semibold text-sm text-slate-900">{src.provision}</span>
                        </div>
                        <p className="text-sm text-slate-700">{src.explanation}</p>
                      </div>
                    ))}
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
                      {caseData.timeline?.map((event: any, i: number) => (
                        <div key={i} className="flex gap-3">
                          <div className="relative mt-1 flex flex-col items-center">
                            <div className="size-2 rounded-full bg-slate-300" />
                            {i !== caseData.timeline.length - 1 && (
                              <div className="absolute top-3 bottom-[-16px] w-px bg-slate-200" />
                            )}
                          </div>
                          <div className="pb-2">
                            <p className="text-sm font-medium text-slate-900">{event.event}</p>
                            <p className="text-xs text-slate-500">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[600px] rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm ${
                      msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none px-5 py-3 text-sm shadow-sm flex items-center gap-2">
                      <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <div className="size-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                      <div className="size-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
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
