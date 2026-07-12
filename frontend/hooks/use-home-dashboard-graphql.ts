"use client";

import { useCallback } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import { getDateRangeStart, type DateRangeOption } from "@/lib/call-logs-data";
import type { HomePageResult } from "@/lib/graphql/queries";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

function buildHomeDateFilter(dateRange: DateRangeOption) {
  return {
    dateFrom: new Date(getDateRangeStart(dateRange)).toISOString(),
    dateTo: new Date().toISOString(),
  };
}

export function useHomeDashboardGraphQL() {
  const dateRange = useHomeDashboardStore((s) => s.dateRange);
  const setLoading = useHomeDashboardStore((s) => s.setLoading);
  const setError = useHomeDashboardStore((s) => s.setError);
  const setPageData = useHomeDashboardStore((s) => s.setPageData);

  const fetchPage = useCallback(
    () =>
      fetchCachedPage<HomePageResult>("home", {
        filter: buildHomeDateFilter(dateRange),
      }),
    [dateRange],
  );

  const { reload } = useCachedPagePoll({
    loadKey: "home",
    fetchPage,
    onData: setPageData,
    onError: () => setError(true),
    onLoading: setLoading,
    deps: [dateRange],
  });

  return { reload };
}
