"use client";

import { useCallback, useState } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import type { CallLogsPageResult } from "@/lib/graphql/queries/call-logs";
import type { CallOutcome, LeadTemperature } from "@/lib/call-detail-data";
import type { SentimentOutcome } from "@/lib/call-logs-data";
import { extractSentimentOutcome } from "@/lib/call-logs-data";
import { getLeadTemperatureForCall } from "@/lib/call-detail-data";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";

type CallLogNode = CallLogsPageResult["callLogs"]["connection"]["edges"][number]["node"];

export type GraphQLCallLog = {
  id: string;
  startedAt: string;
  direction: string;
  status: string;
  durationSeconds: number;
  leadName: string;
  agentName: string;
  agentId: string;
  phoneNumber: string;
  lineLabel: string;
  leadPhone: string;
  phoneNumberId: string;
  outcome: CallOutcome | null;
  leadTemperature: LeadTemperature;
  leadScore: number;
  callCost: number;
  creditsUsed: number;
  provider: string;
  summarySnippet: string;
  hasRecording: boolean;
  recordingUrl: string | null;
  sentimentOutcome: SentimentOutcome | null;
  hasTranscript: boolean;
};

function toOutcome(value?: string | null): CallOutcome | null {
  if (!value) return null;
  return value.toLowerCase().replace(/_/g, "-") as CallOutcome;
}

function toTemperature(
  value: string | null | undefined,
  callId: string,
): LeadTemperature {
  if (value) return value.toLowerCase() as LeadTemperature;
  return getLeadTemperatureForCall(callId);
}

function extractAiSummary(summary: Record<string, unknown> | null): string {
  if (!summary) return "—";
  const interests = summary.interests;
  if (typeof interests === "string" && interests.trim()) return interests.trim();
  const points = summary.discussionPoints;
  if (Array.isArray(points) && points.length > 0) {
    return String(points[0]);
  }
  return "—";
}

function mapNode(node: CallLogNode): GraphQLCallLog {
  const leadName =
    [node.lead?.firstName, node.lead?.lastName].filter(Boolean).join(" ") ||
    "Unknown";

  return {
    id: node.id,
    startedAt: node.startedAt,
    direction: node.direction.toLowerCase(),
    status: node.status.toLowerCase(),
    durationSeconds: node.durationSeconds,
    leadName,
    agentName: node.aiAgent?.name ?? "Unassigned",
    agentId: node.aiAgent?.id ?? "",
    phoneNumber: node.phoneNumber?.number ?? "—",
    lineLabel: node.phoneNumber?.label ?? "",
    leadPhone: node.lead?.phone ?? "—",
    phoneNumberId: node.phoneNumber?.id ?? "",
    outcome: toOutcome(node.outcome),
    leadTemperature: toTemperature(node.lead?.temperature, node.id),
    leadScore: node.lead?.score ?? 0,
    callCost: node.cost ?? 0,
    creditsUsed: node.creditsUsed ?? 0,
    provider: node.provider ?? "—",
    summarySnippet: extractAiSummary(node.aiSummary),
    hasRecording: Boolean(node.recordingUrl),
    recordingUrl: node.recordingUrl,
    sentimentOutcome: extractSentimentOutcome(node.sentiment),
    hasTranscript: Boolean(node.transcriptUrl),
  };
}

export function useCallLogsGraphQL(filter?: Record<string, unknown>) {
  const [logs, setLogs] = useState<GraphQLCallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const applyPageData = useCallback((data: CallLogsPageResult) => {
    const connection = data.callLogs.connection;
    const mapped = connection.edges.map(({ node }) => mapNode(node));
    setLogs(mapped);
    setEndCursor(connection.pageInfo.endCursor);
    setHasNextPage(connection.pageInfo.hasNextPage);
    setError(null);
  }, []);

  const fetchPage = useCallback(
    () =>
      fetchCachedPage<CallLogsPageResult>("call-logs", {
        filter,
      }),
    [filter],
  );

  const { reload } = useCachedPagePoll({
    fetchPage,
    onData: applyPageData,
    onError: (message) => setError(message),
    onLoading: setIsLoading,
    deps: [filter],
  });

  const loadMore = useCallback(async () => {
    if (!endCursor || !hasNextPage) return;
    try {
      const data = await fetchCachedPage<CallLogsPageResult>("call-logs", {
        after: endCursor,
        filter,
      });
      const connection = data.callLogs.connection;
      const mapped = connection.edges.map(({ node }) => mapNode(node));
      setLogs((prev) => [...prev, ...mapped]);
      setEndCursor(connection.pageInfo.endCursor);
      setHasNextPage(connection.pageInfo.hasNextPage);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load call logs");
    }
  }, [endCursor, filter, hasNextPage]);

  return {
    logs,
    isLoading,
    error,
    hasNextPage,
    loadMore: () => {
      void loadMore();
    },
    reload,
  };
}
