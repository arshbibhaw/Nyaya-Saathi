"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCaseStore } from "@/store/case-store";

export default function NewCasePage() {
  const [issue, setIssue] = useState("");
  const router = useRouter();
  const { createCase, isLoading, error } = useCaseStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return;

    try {
      const newCase = await createCase(issue);
      router.push(`/cases/${newCase.case_id}/chat`);
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 pb-20 animate-slide-up">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles className="size-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">What legal issue are you facing?</h1>
          <p className="mt-3 text-muted-foreground">
            Describe your problem in plain language. Don&apos;t worry about legal terms — our AI will understand and guide you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="issue" className="sr-only">Your Issue</Label>
            <div className="relative">
              <textarea
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="E.g., My landlord hasn't returned my deposit after 2 months of moving out..."
                className="w-full min-h-[200px] resize-none rounded-xl border border-border/50 bg-card p-6 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="glow-indigo gap-2 px-8"
              disabled={isLoading || !issue.trim()}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Start Analysis
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
