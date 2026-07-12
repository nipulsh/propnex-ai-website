import type { ToolUsageMetrics } from "@/lib/tools/types";

type ToolUsageMetricsDisplayProps = {
  usage: ToolUsageMetrics;
};

export function ToolUsageMetricsDisplay({
  usage,
}: ToolUsageMetricsDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Metric label="Executions" value={usage.totalExecutions.toLocaleString()} />
      <Metric
        label="Success rate"
        value={
          usage.totalExecutions > 0
            ? `${Math.round(usage.successRate * 100)}%`
            : "—"
        }
      />
      <Metric
        label="Last used"
        value={
          usage.lastUsedAt
            ? new Date(usage.lastUsedAt).toLocaleDateString()
            : "Never"
        }
      />
      <Metric
        label="Errors"
        value={usage.errorCount.toString()}
        variant={usage.errorCount > 0 ? "error" : "default"}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "error";
}) {
  return (
    <div className="rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-propnex-muted">
        {label}
      </p>
      <p
        className={
          variant === "error"
            ? "mt-0.5 text-sm font-semibold text-destructive"
            : "mt-0.5 text-sm font-semibold text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}
