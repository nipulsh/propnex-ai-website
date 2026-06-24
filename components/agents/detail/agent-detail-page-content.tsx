"use client";

import { useMemo } from "react";
import Link from "next/link";

import { AgentCallActivitySection } from "@/components/agents/detail/agent-call-activity-section";
import { AgentConfigurationSection } from "@/components/agents/detail/agent-configuration-section";
import { AgentToolsSection } from "@/components/agents/detail/agent-tools-section";
import { AgentDetailHeader } from "@/components/agents/detail/agent-detail-header";
import { AgentIntelligenceSection } from "@/components/agents/detail/agent-intelligence-section";
import { AgentKnowledgeSection } from "@/components/agents/detail/agent-knowledge-section";
import { AgentOverviewSection } from "@/components/agents/detail/agent-overview-section";
import { AgentResourcesSection } from "@/components/agents/detail/agent-resources-section";
import { AgentSectionNav } from "@/components/agents/detail/agent-section-nav";
import { Button } from "@/components/ui/button";
import type { AgentListMetrics } from "@/lib/agent-detail-data";
import { useAgentDetailGraphQL } from "@/hooks/use-agent-detail-graphql";
import {
  useActionNotification,
  usePageStatusNotification,
} from "@/hooks/use-page-status-notification";
import { useAgentDetailStore } from "@/stores/agent-detail-store";
import { useAgentsStore } from "@/stores/agents-store";

type AgentDetailPageContentProps = {
  agentId: string;
};

function computeMetrics(
  agentId: string,
  calls: ReturnType<typeof useAgentDetailStore.getState>["calls"],
): AgentListMetrics {
  const inboundCalls = calls.filter((c) => c.direction === "inbound").length;
  const outboundCalls = calls.filter((c) => c.direction === "outbound").length;
  const completed = calls.filter((c) => c.status === "completed");
  const avgCallDurationSeconds =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, c) => sum + c.durationSeconds, 0) /
            completed.length,
        )
      : 0;

  return {
    totalCalls: calls.length,
    inboundCalls,
    outboundCalls,
    lastActivity: calls[0]?.timestamp ?? null,
    conversionRate:
      completed.length > 0
        ? Math.round((completed.length / calls.length) * 100)
        : 0,
    hotLeads: 0,
    avgCallDurationSeconds,
  };
}

export function AgentDetailPageContent({
  agentId,
}: AgentDetailPageContentProps) {
  useAgentDetailGraphQL(agentId);

  const agent = useAgentsStore((s) => s.agents.find((a) => a.id === agentId));
  const setAgentEnabled = useAgentsStore((s) => s.setAgentEnabled);
  const isLoading = useAgentDetailStore((s) => s.isLoading);
  const error = useAgentDetailStore((s) => s.error);
  const successBanner = useAgentDetailStore((s) => s.successBanner);
  const setSuccessBanner = useAgentDetailStore((s) => s.setSuccessBanner);
  const calls = useAgentDetailStore((s) => s.calls);
  const assignedNumbers = useAgentDetailStore((s) => s.assignedNumbers);

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading agent…",
    loadingId: "agent-detail-loading",
    error: error ?? undefined,
    onErrorClear: () => useAgentDetailStore.setState({ error: null }),
  });

  useActionNotification({
    message: successBanner,
    type: "success",
    onClear: () => setSuccessBanner(null),
  });

  const metrics = useMemo(
    () => (agent ? computeMetrics(agentId, calls) : null),
    [agent, agentId, calls],
  );

  if (!agent || !metrics) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overscroll-contain p-6">
        <Button
          nativeButton={false}
          render={<Link href="/agents" />}
          variant="outline"
        >
          Back to Agents
        </Button>
      </div>
    );
  }

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      <div className="flex flex-col gap-6 p-6 pb-24">
        <AgentDetailHeader
          agent={agent}
          onToggleEnabled={(enabled) => setAgentEnabled(agent.id, enabled)}
        />

        <AgentSectionNav />

        <AgentOverviewSection agent={agent} metrics={metrics} />
        <AgentResourcesSection
          agent={agent}
          phoneNumbers={assignedNumbers}
        />
        <AgentConfigurationSection agent={agent} />
        <AgentToolsSection agent={agent} />
        <AgentIntelligenceSection agent={agent} />
        <AgentCallActivitySection calls={calls} />
        <AgentKnowledgeSection agent={agent} />
      </div>
    </div>
  );
}
