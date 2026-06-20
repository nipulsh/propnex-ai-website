"use client";

import { useCallback, useEffect } from "react";

import {
  createAgent as createAgentApi,
  fetchAgentsList,
  updateAgent as updateAgentApi,
} from "@/lib/graphql/api";
import {
  mapGraphQLAgentToUI,
  mapUIAgentToCreateInput,
} from "@/lib/mappers/agent.mapper";
import { useAgentsStore } from "@/stores/agents-store";

export function useAgentsGraphQL() {
  const setAgents = useAgentsStore((s) => s.setAgents);
  const setLoading = useAgentsStore((s) => s.setLoading);
  const setError = useAgentsStore((s) => s.setError);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentsList();
      const mapped = data.agents.list.map((agent) =>
        mapGraphQLAgentToUI(agent as never),
      );
      setAgents(mapped);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, [setAgents, setError, setLoading]);

  useEffect(() => {
    void reload();
  }, [reload]);

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
