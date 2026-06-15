"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  Eye,
  Pencil,
  Phone,
} from "lucide-react";

import { AgentStatusBadge } from "@/components/agents/agent-status-badge";
import { DisableAgentDialog } from "@/components/agents/disable-agent-dialog";
import { Button } from "@/components/ui/button";
import {
  formatLastActivity,
  getAgentListMetrics,
  getPhoneNumbersForAgent,
} from "@/lib/agent-detail-data";
import type { Agent } from "@/lib/agents-data";
import { cn } from "@/lib/utils";
import { useAgentsStore } from "@/stores/agents-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

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

export function AgentCard({ agent }: AgentCardProps) {
  const setAgentEnabled = useAgentsStore((s) => s.setAgentEnabled);
  const phoneNumbers = usePhoneNumbersStore((s) => s.numbers);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);

  const metrics = getAgentListMetrics(agent.id);
  const assignedNumbers = getPhoneNumbersForAgent(phoneNumbers, agent.id);
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

            <div className="flex items-center gap-2">
              <AgentToggle enabled={agent.enabled} onChange={handleToggle} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {agent.name}
              </h3>
              <AgentStatusBadge agent={agent} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-propnex-muted">
              <span className="rounded-md border border-propnex-border bg-propnex-bg px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                {agent.type}
              </span>
              <span>{agent.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-propnex-muted">
            <Phone className="size-3.5 shrink-0" />
            <span>
              {assignedNumbers.length} phone number
              {assignedNumbers.length !== 1 ? "s" : ""} assigned
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-propnex-border bg-propnex-bg/50 p-3 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-medium tracking-wide text-propnex-muted uppercase">
                Total Calls
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {metrics.totalCalls.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide text-propnex-muted uppercase">
                Inbound
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-foreground">
                <ArrowDownLeft className="size-3 text-propnex-accent" />
                {metrics.inboundCalls}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide text-propnex-muted uppercase">
                Outbound
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-foreground">
                <ArrowUpRight className="size-3 text-propnex-accent" />
                {metrics.outboundCalls}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide text-propnex-muted uppercase">
                Last Activity
              </p>
              <p className="mt-0.5 text-sm text-foreground">
                {formatLastActivity(metrics.lastActivity)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-medium tracking-wide text-propnex-muted uppercase">
                Conversion
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {metrics.conversionRate}% · {metrics.hotLeads} hot leads
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-propnex-border bg-propnex-bg/30 p-3">
          <Button
            nativeButton={false}
            render={<Link href={`/agents/${agent.id}`} />}
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 border-propnex-border bg-propnex-panel text-xs"
          >
            <Eye className="size-3.5" />
            View Details
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={`/agents/${agent.id}?edit=config`} />}
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 border-propnex-border bg-propnex-panel text-xs"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
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
