"use client";

import { cn } from "@/lib/utils";

type WizardStepperProps = {
  steps: { id: string; label: string }[];
  currentStep: number;
};

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;

        return (
          <div key={step.id} className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                isActive && "bg-propnex-accent text-propnex-bg",
                isComplete && "bg-success/20 text-success",
                !isActive && !isComplete && "bg-propnex-bg text-propnex-muted",
              )}
            >
              {isComplete ? "✓" : stepNum}
            </div>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                isActive ? "font-medium text-foreground" : "text-propnex-muted",
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "mx-1 h-px w-6 sm:w-10",
                  isComplete ? "bg-success/40" : "bg-propnex-border",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
