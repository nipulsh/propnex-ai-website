"use client";

import {
  Calendar,
  CheckCircle,
  Megaphone,
  RefreshCw,
  UserPlus,
  XCircle,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCallDetailStore } from "@/stores/call-detail-store";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

type QuickActionsPanelProps = {
  className?: string;
  variant?: "sidebar" | "mobile";
};

const actions = [
  { id: "follow-up", label: "Schedule Follow-Up", icon: Calendar },
  { id: "assign", label: "Assign Agent", icon: UserPlus },
  { id: "campaign", label: "Add to Campaign", icon: Megaphone },
  { id: "reactivation", label: "Add to Reactivation Plan", icon: RefreshCw },
  { id: "converted", label: "Mark as Converted", icon: CheckCircle },
  { id: "lost", label: "Mark as Lost Lead", icon: XCircle },
] as const;

export function QuickActionsPanel({
  className,
  variant = "sidebar",
}: QuickActionsPanelProps) {
  const { role, branchAccessType, isLoading } = usePermissions();
  const isBranchAdmin = !isLoading && role === "ADMIN" && branchAccessType === "SELECTED";

  const setOutcome = useCallDetailStore((s) => s.setOutcome);
  const setReactivationEnabled = useCallDetailStore(
    (s) => s.setReactivationEnabled,
  );

  if (isBranchAdmin) return null;

  const handleAction = (id: (typeof actions)[number]["id"]) => {
    switch (id) {
      case "converted":
        setOutcome("converted");
        break;
      case "lost":
        setOutcome("not-interested");
        break;
      case "reactivation":
        setReactivationEnabled(true);
        break;
      default:
        break;
    }
  };

  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "flex gap-2 overflow-x-auto pb-1 propnex-scrollbar lg:hidden",
          className,
        )}
      >
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => handleAction(action.id)}
          >
            <action.icon className="size-4" />
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "rounded-xl border border-propnex-border bg-propnex-panel p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Zap className="size-4 text-propnex-accent" />
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
      </div>
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => handleAction(action.id)}
          >
            <action.icon className="size-4 shrink-0" />
            {action.label}
          </Button>
        ))}
      </div>
    </aside>
  );
}
