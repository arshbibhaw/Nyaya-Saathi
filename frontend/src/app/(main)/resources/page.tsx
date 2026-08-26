"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, Search, Filter, ShieldCheck, Car, ShoppingBag, Lock, 
  Home, Landmark, ArrowRight, ChevronRight, FileText, Share2, Sparkles, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/fade-in";

interface Article {
  id: string;
  title: string;
  category: "Traffic Rules" | "Consumer Rights" | "Cyber Crime" | "Constitution" | "Tenant Rights";
  readTime: string;
  date: string;
  summary: string;
  author: string;
  sectionsCited: string[];
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Complete Guide to Traffic Rules & Police Check Rights in India (2026)",
    category: "Traffic Rules",
    readTime: "5 min read",
    date: "Aug 20, 2026",
    author: "Adv. Rajesh Sharma",
    summary: "What to do when traffic police stop your vehicle. DigiLocker validity, spot fine rules, key confiscation legality, and breathalyzer procedures.",
    sectionsCited: ["Motor Vehicles Act Sec 130", "CMVR Rule 139", "IT Act Sec 4"],
    content: [
      "Traffic police checks are a routine occurrence on Indian roads, yet most citizens are unaware of their legal rights during a check. Under Section 130 of the Motor Vehicles Act 1988 read with Central Motor Vehicles Rules 1989 (Rule 139), drivers have specific procedural protections.",
      "1. Electronic Documents Are Legally Mandatory: Pursuant to MoRTH advisories and IT Act Section 4, documents shown on official DigiLocker or mParivahan apps carry equal legal weight to physical laminated cards. A traffic officer cannot demand physical originals if DigiLocker copies are produced.",
      "2. Key Snatching & Towing Legality: Police constables or officers do not possess legal authorization to remove vehicle keys from the ignition or deflate tires. Furthermore, vehicles containing passengers or drivers cannot be towed under towing guidelines.",
      "3. Authorized Fine Collection: Only police officers holding the rank of Sub-Inspector (SI) or above with a visible name badge and official e-challan device can issue spot cash or digital fines.",
    ],
  },
  {
    id: "art-2",
    title: "Consumer Protection Act 2019: Refunds, E-Commerce & Service Charges",
    category: "Consumer Rights",
    readTime: "6 min read",
    date: "Aug 18, 2026",
    author: "Nyaya Saathi Legal Research Desk",
    summary: "Understanding your rights when buying online or offline. Mandatory return policies, hidden service charges, and filing complaints on 1915.",
    sectionsCited: ["Consumer Protection Act 2019 Sec 2(47)", "E-Commerce Rules 2020", "Legal Metrology Act"],
    content: [
      "The Consumer Protection Act 2019 revolutionized consumer rights in India by introducing central authority enforcement (CCPA), e-commerce accountability, and product liability provisions.",
      "1. Mandatory Refund & Return Policies: E-commerce entities are forbidden from enforcing unfair 'No Returns' policies for defective or damaged goods. If a product arrives broken, fake, or significantly different, the seller is bound to refund or replace it.",
      "2. Mandatory Service Charge Removal: Restaurant service charges are purely voluntary. Central Consumer Protection Authority (CCPA) guidelines explicitly prohibit adding service charges automatically to dining bills.",
      "3. How to Lodge Complaints: If a seller or service provider defaults, lodge a complaint online at consumerhelpline.gov.in or call 1915 to trigger National Consumer Helpline mediation.",
    ],
  },
  {
    id: "art-3",
    title: "Cyber Banking Fraud: How to Recover Funds & Claim Bank Zero Liability",
    category: "Cyber Crime",
    readTime: "7 min read",
    date: "Aug 15, 2026",
    author: "Cyber Law Specialist Cell",
    summary: "Step-by-step guide to reporting OTP scams, unauthorized UPI/card debits within 72 hours to ensure full refund under RBI guidelines.",
    sectionsCited: ["RBI Customer Liability Circular 2017", "IT Act Sec 66D", "BNSS Sec 318"],
    content: [
      "Financial cyber fraud is on the rise across UPI, net banking, and credit cards. However, RBI regulations offer robust financial protection to bank account holders provided swift reporting takes place.",
      "1. The 72-Hour Golden Window: According to RBI Circular DBR.No.Leg.BC.78/2017-18, if an unauthorized transaction occurs due to third-party breach or scam, reporting it to your bank within 3 working days ensures ZERO liability for the customer.",
      "2. Immediate Helpline 1930 Call: Dial 1930 immediately to freeze the money in the fraudster's wallet or bank account before it is withdrawn.",
      "3. Bank Compensation Mandate: Once reported, the bank must credit the disputed amount into the customer's account within 10 working days, subject to investigation.",
    ],
  },
  {
    id: "art-4",
    title: "Model Tenancy Act: Security Deposit Refunds & Tenant Safeguards",
    category: "Tenant Rights",
    readTime: "4 min read",
    date: "Aug 12, 2026",
    author: "Property Rights Editorial",
    summary: "Landlord-tenant laws in India: 30-day deposit return timeline, arbitrary rent hikes, and eviction rules.",
    sectionsCited: ["Model Tenancy Act 2021 Sec 11", "Transfer of Property Act Sec 108"],
    content: [
      "Renting a flat or house in urban India often brings friction regarding security deposits and maintenance costs. The Model Tenancy Act 2021 aims to balance landlord and tenant obligations.",
      "1. 30-Day Security Deposit Cap: For residential housing, landlords cannot demand exorbitant security deposits. Upon vacating, the security deposit must be refunded within 1 month.",
      "2. Essential Services Protection: Landlords cannot cut off electricity, water supply, or elevator access under any dispute.",
    ],
  },
  {
    id: "art-5",
    title: "Fundamental Constitutional Rights Every Citizen Should Know",
    category: "Constitution",
    readTime: "8 min read",
    date: "Aug 10, 2026",
    author: "Constitutional Law Forum",
    summary: "Article 14, 19, 21 and 39A (Free Legal Aid) demystified for everyday situations.",
    sectionsCited: ["Constitution Art 14", "Constitution Art 19", "Constitution Art 21", "Art 39A"],
    content: [
      "The Constitution of India guarantees basic human rights that protect citizens against state overreach and unlawful discrimination.",
      "Article 21 guarantees the right to life, dignity, personal liberty, privacy, and fair trial. Article 39A mandates free legal representation for economically weaker citizens via NALSA.",
    ],
  },
];

