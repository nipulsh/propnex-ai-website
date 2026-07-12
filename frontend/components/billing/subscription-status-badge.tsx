import type { SubscriptionStatus } from "@/lib/billing-resources-data";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/billing-resources-data";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: "text-success bg-success/10",
  expiring_soon: "text-amber-400 bg-amber-400/10",
  expired: "text-destructive bg-destructive/10",
};

type SubscriptionStatusBadgeProps = {
  status: SubscriptionStatus;
};

export function SubscriptionStatusBadge({
  status,
}: SubscriptionStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {SUBSCRIPTION_STATUS_LABELS[status]}
    </span>
  );
}
