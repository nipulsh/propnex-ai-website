"use client";

import { useState } from "react";
import { Bot, ChevronRight, Mic, Settings2 } from "lucide-react";

import type { AgentCardData } from "@/lib/agents-data";
import { cn } from "@/lib/utils";
import { useAgentArchitectStore } from "@/stores/agent-architect-store";

type AgentCardProps = {
  agent: AgentCardData;
  compact?: boolean;
  onToggle?: (id: string, enabled: boolean) => void;
};

function AgentToggle({
  enabled,
  onChange,
  compact,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative shrink-0 rounded-full transition-colors",
        compact ? "h-5 w-9" : "h-6 w-11",
        enabled ? "bg-propnex-accent" : "bg-propnex-border"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 rounded-full bg-foreground shadow-sm transition-transform",
          compact ? "size-4" : "size-5",
          enabled && (compact ? "translate-x-4 bg-propnex-bg" : "translate-x-5 bg-propnex-bg")
        )}
      />
    </button>
  );
}

export function AgentCard({ agent, compact = false, onToggle }: AgentCardProps) {
  const [enabled, setEnabled] = useState(agent.enabled);
  const openForAgent = useAgentArchitectStore((state) => state.openForAgent);
  const isActive = enabled && agent.status === "active";

  function handleToggle(next: boolean) {
    setEnabled(next);
    onToggle?.(agent.id, next);
  }

  function openConfiguration() {
    openForAgent(agent);
  }

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-propnex-border bg-propnex-panel transition-all duration-300",
        !enabled && "opacity-90",
        compact && "rounded-xl"
      )}
    >
      <div className={cn("flex flex-col", compact ? "gap-3 p-3.5" : "gap-5 p-5")}>
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <div
              className={cn(
                "flex items-center justify-center rounded-full ring-1 ring-propnex-border",
                agent.avatarGradient,
                compact ? "size-10" : "size-14",
                !enabled && "grayscale"
              )}
            >
              <Bot
                className={cn("text-foreground/90", compact ? "size-5" : "size-7")}
                strokeWidth={1.5}
              />
            </div>
            <span
              className={cn(
                "absolute right-0 bottom-0 rounded-full ring-2 ring-propnex-panel",
                compact ? "size-2.5" : "size-3",
                isActive ? "bg-success" : "bg-propnex-muted"
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openConfiguration}
              className={cn(
                "rounded-lg border border-propnex-border text-propnex-muted transition-colors hover:border-propnex-accent/50 hover:bg-propnex-bg hover:text-foreground",
                compact ? "p-1.5" : "p-2"
              )}
              aria-label={`Configure ${agent.name}`}
            >
              <Settings2 className={compact ? "size-3.5" : "size-4"} />
            </button>
            <AgentToggle enabled={enabled} onChange={handleToggle} compact={compact} />
          </div>
        </div>

        <div className="space-y-0.5">
          <h3
            className={cn(
              "font-semibold text-foreground",
              compact ? "text-sm" : "text-base"
            )}
          >
            {agent.name}
          </h3>
          <p className={cn("text-propnex-muted", compact ? "text-xs" : "text-sm")}>
            {agent.role}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {agent.languages.map((language) => (
            <span
              key={language}
              className={cn(
                "rounded-md border border-propnex-border bg-propnex-bg font-medium tracking-wide text-foreground/80 uppercase",
                compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
              )}
            >
              {language}
            </span>
          ))}
          <span
            className={cn(
              "rounded-md font-semibold tracking-wide uppercase",
              compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
              isActive
                ? "bg-success/15 text-success"
                : "bg-propnex-bg text-propnex-muted"
            )}
          >
            {isActive ? "Active" : "Disabled"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={openConfiguration}
        className={cn(
          "flex w-full items-center justify-between gap-3 border-t border-propnex-border text-left transition-colors hover:bg-propnex-bg/60",
          compact ? "px-3.5 py-2.5" : "px-5 py-3.5",
          !enabled && "text-propnex-muted"
        )}
      >
        <span className="flex items-center gap-2 text-sm">
          <Mic
            className={cn("shrink-0 text-propnex-muted", compact ? "size-3.5" : "size-4")}
            strokeWidth={1.75}
          />
          <span
            className={cn(
              compact ? "text-xs" : "text-sm",
              !enabled ? "text-propnex-muted" : "text-foreground"
            )}
          >
            {agent.voiceProfile}
          </span>
        </span>
        <ChevronRight
          className={cn("shrink-0 text-propnex-muted", compact ? "size-3.5" : "size-4")}
        />
      </button>
    </article>
  );
}
