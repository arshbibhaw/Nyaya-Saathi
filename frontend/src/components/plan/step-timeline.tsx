"use client";

import { motion } from "framer-motion";
import { ActionStep } from "./action-step";
import type { ActionPlanStep } from "@/lib/types";

interface StepTimelineProps {
  steps: ActionPlanStep[];
  activeStep: number;
  onStepClick: (step: number) => void;
}

export function StepTimeline({ steps, activeStep, onStepClick }: StepTimelineProps) {
  return (
    <div className="relative space-y-4">
      {/* Connector Line */}
      <div className="absolute bottom-6 left-9 top-6 w-px bg-border/50 -z-10" />

      {steps.map((step, i) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <ActionStep
            step={step}
            isActive={activeStep === step.step}
            onClick={() => onStepClick(step.step)}
          />
        </motion.div>
      ))}
    </div>
  );
}
