import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionPlanStep } from "@/lib/types";

interface ActionStepProps {
  step: ActionPlanStep;
  isActive: boolean;
  onClick: () => void;
}

export function ActionStep({ step, isActive, onClick }: ActionStepProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case "done":
        return <CheckCircle2 className="size-6 text-success" />;
      case "in_progress":
        return <Clock className="size-6 text-warning" />;
      default:
        return <Circle className="size-6 text-muted-foreground" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer gap-4 rounded-xl border p-5 transition-all",
        isActive
          ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/5"
          : "border-border/50 bg-card/50 hover:border-border hover:bg-card/80"
      )}
    >
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-background border border-border/50 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">{step.step}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between">
          <h4 className={cn("font-semibold", isActive ? "text-primary" : "text-foreground")}>
            {step.title}
          </h4>
          <div className="shrink-0">{getStatusIcon()}</div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm"
          >
            <p className="font-medium text-primary mb-1">Why this step?</p>
            <p className="text-muted-foreground">
              Based on the extracted evidence and relevant legal statutes, this is the most effective next action.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
