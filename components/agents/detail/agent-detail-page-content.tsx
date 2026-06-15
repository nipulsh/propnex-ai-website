"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { AgentCallActivitySection } from "@/components/agents/detail/agent-call-activity-section";
import { AgentConfigurationSection } from "@/components/agents/detail/agent-configuration-section";
import { AgentDetailHeader } from "@/components/agents/detail/agent-detail-header";
import { AgentDetailSkeleton } from "@/components/agents/detail/agent-detail-skeleton";
import { AgentIntelligenceSection } from "@/components/agents/detail/agent-intelligence-section";
import { AgentKnowledgeSection } from "@/components/agents/detail/agent-knowledge-section";
import { AgentOverviewSection } from "@/components/agents/detail/agent-overview-section";
import { AgentResourcesSection } from "@/components/agents/detail/agent-resources-section";
import { AgentSectionNav } from "@/components/agents/detail/agent-section-nav";
import { Button } from "@/components/ui/button";
import {
  findAgentInList,
  getAgentListMetrics,
  getCallsForAgent,
  getPhoneNumbersForAgent,
} from "@/lib/agent-detail-data";
import { useAgentDetailStore } from "@/stores/agent-detail-store";
import { useAgentsStore } from "@/stores/agents-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

type AgentDetailPageContentProps = {
  agentId: string;
};

export function AgentDetailPageContent({
  agentId,
}: AgentDetailPageContentProps) {
  const agents = useAgentsStore((s) => s.agents);
  const setAgentEnabled = useAgentsStore((s) => s.setAgentEnabled);
  const phoneNumbers = usePhoneNumbersStore((s) => s.numbers);
  const isLoading = useAgentDetailStore((s) => s.isLoading);
  const error = useAgentDetailStore((s) => s.error);
  const successBanner = useAgentDetailStore((s) => s.successBanner);
  const hydrate = useAgentDetailStore((s) => s.hydrate);
  const reset = useAgentDetailStore((s) => s.reset);
  const setLoading = useAgentDetailStore((s) => s.setLoading);
  const setError = useAgentDetailStore((s) => s.setError);

  const agent = useMemo(
    () => findAgentInList(agents, agentId),
    [agents, agentId],
  );

  const metrics = useMemo(
    () => (agent ? getAgentListMetrics(agent.id) : null),
    [agent],
  );

  const assignedNumbers = useMemo(
    () =>
      agent ? getPhoneNumbersForAgent(phoneNumbers, agent.id) : [],
    [agent, phoneNumbers],
  );

  const calls = useMemo(
    () => (agent ? getCallsForAgent(agent.id) : []),
    [agent],
  );

  useEffect(() => {
    reset();
    setLoading(true);

    const timer = setTimeout(() => {
      const found = findAgentInList(
        useAgentsStore.getState().agents,
        agentId,
      );
      if (!found) {
        setError("Agent not found");
        return;
      }
      hydrate(agentId);
    }, 300);

    return () => clearTimeout(timer);
  }, [agentId, hydrate, reset, setError, setLoading]);

  if (isLoading) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
        <AgentDetailSkeleton />
      </div>
    );
  }

  if (error || !agent || !metrics) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overscroll-contain p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-propnex-border bg-propnex-panel p-8 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">
            Agent not found
          </h2>
          <p className="max-w-sm text-sm text-propnex-muted">
            The agent you are looking for does not exist or may have been
            removed.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/agents" />}
            className="mt-2"
          >
            Back to Agents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      {successBanner ? (
        <div className="border-b border-success/30 bg-success/10 px-6 py-3 text-sm text-success">
          {successBanner}
        </div>
      ) : null}

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
        <AgentIntelligenceSection agent={agent} />
        <AgentCallActivitySection calls={calls} />
        <AgentKnowledgeSection agent={agent} />
      </div>
    </div>
  );
}
