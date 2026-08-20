import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  label: string;
  optional?: boolean;
}

export default function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex items-center w-full overflow-x-auto no-scrollbar gap-0",
        className
      )}
    >
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        const isClickable = Boolean(onStepClick) && index < currentStep;

        return (
          <React.Fragment key={step.id}>
            <li className="flex items-center shrink-0">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(index)}
                className={cn(
                  "flex items-center gap-2.5 group",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2",
                    isComplete
                      ? "bg-primary border-primary text-white"
                      : isActive
                        ? "border-primary text-primary bg-primary-light/50"
                        : "border-border text-subtle bg-white"
                  )}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold whitespace-nowrap hidden sm:block",
                    isActive
                      ? "text-text"
                      : isComplete
                        ? "text-text/70"
                        : "text-subtle"
                  )}
                >
                  {step.label}
                  {step.optional && (
                    <span className="ml-1 text-xs font-normal text-subtle">
                      (optional)
                    </span>
                  )}
                </span>
              </button>
            </li>
            {index < steps.length - 1 && (
              <li
                className={cn(
                  "flex-1 min-w-4 sm:min-w-8 h-0.5 mx-2 rounded",
                  index < currentStep ? "bg-primary" : "bg-border"
                )}
                aria-hidden
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
