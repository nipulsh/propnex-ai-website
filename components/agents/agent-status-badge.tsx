import type { Agent } from "@/lib/agents-data";
import { cn } from "@/lib/utils";

type AgentStatusBadgeProps = {
  agent: Pick<Agent, "status" | "enabled">;
  className?: string;
};

export function AgentStatusBadge({ agent, className }: AgentStatusBadgeProps) {
  const isActive = agent.enabled && agent.status === "active";

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isActive
          ? "bg-success/15 text-success"
          : "bg-propnex-bg text-propnex-muted",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
