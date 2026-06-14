"use client";

import { CloudUpload, Plus } from "lucide-react";

import { AgentArchitectPanel } from "@/components/agents/agent-architect/agent-architect-panel";
import { AgentCard } from "@/components/agents/agent-card";
import { Button } from "@/components/ui/button";
import { agents } from "@/lib/agents-data";
import { cn } from "@/lib/utils";
import { useAgentArchitectStore } from "@/stores/agent-architect-store";

export function AgentsPageContent() {
  const isOpen = useAgentArchitectStore((state) => state.isOpen);
  const openNew = useAgentArchitectStore((state) => state.openNew);

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <AgentArchitectPanel />

      <div
        className={cn(
          "propnex-scrollbar flex min-h-0 min-w-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain p-6 transition-all duration-300",
          isOpen && "xl:gap-6 xl:p-5",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className={cn(
                "font-semibold tracking-tight text-foreground transition-all duration-300",
                isOpen ? "text-xl" : "text-2xl",
              )}
            >
              Active Agents
            </h1>
            <p
              className={cn(
                "mt-1 text-propnex-muted transition-all duration-300",
                isOpen ? "text-xs" : "text-sm",
              )}
            >
              Manage and deploy your high-fidelity voice architectures.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              className={cn(
                "gap-2 border-propnex-border bg-propnex-panel",
                isOpen ? "h-8 px-3 text-xs" : "h-9 px-4",
              )}
            >
              <CloudUpload className={isOpen ? "size-3.5" : "size-4"} />
              Import Agent
            </Button>
            <Button
              onClick={openNew}
              className={cn(
                "gap-2 shadow-[0_0_20px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]",
                isOpen ? "h-8 px-3 text-xs" : "h-9 px-4",
              )}
            >
              <Plus className={isOpen ? "size-3.5" : "size-4"} />
              Create Agent
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-4 transition-all duration-300",
            isOpen
              ? "grid-cols-1 md:grid-cols-2 2xl:grid-cols-2"
              : "grid-cols-1 xl:grid-cols-2",
          )}
        >
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} compact={isOpen} />
          ))}
        </div>
      </div>
    </div>
  );
}
