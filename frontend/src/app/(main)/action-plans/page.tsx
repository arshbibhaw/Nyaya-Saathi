"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ClipboardList, CheckCircle2, Circle, ArrowRight, ExternalLink, 
  Clock, AlertCircle, Shield, ChevronRight, Plus, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/fade-in";
import { useCaseStore } from "@/store/case-store";
import * as api from "@/lib/api";
import { format } from "date-fns";

interface ActionPlanItem {
  caseId: string;
  category: string;
  summary: string;
  createdDate: string;
  progress: number;
  steps: {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    link?: string;
  }[];
}

export default function ActionPlansPage() {
  const { cases, isLoading: casesLoading, fetchCases } = useCaseStore();
  const [plans, setPlans] = useState<ActionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    async function loadAllPlans() {
      if (cases.length === 0) {
        setPlans([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const loadedPlans: ActionPlanItem[] = [];

      for (const c of cases) {
        try {
          const planData = await api.getActionPlan(c.id);
          const steps = (planData?.steps || []).map((s, idx) => ({
            id: s.step || idx + 1,
            title: s.title,
            description: s.description,
            completed: (s.status || "").toUpperCase() === "COMPLETED" || s.status === "done",
          }));

          const completedCount = steps.filter((s) => s.completed).length;
          const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 25;

          loadedPlans.push({
            caseId: c.id,
            category: c.title || c.domain || "Legal Case",
            summary: c.summary || c.description || c.issue || "Legal matter action roadmap",
            createdDate: format(new Date(c.created_at), "MMM d, yyyy"),
            progress,
            steps: steps.length > 0 ? steps : [
              { id: 1, title: "Preserve Relevant Evidence", description: "Compile all receipts, agreements, and communications.", completed: true },
              { id: 2, title: "Serve Formal Legal Notice", description: "Issue a 15-day statutory written demand notice.", completed: false },
              { id: 3, title: "Initiate Forum / Court Redressal", description: "File a complaint before the appropriate statutory authority or tribunal.", completed: false },
            ],
          });
        } catch {
          loadedPlans.push({
            caseId: c.id,
            category: c.title || c.domain || "Legal Case",
            summary: c.summary || c.description || c.issue || "Legal matter action roadmap",
            createdDate: format(new Date(c.created_at), "MMM d, yyyy"),
            progress: 33,
            steps: [
              { id: 1, title: "Preserve Relevant Evidence", description: "Compile all receipts, agreements, and communications.", completed: true },
              { id: 2, title: "Serve Formal Legal Notice", description: "Issue a 15-day statutory written demand notice.", completed: false },
              { id: 3, title: "Initiate Forum / Court Redressal", description: "File a complaint before the appropriate statutory authority or tribunal.", completed: false },
            ],
          });
        }
      }

      setPlans(loadedPlans);
      setLoading(false);
    }

    loadAllPlans();
  }, [cases]);

  const toggleStep = (caseId: string, stepId: number) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.caseId !== caseId) return plan;
        const updatedSteps = plan.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s));
        const completedCount = updatedSteps.filter((s) => s.completed).length;
        const newProgress = Math.round((completedCount / updatedSteps.length) * 100);
        return { ...plan, steps: updatedSteps, progress: newProgress };
      })
    );
  };

  return (
    <FadeIn className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
            <ClipboardList className="size-8 text-[#C49B63]" />
            Action Plans & Roadmaps
          </h1>
          <p className="text-slate-600 mt-1 text-base">
            Track interactive step-by-step resolution roadmaps generated for your legal matters.
          </p>
        </div>

        <Link href="/cases/new">
          <Button className="bg-[#19201D] hover:bg-[#28352F] text-white shadow-md rounded-xl font-bold px-5">
            <Plus className="mr-2 size-4 text-[#C49B63]" /> Create New Action Plan
          </Button>
        </Link>
      </div>

      {loading || casesLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-[#C49B63] mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading your legal roadmaps...</p>
        </div>
      ) : plans.length > 0 ? (
        <div className="space-y-6">
          {plans.map((plan) => (
            <Card key={plan.caseId} className="shadow-sm border-[#EAE5D9] bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-[#19201D] text-[#C49B63] text-xs font-bold">
                        {plan.category}
                      </Badge>
                      <span className="text-xs text-slate-400">• ID: {plan.caseId.split("-")[0].toUpperCase()}</span>
                      <span className="text-xs text-slate-400">• Created: {plan.createdDate}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 line-clamp-2">{plan.summary}</h2>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500">Completion Status</p>
                      <p className="text-lg font-bold text-[#C49B63]">{plan.progress}% Done</p>
                    </div>
                    <Link href={`/cases/${plan.caseId}`}>
                      <Button variant="outline" size="sm" className="border-[#EAE5D9] text-xs font-bold">
                        Open Workspace <ChevronRight className="ml-1 size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#19201D] to-[#C49B63] transition-all duration-500"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>

                {/* Steps List */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Action Items</h3>
                  {plan.steps.map((step) => (
                    <div
                      key={step.id}
                      onClick={() => toggleStep(plan.caseId, step.id)}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${
                        step.completed
                          ? "bg-slate-50/70 border-slate-200 opacity-90"
                          : "bg-white border-[#EAE5D9] shadow-sm hover:border-[#C49B63]/40"
                      }`}
                    >
                      <button type="button" className="mt-0.5 shrink-0">
                        {step.completed ? (
                          <CheckCircle2 className="size-5 text-emerald-600" />
                        ) : (
                          <Circle className="size-5 text-slate-300" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold ${step.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
                            Step {step.id}: {step.title}
                          </h4>
                          {step.link && (
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-600 font-bold hover:underline flex items-center shrink-0"
                            >
                              Portal <ExternalLink className="ml-1 size-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 border-2 border-dashed border-[#EAE5D9] rounded-2xl bg-white space-y-4">
          <ClipboardList className="mx-auto size-12 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No action plans created yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">
            Start a case to receive a personalized, step-by-step legal roadmap generated by Nyaya AI.
          </p>
          <Link href="/cases/new">
            <Button className="bg-[#19201D] text-white font-bold">Start New Case Plan</Button>
          </Link>
        </div>
      )}
    </FadeIn>
  );
}
