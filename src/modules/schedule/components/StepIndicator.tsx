import React from "react";
import { Check } from "lucide-react";
import { cn } from "@lib/utils";

interface StepIndicatorProps {
  current: 1 | 2;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const steps = ["Rotina atual", "Novos objetivos"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <React.Fragment key={stepNum}>
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                done ? "bg-green-500 text-white" : active ? "bg-primary text-white" : "bg-slate-200 text-slate-400")}>
                {done ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className={cn("text-sm font-medium hidden sm:block",
                active ? "text-slate-900" : done ? "text-green-600" : "text-slate-400")}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2 rounded", done ? "bg-green-300" : "bg-slate-200")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
