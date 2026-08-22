"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Target, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useCaseStore } from "@/store/case-store";
import { getActionPlan } from "@/lib/api";
import type { ActionPlan } from "@/lib/types";
import { StepTimeline } from "@/components/plan/step-timeline";

export default function ActionPlanPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const { activeCase, loadCase } = useCaseStore();
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCase(caseId);
    
    // Fetch plan
    const fetchPlan = async () => {
      try {
        const data = await getActionPlan(caseId);
        setPlan(data);
        if (data.steps.length > 0) {
          setActiveStep(data.steps[0].step);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load action plan");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlan();
  }, [caseId, loadCase]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-4 border-b border-border/50 bg-background/50 p-4 backdrop-blur-sm">
        <Link href={`/cases/${caseId}/chat`}>
          <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Action Plan</h2>
          <p className="text-xs text-muted-foreground">
            {activeCase?.domain || "Analyzing..."} • Case {caseId.split("-")[0]}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
          
          {/* Left Column: Timeline */}
          <div className="w-full lg:w-3/5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <Target className="size-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Your Roadmap to Resolution</h3>
                <p className="text-sm text-muted-foreground">Follow these steps carefully to progress your case.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="mb-4 size-8 animate-spin text-primary" />
                <p>Generating personalized action plan...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <ShieldAlert className="mx-auto mb-3 size-8 text-destructive opacity-80" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : plan?.steps && plan.steps.length > 0 ? (
              <StepTimeline 
                steps={plan.steps} 
                activeStep={activeStep} 
                onStepClick={setActiveStep} 
              />
            ) : (
              <div className="rounded-xl border border-border/50 p-12 text-center text-muted-foreground">
                <p>No action plan generated yet.</p>
                <Link href={`/cases/${caseId}/chat`} className="mt-4 inline-block">
                  <Button variant="outline">Provide more details in chat</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Context/Details */}
          <div className="w-full lg:w-2/5">
            <div className="sticky top-6 flex flex-col gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border/50 bg-card p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Info className="size-5 text-primary" />
                  <h4 className="font-semibold">Important Notes</h4>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 rounded-full bg-primary/20 p-0.5 text-primary">•</span>
                    Keep all physical and digital evidence organized.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 rounded-full bg-primary/20 p-0.5 text-primary">•</span>
                    Do not sign any documents from the opposing party without careful review.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 rounded-full bg-primary/20 p-0.5 text-primary">•</span>
                    Timelines are critical. Notice periods begin from the date of receipt.
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-border/50 bg-card p-5 shadow-sm"
              >
                 <h4 className="font-semibold mb-3">Ready to draft documents?</h4>
                 <p className="text-sm text-muted-foreground mb-4">
                   Once you understand the plan, you can use our AI to generate the necessary legal drafts automatically based on your evidence.
                 </p>
                 <Link href={`/cases/${caseId}/documents`}>
                   <Button className="w-full glow-indigo">Go to Document Generator</Button>
                 </Link>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
