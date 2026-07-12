import type { PurchaseStatus } from "@/lib/billing-resources-data";
import { PURCHASE_STATUS_LABELS } from "@/lib/billing-resources-data";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  completed: "text-success bg-success/10",
  pending: "text-amber-400 bg-amber-400/10",
  expired: "text-propnex-muted bg-propnex-muted/10",
  cancelled: "text-destructive bg-destructive/10",
};

type PurchaseStatusBadgeProps = {
  status: PurchaseStatus;
};

export function PurchaseStatusBadge({ status }: PurchaseStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {PURCHASE_STATUS_LABELS[status]}
    </span>
  );
}
