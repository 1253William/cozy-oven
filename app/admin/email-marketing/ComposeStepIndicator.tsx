"use client";

import { COMPOSE_STEPS, type ComposeStep } from "./emailMarketingUtils";

type ComposeStepIndicatorProps = {
  active: ComposeStep;
};

export default function ComposeStepIndicator({ active }: ComposeStepIndicatorProps) {
  const activeIndex = COMPOSE_STEPS.findIndex((step) => step.id === active);

  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
      {COMPOSE_STEPS.map((step, index) => {
        const isActive = step.id === active;
        const isDone = index < activeIndex;
        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            {index > 0 ? (
              <span className="hidden h-px w-6 bg-[#b9aca2]/60 sm:block" aria-hidden />
            ) : null}
            <span
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                isActive
                  ? "bg-[#5d6043] text-[#faf9f5]"
                  : isDone
                    ? "bg-[#5d6043]/15 text-[#5d6043]"
                    : "bg-white text-[#5d6043]/70 ring-1 ring-[#b9aca2]/50"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isActive ? "bg-[#faf9f5] text-[#5d6043]" : "bg-[#b9aca2]/40 text-[#5d6043]"
                }`}
              >
                {step.number}
              </span>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
