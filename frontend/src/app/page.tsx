"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import { ThemeToggle } from "@/components/theme-toggle";

/* ─── Data ─────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Compass,
    title: "AI Legal Navigator",
    description:
      "Describe your problem in plain language. Our AI identifies the relevant laws and your legal options instantly.",
    gradient: "from-[#344E5C] to-[#557A61]",
  },
  {
    icon: FileSearch,
    title: "Evidence Analyzer",
    description:
      "Upload PDFs, screenshots, or documents. OCR extracts dates, names, and amounts automatically.",
    gradient: "from-[#557A61] to-[#A4773C]",
  },
  {
    icon: ClipboardList,
    title: "Smart Action Plans",
    description:
      "Get a step-by-step personalized roadmap — who to contact, what to file, and when.",
    gradient: "from-[#A4773C] to-[#A24B45]",
  },
  {
    icon: FileSignature,
    title: "Document Generator",
    description:
      "Generate legal complaints, notices, and letters based on your evidence and situation.",
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

const testimonials = [
  {
    quote: "Nyaya Saathi helped me understand my consumer rights and draft a complaint in minutes. The step-by-step plan was incredibly clear.",
    author: "Priya Sharma",
    role: "Consumer Rights Case",
    rating: 5,
  },
  {
    quote: "I was lost navigating tenant laws until Nyaya Saathi broke everything down for me. It felt like having a lawyer by my side.",
    author: "Rahul Verma",
    role: "Tenant Dispute Case",
    rating: 5,
  },
  {
    quote: "The document generator saved me hours of work. It produced a professional legal notice that actually got results.",
    author: "Anita Desai",
    role: "Workplace Issue",
    rating: 5,
  },
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
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-background z-0">
      <InteractiveBackground />

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left gradient-primary"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-[600px] rounded-full bg-primary/8 blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 size-[500px] rounded-full bg-accent/8 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 size-[600px] rounded-full bg-primary/5 blur-[140px]" />
      </div>

      {/* ─── Sticky Navigation ─────────────────────────────────────── */}
      <nav
        className={`sticky top-0 z-40 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/50"
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
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-8 text-center md:pt-24"
        initial="hidden"
        animate="show"
        variants={container}
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <motion.div variants={fadeUp} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wide uppercase text-primary">
            <Sparkles className="size-3.5 animate-pulse" />
            AI-Powered Legal Navigation for India
          </span>
        </motion.div>

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
          — no legal jargon required.
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
        className="relative z-10 mx-auto max-w-5xl px-6 py-12"
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
              key={feature.title}
              variants={fadeUp}
              className="glass-card group relative overflow-hidden p-8"
            >
              {/* Gradient accent on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]`} />
              
              <div className="relative">
                <div className={`mb-5 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg">
                  {step.num}
                </span>
              </div>
              <h3 className="mb-1 text-base font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── Testimonials ──────────────────────────────────────────── */}
      <motion.section
        className="relative z-10 mx-auto max-w-6xl px-6 py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={container}
      >
        <motion.div variants={fadeUp} className="mb-14 text-center">
          <span className="mb-4 inline-block text-xs font-semibold tracking-widest uppercase text-primary/60">
            Testimonials
          </span>
          <h2 className="mb-4 font-display text-3xl tracking-tight md:text-5xl">
            Trusted by Citizens
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground text-lg">
            Real people finding clarity in complex legal situations.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="glass-card group p-7 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="size-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground flex-1 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 pt-5 border-t border-border/50">
                <p className="text-sm font-semibold">{t.author}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── CTA Section ───────────────────────────────────────────── */}
      <motion.section
        className="relative z-10 mx-auto max-w-4xl px-6 py-20"
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
          <div className="absolute inset-0 glass-card !rounded-3xl" />
          
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-primary/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-primary/10 blur-[80px]" />

          <div className="relative">
            <h2 className="mb-5 font-display text-3xl tracking-tight md:text-5xl">
              Ready to Take Action?
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-muted-foreground text-lg">
              Don&apos;t let legal confusion hold you back. Start your free case
              analysis today and get a clear path forward.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="gap-2 px-10 py-6 text-base glow-indigo group">
                Create Your Free Account
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required • Takes 30 seconds
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="size-5 text-primary" />
                <span className="text-base font-semibold gradient-text">Nyaya Saathi</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered legal navigation for Indian citizens.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><Link href="/auth/register" className="hover:text-foreground transition-colors">Get Started</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Disclaimer</span></li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Important</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ⚠️ Nyaya Saathi is an AI-powered tool and is{" "}
                <span className="text-foreground font-medium">
                  not a substitute for professional legal advice
                </span>
                . Always consult a qualified lawyer for critical legal matters.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Nyaya Saathi. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hover:text-foreground transition-colors cursor-pointer">GitHub</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Twitter</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
