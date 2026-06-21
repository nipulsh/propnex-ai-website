"use client";

import { useCallback } from "react";

import {
  createAgent as createAgentApi,
  updateAgent as updateAgentApi,
} from "@/lib/graphql/api";
import { fetchCachedPage } from "@/lib/page-cache/client";
import {
  mapGraphQLAgentToUI,
  mapUIAgentToCreateInput,
} from "@/lib/mappers/agent.mapper";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { useAgentsStore } from "@/stores/agents-store";

export function useAgentsGraphQL() {
  const setAgents = useAgentsStore((s) => s.setAgents);
  const setLoading = useAgentsStore((s) => s.setLoading);
  const setError = useAgentsStore((s) => s.setError);

  const applyPageData = useCallback(
    (data: {
      agents: {
        list: Record<string, unknown>[];
      };
    }) => {
      const mapped = data.agents.list.map((agent) =>
        mapGraphQLAgentToUI(agent as never),
      );
      setAgents(mapped);
      setError(null);
    },
    [setAgents, setError],
  );

  const fetchPage = useCallback(
    () =>
      fetchCachedPage<{
        agents: { list: Record<string, unknown>[] };
      }>("agents"),
    [],
  );

  const { reload } = useCachedPagePoll({
    fetchPage,
    onData: applyPageData,
    onError: (message) => setError(message),
    onLoading: setLoading,
  });

  return { reload };
}

export async function createAgentOnServer(
  input: Parameters<typeof mapUIAgentToCreateInput>[0],
) {
  const result = await createAgentApi(mapUIAgentToCreateInput(input));
  return mapGraphQLAgentToUI(result.agents.create as never);
}

export async function updateAgentOnServer(
  id: string,
  input: Record<string, unknown>,
) {
  const result = await updateAgentApi(id, input);
  return mapGraphQLAgentToUI(result.agents.update as never);
}
