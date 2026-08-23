"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, MessageSquare, Plus, Search, Filter, CheckCircle2, 
  Clock, BookOpen, Scale, ArrowRight, ShieldCheck, ChevronRight, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/fade-in";

interface QueryItem {
  id: string;
  question: string;
  category: string;
  state: string;
  date: string;
  status: "Answered" | "Under Review";
  summaryResponse: string;
  sectionsCited: string[];
  actionStep: string;
}

const INITIAL_QUERIES: QueryItem[] = [
  {
    id: "q-101",
    question: "Traffic police stopped me and asked for original RC and DL. Can I show Digilocker documents?",
    category: "Traffic Rules & Vehicles Act",
    state: "Maharashtra",
    date: "Aug 22, 2026",
    status: "Answered",
    summaryResponse: "Yes, under Rule 139 of the Central Motor Vehicles Rules (CMVR) 1989 and MoRTH advisory, electronic documents on DigiLocker and mParivahan are legally valid and must be accepted by traffic police.",
    sectionsCited: ["CMVR Rule 139", "Motor Vehicles Amendment Act Sec 130", "IT Act Sec 4"],
    actionStep: "If a traffic officer refuses DigiLocker, note their badge number and show MoRTH Circular RT-11036/64/2017-MV.",
  },
  {
    id: "q-102",
    question: "Purchased a laptop online which arrived defective. Seller refusing return after 7 days.",
    category: "Consumer Rights & E-Commerce",
    state: "Karnataka",
    date: "Aug 20, 2026",
    status: "Answered",
    summaryResponse: "Under the Consumer Protection (E-Commerce) Rules 2020, sellers cannot refuse returns or refunds for defective products. You can lodge a complaint on National Consumer Helpline (1915).",
    sectionsCited: ["Consumer Protection Act 2019 Sec 2(47)", "E-Commerce Rules 2020 Sec 6"],
    actionStep: "Send a formal notice to customer care or file a grievance at consumerhelpline.gov.in.",
  },
  {
    id: "q-103",
    question: "Landlord is refusing to refund my security deposit of ₹45,000 after I moved out with 1 month notice.",
    category: "Tenant & Property Rights",
    state: "Delhi (NCT)",
    date: "Aug 18, 2026",
    status: "Answered",
    summaryResponse: "Unless actual physical damage beyond normal wear and tear is proven with itemized bills, the landlord is legally obligated to return the security deposit within 30 days.",
    sectionsCited: ["Model Tenancy Act 2021 Sec 11", "Delhi Rent Control Act"],
    actionStep: "Draft a formal Legal Demand Notice via Nyaya Saathi Document Vault giving 15 days to refund before filing in Rent Authority/Consumer Court.",
  },
  {
    id: "q-104",
    question: "Received fraudulent OTP message and ₹15,000 debited from bank account. What is my liability?",
    category: "Cyber Crime & Banking Fraud",
    state: "Tamil Nadu",
    date: "Aug 15, 2026",
    status: "Answered",
    summaryResponse: "According to RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18, if reported to bank within 3 working days, zero liability applies for unauthorized electronic banking transactions.",
    sectionsCited: ["RBI Customer Liability Circular 2017", "IT Act Sec 66D"],
    actionStep: "Call Cyber Crime Helpline 1930 immediately and lodge formal written complaint with your bank branch.",
  },
];

export default function QueriesPage() {
  const [queries, setQueries] = useState<QueryItem[]>(INITIAL_QUERIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedQuery, setSelectedQuery] = useState<QueryItem | null>(null);

  const categories = [
    "All",
    "Traffic Rules & Vehicles Act",
    "Consumer Rights & E-Commerce",
    "Tenant & Property Rights",
    "Cyber Crime & Banking Fraud",
  ];

  const filteredQueries = queries.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.summaryResponse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sectionsCited.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || q.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <FadeIn className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <HelpCircle className="size-8 text-[#C49B63]" />
            My Legal Queries
          </h1>
          <p className="text-slate-600 mt-1 text-base">
            Review past questions, AI guidance, and cited legal provisions or ask a new legal question.
          </p>
        </div>

        <Link href="/queries/new">
          <Button className="bg-[#19201D] hover:bg-[#28352F] text-white shadow-md rounded-xl font-bold px-5">
            <Plus className="mr-2 size-4 text-[#C49B63]" /> Ask Legal Question
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <Input
            placeholder="Search queries, acts, legal sections, or keywords..."
            className="pl-10 rounded-xl bg-white border-[#EAE5D9]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? "bg-[#19201D] text-[#C49B63] border-[#19201D]"
                  : "bg-white text-slate-600 border-[#EAE5D9] hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Queries List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQueries.length > 0 ? (
          filteredQueries.map((item) => (
            <Card
              key={item.id}
              className="shadow-sm hover:shadow-md border-[#EAE5D9] transition-all bg-white overflow-hidden cursor-pointer"
              onClick={() => setSelectedQuery(item)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-medium text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-slate-400">• {item.state}</span>
                    <span className="text-xs text-slate-400">• {item.date}</span>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="mr-1 size-3" /> {item.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#C49B63] transition-colors">
                    {item.question}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.summaryResponse}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-500 mr-1 flex items-center">
                      <Scale className="mr-1 size-3 text-[#C49B63]" /> Cited Provisions:
                    </span>
                    {item.sectionsCited.map((sec, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {sec}
                      </span>
                    ))}
                  </div>

                  <span className="text-blue-600 font-bold flex items-center hover:underline">
                    View Full Analysis <ChevronRight className="ml-0.5 size-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 px-4 border-2 border-dashed border-[#EAE5D9] rounded-2xl bg-white space-y-4">
            <MessageSquare className="mx-auto size-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-800">No matching legal queries found</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">
              Try adjusting your search keywords or ask a new legal question to get instant guidance from Nyaya AI.
            </p>
            <Link href="/queries/new">
              <Button className="bg-[#19201D] text-white">Ask a Legal Question</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Selected Query Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 mb-2">
                  {selectedQuery.category} ({selectedQuery.state})
                </Badge>
                <h2 className="text-xl font-bold text-slate-900">{selectedQuery.question}</h2>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedQuery(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" /> Nyaya AI Legal Guidance
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans">
                  {selectedQuery.summaryResponse}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="size-4 text-[#C49B63]" /> Applicable Laws & Sections
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedQuery.sectionsCited.map((sec, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-[#19201D] text-[#C49B63] font-mono text-xs font-bold">
                      {sec}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-blue-600" /> Recommended Action Step
                </h4>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-sm text-blue-900 font-medium">
                  {selectedQuery.actionStep}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <Link href={`/cases/new`}>
                <Button className="bg-[#C49B63] hover:bg-[#b08752] text-[#19201D] font-bold text-xs">
                  Convert to Formal Case Notice
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setSelectedQuery(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
