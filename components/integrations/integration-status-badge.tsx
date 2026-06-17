import type { IntegrationStatus } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

const LABELS: Record<IntegrationStatus, string> = {
  connected: "Connected",
  not_connected: "Not Connected",
  syncing: "Syncing",
  error: "Error",
};

const STYLES: Record<IntegrationStatus, string> = {
  connected: "text-success bg-success/10",
  not_connected: "text-propnex-muted bg-propnex-muted/10",
  syncing: "text-propnex-accent bg-propnex-accent/10",
  error: "text-destructive bg-destructive/10",
};

type IntegrationStatusBadgeProps = {
  status: IntegrationStatus;
  className?: string;
};

export function IntegrationStatusBadge({
  status,
  className,
}: IntegrationStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
