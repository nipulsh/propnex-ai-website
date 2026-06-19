"use client";

import { useEffect } from "react";

import { fetchHomeDashboard } from "@/lib/graphql/api";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";
import { useUsageStore } from "@/stores/usage-store";

export function useHomeDashboardGraphQL() {
  const setLoading = useHomeDashboardStore((s) => s.setLoading);
  const setError = useHomeDashboardStore((s) => s.setError);
  const setUsage = useUsageStore((s) => s.setFromSnapshot);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchHomeDashboard();
        if (cancelled) return;

        const summary = data.credits.summary;
        setUsage({
          totalCredits: summary.remaining + summary.used,
          usedCredits: summary.used,
          remainingCredits: summary.remaining,
          moneyUsedInr: 0,
          monthlyCallsUsed: data.analytics.summary.totalCalls,
          monthlyCallCapacity: 1000,
          availablePercent: summary.availablePercent,
        });
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [setError, setLoading, setUsage]);
}
