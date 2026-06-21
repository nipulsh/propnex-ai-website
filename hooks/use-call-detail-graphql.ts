"use client";

import { useCallback, useState } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import { mapGraphQLCallDetailToUI } from "@/lib/mappers/call-detail.mapper";
import type { CallDetail } from "@/lib/call-detail-data";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";

export function useCallDetailGraphQL(callId: string) {
  const [detail, setDetail] = useState<CallDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyPageData = useCallback(
    (data: { callLogs: { detail: Record<string, unknown> | null } }) => {
      if (!data.callLogs.detail) {
        setError("Call not found");
        setDetail(null);
        return;
      }
      setDetail(mapGraphQLCallDetailToUI(data.callLogs.detail as never));
      setError(null);
    },
    [],
  );

  const fetchPage = useCallback(
    () =>
      fetchCachedPage<{ callLogs: { detail: Record<string, unknown> | null } }>(
        "call-detail",
        { id: callId },
      ),
    [callId],
  );

  const { reload } = useCachedPagePoll({
    fetchPage,
    onData: applyPageData,
    onError: (message) => {
      setError(message);
      setDetail(null);
    },
    onLoading: setIsLoading,
    deps: [callId],
  });

  return { detail, isLoading, error, reload };
}
