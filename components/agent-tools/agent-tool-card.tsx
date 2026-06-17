"use client";

import { Loader2, Settings2, Zap } from "lucide-react";

import { ToolConnectionHealth } from "@/components/agent-tools/tool-connection-health";
import { ToolUsageMetricsDisplay } from "@/components/agent-tools/tool-usage-metrics";
import { Button } from "@/components/ui/button";
import { getToolDefinition } from "@/lib/tools/registry";
import type { AgentToolAssignment } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

type AgentToolCardProps = {
  tool: AgentToolAssignment;
  isSaving: boolean;
  isTesting: boolean;
  onToggle: (enabled: boolean) => void;
  onConfigure: () => void;
  onTest: () => void;
};

export function AgentToolCard({
  tool,
  isSaving,
  isTesting,
  onToggle,
  onConfigure,
  onTest,
}: AgentToolCardProps) {
  const definition = getToolDefinition(tool.toolId);
  const Icon = definition?.icon;
  const isBlocked = tool.health === "unavailable";

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-propnex-border bg-propnex-panel p-5",
        isBlocked && "opacity-75",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-propnex-accent/15 text-propnex-accent">
          {Icon ? <Icon className="size-5" /> : <Zap className="size-5" />}
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={tool.enabled}
            disabled={isSaving || isBlocked}
            onChange={(e) => onToggle(e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-propnex-border peer-checked:bg-propnex-accent peer-disabled:opacity-50 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
        </label>
      </div>

      <h3 className="mt-4 text-base font-semibold text-foreground">
        {definition?.name ?? tool.toolId}
      </h3>
      <p className="mt-1 text-sm text-propnex-muted">
        {definition?.description}
      </p>

      <div className="mt-3">
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            tool.enabled
              ? "bg-success/15 text-success"
              : "bg-propnex-border text-propnex-muted",
          )}
        >
          {tool.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <div className="mt-4">
        <ToolConnectionHealth
          health={tool.health}
          blockedReason={tool.blockedReason}
        />
      </div>

      {tool.enabled ? (
        <div className="mt-4 border-t border-propnex-border pt-4">
          <ToolUsageMetricsDisplay usage={tool.usage} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onConfigure}
          disabled={isBlocked}
          className="gap-1.5"
        >
          <Settings2 className="size-3.5" />
          Configure
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onTest}
          disabled={isTesting || !tool.enabled || isBlocked}
          className="gap-1.5"
        >
          {isTesting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Zap className="size-3.5" />
          )}
          Test
        </Button>
      </div>
    </article>
  );
}
