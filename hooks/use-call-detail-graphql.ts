"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchCallDetail } from "@/lib/graphql/api";
import { mapGraphQLCallDetailToUI } from "@/lib/mappers/call-detail.mapper";
import type { CallDetail } from "@/lib/call-detail-data";

export function useCallDetailGraphQL(callId: string) {
  const [detail, setDetail] = useState<CallDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCallDetail(callId);
      if (!data.callLogs.detail) {
        setError("Call not found");
        setDetail(null);
        return;
      }
      setDetail(mapGraphQLCallDetailToUI(data.callLogs.detail as never));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load call");
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [callId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { detail, isLoading, error, reload: load };
}
