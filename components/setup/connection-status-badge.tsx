import type { ConnectionStatus } from "@/lib/setup-data";
import { formatConnectionStatus } from "@/lib/setup-data";
import { cn } from "@/lib/utils";

type ConnectionStatusBadgeProps = {
  status: ConnectionStatus;
  className?: string;
};

const styles: Record<ConnectionStatus, string> = {
  connected: "text-success bg-success/10",
  warning: "text-orange-400 bg-orange-400/10",
  disconnected: "text-destructive bg-destructive/10",
  untested: "text-propnex-muted bg-propnex-muted/10",
};

export function ConnectionStatusBadge({
  status,
  className,
}: ConnectionStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {formatConnectionStatus(status)}
    </span>
  );
}
