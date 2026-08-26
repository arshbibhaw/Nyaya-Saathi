"use client";

import { useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, MessageSquare, ClipboardList, FolderOpen, ArrowRight, 
  ShieldAlert, FileText, CheckCircle2, HelpCircle, Sparkles, PhoneCall,
  Clock, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCaseStore } from "@/store/case-store";
import { format } from "date-fns";

export default function DashboardPage() {
  const { cases, fetchCases } = useCaseStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const cards = [
    {
      title: "Know Your Rights",
      description: "Understand your constitutional and statutory rights in simple language",
      icon: BookOpen,
      href: "/resources/rights",
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200",
    },
    {
      title: "Ask a Legal Question",
      description: "Get real-time legal guidance & section analysis powered by Nyaya AI",
      icon: MessageSquare,
      href: "/queries/new",
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200",
    },
    {
      title: "My Cases",
      description: "Track active legal matters, timeline updates, and action roadmaps",
      icon: FolderOpen,
      href: "/cases",
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200",
    },
    {
      title: "Legal Resources",
      description: "Explore blogs, articles, and guides on traffic rules, consumer laws, and more",
      icon: ClipboardList,
      href: "/resources",
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200",
    },
  ];

  const recentQueries = [
    {
      id: "q-1",
      topic: "Traffic Rules & Police Fine",
      question: "Can police confiscate my vehicle key or DL during a routine check?",
      status: "Answered",
      date: "Today",
      category: "Motor Vehicles Act",
    },
    {
      id: "q-2",
      topic: "E-Commerce Refund",
      question: "Seller refused refund for defective smartphone delivered last week.",
      status: "Answered",
      date: "Yesterday",
      category: "Consumer Protection",
    },
  ];

  return (
    <div className="flex flex-col space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#19201D] via-[#28352F] to-[#19201D] p-6 md:p-8 text-white shadow-xl border border-[#3E5248]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C49B63]/20 border border-[#C49B63]/30 text-[#C49B63] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" /> AI Legal Assistant Active
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
            Welcome to Nyaya Saathi
          </h1>
          <p className="text-sm text-slate-300">
            Your personal legal co-pilot for simplified legal rights, instant query resolution, and structured case management across India.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          <Link href="/queries/new">
            <Button className="bg-[#C49B63] hover:bg-[#b08752] text-[#19201D] font-bold shadow-md">
              <MessageSquare className="mr-2 size-4" /> Ask Nyaya AI
            </Button>
          </Link>
          <Link href="/cases/new">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <FolderOpen className="mr-2 size-4" /> Start New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Main 4 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, idx) => (
          <Link href={card.href} key={idx} className="group">
            <div className="flex flex-col h-full bg-white rounded-2xl p-6 border border-[#EAE5D9] shadow-sm hover:shadow-md hover:border-[#C49B63]/40 transition-all cursor-pointer relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDFBF7] border border-[#EAE5D9] text-[#19201D] group-hover:bg-[#19201D] group-hover:text-[#C49B63] transition-colors">
                  <card.icon className="size-6" />
                </div>
                <div className="text-slate-300 group-hover:text-[#C49B63] transition-colors">
                  <ArrowRight className="size-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-1 group-hover:text-[#19201D]">{card.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases / Recent Queries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
              {cases.length > 0 ? (
                <>
                  <FolderOpen className="size-5 text-[#C49B63]" /> Active Legal Matters ({cases.length})
                </>
              ) : (
                <>
                  <HelpCircle className="size-5 text-[#C49B63]" /> Recent Legal Queries
                </>
              )}
            </h2>
            <Link
              href={cases.length > 0 ? "/cases" : "/queries"}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center"
            >
              View All {cases.length > 0 ? "Cases" : "Queries"} <ArrowRight className="ml-1 size-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {cases.length > 0 ? (
              cases.slice(0, 3).map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <div className="p-4 rounded-xl bg-white border border-[#EAE5D9] shadow-sm hover:border-[#C49B63]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 cursor-pointer group">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#19201D] text-[#C49B63] text-[10px] font-bold">
                          {c.domain || "Civil / Statutory"}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: {c.id.split("-")[0].toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          • {format(new Date(c.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#1F2937] group-hover:text-blue-600 transition-colors line-clamp-1">
                        {c.title || c.domain}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">{c.summary || c.issue}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="mr-1 size-3" /> Active
                      </Badge>
                      <Button variant="outline" size="sm" className="text-xs font-semibold border-[#EAE5D9]">
                        Open Workspace →
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              recentQueries.map((q) => (
                <div key={q.id} className="p-4 rounded-xl bg-white border border-[#EAE5D9] shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">
                        {q.category}
                      </Badge>
                      <span className="text-xs text-slate-400">• {q.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1F2937] truncate">{q.question}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium">
                      <CheckCircle2 className="mr-1 size-3" /> {q.status}
                    </Badge>
                    <Link href="/queries">
                      <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900">
                        View Answer
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Legal Helplines Widget */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
            <PhoneCall className="size-5 text-amber-600" /> Emergency Legal Helplines
          </h2>

          <div className="rounded-2xl bg-amber-500/10 border border-amber-200/80 p-5 space-y-4 text-slate-900">
            <div className="flex items-start gap-3">
              <ShieldAlert className="size-6 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">National Helplines (24x7)</p>
                <p className="text-xs text-amber-800/90 mt-0.5">Free official emergency assistance across India</p>
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-amber-200/60 pt-1">
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-slate-700">Cyber Crime Helpline</span>
                <a href="tel:1930" className="font-bold text-amber-900 hover:underline">1930</a>
              </div>
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-slate-700">National Consumer Helpline</span>
                <a href="tel:15100" className="font-bold text-amber-900 hover:underline">1915 / 15100</a>
              </div>
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-slate-700">Women Helpline</span>
                <a href="tel:1091" className="font-bold text-amber-900 hover:underline">1091</a>
              </div>
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-slate-700">NALSA Legal Aid</span>
                <a href="tel:15100" className="font-bold text-amber-900 hover:underline">15100</a>
              </div>
            </div>

            <Link href="/help" className="block text-center text-xs font-bold text-amber-900 hover:underline pt-2">
              View All Support Options →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
