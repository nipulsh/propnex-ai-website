import Link from "next/link";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

import type { ToolHealth } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

type ToolConnectionHealthProps = {
  health: ToolHealth;
  blockedReason?: string;
};

const CONFIG: Record<
  ToolHealth,
  { label: string; icon: typeof CheckCircle; className: string }
> = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle,
    className: "text-success",
  },
  degraded: {
    label: "Degraded",
    icon: AlertTriangle,
    className: "text-orange-400",
  },
  down: {
    label: "Down",
    icon: XCircle,
    className: "text-destructive",
  },
  unavailable: {
    label: "Unavailable",
    icon: XCircle,
    className: "text-propnex-muted",
  },
};

export function ToolConnectionHealth({
  health,
  blockedReason,
}: ToolConnectionHealthProps) {
  const { label, icon: Icon, className } = CONFIG[health];

  return (
    <div className="space-y-1">
      <div className={cn("flex items-center gap-1.5 text-xs font-medium", className)}>
        <Icon className="size-3.5" />
        {label}
      </div>
      {blockedReason ? (
        <p className="text-xs text-propnex-muted">
          {blockedReason}.{" "}
          <Link href="/settings" className="text-propnex-accent hover:underline">
            Go to Settings
          </Link>
        </p>
      ) : null}
    </div>
  );
}
