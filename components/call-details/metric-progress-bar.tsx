import { cn } from "@/lib/utils";

type MetricProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  barClassName?: string;
};

export function MetricProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  className,
  barClassName,
}: MetricProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between text-sm">
          {label ? <span className="text-propnex-muted">{label}</span> : <span />}
          {showValue ? (
            <span className="font-medium text-foreground">
              {Math.round(percent)}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--propnex-muted)_20%,var(--propnex-panel))]">
        <div
          className={cn(
            "h-full rounded-full bg-propnex-accent transition-all duration-500",
            barClassName,
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
