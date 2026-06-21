"use client";

import { useCallback } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import type { HomePageResult } from "@/lib/graphql/queries";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function useHomeDashboardGraphQL() {
  const setLoading = useHomeDashboardStore((s) => s.setLoading);
  const setError = useHomeDashboardStore((s) => s.setError);
  const setPageData = useHomeDashboardStore((s) => s.setPageData);

  const fetchPage = useCallback(
    () => fetchCachedPage<HomePageResult>("home"),
    [],
  );

  const { reload } = useCachedPagePoll({
    fetchPage,
    onData: setPageData,
    onError: () => setError(true),
    onLoading: setLoading,
  });

  return { reload };
}
