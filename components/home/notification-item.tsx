import Link from "next/link";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";

import type { AlertSeverity, DashboardAlert } from "@/lib/home-dashboard-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-orange-400/30 bg-orange-400/10 text-orange-400",
  info: "border-propnex-accent/30 bg-propnex-accent/10 text-propnex-accent",
};

const SEVERITY_ICONS: Record<AlertSeverity, typeof Info> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

type NotificationItemProps = {
  alert: DashboardAlert;
  onDismiss?: (id: string) => void;
};

export function NotificationItem({ alert, onDismiss }: NotificationItemProps) {
  const Icon = SEVERITY_ICONS[alert.severity];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3",
        SEVERITY_STYLES[alert.severity],
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{alert.title}</p>
        <p className="mt-0.5 text-xs opacity-90">{alert.message}</p>
        <Link
          href={alert.href}
          className="mt-2 inline-block text-xs font-medium underline underline-offset-2"
        >
          View details
        </Link>
      </div>
      {onDismiss ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 opacity-70 hover:opacity-100"
          onClick={() => onDismiss(alert.id)}
          aria-label="Dismiss alert"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
