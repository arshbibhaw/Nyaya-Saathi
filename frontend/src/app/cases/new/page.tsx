"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, Upload, FileText, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useCaseStore } from "@/store/case-store";
import { cn } from "@/lib/utils";

export default function NewCasePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    issue: "",
    date: "",
    amount: "",
    state: "",
    reported: "",
    evidence: [] as File[],
  });

  const router = useRouter();
  const { createCase, isLoading, error } = useCaseStore();

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issue.trim()) return;

    try {
      const newCase = await createCase(formData.issue);
      router.push(`/cases/${newCase.id}`);
    } catch {
      // Error handled by store
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.issue.trim().length > 10;
    if (step === 2) return formData.state.trim().length > 0;
    return true; // Steps 3 and 4 are optional or just review
  };

  const steps = [
    { id: 1, name: "Problem" },
    { id: 2, name: "Context" },
    { id: 3, name: "Evidence" },
    { id: 4, name: "Review" }
  ];

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-10">
      
      {/* Progress Indicator */}
      <div className="mb-10">
        <nav aria-label="Progress">
          <ol className="flex items-center space-x-2 text-sm font-medium">
            {steps.map((s, idx) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              return (
                <li key={s.id} className={cn("flex items-center", isCurrent ? "text-slate-900 dark:text-slate-100" : isCompleted ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400 dark:text-slate-500")}>
                  <span className="mr-2 flex items-center">
                    <span className="mr-2 text-xs font-mono">{String(s.id).padStart(2, '0')}</span>
                    {s.name}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="size-4" />
                  ) : isCurrent ? (
                    <ArrowRight className="size-4" />
                  ) : (
                    <Circle className="size-4 opacity-50" />
                  )}
                  {idx < steps.length - 1 && (
                    <div className="ml-4 mr-2 h-px w-8 bg-slate-200" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {step === 1 && "Tell us what happened"}
          {step === 2 && "Understand the context"}
          {step === 3 && "Do you have any evidence?"}
          {step === 4 && "Review your case"}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {step === 1 && "Describe the situation in your own words. You don't need to know legal terminology."}
          {step === 2 && "Collect only the necessary information needed for analysis."}
          {step === 3 && "Upload screenshots, receipts, agreements, or messages."}
          {step === 4 && "Review the summary before we begin the AI analysis."}
        </p>
      </div>

      <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Problem */}
            {step === 1 && (
              <div className="space-y-3">
                <Label htmlFor="issue" className="sr-only">Your Issue</Label>
                <Textarea
                  id="issue"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="Example: I received a call from someone impersonating a bank representative and transferred ₹20,000..."
                  className="min-h-[250px] resize-none text-base p-4"
                  required
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>You can write in English or Hindi.</span>
                  <span>{formData.issue.length} characters</span>
                </div>
              </div>
            )}

            {/* Step 2: Context */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">When did this happen?</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Approximately how much money was involved?</Label>
                    <Input
                      id="amount"
                      placeholder="₹ amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">Which state are you in?</Label>
                  <select
                    id="state"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  >
                    <option value="">Select a state</option>
                    <option value="maharashtra">Maharashtra</option>
                    <option value="karnataka">Karnataka</option>
                    <option value="delhi">Delhi</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label>Have you already reported this?</Label>
                  <div className="flex gap-4">
                    {["Yes", "No", "Not sure"].map((opt) => (
                      <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="reported"
                          value={opt}
                          checked={formData.reported === opt}
                          onChange={(e) => setFormData({ ...formData, reported: e.target.value })}
                          className="size-4 text-primary"
                        />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Evidence */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-12 text-center transition-colors hover:bg-muted/80">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormData({ ...formData, evidence: [...formData.evidence, ...Array.from(e.target.files)] });
                      }
                    }}
                  />
                  <Upload className="size-8 text-muted-foreground mb-4 pointer-events-none" />
                  <h3 className="text-sm font-semibold text-foreground pointer-events-none">Click to upload or drag and drop</h3>
                  <p className="mt-1 text-xs text-muted-foreground pointer-events-none">PDF, JPG, PNG up to 10MB</p>
                  <Button type="button" variant="outline" className="mt-6 pointer-events-none">
                    Select Files
                  </Button>
                </div>
                
                {formData.evidence.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {formData.evidence.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-md border p-3 bg-card">
                        <FileText className="size-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <CheckCircle2 className="size-5 text-success" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Here&apos;s what we understood</h3>
                    
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Issue</dt>
                        <dd className="mt-1 text-sm text-foreground line-clamp-2">{formData.issue || "Cyber / Financial Fraud"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                        <dd className="mt-1 text-sm text-foreground capitalize">{formData.state || "Maharashtra"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Evidence</dt>
                        <dd className="mt-1 text-sm text-foreground">1 file</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Urgency</dt>
                        <dd className="mt-1 text-sm font-medium text-warning">High</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <p className="text-xs text-muted-foreground text-center">
                  Your documents are used to help analyze this case. Review the privacy policy before uploading sensitive information.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between border-t border-slate-100 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1 || isLoading}
          >
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
          
          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Analyzing...
                </>
              ) : (
                "Analyze Case"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
