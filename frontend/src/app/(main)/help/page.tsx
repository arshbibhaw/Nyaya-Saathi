"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, PhoneCall, ShieldAlert, Mail, Send, CheckCircle2, 
  MessageSquare, FileText, ChevronDown, ChevronUp, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/fade-in";

const HELPLINES = [
  { name: "National Cyber Crime Helpline", number: "1930", hours: "24x7 Emergency", desc: "For reporting financial fraud, OTP scams & cyber crime" },
  { name: "National Consumer Helpline", number: "1915 / 15100", hours: "8 AM - 8 PM", desc: "For defective goods, e-commerce refunds & service disputes" },
  { name: "Women Helpline (NCW)", number: "1091", hours: "24x7 Emergency", desc: "For harassment, domestic violence & workplace safety" },
  { name: "NALSA Free Legal Aid", number: "15100", hours: "9:30 AM - 6 PM", desc: "Free legal representation for eligible citizens across India" },
];

const FAQS = [
  {
    q: "How does Nyaya Saathi provide legal guidance?",
    a: "Nyaya Saathi utilizes AI model fine-tuned on Central Motor Vehicles Rules, Consumer Protection Act 2019, Information Technology Act, IPC/BNS, and Constitution articles to deliver instant citizen-friendly explanations.",
  },
  {
    q: "Is my personal data and evidence document secure?",
    a: "Yes. All uploads and text details are encrypted using AES-256 standards. We enforce strict zero-retention privacy policies for sensitive personal files.",
  },
  {
    q: "Are electronic documents on DigiLocker valid during traffic police checks?",
    a: "Yes. Under Rule 139 of CMVR 1989 and MoRTH directives, digital copies on DigiLocker and mParivahan are legally binding across all States and Union Territories in India.",
  },
  {
    q: "Can I consult a human advocate through Nyaya Saathi?",
    a: "Nyaya Saathi generates formal notice drafts, complaint letters, and action roadmaps. For litigation, you can export your case summary directly to registered advocates.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactData, setContactData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setContactData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSentSuccess(false), 5000);
  };

  return (
    <FadeIn className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <HelpCircle className="size-8 text-[#C49B63]" />
          Help & Support Center
        </h1>
        <p className="text-slate-600 mt-1 text-base">
          Emergency helpline directory, citizen FAQs, and direct technical support contact form.
        </p>
      </div>

      {/* Emergency Helplines Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <PhoneCall className="size-5 text-amber-600" /> Emergency Legal Helplines (India)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HELPLINES.map((h, i) => (
            <Card key={i} className="shadow-sm border-amber-200/80 bg-amber-500/10">
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{h.name}</h3>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold">
                      {h.hours}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{h.desc}</p>
                </div>

                <a
                  href={`tel:${h.number.split(" ")[0]}`}
                  className="px-3.5 py-2 rounded-xl bg-[#19201D] text-[#C49B63] font-mono text-sm font-bold shrink-0 hover:bg-[#28352F] transition-colors"
                >
                  {h.number}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-serif font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl border border-[#EAE5D9] bg-white overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="size-4 text-[#C49B63]" /> : <ChevronDown className="size-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-slate-900">Contact Support</h2>
          <Card className="shadow-sm border-[#EAE5D9] bg-white">
            <CardContent className="p-6 space-y-4">
              {sentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" /> Message sent! Our team will reply shortly.
                </div>
              )}

              <form onSubmit={handleSubmitContact} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="c_name" className="text-xs font-bold">Your Name</Label>
                  <Input
                    id="c_name"
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    required
                    className="text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c_email" className="text-xs font-bold">Email Address</Label>
                  <Input
                    id="c_email"
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    required
                    className="text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c_msg" className="text-xs font-bold">Message</Label>
                  <Textarea
                    id="c_msg"
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    required
                    className="text-xs min-h-[90px] rounded-lg"
                  />
                </div>

                <Button type="submit" className="w-full bg-[#19201D] text-[#C49B63] font-bold text-xs rounded-xl py-4">
                  <Send className="mr-1.5 size-3.5" /> Send Support Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </FadeIn>
  );
}
