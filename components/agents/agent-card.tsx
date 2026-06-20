"use client";

import { useState } from "react";
import { Bot } from "lucide-react";

import { AgentStatusBadge } from "@/components/agents/agent-status-badge";
import { DisableAgentDialog } from "@/components/agents/disable-agent-dialog";
import { HearAgentButton } from "@/components/agents/hear-agent-button";
import type { Agent } from "@/lib/agents-data";
import { cn } from "@/lib/utils";
import { useAgentsStore } from "@/stores/agents-store";

type AgentCardProps = {
  agent: Agent;
};

function AgentToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        enabled ? "bg-propnex-accent" : "bg-propnex-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-foreground shadow-sm transition-transform",
          enabled && "translate-x-5 bg-propnex-bg",
        )}
      />
    </button>
  );
}

function LeadSummaryCard() {
  return (
    <div className="rounded-lg border border-propnex-border bg-propnex-bg/50 p-3">
      <p className="text-[10px] font-medium tracking-wide text-propnex-muted uppercase">
        Lead Summary
      </p>
      <p className="mt-2 text-xs text-propnex-muted">
        Open agent detail for call and lead metrics.
      </p>
    </div>
  );
}

export function AgentCard({ agent }: AgentCardProps) {
  const setAgentEnabled = useAgentsStore((s) => s.setAgentEnabled);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);

  const isActive = agent.enabled && agent.status === "active";

  function handleToggle(next: boolean) {
    if (!next) {
      setDisableDialogOpen(true);
      return;
    }
    setAgentEnabled(agent.id, true);
  }

  function handleConfirmDisable() {
    setAgentEnabled(agent.id, false);
  }

  return (
    <>
      <article
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border border-propnex-border bg-propnex-panel transition-all",
          !isActive && "opacity-60 grayscale-[0.3]",
        )}
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-full ring-1 ring-propnex-border",
                  agent.avatarGradient,
                  !isActive && "grayscale",
                )}
              >
                <Bot className="size-7 text-foreground/90" strokeWidth={1.5} />
              </div>
              <span
                className={cn(
                  "absolute right-0 bottom-0 size-3 rounded-full ring-2 ring-propnex-panel",
                  isActive ? "bg-success" : "bg-propnex-muted",
                )}
              />
            </div>

            <AgentToggle enabled={agent.enabled} onChange={handleToggle} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {agent.name}
              </h3>
              <AgentStatusBadge agent={agent} />
            </div>
            <span className="inline-block rounded-md border border-propnex-border bg-propnex-bg px-2 py-0.5 text-[10px] font-medium tracking-wide text-propnex-muted uppercase">
              {agent.type}
            </span>
          </div>

          <LeadSummaryCard />

          <HearAgentButton agent={agent} className="w-full" />
        </div>
      </article>

      <DisableAgentDialog
        open={disableDialogOpen}
        onOpenChange={setDisableDialogOpen}
        agentName={agent.name}
        onConfirm={handleConfirmDisable}
      />
    </>
  );
}
