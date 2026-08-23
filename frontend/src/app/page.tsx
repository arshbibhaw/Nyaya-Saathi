"use client";

import Link from "next/link";
import { ArrowRight, Scale, Menu, X, ArrowUpRight, Compass, FileSearch, ClipboardList, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Compass,
    title: "AI Legal Navigator",
    description: "Describe your problem in plain language. Our AI identifies the relevant laws and your legal options instantly."
  },
  {
    icon: FileSearch,
    title: "Evidence Analyzer",
    description: "Upload PDFs, screenshots, or documents. OCR extracts dates, names, and amounts automatically."
  },
  {
    icon: ClipboardList,
    title: "Smart Action Plans",
    description: "Get a step-by-step personalized roadmap — who to contact, what to file, and when."
  },
  {
    icon: Zap,
    title: "Document Generator",
    description: "Generate legal complaints, notices, and letters based on your evidence and situation."
  }
];

const steps = [
  { num: "01", title: "Describe", subtitle: "Tell us your problem in your own words" },
  { num: "02", title: "Analyze", subtitle: "AI identifies laws & extracts evidence" },
  { num: "03", title: "Plan", subtitle: "Get a clear step-by-step action plan" },
  { num: "04", title: "Act", subtitle: "Generate documents & take action" },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FCFCFD] text-[#0F172A] selection:bg-slate-900 selection:text-white overflow-hidden font-sans">
      
      {/* --- Animated Iridescent Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-pink-200/40 via-red-100/40 to-transparent blur-[120px] mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-orange-200/40 via-yellow-100/40 to-transparent blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-slate-200/60 via-indigo-100/30 to-transparent blur-[140px] mix-blend-multiply animate-blob animation-delay-4000" />
        
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />
      </div>

      {/* --- Navigation --- */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-3" : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-slate-200/80 shadow-sm">
                <Image 
                  src="/logo-mark.png" 
                  alt="Nyaya Saathi Logo" 
                  fill 
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <span className="text-xl font-serif tracking-widest text-[#19201D]">
                NYAYA SAATHI
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it Works</Link>
              <Link href="#resources" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Resources</Link>
              <Link href="#connect" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Connect</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <span className="text-sm font-medium text-slate-500">
              Available for instant legal analysis
            </span>
            <Link href="/auth/register">
              <Button className="rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-5 h-auto text-sm font-medium group transition-all">
                Start your case
                <div className="ml-2 bg-white text-[#0F172A] rounded-full p-1 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="size-3" />
                </div>
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden flex items-center justify-center p-2 text-slate-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col px-6 py-6 md:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-slate-200/80 shadow-sm">
                  <Image 
                    src="/logo-mark.png" 
                    alt="Nyaya Saathi Logo" 
                    fill 
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="text-xl font-serif tracking-widest text-[#19201D]">
                  NYAYA SAATHI
                </span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-900">
                <X className="size-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 text-2xl font-semibold tracking-tight">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
              <Link href="#resources" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
              <Link href="#connect" onClick={() => setMobileMenuOpen(false)}>Connect</Link>
            </nav>

            <div className="mt-auto flex flex-col gap-4">
              <span className="text-sm font-medium text-slate-500">
                Available for instant legal analysis
              </span>
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-6 h-auto text-lg font-medium flex justify-between">
                  Start your case
                  <div className="bg-white text-[#0F172A] rounded-full p-1.5">
                    <ArrowRight className="size-4" />
                  </div>
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Hero Section --- */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 pt-40 md:pt-56 pb-20 md:pb-32">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold leading-[1.1] tracking-tight text-[#3A332C] max-w-4xl mb-6 font-serif"
        >
          Understand.<br/>
          Decide. Move Forward.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl text-[#3A332C]/80 mb-12 max-w-xl font-medium"
        >
          Trusted legal guidance<br/>for every citizen.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
        >
          <Link href="/auth/register">
            <button className="flex items-center justify-between gap-4 rounded-xl bg-[#C49B63] hover:bg-[#A78B5D] text-white px-8 py-4 transition-colors font-medium text-lg w-full sm:w-auto shadow-md">
              Explore Your Options
              <div className="bg-white text-[#E85D36] rounded-full p-1.5">
                <ArrowRight className="size-4" />
              </div>
            </button>
          </Link>

          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-3 shadow-sm">
            <div className="flex -space-x-1">
              <Scale className="size-5 text-[#E85D36] ml-1" />
            </div>
            <span className="text-sm font-semibold text-slate-900 ml-1">AI Legal Tech</span>
            <span className="bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ml-2">
              Featured
            </span>
          </div>
        </motion.div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 py-24 border-t border-slate-200/50">
        <div className="mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-[#0F172A] mb-6">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            A complete AI-powered toolkit to navigate the Indian legal system with confidence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-8 rounded-[2rem] hover:bg-white/80 transition-colors shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#0F172A] text-white mb-6">
                <feature.icon className="size-5" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 py-24 border-t border-slate-200/50">
         <div className="mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-[#0F172A] mb-6">
            Process
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Four simple steps from confusion to action.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.num} className="relative flex flex-col">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-4xl font-bold tracking-tighter text-[#E85D36] opacity-30">
                  {step.num}
                </span>
                {i < steps.length - 1 && (
                  <div className="hidden md:block h-[1px] w-full mx-6 bg-slate-200 flex-1" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Footer --- */}
      <footer id="connect" className="relative z-10 bg-[#0A1118] text-white overflow-hidden pt-20 pb-12 rounded-t-[3rem]">
        <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
            
            {/* Column 1: Brand & Description */}
            <div className="flex flex-col gap-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#0A1118]">
                  <Scale className="size-5" />
                </div>
                <span className="text-2xl font-bold tracking-tight">Nyaya Saathi</span>
              </div>
              <p className="text-[#8892B0] text-sm leading-relaxed max-w-xs mt-2">
                An AI-driven legal navigation platform empowering citizens with clear actionable insights and step-by-step guidance.
              </p>
            </div>

            {/* Column 2: Platform */}
            <div className="md:col-start-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8892B0] mb-6">Platform</h4>
              <ul className="flex flex-col gap-3.5 text-[#CCD6F6] text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8892B0] mb-6">Resources</h4>
              <ul className="flex flex-col gap-3.5 text-[#CCD6F6] text-sm">
                <li><Link href="/resources/rights" className="hover:text-white transition-colors">Legal Guides</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors">Legal Awareness</Link></li>
                <li><Link href="/documents" className="hover:text-white transition-colors">Document Vault</Link></li>
                <li><Link href="/action-plans" className="hover:text-white transition-colors">Action Plans</Link></li>
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8892B0] mb-6">Connect</h4>
              <ul className="flex flex-col gap-3.5 text-[#CCD6F6] text-sm">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors flex items-center justify-between">
                    Contact Us <ArrowUpRight className="size-3 text-[#8892B0]" />
                  </Link>
                </li>
                <li>
                  <Link href="/cases/new" className="hover:text-white transition-colors flex items-center justify-between">
                    Start a Case <ArrowUpRight className="size-3 text-[#8892B0]" />
                  </Link>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-between">
                    GitHub <ArrowUpRight className="size-3 text-[#8892B0]" />
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-between">
                    LinkedIn <ArrowUpRight className="size-3 text-[#8892B0]" />
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Big NyayaSaathi Background Text */}
          <div className="w-full flex justify-center items-center pointer-events-none select-none my-6">
            <span 
              className="text-[17vw] font-bold tracking-tighter text-white/[0.04] leading-none whitespace-nowrap text-center"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.06)" }}
            >
              NyayaSaathi
            </span>
          </div>

          {/* Legal Disclaimer Line */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-[11px] text-[#8892B0]/80 leading-relaxed max-w-4xl">
              Nyaya Saathi provides general legal information and navigation assistance and does not constitute formal legal advice.
            </p>
          </div>

          {/* Bottom Bar: Left Copyright, Right Legal Links */}
          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8892B0]">
            <p>© {new Date().getFullYear()} Nyaya Saathi. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/help" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>·</span>
              <Link href="/help" className="hover:text-white transition-colors">Terms of Use</Link>
              <span>·</span>
              <Link href="/help" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
