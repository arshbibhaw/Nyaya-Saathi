"use client";

import Link from "next/link";
import { ArrowRight, Scale, Compass, FileSearch, ClipboardList, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import "./landing.css";

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

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Resources", href: "#resources" },
  { name: "Connect", href: "#connect" },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  }, [mobileMenuOpen]);

  return (
<<<<<<< Updated upstream
    <div className="relative min-h-screen bg-[#FCFCFD] text-[#0F172A] selection:bg-slate-900 selection:text-white overflow-x-hidden font-sans">
=======
    <div className="relative min-h-screen bg-[#FCFCFD] text-[#0F172A] selection:bg-slate-900 selection:text-white font-sans">
>>>>>>> Stashed changes
      
      {/* 1) Fixed Full-Width Header with Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FCFCFD]/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-200">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 h-20 flex items-center justify-between">
          
          {/* Left Section: Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-11 rounded-full bg-white border border-slate-200/80 shadow-xs grid place-items-center transition-transform group-hover:scale-105">
              <Image 
                src="/logos/Symbol%20mark.png" 
                alt="Nyaya Saathi Logo" 
                width={44} 
                height={44} 
                className="w-[75%] h-[75%] object-contain" 
              />
            </div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-xl">
              <span className="text-[#0F172A]">Nyaya</span>
              <span className="text-[#C49B63] font-serif">Saathi</span>
            </div>
          </Link>

          {/* Center Section: Navigation with Magnetic Sliding Pill */}
          <nav 
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/70 border border-slate-200/60 shadow-xs relative"
            onMouseLeave={() => setHoveredNavIndex(null)}
          >
            {navLinks.map((link, idx) => {
              const isHovered = hoveredNavIndex === idx;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredNavIndex(idx)}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-medium tracking-tight transition-colors duration-200 z-10 select-none ${
                    isHovered ? "text-[#0F172A] font-semibold" : "text-slate-600 hover:text-[#0F172A]"
                  }`}
                >
                  {isHovered && (
                    <motion.div
                      layoutId="navbar-highlight"
                      className="absolute inset-0 bg-slate-100/90 rounded-full -z-10 shadow-xs"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Actions & Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/auth/login" 
              className="bg-[#0F172A] text-white hover:bg-slate-800 text-sm font-medium px-5 py-2.5 rounded-full shadow-xs transition-all hover:-translate-y-0.5"
            >
              Sign in
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button 
              className="burger md:hidden" 
              aria-expanded={mobileMenuOpen} 
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="burger-bars">
                <span className="bar top"></span>
                <span className="bar mid"></span>
                <span className="bar bot"></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Sheet */}
        <div className={`mobile-menu-sheet md:hidden ${mobileMenuOpen ? '' : 'hidden'}`}>
          <nav className="mobile-links">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="mobile-link" 
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-3 flex flex-col gap-2 border-t border-slate-100 mt-2">
            <Link 
              href="/auth/register" 
              className="pill-sign-in w-full text-center font-medium" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
            <Link 
              href="/auth/login" 
              className="text-xs text-center text-slate-500 hover:text-slate-900 py-1 font-medium transition-colors" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Already have an account? <span className="underline font-semibold">Sign in</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>

      {/* 2) Redesigned Hero Section (Warm Ivory / Trustworthy Theme) */}
      <section className="hero-viewport">
        {/* Subtle Ambient Radial Glow */}
        <div className="hero-ambient-glow" aria-hidden="true" />
        
        {/* Subtle Dot-Grid Pattern */}
        <div className="hero-dot-grid" aria-hidden="true" />

        {/* Hero Main */}
        <main className="hero-main">
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="hero-headline"
          >
            <span className="block">Understand.</span>
            <span className="block mt-1 sm:mt-2">Decide. Move Forward.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="hero-subhead"
          >
            Trusted legal guidance for every citizen. Navigate the Indian legal system with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
          >
            <Link href="/auth/register" className="relative z-10">
              <button className="hero-cta group">
                <span>Explore Your Options</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>
        </main>
      </section>


      {/* Middle Content Wrapper with Multi-color Ambient Mesh Background */}
      <div className="relative subtle-mesh-canvas overflow-hidden">
        {/* Background Subtle Color Glows */}
        <div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden select-none opacity-60">
          {/* Top-Left Rose / Peach Aura */}
          <div className="absolute top-[3%] -left-[12%] w-[50vw] h-[50vw] rounded-full bg-rose-200/35 blur-[140px]" />
          {/* Top-Right Warm Champagne / Light Amber Aura */}
          <div className="absolute top-[2%] -right-[12%] w-[50vw] h-[50vw] rounded-full bg-amber-100/45 blur-[140px]" />
          {/* Center Subtle Sky / Lavender Aura */}
          <div className="absolute top-[40%] left-[25%] w-[50vw] h-[45vw] rounded-full bg-indigo-100/30 blur-[150px]" />
          {/* Bottom-Left Soft Peach / Pink Aura */}
          <div className="absolute bottom-[2%] -left-[10%] w-[48vw] h-[48vw] rounded-full bg-pink-100/35 blur-[140px]" />
          {/* Bottom-Right Soft Butter Aura */}
          <div className="absolute bottom-[2%] -right-[10%] w-[48vw] h-[48vw] rounded-full bg-yellow-100/35 blur-[140px]" />
        </div>

        {/* 2) Feature Section with Scroll Dynamics */}
        <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 py-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={headerVariants}
            className="mb-16 max-w-3xl"
          >
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-[#0F172A] mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              A complete AI-powered toolkit to navigate the Indian legal system with confidence.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div 
                key={feature.title} 
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.22, ease: "easeOut" } }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-8 rounded-[2rem] hover:bg-white hover:border-slate-300 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-slate-200/50 group cursor-default"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-[#0F172A] text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-3 group-hover:text-slate-900 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 3) Process Section with Clean Connected Steps */}
        <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 py-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={headerVariants}
            className="mb-16 max-w-3xl"
          >
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-[#0F172A] mb-4">
              Process
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Four simple steps from confusion to action.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-4"
          >
            {steps.map((step, i) => (
              <motion.div 
                key={step.num} 
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative flex flex-col group cursor-default"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-3xl md:text-4xl font-bold tracking-tight text-[#E8927C] select-none">
                    {step.num}
                  </span>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block h-[1px] flex-1 ml-6 mr-4 bg-slate-200/90" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      {/* 4) Existing Footer */}
      <footer id="connect" className="relative z-10 bg-[#0A1118] text-white overflow-hidden pt-20 pb-12 rounded-t-[3rem]">
        <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
            
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

            <div className="md:col-start-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8892B0] mb-6">Platform</h4>
              <ul className="flex flex-col gap-3.5 text-[#CCD6F6] text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8892B0] mb-6">Resources</h4>
              <ul className="flex flex-col gap-3.5 text-[#CCD6F6] text-sm">
                <li><Link href="/resources/rights" className="hover:text-white transition-colors">Legal Guides</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors">Legal Awareness</Link></li>
                <li><Link href="/documents" className="hover:text-white transition-colors">Document Vault</Link></li>
                <li><Link href="/action-plans" className="hover:text-white transition-colors">Action Plans</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8892B0] mb-6">Connect</h4>
              <ul className="flex flex-col gap-3.5 text-[#CCD6F6] text-sm">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors flex items-center justify-between">
                    Contact Us <ArrowRight className="size-3 text-[#8892B0]" />
                  </Link>
                </li>
                <li>
                  <Link href="/cases/new" className="hover:text-white transition-colors flex items-center justify-between">
                    Start a Case <ArrowRight className="size-3 text-[#8892B0]" />
                  </Link>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-between">
                    GitHub <ArrowRight className="size-3 text-[#8892B0]" />
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-between">
                    LinkedIn <ArrowRight className="size-3 text-[#8892B0]" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Infinite Scrolling Marquee Text - Full Width & Serif Font */}
        <div className="relative w-full overflow-hidden select-none my-4 flex cursor-default pointer-events-auto group">
          <style>{`
            @keyframes footer-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-footer-marquee {
              animation: footer-marquee 40s linear infinite;
            }
            .group:hover .animate-footer-marquee {
              animation-play-state: paused !important;
            }
          `}</style>
          <div className="flex whitespace-nowrap animate-footer-marquee">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center whitespace-nowrap">
                <span 
                  className="text-[10vw] px-4 font-serif tracking-wide text-transparent uppercase leading-none inline-block transition-all duration-300 ease-out cursor-pointer hover:text-slate-300 hover:[-webkit-text-stroke:0px] hover:scale-[1.02] [-webkit-text-stroke:1.5px_rgba(255,255,255,0.5)]"
                >
                  NYAYA SAATHI
                </span>
                <span 
                  className="text-[10vw] px-4 font-serif tracking-wide text-transparent uppercase leading-none inline-block transition-all duration-300 ease-out cursor-pointer hover:text-slate-300 hover:[-webkit-text-stroke:0px] hover:scale-[1.1] [-webkit-text-stroke:1.5px_rgba(255,255,255,0.5)]"
                >
                  ○
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
          <div className="pt-4 border-t border-white/10">
            <p className="text-[11px] text-[#8892B0]/80 leading-relaxed max-w-4xl">
              Nyaya Saathi provides general legal information and navigation assistance and does not constitute formal legal advice.
            </p>
          </div>
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
