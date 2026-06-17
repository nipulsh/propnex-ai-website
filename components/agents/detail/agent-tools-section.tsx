"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

import { AgentToolCard } from "@/components/agent-tools/agent-tool-card";
import { AgentToolConfigSheet } from "@/components/agent-tools/agent-tool-config-sheet";
import { DetailSection } from "@/components/call-details/detail-section";
import type { Agent } from "@/lib/agents-data";
import { TOOL_REGISTRY } from "@/lib/tools/registry";
import type { AgentToolAssignment, AgentToolId } from "@/lib/tools/types";
import { cn } from "@/lib/utils";
import { useAgentToolsStore } from "@/stores/agent-tools-store";

type AgentToolsSectionProps = {
  agent: Agent;
};

export function AgentToolsSection({ agent }: AgentToolsSectionProps) {
  const tools = useAgentToolsStore((s) => s.toolsByAgent[agent.id] ?? []);
  const isLoading = useAgentToolsStore((s) => s.isLoading);
  const isSaving = useAgentToolsStore((s) => s.isSaving);
  const isTesting = useAgentToolsStore((s) => s.isTesting);
  const banner = useAgentToolsStore((s) => s.banner);
  const fetchAgentTools = useAgentToolsStore((s) => s.fetchAgentTools);
  const toggleTool = useAgentToolsStore((s) => s.toggleTool);
  const saveToolConfig = useAgentToolsStore((s) => s.saveToolConfig);
  const testTool = useAgentToolsStore((s) => s.testTool);
  const clearBanner = useAgentToolsStore((s) => s.clearBanner);

  const [configTool, setConfigTool] = useState<AgentToolAssignment | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    fetchAgentTools(agent.id);
  }, [agent.id, fetchAgentTools]);

  const orderedTools = TOOL_REGISTRY.map((def) =>
    tools.find((t) => t.toolId === def.id),
  ).filter(Boolean) as AgentToolAssignment[];

  return (
    <DetailSection
      id="tools"
      title="Agent Tools"
      description="Capabilities this AI agent can use during live customer conversations."
    >
      {banner ? (
        <div
          className={cn(
            "mb-4 flex items-center justify-between rounded-lg px-4 py-3 text-sm",
            banner.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive",
          )}
        >
          <span className="flex items-center gap-2">
            {banner.type === "error" ? (
              <AlertCircle className="size-4" />
            ) : null}
            {banner.message}
          </span>
          <button type="button" onClick={clearBanner}>
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-propnex-border bg-propnex-panel"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orderedTools.map((tool) => (
            <AgentToolCard
              key={tool.toolId}
              tool={tool}
              isSaving={isSaving}
              isTesting={isTesting}
              onToggle={(enabled) =>
                toggleTool(agent.id, tool.toolId as AgentToolId, enabled)
              }
              onConfigure={() => {
                setConfigTool(tool);
                setConfigOpen(true);
              }}
              onTest={() =>
                testTool(agent.id, tool.toolId as AgentToolId)
              }
            />
          ))}
        </div>
      )}

      <AgentToolConfigSheet
        agent={agent}
        tool={configTool}
        open={configOpen}
        isSaving={isSaving}
        onOpenChange={setConfigOpen}
        onSave={(update) => {
          if (!configTool) return;
          saveToolConfig(agent.id, configTool.toolId, update);
        }}
      />
    </DetailSection>
  );
}
