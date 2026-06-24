"use client";

import { useCallback, useEffect } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import {
  mapGraphQLAgentToUI,
  mapGraphQLCallLogToUI,
} from "@/lib/mappers/agent.mapper";
import { mapGraphQLPhoneNumberToUI } from "@/lib/mappers/phone-number.mapper";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
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

  const applyPageData = useCallback(
    (data: {
      agents: { byId: Record<string, unknown> | null };
      phoneNumbers: { list: Record<string, unknown>[] };
      callLogs: {
        connection: {
          edges: {
            node: Record<string, unknown>;
          }[];
        };
      };
    }) => {
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
    },
    [
      agentId,
      hydrate,
      upsertAgent,
      setAssignedNumbers,
      setCalls,
      setError,
    ],
  );

  const fetchPage = useCallback(
    () =>
      fetchCachedPage<{
        agents: { byId: Record<string, unknown> | null };
        phoneNumbers: { list: Record<string, unknown>[] };
        callLogs: {
          connection: {
            edges: {
              node: Record<string, unknown>;
            }[];
          };
        };
      }>("agent-detail", { id: agentId }),
    [agentId],
  );

  const { reload } = useCachedPagePoll({
    enabled: Boolean(agentId),
    loadKey: `agent-detail:${agentId}`,
    fetchPage,
    onData: applyPageData,
    onError: (message) => setError(message),
    onLoading: setLoading,
    deps: [agentId],
  });

  useEffect(() => {
    reset();
  }, [agentId, reset]);

  return { reload };
}
