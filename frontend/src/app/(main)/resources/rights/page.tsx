"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, Scale, ArrowLeft, Shield, CheckCircle2, AlertTriangle, 
  Car, ShoppingBag, Landmark, Home, UserCheck, Lock, Search, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/fade-in";

const RIGHTS_CATEGORIES = [
  {
    id: "traffic",
    title: "Traffic & Motorist Rights",
    icon: Car,
    description: "Rules regarding police checks, towing, spot fines, and digital documents",
    items: [
      {
        heading: "DigiLocker & mParivahan Document Validity",
        rule: "Rule 139 of Central Motor Vehicles Rules (CMVR) 1989 & MoRTH Circular",
        details: "Traffic police are legally required to accept digital Driving Licences, RC, Insurance, and PUC on DigiLocker or mParivahan. Physical documents cannot be demanded if digital copies are presented.",
        tip: "Show MoRTH Circular RT-11036/64/2017-MV if an officer refuses electronic documents.",
      },
      {
        heading: "Police Key Confiscation & Vehicle Towing Rules",
        rule: "Motor Vehicles Amendment Act 2019",
        details: "A traffic constable or police officer has NO legal right to snatch vehicle keys out of the ignition or deflate tires. Vehicles cannot be towed while a driver or passenger is inside.",
        tip: "Only Sub-Inspectors (SI) or officers wearing official uniform with name badge are authorized to issue spot fines.",
      },
      {
        heading: "Breathalyzer Test Rights",
        rule: "Motor Vehicles Act Section 203 & Section 185",
        details: "Police must use a clean, sealed disposable mouthpiece for every breathalyzer alcohol test. If blood alcohol content (BAC) exceeds 30mg per 100ml, you have the right to request a medical checkup at a government hospital within 2 hours.",
        tip: "Always insist on a fresh unsealed mouthpiece for breath tests.",
      },
    ],
  },
  {
    id: "consumer",
    title: "Consumer Rights & E-Commerce",
    icon: ShoppingBag,
    description: "Protection against defective goods, fake products, and refund refusals",
    items: [
      {
        heading: "Right to Refund & Replacement for Defective Products",
        rule: "Consumer Protection Act 2019 Section 2(47)",
        details: "Sellers and e-commerce platforms cannot legally display 'No Refund / No Return' policies for defective, damaged, or fake items. Consumers are entitled to full refund, replacement, or repair.",
        tip: "Record unboxing videos for high-value online purchases as evidence.",
      },
      {
        heading: "MRP Overcharging & Service Charge Removal",
        rule: "Legal Metrology Act 2009 & CCPA Guidelines",
        details: "No retailer, hotel, or multiplex can charge above the Maximum Retail Price (MRP). Service charges levied by restaurants are voluntary, and mandatory addition to bills is illegal.",
        tip: "You can lodge a complaint at National Consumer Helpline 1915 or send a whatsapp to 8800001915.",
      },
    ],
  },
  {
    id: "constitution",
    title: "Fundamental Constitutional Rights",
    icon: Landmark,
    description: "Article 14, 19, 21, 39A and protection against illegal detention",
    items: [
      {
        heading: "Article 21: Right to Life & Personal Liberty",
        rule: "Constitution of India Article 21",
        details: "Guarantees protection against arbitrary arrest, unlawful detention, and inhumane treatment. Encompasses right to privacy, clean environment, and speedy trial.",
        tip: "No person can be detained for more than 24 hours without being presented before a Magistrate.",
      },
      {
        heading: "Article 39A: Free Legal Aid (NALSA)",
        rule: "Constitution of India Article 39A & Legal Services Authorities Act 1987",
        details: "Provides free and competent legal services to women, children, SC/ST members, and persons with annual income under ₹3 Lakhs to ensure justice is not denied due to economic disability.",
        tip: "Contact NALSA Helpline 15100 or your local District Legal Services Authority (DLSA).",
      },
    ],
  },
  {
    id: "tenant",
    title: "Tenant & Housing Rights",
    icon: Home,
    description: "Security deposit return, eviction notice periods, and maintenance",
    items: [
      {
        heading: "Security Deposit Return Timeline",
        rule: "Model Tenancy Act 2021 Section 11",
        details: "Landlords must return the security deposit within 30 days after tenant vacates. Deductions are only permitted for actual unpaid bills or physical damage beyond reasonable wear and tear.",
        tip: "Always take time-stamped handover photos and video when vacating an apartment.",
      },
      {
        heading: "Arbitrary Eviction & Notice Period",
        rule: "Transfer of Property Act Section 106 & Model Tenancy Act",
        details: "A landlord cannot forcibly evict a tenant, lock doors, or disconnect electricity/water utilities without a court order or proper written notice (minimum 15 to 30 days).",
        tip: "Disconnection of essential services by landlord is an offense under Rent Control Acts.",
      },
    ],
  },
  {
    id: "women",
    title: "Women Legal Rights & Safety",
    icon: UserCheck,
    description: "Zero FIR, POSH Act, and special arrest safeguards",
    items: [
      {
        heading: "Right to Zero FIR",
        rule: "Criminal Procedure Code (CrPC) / BNSS & MHA Guidelines",
        details: "A woman can register a 'Zero FIR' at ANY police station regardless of where the incident occurred. The police station cannot turn away the complainant citing jurisdiction.",
        tip: "Zero FIR will later be transferred to the concerned jurisdiction station.",
      },
      {
        heading: "Arrest Restrictions After Sunset",
        rule: "Code of Criminal Procedure Section 46(4)",
        details: "Women cannot be arrested after sunset and before sunrise, except under exceptional circumstances with prior written permission of a Judicial Magistrate and by a female police officer.",
        tip: "Call Women Helpline 1091 if safety or procedural violations occur.",
      },
    ],
  },
  {
    id: "cyber",
    title: "Cyber Fraud & Bank Zero Liability",
    icon: Lock,
    description: "Protection against OTP scams, phishing, and fraudulent bank debits",
    items: [
      {
        heading: "RBI Zero Liability Rule for Unauthorized Debits",
        rule: "RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18",
        details: "If you notify your bank about an unauthorized online transaction within 3 working days, your financial liability is zero. The bank must credit the disputed amount within 10 days.",
        tip: "Immediately call 1930 (Cyber Crime Helpline) to block funds before fraudster withdraws.",
      },
    ],
  },
];

