"use client";

import { useCallback, useEffect } from "react";

import { fetchAgentDetailPage } from "@/lib/graphql/api";
import {
  mapGraphQLAgentToUI,
  mapGraphQLCallLogToUI,
} from "@/lib/mappers/agent.mapper";
import { mapGraphQLPhoneNumberToUI } from "@/lib/mappers/phone-number.mapper";
import { useAgentDetailStore } from "@/stores/agent-detail-store";
import { useAgentsStore } from "@/stores/agents-store";

export function useAgentDetailGraphQL(agentId: string) {
  const upsertAgent = useAgentsStore((s) => s.upsertAgent);
  const setLoading = useAgentDetailStore((s) => s.setLoading);
  const setError = useAgentDetailStore((s) => s.setError);
  const hydrate = useAgentDetailStore((s) => s.hydrate);
  const setCalls = useAgentDetailStore((s) => s.setCalls);
  const setAssignedNumbers = useAgentDetailStore((s) => s.setAssignedNumbers);
  const reset = useAgentDetailStore((s) => s.reset);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentDetailPage(agentId);
      const agent = data.agents.byId;

      if (!agent) {
        setError("Agent not found");
        return;
      }

      const mappedAgent = mapGraphQLAgentToUI(agent as never);
      upsertAgent(mappedAgent);

      const assigned = data.phoneNumbers.list
        .map((n) => mapGraphQLPhoneNumberToUI(n as never))
        .filter(
          (n) =>
            n.inboundAgentId === agentId || n.outboundAgentId === agentId,
        )
        .map((n) => ({
          id: n.id,
          number: n.number,
          provider: n.provider,
          direction:
            n.inboundAgentId === agentId && n.outboundAgentId === agentId
              ? ("both" as const)
              : n.inboundAgentId === agentId
                ? ("inbound" as const)
                : ("outbound" as const),
          status: n.status,
        }));

      const calls = data.callLogs.connection.edges.map((edge) =>
        mapGraphQLCallLogToUI(
          edge.node as never,
          agentId,
          mappedAgent.name,
        ),
      );

      setAssignedNumbers(assigned);
      setCalls(calls);
      hydrate(agentId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent");
    } finally {
      setLoading(false);
    }
  }, [
    agentId,
    hydrate,
    upsertAgent,
    setAssignedNumbers,
    setCalls,
    setError,
    setLoading,
  ]);

  useEffect(() => {
    reset();
    void reload();
  }, [agentId, reload, reset]);

  return { reload };
}
