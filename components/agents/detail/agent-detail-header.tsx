"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Globe } from "lucide-react";

import { AgentStatusBadge } from "@/components/agents/agent-status-badge";
import { DisableAgentDialog } from "@/components/agents/disable-agent-dialog";
import { Button } from "@/components/ui/button";
import { formatAgentDate } from "@/lib/agent-detail-data";
import type { Agent } from "@/lib/agents-data";
import { cn } from "@/lib/utils";

type AgentDetailHeaderProps = {
  agent: Agent;
  onToggleEnabled: (enabled: boolean) => void;
};

export function AgentDetailHeader({
  agent,
  onToggleEnabled,
}: AgentDetailHeaderProps) {
  const isActive = agent.enabled && agent.status === "active";
  const [disableOpen, setDisableOpen] = useState(false);

  function handleToggle() {
    if (isActive) {
      setDisableOpen(true);
    } else {
      onToggleEnabled(true);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", !isActive && "opacity-80")}>
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/agents" />}
        className="w-fit gap-2 px-0 text-propnex-muted hover:bg-transparent hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Agents
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              AI Voice Agent
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {agent.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AgentStatusBadge agent={agent} />
            <span className="rounded-md border border-propnex-border bg-propnex-panel px-2.5 py-1 text-xs font-medium capitalize text-propnex-muted">
              {agent.type}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-propnex-border bg-propnex-panel px-2.5 py-1 text-xs text-propnex-muted">
              <Globe className="size-3.5 text-propnex-accent" />
              {agent.environment}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-propnex-muted">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 text-propnex-accent" />
              Created {formatAgentDate(agent.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-propnex-accent" />
              Modified {formatAgentDate(agent.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={<Link href={`/agents/create?edit=${agent.id}`} />}
            variant="outline"
            className="border-propnex-border bg-propnex-panel"
          >
            Edit Agent
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleToggle}
            className={cn(
              "border-propnex-border bg-propnex-panel",
              isActive && "text-destructive hover:text-destructive",
            )}
          >
            {isActive ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>

      <DisableAgentDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        agentName={agent.name}
        onConfirm={() => onToggleEnabled(false)}
      />
    </div>
  );
}
