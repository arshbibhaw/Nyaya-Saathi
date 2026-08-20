"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Scale,
  Compass,
  FileSearch,
  ClipboardList,
  FileSignature,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Compass,
    title: "AI Legal Navigator",
    description:
      "Describe your problem in plain language. Our AI identifies the relevant laws and your legal options instantly.",
  },
  {
    icon: FileSearch,
    title: "Evidence Analyzer",
    description:
      "Upload PDFs, screenshots, or documents. OCR extracts dates, names, and amounts automatically.",
  },
  {
    icon: ClipboardList,
    title: "Smart Action Plans",
    description:
      "Get a step-by-step personalized roadmap — who to contact, what to file, and when.",
  },
  {
    icon: FileSignature,
    title: "Document Generator",
    description:
      "Generate legal complaints, notices, and letters based on your evidence and situation.",
  },
];

const steps = [
  { num: "01", title: "Describe", subtitle: "Tell us your problem in your own words" },
  { num: "02", title: "Analyze", subtitle: "AI identifies laws & extracts evidence" },
  { num: "03", title: "Plan", subtitle: "Get a clear step-by-step action plan" },
  { num: "04", title: "Act", subtitle: "Generate documents & take action" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 size-[400px] rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 size-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20">
            <Scale className="size-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight gradient-text">
            Nyaya Saathi
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="gap-1.5">
              Get Started
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-16 text-center md:pt-32"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <motion.div variants={fadeUp} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            AI-Powered Legal Navigation for India
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl md:leading-[1.1]"
        >
          From Legal Confusion{" "}
          <span className="gradient-text">to Clear Action</span>
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
            <Button size="lg" className="gap-2 px-8 text-base glow-indigo">
              Start Your Case
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" className="px-8 text-base">
              How It Works
            </Button>
          </a>
        </motion.div>

        {/* Floating decorative icons */}
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          <motion.div
            className="absolute top-16 left-12 text-4xl opacity-20"
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            ⚖️
          </motion.div>
          <motion.div
            className="absolute top-32 right-16 text-3xl opacity-15"
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            📋
          </motion.div>
          <motion.div
            className="absolute bottom-20 left-20 text-3xl opacity-15"
            animate={{ y: [-6, 8, -6] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            🏛️
          </motion.div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        className="relative z-10 mx-auto max-w-6xl px-6 py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            A complete AI-powered toolkit to navigate the Indian legal system
            with confidence.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="glass-card group p-6"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="size-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-5xl px-6 py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >
        <motion.div variants={fadeUp} className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Four simple steps from confusion to action.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              className="relative flex flex-col items-center text-center"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-7 left-[calc(50%+28px)] hidden h-px w-[calc(100%-56px)] bg-gradient-to-r from-primary/40 to-accent/40 md:block" />
              )}

              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-bold text-primary">
                {step.num}
              </div>
              <h3 className="mb-1 text-base font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="relative z-10 mx-auto max-w-4xl px-6 py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={container}
      >
        <motion.div
          variants={fadeUp}
          className="glass-card overflow-hidden rounded-2xl p-10 text-center md:p-16"
        >
          <div className="pointer-events-none absolute inset-0 gradient-primary opacity-5" />
          <h2 className="relative mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Take Action?
          </h2>
          <p className="relative mx-auto mb-8 max-w-lg text-muted-foreground">
            Don&apos;t let legal confusion hold you back. Start your free case
            analysis today and get a clear path forward.
          </p>
          <Link href="/auth/register" className="relative">
            <Button size="lg" className="gap-2 px-8 text-base glow-indigo">
              Create Your Free Account
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            <span className="text-sm font-medium gradient-text">Nyaya Saathi</span>
          </div>
          <p className="text-center text-xs text-muted-foreground max-w-md">
            ⚠️ Nyaya Saathi is an AI-powered tool and is{" "}
            <span className="text-foreground font-medium">
              not a substitute for professional legal advice
            </span>
            . Always consult a qualified lawyer for critical legal matters.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nyaya Saathi
          </p>
        </div>
      </footer>
    </div>
  );
}
