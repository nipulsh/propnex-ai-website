"use client";

import { useCallback, useEffect } from "react";

import { fetchHomePage } from "@/lib/graphql/api";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function useHomeDashboardGraphQL() {
  const setLoading = useHomeDashboardStore((s) => s.setLoading);
  const setError = useHomeDashboardStore((s) => s.setError);
  const setPageData = useHomeDashboardStore((s) => s.setPageData);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHomePage();
      setPageData(data);
    } catch {
      setError(true);
    }
  }, [setError, setLoading, setPageData]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { reload };
}