export default function LegalResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const categories = ["All", "Traffic Rules", "Consumer Rights", "Cyber Crime", "Tenant Rights", "Constitution"];

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.sectionsCited.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <FadeIn className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#19201D] via-[#28352F] to-[#19201D] p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge className="bg-[#C49B63] text-[#19201D] font-bold text-xs">
            Nyaya Knowledge Base
          </Badge>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide">
            Legal Resources & Articles
          </h1>
          <p className="text-sm text-slate-300">
            Simplified legal blogs, statutory guides, and constitutional analysis written by legal experts for Indian citizens.
          </p>
        </div>

        <Link href="/resources/rights">
          <Button className="bg-[#C49B63] hover:bg-[#b08752] text-[#19201D] font-bold shadow-md">
            <BookOpen className="mr-2 size-4" /> Know Your Rights Portal →
          </Button>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <Input
            placeholder="Search legal blogs, traffic rules, cyber crime, consumer act..."
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

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art) => (
          <Card
            key={art.id}
            className="shadow-sm hover:shadow-md border-[#EAE5D9] transition-all bg-white cursor-pointer flex flex-col justify-between"
            onClick={() => setActiveArticle(art)}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="bg-slate-50 text-slate-700 font-medium text-xs">
                  {art.category}
                </Badge>
                <span className="text-xs text-slate-400">{art.readTime}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 hover:text-[#C49B63] transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">By {art.author} • {art.date}</p>
                <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap gap-1">
                  {art.sectionsCited.slice(0, 2).map((sec, i) => (
                    <span key={i} className="bg-slate-100 font-mono text-[10px] text-slate-700 px-2 py-0.5 rounded">
                      {sec}
                    </span>
                  ))}
                </div>
                <span className="text-blue-600 font-bold flex items-center hover:underline">
                  Read Article <ChevronRight className="ml-1 size-4" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Article Reader Drawer Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#19201D] text-[#C49B63] text-xs">
                    {activeArticle.category}
                  </Badge>
                  <span className="text-xs text-slate-400">• {activeArticle.readTime}</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 leading-snug">
                  {activeArticle.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Written by {activeArticle.author} on {activeArticle.date}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setActiveArticle(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 mr-2">Key Statutory Sections:</span>
                {activeArticle.sectionsCited.map((sec, i) => (
                  <Badge key={i} className="bg-[#19201D] text-[#C49B63] font-mono text-xs">
                    {sec}
                  </Badge>
                ))}
              </div>

              <div className="space-y-4 text-slate-800 text-sm leading-relaxed font-sans">
                {activeArticle.content.map((paragraph, idx) => (
                  <p key={idx} className="bg-white p-2 rounded-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link href="/queries/new">
                <Button className="bg-[#19201D] text-[#C49B63] font-bold text-xs">
                  Ask Question Regarding This Subject
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setActiveArticle(null)}>
                Close Reader
              </Button>
            </div>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
