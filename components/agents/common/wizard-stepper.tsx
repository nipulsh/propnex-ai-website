"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type WizardStepperProps = {
  steps: { id: string; label: string }[];
  currentStep: number;
};

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  const activeStep = steps[currentStep - 1];

  return (
    <div className="w-full space-y-3">
      <nav aria-label="Progress">
        <ol className="flex w-full items-center">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isComplete = stepNum < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center",
                  !isLast && "min-w-0 flex-1",
                  isLast && "shrink-0",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold sm:size-8 sm:text-xs",
                    isActive && "bg-propnex-accent text-propnex-bg",
                    isComplete && "bg-success/20 text-success",
                    !isActive && !isComplete && "bg-propnex-bg text-propnex-muted",
                  )}
                  title={step.label}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isComplete ? <Check className="size-3.5" strokeWidth={2.5} /> : stepNum}
                </div>
                {!isLast ? (
                  <div
                    className={cn(
                      "mx-0.5 h-px min-w-1 flex-1",
                      isComplete ? "bg-success/40" : "bg-propnex-border",
                    )}
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      {activeStep ? (
        <p className="text-center text-sm text-propnex-muted">
          <span className="font-medium text-foreground">{activeStep.label}</span>
          <span className="mx-1.5">·</span>
          Step {currentStep} of {steps.length}
        </p>
      ) : null}
    </div>
  );
}
