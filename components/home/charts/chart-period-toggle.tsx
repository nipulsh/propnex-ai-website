"use client";

import { cn } from "@/lib/utils";
import type { ChartGranularity } from "@/lib/home-dashboard-data";

const OPTIONS: { value: ChartGranularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

type ChartPeriodToggleProps = {
  value: ChartGranularity;
  onChange: (value: ChartGranularity) => void;
  className?: string;
};

export function ChartPeriodToggle({
  value,
  onChange,
  className,
}: ChartPeriodToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-propnex-border bg-propnex-bg p-0.5",
        className,
      )}
      role="group"
      aria-label="Chart period"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-propnex-panel text-foreground shadow-sm"
              : "text-propnex-muted hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
