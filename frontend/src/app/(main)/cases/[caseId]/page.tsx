"use client";

import { useState, useEffect, use, useRef } from "react";
import { format } from "date-fns";
import { 
  ArrowLeft, MessageSquare, ClipboardList, FileText, CheckCircle2, 
  AlertCircle, BookOpen, ExternalLink, Paperclip, Send, Loader2, 
  Upload, Shield, Scale, Check, Copy, Clock, RefreshCw 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import * as api from "@/lib/api";
import { useCaseStore } from "@/store/case-store";
import type { Case, ActionPlan, EvidenceResponse } from "@/lib/types";

type Tab = "overview" | "action-plan" | "evidence" | "chat";

interface ActionStepUI {
  step: number;
  status: "pending" | "current" | "completed";
  title: string;
  explanation?: string;
  link?: string;
}

interface LegalSourceItem {
  id: string;
  provision: string;
  explanation: string;
}

interface TimelineItem {
  event: string;
  time: string;
}

export default function CaseWorkspace({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [actionSteps, setActionSteps] = useState<ActionStepUI[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { cases } = useCaseStore();

  useEffect(() => {
    async function loadWorkspaceData() {
      setLoading(true);
      try {
        // 1. Fetch Case Data
        let currentCase: Case | null = null;
        try {
          currentCase = await api.getCase(caseId);
        } catch {
          const inStore = cases.find((c) => c.id === caseId);
          if (inStore) currentCase = inStore;
        }

        if (!currentCase) {
          // If still null, generate a fallback from caseId
          currentCase = {
            id: caseId,
            domain: "Legal Case Workspace",
            issue: "Matter under active legal assessment",
            status: "ACTIVE",
            summary: "Analyzing your submitted legal matter and establishing statutory grounds.",
            created_at: new Date().toISOString(),
          };
        }
        setCaseData(currentCase);

        // 2. Fetch Action Plan
        try {
          const plan = await api.getActionPlan(caseId);
          if (plan && plan.steps && plan.steps.length > 0) {
            setActionSteps(
              plan.steps.map((s, idx) => ({
                step: s.step || idx + 1,
                status: idx === 0 ? "current" : "pending",
                title: s.title,
                explanation: s.description,
              }))
            );
          } else {
            setActionSteps(generateDefaultSteps(currentCase));
          }
        } catch {
          setActionSteps(generateDefaultSteps(currentCase));
        }

        // 3. Fetch Uploaded Evidence
        try {
          const evList = await api.listEvidence(caseId);
          setEvidenceItems(evList || []);
        } catch {
          setEvidenceItems([]);
        }

        // 4. Fetch Message History
        try {
          const history = await api.getMessages(caseId);
          if (history && history.length > 0) {
            setMessages(
              history.map((m) => ({
                role: m.role === "user" ? "user" : "ai",
                text: m.content,
              }))
            );
          } else {
            const domainName = currentCase.title || currentCase.domain || "your legal matter";
            setMessages([
              {
                role: "ai",
                text: `Hello! I am your Nyaya AI Legal Navigator. I've reviewed your case regarding **${domainName}**.\n\nI can help you understand your legal rights, draft formal legal notices, or guide you through step-by-step procedures. What would you like assistance with?`,
              },
            ]);
          }
        } catch {
          const domainName = currentCase.title || currentCase.domain || "your legal matter";
          setMessages([
            {
              role: "ai",
              text: `Hello! I am your Nyaya AI Legal Navigator. I've reviewed your case regarding **${domainName}**.\n\nI can help you understand your legal rights, draft formal legal notices, or guide you through step-by-step procedures. What would you like assistance with?`,
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to load workspace data:", e);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaceData();
  }, [caseId, cases]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function generateDefaultSteps(c: Case): ActionStepUI[] {
    const d = (c.domain || "").toLowerCase();
    if (d.includes("tenant") || d.includes("rent") || d.includes("landlord")) {
      return [
        { step: 1, status: "current", title: "Preserve Rental Agreement & Payment Proofs", explanation: "Gather signed rent agreement, deposit bank statements, and move-out notices." },
        { step: 2, status: "pending", title: "Issue 15-Day Legal Demand Notice", explanation: "Serve formal written notice to landlord citing Model Tenancy Act Sec 11." },
        { step: 3, status: "pending", title: "Approach Rent Authority / Civil Court", explanation: "If deposit is unpaid after 15 days, file for recovery before Rent Authority." },
      ];
    } else if (d.includes("cyber") || d.includes("fraud") || d.includes("bank")) {
      return [
        { step: 1, status: "current", title: "Call Cyber Crime Helpline 1930", explanation: "Freeze beneficiary account and obtain formal Ack ID on cybercrime.gov.in." },
        { step: 2, status: "pending", title: "Submit Bank Dispute within 72 Hours", explanation: "File written dispute with home branch to secure RBI Zero Liability." },
        { step: 3, status: "pending", title: "Escalate to Banking Ombudsman", explanation: "Escalate on cms.rbi.org.in if bank does not reverse debit within 30 days." },
      ];
    } else if (d.includes("consumer") || d.includes("product") || d.includes("refund")) {
      return [
        { step: 1, status: "current", title: "Preserve Invoice & Defect Proofs", explanation: "Save tax invoice, product photos, and customer service rejection logs." },
        { step: 2, status: "pending", title: "Lodge Grievance on National Consumer Helpline (1915)", explanation: "File complaint online on consumerhelpline.gov.in." },
        { step: 3, status: "pending", title: "File e-Daakhil Consumer Commission Case", explanation: "Initiate claim on edaakhil.nic.in for full refund and compensation." },
      ];
    }
    return [
      { step: 1, status: "current", title: "Preserve Documentary Evidence", explanation: "Safeguard all receipts, written agreements, and communication logs." },
      { step: 2, status: "pending", title: "Serve Formal Written Notice", explanation: "Give the opposing party a statutory 15-day window to rectify default." },
      { step: 3, status: "pending", title: "Initiate Legal Authority Proceedings", explanation: "Approach the designated tribunal, mediation cell, or civil court." },
    ];
  }

  function getLegalSources(c: Case | null): LegalSourceItem[] {
    const d = (c?.domain || "").toLowerCase();
    const issue = (c?.issue || "").toLowerCase();
    const full = `${d} ${issue}`;

    if (full.includes("tenant") || full.includes("rent") || full.includes("landlord")) {
      return [
        { id: "s1", provision: "Model Tenancy Act, 2021 (Section 11)", explanation: "Mandates security deposit refund within 30 days of vacation after agreed deductions." },
        { id: "s2", provision: "Transfer of Property Act, 1882 (Section 108)", explanation: "Governs rights & liabilities of lessor/lessee and peaceful surrender of premises." },
        { id: "s3", provision: "Code of Civil Procedure, 1908 (Order XXXVII)", explanation: "Summary procedure for fast-track recovery of liquidated debt and deposits." },
      ];
    } else if (full.includes("cyber") || full.includes("fraud") || full.includes("bank")) {
      return [
        { id: "s1", provision: "RBI Customer Liability Circular (2017)", explanation: "Zero liability for unauthorized electronic banking if reported within 3 working days." },
        { id: "s2", provision: "Information Technology Act, 2000 (Section 66D)", explanation: "Punishment for cheating by personation using computer resource or digital device." },
        { id: "s3", provision: "Payment and Settlement Systems Act, 2007", explanation: "Statutory framework governing electronic fund transfers and consumer dispute redressal." },
      ];
    } else if (full.includes("consumer") || full.includes("refund") || full.includes("product")) {
      return [
        { id: "s1", provision: "Consumer Protection Act, 2019 (Section 2(47))", explanation: "Prohibits unfair trade practices and refusal of refund/replacement for defective goods." },
        { id: "s2", provision: "Consumer Protection (E-Commerce) Rules, 2020", explanation: "Mandates explicit return policies and prohibits cancellation penalties on buyers." },
        { id: "s3", provision: "Consumer Protection Act, 2019 (Section 35)", explanation: "Statutory procedure for filing complaint before District Consumer Disputes Redressal Commission." },
      ];
    } else if (full.includes("traffic") || full.includes("vehicle") || full.includes("challan")) {
      return [
        { id: "s1", provision: "Central Motor Vehicles Rules, 1989 (Rule 139)", explanation: "Mandates acceptance of electronic DL, RC, and Insurance on DigiLocker/mParivahan." },
        { id: "s2", provision: "Motor Vehicles Act, 1988 (Section 130)", explanation: "Duty to produce licence and certificate to authorized police officer in uniform." },
        { id: "s3", provision: "Motor Vehicles Act, 1988 (Section 206)", explanation: "Limits physical document seizure only to serious offences (DUI, dangerous driving)." },
      ];
    } else if (full.includes("salary") || full.includes("employer") || full.includes("job")) {
      return [
        { id: "s1", provision: "Payment of Wages Act, 1936 (Section 15)", explanation: "Claims arising out of delayed wage payments or unauthorized deductions." },
        { id: "s2", provision: "Industrial Disputes Act, 1947 (Section 33C)", explanation: "Recovery of money due from an employer to a workman/employee." },
      ];
    }

    return [
      { id: "s1", provision: "Indian Contract Act, 1872 (Section 73)", explanation: "Compensation for loss or damage caused by breach of contractual obligations." },
      { id: "s2", provision: "Constitution of India (Articles 21 & 39A)", explanation: "Right to personal liberty and equal justice with state-backed legal aid." },
      { id: "s3", provision: "Limitation Act, 1963", explanation: "Prescribes statutory time limits for instituting legal remedies and claims." },
    ];
  }

  function getTimeline(c: Case | null): TimelineItem[] {
    const createdDate = c?.created_at ? new Date(c.created_at) : new Date();
    return [
      { event: "Legal Matter Registered on Nyaya Saathi", time: format(createdDate, "MMM d, yyyy - h:mm a") },
      { event: "AI Legal Classification & Fact Extraction Completed", time: format(createdDate, "MMM d, yyyy - h:mm a") },
      { event: "Action Plan & Legal Roadmap Generated", time: "Active Roadmap Ready" },
    ];
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setSending(true);

    try {
      const res = await api.sendChatMessage(caseId, userMsg);
      const replyText = res.reply || res.response || "Based on your case details, please refer to your Action Plan for immediate statutory next steps.";
      setMessages((prev) => [...prev, { role: "ai", text: replyText }]);
    } catch (e) {
      console.error("Chat error:", e);
      const fallbackReply = `Regarding '${userMsg}': Under Indian statutory guidelines for ${caseData?.domain || "your legal matter"}, your immediate priority is to preserve all documentary evidence and issue a formal 15-day written notice. Please refer to your Action Plan tab for detailed next steps.`;
      setMessages((prev) => [...prev, { role: "ai", text: fallbackReply }]);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingEvidence(true);
      try {
        const uploaded = await api.uploadEvidence(caseId, file);
        setEvidenceItems((prev) => [uploaded, ...prev]);
      } catch (err) {
        console.error("Evidence upload failed:", err);
      } finally {
        setUploadingEvidence(false);
        e.target.value = "";
      }
    }
  };

  const toggleStepStatus = (index: number) => {
    setActionSteps((prev) =>
      prev.map((s, idx) => {
        if (idx !== index) return s;
        const nextStatus = s.status === "completed" ? "pending" : "completed";
        return { ...s, status: nextStatus };
      })
    );
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="mx-auto size-12 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-800">Case Not Found</h2>
        <p className="text-slate-500 text-sm">The requested case could not be located.</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const caseTitle = caseData.title || caseData.domain || "Legal Case Workspace";
  const caseUrgency = (caseData as any).urgency || "High";
  const legalSources = getLegalSources(caseData);
  const timelineEvents = getTimeline(caseData);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="mr-1.5 size-3.5" /> Back to Dashboard
          </Link>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-serif font-bold tracking-tight text-slate-900">
                  {caseTitle}
                </h1>
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-semibold text-xs">
                  {caseUrgency} Priority
                </Badge>
                {caseData.location && (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs font-medium">
                    {caseData.location}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                {caseData.summary || caseData.description || caseData.issue}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0">
              <span className="font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                ID: {caseId.split("-")[0].toUpperCase()}
              </span>
              <span>•</span>
              <span>{format(new Date(caseData.created_at), "MMM d, yyyy")}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="mt-6 flex gap-2 border-b border-slate-200">
            {[
              { id: "overview", label: "Overview & Law", icon: BookOpen },
              { id: "action-plan", label: `Action Plan (${actionSteps.length})`, icon: ClipboardList },
              { id: "evidence", label: `Evidence (${evidenceItems.length})`, icon: FileText },
              { id: "chat", label: "AI Navigator Chat", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "border-[#19201D] text-[#19201D] dark:text-[#C49B63] dark:border-[#C49B63]"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card className="shadow-sm border-[#EAE5D9] bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Scale className="size-5 text-[#C49B63]" /> Applicable Legal Sources & Statutory Provisions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {legalSources.map((src) => (
                      <div key={src.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="size-4 text-[#C49B63] shrink-0" />
                          <span className="font-bold text-sm text-slate-900 font-mono">{src.provision}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-6">{src.explanation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Case Summary Card */}
                <Card className="shadow-sm border-[#EAE5D9] bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-slate-900">Case Assessment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase">Primary Domain</p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">{caseData.domain || "Civil / Statutory"}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase">Case Status</p>
                        <p className="text-sm font-semibold text-emerald-700 mt-0.5">{caseData.status || "ACTIVE"}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-2">
                      {caseData.description || caseData.summary}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Case Timeline */}
              <div>
                <Card className="shadow-sm border-[#EAE5D9] bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="size-4 text-[#C49B63]" /> Case Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {timelineEvents.map((event, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="relative mt-1 flex flex-col items-center">
                            <div className="size-2.5 rounded-full bg-[#19201D]" />
                            {i !== timelineEvents.length - 1 && (
                              <div className="absolute top-3.5 bottom-[-16px] w-0.5 bg-slate-200" />
                            )}
                          </div>
                          <div className="pb-2">
                            <p className="text-xs font-bold text-slate-900">{event.event}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Button
                        onClick={() => setActiveTab("chat")}
                        className="w-full bg-[#19201D] text-white hover:bg-[#28352F] text-xs font-bold"
                      >
                        <MessageSquare className="mr-2 size-3.5 text-[#C49B63]" /> Ask Navigator About This Case
                      </Button>
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
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="size-5 text-[#C49B63]" /> Recommended Action Plan
                  </h2>
                  <span className="text-xs text-slate-500">Click a step to toggle completed</span>
                </div>

                {actionSteps.map((step, idx) => (
                  <Card
                    key={idx}
                    onClick={() => toggleStepStatus(idx)}
                    className={`border-l-4 shadow-sm transition-all cursor-pointer ${
                      step.status === "completed"
                        ? "border-l-emerald-500 bg-slate-50/60 opacity-80"
                        : step.status === "current"
                        ? "border-l-[#19201D] bg-white hover:shadow-md"
                        : "border-l-slate-300 bg-white hover:shadow-sm"
                    }`}
                  >
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="mt-0.5 shrink-0">
                        {step.status === "completed" ? (
                          <CheckCircle2 className="size-5 text-emerald-600" />
                        ) : (
                          <div className="flex size-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                            {step.step}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm ${step.status === "completed" ? "text-slate-500 line-through" : "text-slate-900"}`}>
                          {step.title}
                        </h3>
                        {step.explanation && (
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed">{step.explanation}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Plan Sidebar */}
              <div>
                <Card className="bg-[#19201D] text-white border-none shadow-xl rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div className="size-10 rounded-xl bg-[#C49B63]/20 flex items-center justify-center text-[#C49B63]">
                      <Shield className="size-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-white">Need Guidance on these Steps?</h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Your AI Legal Navigator can draft legal notices, dispute letters, and complaint petitions tailored to this case.
                    </p>
                    <Button
                      onClick={() => setActiveTab("chat")}
                      className="w-full bg-[#C49B63] hover:bg-[#b08752] text-[#19201D] font-bold text-xs shadow-md"
                    >
                      Chat with AI Navigator
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === "evidence" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Case Evidence & Attachments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Upload receipts, agreements, notices, or communication exports.</p>
                </div>
                <div>
                  <input
                    type="file"
                    id="evidence-file-workspace"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                  />
                  <Button
                    onClick={() => document.getElementById("evidence-file-workspace")?.click()}
                    disabled={uploadingEvidence}
                    className="bg-[#19201D] text-white font-bold text-xs"
                  >
                    {uploadingEvidence ? (
                      <>
                        <Loader2 className="mr-2 size-3.5 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 size-3.5 text-[#C49B63]" /> Upload New Evidence
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {evidenceItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {evidenceItems.map((ev) => (
                    <Card key={ev.id} className="shadow-sm border-[#EAE5D9] bg-white">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-slate-100 p-2.5 text-[#C49B63] shrink-0">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-slate-900 truncate">{ev.file_name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Uploaded on {format(new Date(ev.created_at || Date.now()), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>

                        {ev.extracted_text && (
                          <div className="mt-4 border-t border-slate-100 pt-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Extracted Text Snapshot
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-3 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                              {ev.extracted_text}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 border-2 border-dashed border-[#EAE5D9] rounded-2xl bg-white space-y-3">
                  <FileText className="mx-auto size-10 text-slate-300" />
                  <h3 className="text-base font-bold text-slate-800">No evidence documents uploaded yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Attach screenshots, receipts, or contracts to enrich the AI analysis and generate precise draft documents.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Navigator Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[650px] rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
              {/* Chat Header */}
              <div className="bg-[#19201D] px-6 py-3.5 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Scale className="size-4 text-[#C49B63]" />
                  <span className="font-serif font-bold text-sm text-[#C49B63]">Nyaya AI Legal Navigator</span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium">Context: {caseTitle}</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#19201D] text-white rounded-br-none shadow-sm"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm whitespace-pre-wrap font-sans"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none px-5 py-3 text-xs shadow-sm flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin text-[#C49B63]" />
                      <span>Nyaya AI is analyzing statutory laws and case context...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Quick Question Prompts */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-medium text-slate-600 whitespace-nowrap">Suggested:</span>
                {[
                  "What if they ignore my calls?",
                  "Can they deduct painting charges?",
                  "Can they cut electricity or water?",
                  "Is WhatsApp chat valid in court?",
                  "Draft a formal demand notice",
                  "How many days do they have to refund?",
                  "What if they threaten me?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                    }}
                    className="text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="border-t border-slate-200 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask any legal question regarding ${caseTitle}...`}
                    className="flex-1 rounded-xl pl-4 pr-12 bg-slate-50 border-slate-200 text-sm h-11"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || sending}
                    className="absolute right-1 top-1 bottom-1 h-auto w-9 rounded-lg bg-[#19201D] text-[#C49B63] hover:bg-[#28352F]"
                  >
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
