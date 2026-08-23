"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, Files, Download, Copy, Check, Eye, Plus, Search, 
  Shield, FileCheck, ArrowRight, FolderOpen, Printer, Sparkles, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/fade-in";
import { useCaseStore } from "@/store/case-store";
import * as api from "@/lib/api";
import { format } from "date-fns";

interface DocumentTemplate {
  id: string;
  title: string;
  category: "RTI Application" | "Consumer Notice" | "Cyber Fraud" | "Property Notice" | "Employment Notice";
  description: string;
  sections: string[];
  content: string;
}

interface VaultDocItem {
  id: string;
  caseId: string;
  name: string;
  type: string;
  date: string;
  size?: string;
  status: string;
  content?: string;
}

const TEMPLATES: DocumentTemplate[] = [
  {
    id: "tpl-1",
    title: "Standard RTI (Right to Information) Application",
    category: "RTI Application",
    description: "Official RTI format to seek information from Public Information Officers (PIO) under RTI Act 2005.",
    sections: ["RTI Act 2005 Sec 6(1)"],
    content: `To,
The Public Information Officer (PIO),
[Name of Public Authority / Department Office],
[City, State]

Subject: Application for Information under Section 6(1) of the Right to Information Act, 2005.

1. Full Name of Applicant: [Your Name]
2. Address for Correspondence: [Your Full Address, Phone & Email]

3. Particulars of Information Required:
   a. Details of status/progress of file/complaint reference no: [Reference Number].
   b. Certified copies of all daily progress notes and inspector remarks regarding the above matter.
   c. Name and designation of officers responsible for processing this application.

4. Fee Details: Court fee stamp / Indian Postal Order (IPO) of ₹10 attached herewith.

Date: [Date]
Place: [City]
Signature: ______________________`,
  },
  {
    id: "tpl-2",
    title: "Consumer Legal Demand Notice for Defective Product",
    category: "Consumer Notice",
    description: "Formal legal notice to seller or e-commerce merchant demanding full refund within 15 days.",
    sections: ["Consumer Protection Act 2019 Sec 2(47)"],
    content: `LEGAL DEMAND NOTICE (WITHOUT PREJUDICE)

To,
[Name of Seller / E-Commerce Entity]
[Registered Office Address]

Subject: Notice for refund of ₹[Amount] towards purchase of defective product Order ID: [Order ID].

Sir/Madam,

Under instructions from my client / On my own behalf, I hereby serve you with this Legal Notice:

1. On [Date], I purchased [Product Name] bearing Order ID [Order ID] for a sum of ₹[Amount].
2. Upon delivery, the product was found to be defective/damaged [describe defect].
3. Despite repeated communications, your company refused refund/replacement in violation of Section 2(47) of the Consumer Protection Act 2019.

I hereby call upon you to refund the full amount of ₹[Amount] along with ₹5,000 compensation within 15 days of receipt of this notice, failing which appropriate proceedings will be initiated in the District Consumer Disputes Redressal Commission at your cost and consequences.

Date: [Date]
Sender Name: [Your Name]`,
  },
  {
    id: "tpl-3",
    title: "Bank Dispute Letter for Unauthorized Transaction",
    category: "Cyber Fraud",
    description: "Formal dispute letter to bank branch manager for fraudulent debit under RBI Zero Liability rules.",
    sections: ["RBI Circular DBR.No.Leg.BC.78/2017-18"],
    content: `To,
The Branch Manager,
[Name of Bank], [Branch Name]
[City, State]

Subject: Formal Dispute and Claim for Zero Liability for Unauthorized Transaction of ₹[Amount] on Account No: [Account Number].

Sir/Madam,

I hold a Savings Bank Account (No: [Account Number]) with your branch.

1. On [Date] at [Time], an unauthorized electronic transaction of ₹[Amount] occurred from my account.
2. I did not initiate this transaction nor did I share any OTP/PIN with any third party.
3. As required under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18, I am notifying the bank within 72 hours of the occurrence.
4. National Cyber Crime Helpline acknowledgment number: [Cyber Acknowledgment Number].

Kindly block the associated card/account services and shadow credit the disputed amount of ₹[Amount] into my account pending investigation.

Date: [Date]
Account Holder Name: [Your Name]
Contact: [Mobile Number]`,
  },
  {
    id: "tpl-4",
    title: "Tenant Notice for Refund of Security Deposit",
    category: "Property Notice",
    description: "Legal demand notice to landlord for immediate refund of security deposit with statutory interest.",
    sections: ["Model Tenancy Act 2021 Sec 11", "Transfer of Property Act Sec 108"],
    content: `LEGAL NOTICE FOR REFUND OF TENANCY SECURITY DEPOSIT

To,
[Landlord / Owner Name]
[Property Address]

Subject: Demand for Refund of Security Deposit of ₹[Amount] for Premises [Address]

Sir/Madam,

1. I was a tenant at the premises under Rental Agreement dated [Date], having paid a refundable security deposit of ₹[Amount].
2. Peaceful vacant possession was handed over on [Date] after serving due notice and clearing utility dues.
3. Under Section 11 of the Model Tenancy Act, 2021 and Transfer of Property Act, 1882, the security deposit must be refunded within 30 days of vacation.

You are hereby called upon to refund ₹[Amount] within 15 days of this notice, failing which legal recovery proceedings under Order XXXVII CPC / Rent Authority will be initiated.

Date: [Date]
Tenant Name: [Your Name]`,
  },
];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [vaultDocs, setVaultDocs] = useState<VaultDocItem[]>([]);
  const [loadingVault, setLoadingVault] = useState(true);

  const { cases, fetchCases } = useCaseStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    async function loadVault() {
      setLoadingVault(true);
      const docs: VaultDocItem[] = [];

      for (const c of cases) {
        // Fetch generated documents for this case
        try {
          const doc = await api.getDocument(c.id);
          if (doc && doc.content) {
            docs.push({
              id: doc.id || `doc-${c.id}`,
              caseId: c.id,
              name: `Legal Notice Draft - ${c.title || c.domain || "Case"}.txt`,
              type: "AI Drafted Notice",
              date: format(new Date(c.created_at), "MMM d, yyyy"),
              size: `${(doc.content.length / 1024).toFixed(1)} KB`,
              status: "Draft Ready",
              content: doc.content,
            });
          }
        } catch {}

        // Fetch uploaded evidence files
        try {
          const evidence = await api.listEvidence(c.id);
          for (const ev of evidence) {
            docs.push({
              id: ev.id || ev.evidence_id || `ev-${c.id}-${ev.file_name}`,
              caseId: c.id,
              name: ev.file_name,
              type: "Uploaded Evidence",
              date: format(new Date(ev.created_at || Date.now()), "MMM d, yyyy"),
              size: "Attached Document",
              status: "Verified",
            });
          }
        } catch {}
      }

      setVaultDocs(docs);
      setLoadingVault(false);
    }

    loadVault();
  }, [cases]);

  const handleCopyTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <FadeIn className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <FileText className="size-8 text-[#C49B63]" />
            Document Vault & Legal Templates
          </h1>
          <p className="text-slate-600 mt-1 text-base">
            Access your evidence vault or download ready-to-use legal draft templates for RTI, consumer complaints, and bank disputes.
          </p>
        </div>

        <Link href="/cases/new">
          <Button className="bg-[#19201D] hover:bg-[#28352F] text-white shadow-md rounded-xl font-bold px-5">
            <Plus className="mr-2 size-4 text-[#C49B63]" /> Start New Case & Draft
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex h-auto p-1.5 bg-slate-100/80 rounded-2xl gap-1 border border-slate-200 w-fit">
          <TabsTrigger
            value="templates"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-[#19201D] data-[state=active]:text-[#C49B63]"
          >
            <Sparkles className="size-4" /> Ready Legal Templates
          </TabsTrigger>
          <TabsTrigger
            value="vault"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-[#19201D] data-[state=active]:text-[#C49B63]"
          >
            <Files className="size-4" /> Saved Vault Documents ({vaultDocs.length})
          </TabsTrigger>
        </TabsList>

        {/* Legal Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((tpl) => (
              <Card key={tpl.id} className="shadow-sm border-[#EAE5D9] bg-white flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 font-medium text-xs">
                    {tpl.category}
                  </Badge>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{tpl.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{tpl.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">{tpl.sections[0]}</span>
                    <Button
                      size="sm"
                      className="bg-[#19201D] text-[#C49B63] font-bold text-xs"
                      onClick={() => setSelectedTemplate(tpl)}
                    >
                      <Eye className="mr-1.5 size-3.5" /> Preview & Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Vault Saved Documents Tab */}
        <TabsContent value="vault" className="space-y-6">
          {loadingVault ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-[#C49B63] mb-3" />
              <p className="text-sm text-slate-500 font-medium">Loading your document vault...</p>
            </div>
          ) : vaultDocs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {vaultDocs.map((doc) => (
                <Card key={doc.id} className="shadow-sm border-[#EAE5D9] bg-white">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 rounded-xl bg-slate-100 text-[#C49B63] shrink-0">
                        <FileText className="size-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                        <p className="text-xs text-slate-500">{doc.type} • {doc.size} • {doc.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                        {doc.status}
                      </Badge>
                      <Link href={`/cases/${doc.caseId}`}>
                        <Button variant="outline" size="sm" className="text-xs border-[#EAE5D9] font-semibold">
                          Open Case Workspace
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 border-2 border-dashed border-[#EAE5D9] rounded-2xl bg-white space-y-3">
              <Files className="mx-auto size-10 text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">Your Document Vault is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                File a case or upload evidence to automatically generate legal notice drafts and store documents securely.
              </p>
              <Link href="/cases/new">
                <Button className="bg-[#19201D] text-white font-bold text-xs">Start a New Case</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Preview & Copy Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <Badge className="bg-[#19201D] text-[#C49B63] text-xs mb-2">
                  {selectedTemplate.category}
                </Badge>
                <h2 className="text-xl font-bold text-slate-900">{selectedTemplate.title}</h2>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedTemplate(null)}>
                ✕
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto border border-slate-800">
              {selectedTemplate.content}
            </div>

            <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Fill details in bracketed placeholders [ ] before signing.</span>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-[#C49B63] hover:bg-[#b08752] text-[#19201D] font-bold text-xs"
                  onClick={() => handleCopyTemplate(selectedTemplate.content)}
                >
                  {copied ? <Check className="mr-1.5 size-4 text-emerald-950" /> : <Copy className="mr-1.5 size-4" />}
                  {copied ? "Copied to Clipboard" : "Copy Template"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
