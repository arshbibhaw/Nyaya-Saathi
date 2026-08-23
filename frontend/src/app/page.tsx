"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Scale,
  Compass,
  FileSearch,
  ClipboardList,
  FileSignature,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
  Users,
  BookOpen,
  MessageSquare,
  Maximize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

/* ─── Data ─────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Compass,
    title: "AI Legal Navigator",
    description:
      "Describe your problem in plain language. Our AI identifies the relevant laws and your legal options instantly.",
    details: "Nyaya Saathi's advanced natural language processing understands context, translating your everyday problem into exact legal statutes.",
    bullets: ["Instant statute matching", "Precedent case suggestions", "Simple language explanations"],
    gradient: "from-[#344E5C] to-[#557A61]",
  },
  {
    icon: FileSearch,
    title: "Evidence Analyzer",
    description:
      "Upload PDFs, screenshots, or documents. OCR extracts dates, names, and amounts automatically.",
    details: "Our intelligent OCR pipeline scans your uploads to automatically flag crucial pieces of evidence that strengthen your case.",
    bullets: ["Auto-extract dates & amounts", "Highlight key terms", "Format for legal use"],
    gradient: "from-[#557A61] to-[#A4773C]",
  },
  {
    icon: ClipboardList,
    title: "Smart Action Plans",
    description:
      "Get a step-by-step personalized roadmap — who to contact, what to file, and when.",
    details: "We generate a customized, timeline-driven checklist so you always know your next move and don't miss any critical deadlines.",
    bullets: ["Step-by-step guidance", "Timeline predictions", "Authority contact info"],
    gradient: "from-[#A4773C] to-[#A24B45]",
  },
  {
    icon: FileSignature,
    title: "Document Generator",
    description:
      "Generate legal complaints, notices, and letters based on your evidence and situation.",
    details: "Automatically draft professional, legally sound documents tailored exactly to the specifics of your situation.",
    bullets: ["Custom legal notices", "Complaint drafting", "Print-ready formatting"],
    gradient: "from-[#344E5C] to-[#A4773C]",
  },
];

const steps = [
  { num: "01", title: "Describe", subtitle: "Tell us your problem in your own words", icon: MessageSquare },
  { num: "02", title: "Analyze", subtitle: "AI identifies laws & extracts evidence", icon: FileSearch },
  { num: "03", title: "Plan", subtitle: "Get a clear step-by-step action plan", icon: ClipboardList },
  { num: "04", title: "Act", subtitle: "Generate documents & take action", icon: Zap },
];

const stats = [
  { value: "15+", label: "Legal Domains", icon: BookOpen },
  { value: "AI", label: "Powered Analysis", icon: Sparkles },
  { value: "24/7", label: "Available", icon: Shield },
  { value: "100%", label: "Free to Use", icon: Users },
];

/* ─── Animations ───────────────────────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Measure footer height for the curtain reveal effect
  useEffect(() => {
    const updateFooterHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };
    
    updateFooterHeight();
    window.addEventListener("resize", updateFooterHeight);
    // Slight delay to ensure content is fully rendered
    setTimeout(updateFooterHeight, 100);
    
    return () => window.removeEventListener("resize", updateFooterHeight);
  }, []);

  return (
    <div className="bg-background">
      {/* ─── Curtain Wrapper ───────────────────────────────────────── */}
      <main 
        className="relative z-10 bg-background shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-b-none mb-0 transition-all duration-300"
        style={{ marginBottom: footerHeight > 0 ? `${footerHeight}px` : "auto" }}
      >

        {/* Scroll progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left gradient-primary"
          style={{ scaleX: scrollYProgress }}
        />

        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-none">
          <div className="absolute -top-40 -left-40 size-[600px] rounded-full bg-primary/8 blur-[140px] animate-pulse" />
          <div className="absolute top-1/3 -right-40 size-[500px] rounded-full bg-accent/8 blur-[140px]" />
          <div className="absolute -bottom-40 left-1/3 size-[600px] rounded-full bg-primary/5 blur-[140px]" />
        </div>

        {/* ─── Sticky Navigation ─────────────────────────────────────── */}
        <nav
          className={`sticky top-0 z-40 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-300 ${
            scrolled
              ? "backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
              : "bg-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20 transition-transform group-hover:rotate-6 group-hover:scale-110">
              <Scale className="size-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight gradient-text">
              Nyaya Saathi
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="gap-1.5 group">
                Get Started
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* ─── Hero Section ──────────────────────────────────────────── */}
        <motion.section
          className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-32 pb-32 text-center md:pt-48 md:pb-48"
          initial="hidden"
          animate="show"
          variants={container}
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.h1
            variants={fadeUp}
            className="mb-6 max-w-4xl font-display text-5xl font-normal leading-tight tracking-tight md:text-7xl md:leading-[1.08]"
          >
            From Legal Confusion{" "}
            <span className="gradient-text italic">to Clear Action</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            You know you have a legal problem but don&apos;t know what to do next.
            Nyaya Saathi guides you through{" "}
            <span className="text-foreground font-medium">
              Problem → Law → Evidence → Action
            </span>{" "}
            - no legal jargon required.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2 px-8 text-base glow-indigo group">
                Start Your Case
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="px-8 text-base group">
                How It Works
                <ChevronRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </a>
          </motion.div>
        </motion.section>

        {/* ─── Stats Bar ─────────────────────────────────────────────── */}
        <motion.section
          className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={container}
        >
          <motion.div
            variants={fadeUp}
            className="glass-card grid grid-cols-2 divide-x divide-border/50 rounded-2xl md:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 py-6 px-4">
                <stat.icon className="size-5 text-primary/60 mb-1" />
                <span className="text-2xl font-bold font-display text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* ─── Features Grid ─────────────────────────────────────────── */}
        <motion.section
          className="relative z-10 mx-auto max-w-6xl px-6 py-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={container}
        >
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="mb-4 inline-block text-xs font-semibold tracking-widest uppercase text-primary/60">
              Features
            </span>
            <h2 className="mb-4 font-display text-3xl tracking-tight md:text-5xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground text-lg">
              A complete AI-powered toolkit to navigate the Indian legal system
              with confidence.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                layoutId={`feature-card-${feature.title}`}
                onClick={() => setSelectedFeature(feature)}
                key={feature.title}
                variants={fadeUp}
                className="glass-card group relative overflow-hidden p-8 bg-[#FDFBF7] border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/40 cursor-pointer"
              >
                {/* Expand Icon */}
                <div className="absolute top-6 right-6 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                  <Maximize2 className="size-5 text-teal-600 dark:text-teal-400" />
                </div>
                
                {/* Gradient accent on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]`} />
                
                <div className="relative">
                  <div className={`mb-5 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 translate-x-[-8px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    Learn more <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── How It Works ──────────────────────────────────────────── */}
        <motion.section
          id="how-it-works"
          className="relative z-10 mx-auto max-w-5xl px-6 py-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={container}
        >
          <motion.div variants={fadeUp} className="mb-16 text-center">
            <span className="mb-4 inline-block text-xs font-semibold tracking-widest uppercase text-primary/60">
              Process
            </span>
            <h2 className="mb-4 font-display text-3xl tracking-tight md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground text-lg">
              Four simple steps from confusion to action.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={scaleIn}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute top-8 left-[calc(50%+32px)] hidden h-[2px] w-[calc(100%-64px)] md:block">
                    <div className="h-full w-full bg-gradient-to-r from-primary/30 to-primary/10 rounded-full" />
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.3 + 0.5 }}
                    />
                  </div>
                )}

                <div className="relative mb-5">
                  <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/20 group-hover:scale-110">
                    <step.icon className="size-6 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-slate-900 dark:text-white shadow-lg">
                    {step.num}
                  </span>
                </div>
                <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>


        {/* ─── CTA Section ───────────────────────────────────────────── */}
        <motion.section
          className="relative z-10 mx-auto max-w-4xl px-6 py-20 pb-32"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
        >
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl p-12 text-center md:p-20"
          >
            {/* Layered background */}
            <div className="absolute inset-0 gradient-primary opacity-[0.07]" />
            <div className="absolute inset-0 glass-card !rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md" />
            
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-primary/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-primary/10 blur-[80px]" />

            <div className="relative">
              <h2 className="mb-5 font-display text-3xl tracking-tight md:text-5xl">
                Ready to Take Action?
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-muted-foreground dark:text-slate-300 text-lg">
                Don&apos;t let legal confusion hold you back. Start your free case
                analysis today and get a clear path forward.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Link href="/auth/register">
                  <Button size="lg" className="gap-2 px-10 py-6 text-base glow-indigo group">
                    Create Your Free Account
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
              <p className="mt-4 text-xs text-muted-foreground">
                No credit card required • Takes 30 seconds
              </p>
            </div>
          </motion.div>
        </motion.section>
      </main>

      {/* ─── Fixed Footer (Revealed by Curtain) ────────────────────── */}
      <div 
        ref={footerRef}
        className="fixed bottom-0 left-0 w-full z-0 bg-[#0F172A] text-slate-300 pointer-events-none"
      >
        {/* We use pointer-events-none on the wrapper and auto on the footer so we don't block clicks on the main page above it */}
        <footer className="pointer-events-auto px-6 py-12 md:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-4">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="size-5 text-indigo-400" />
                  <span className="text-base font-semibold text-slate-100">Nyaya Saathi</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  AI-powered legal navigation for Indian citizens.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-slate-100">Product</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><Link href="/auth/register" className="hover:text-white transition-colors">Get Started</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-slate-100">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Disclaimer</span></li>
                </ul>
              </div>

              {/* Disclaimer */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-slate-100">Important</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ⚠️ Nyaya Saathi is an AI-powered tool and is{" "}
                  <span className="text-slate-200 font-medium">
                    not a substitute for professional legal advice
                  </span>
                  . Always consult a qualified lawyer for critical legal matters.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} Nyaya Saathi. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="hover:text-white transition-colors cursor-pointer">GitHub</span>
                <span className="hover:text-white transition-colors cursor-pointer">Twitter</span>
                <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ─── Feature Expansion Modal ───────────────────────────────── */}
      <AnimatePresence>
        {/* Background Overlay (animates independently) */}
        {selectedFeature && (
          <motion.div
            key="modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedFeature(null)}
          />
        )}
        
        {/* The Card (handles layout morphing) */}
        {selectedFeature && (
          <motion.div
            key="modal-card"
            layoutId={`feature-card-${selectedFeature.title}`}
            transition={{ type: "spring", stiffness: 200, damping: 25, bounce: 0.2 }}
            className="fixed inset-0 z-[101] m-auto h-fit w-full max-w-2xl overflow-hidden rounded-2xl bg-[#FDFBF7] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-2xl"
          >
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-6 right-6 flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className={`mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedFeature.gradient} text-white shadow-lg`}>
              <selectedFeature.icon className="size-8" />
            </div>
            <h3 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">{selectedFeature.title}</h3>
            <p className="mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {selectedFeature.details}
            </p>
            
            <ul className="space-y-4">
              {selectedFeature.bullets.map((bullet, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-500">
                    <ChevronRight className="size-4" />
                  </div>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
