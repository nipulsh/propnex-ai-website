import { cn } from "@/lib/utils";
import type { PhoneNumberStatus } from "@/lib/phone-numbers-data";

type PhoneNumberStatusBadgeProps = {
  status: PhoneNumberStatus;
  className?: string;
};

const STATUS_STYLES: Record<PhoneNumberStatus, string> = {
  active: "text-success bg-success/10",
  inactive: "text-warning bg-warning/10",
  disabled: "text-destructive bg-destructive/10",
};

export function PhoneNumberStatusBadge({
  status,
  className,
}: PhoneNumberStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
