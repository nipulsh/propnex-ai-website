import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

type TrendBadgeProps = {
  percent: number;
  periodLabel: string;
  className?: string;
};

export function TrendBadge({ percent, periodLabel, className }: TrendBadgeProps) {
  const isPositive = percent >= 0;
  const isNeutral = percent === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
        isNeutral
          ? "bg-propnex-muted/10 text-propnex-muted"
          : isPositive
            ? "bg-success/10 text-success"
            : "bg-destructive/10 text-destructive",
        className,
      )}
    >
      {!isNeutral ? (
        isPositive ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )
      ) : null}
      {isPositive && !isNeutral ? "+" : ""}
      {percent}%
    </span>
  );
}

export function formatTrendFooter(percent: number, periodLabel: string): string {
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}% ${periodLabel}`;
}
