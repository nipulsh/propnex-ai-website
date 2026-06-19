"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCallLogsPage } from "@/lib/graphql/api";

export type GraphQLCallLog = {
  id: string;
  startedAt: string;
  direction: string;
  status: string;
  durationSeconds: number;
  leadName: string;
  agentName: string;
  phoneNumber: string;
  lineLabel: string;
};

export function useCallLogsGraphQL(filter?: Record<string, unknown>) {
  const [logs, setLogs] = useState<GraphQLCallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const load = useCallback(
    async (after?: string) => {
      setIsLoading(true);
      try {
        const data = await fetchCallLogsPage(after, filter);
        const connection = data.callLogs.connection;
        const mapped = connection.edges.map(({ node }) => ({
          id: node.id,
          startedAt: node.startedAt,
          direction: node.direction.toLowerCase(),
          status: node.status.toLowerCase(),
          durationSeconds: node.durationSeconds,
          leadName: [node.lead?.firstName, node.lead?.lastName]
            .filter(Boolean)
            .join(" ") || "Unknown",
          agentName: node.aiAgent?.name ?? "Unassigned",
          phoneNumber: "",
          lineLabel: "",
        }));

        setLogs((prev) => (after ? [...prev, ...mapped] : mapped));
        setEndCursor(connection.pageInfo.endCursor);
        setHasNextPage(connection.pageInfo.hasNextPage);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load call logs");
      } finally {
        setIsLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    logs,
    isLoading,
    error,
    hasNextPage,
    loadMore: () => {
      if (endCursor && hasNextPage) {
        void load(endCursor);
      }
    },
    reload: () => load(),
  };
}