export default function KnowYourRightsPage() {
  const [activeTab, setActiveTab] = useState("traffic");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <FadeIn className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2">
            <ArrowLeft className="mr-1.5 size-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="size-8 text-[#C49B63]" />
            Know Your Rights
          </h1>
          <p className="text-slate-600 mt-1 text-base">
            Essential citizen rights under Indian Laws, Central Acts, and Constitutional provisions explained in clear language.
          </p>
        </div>

        <Link href="/queries/new">
          <Button className="bg-[#19201D] hover:bg-[#28352F] text-white shadow-md rounded-xl font-bold px-5">
            Ask Specific Question
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="traffic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto p-1.5 bg-slate-100/80 rounded-2xl gap-1 border border-slate-200">
          {RIGHTS_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-[#19201D] data-[state=active]:text-[#C49B63] data-[state=active]:shadow-md"
              >
                <Icon className="size-4" />
                {cat.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {RIGHTS_CATEGORIES.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#19201D] to-[#28352F] text-white space-y-2 border border-slate-800">
              <h2 className="text-xl font-serif font-bold text-[#C49B63] flex items-center gap-2">
                <cat.icon className="size-6" /> {cat.title}
              </h2>
              <p className="text-sm text-slate-300">{cat.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {cat.items.map((item, idx) => (
                <Card key={idx} className="shadow-sm border-[#EAE5D9] bg-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-slate-900">{item.heading}</h3>
                      <Badge className="bg-[#19201D] text-[#C49B63] font-mono text-[11px] shrink-0">
                        {item.rule}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed font-sans">
                      {item.details}
                    </p>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
                      <Shield className="size-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-amber-950">Actionable Tip: </strong>
                        {item.tip}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </FadeIn>
  );
}
