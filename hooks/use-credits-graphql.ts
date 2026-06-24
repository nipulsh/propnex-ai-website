"use client";

import { useCallback } from "react";

import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { fetchCreditsSummary } from "@/lib/graphql/api";
import type { CreditsSummaryResult } from "@/lib/graphql/queries";
import { USAGE_RATES } from "@/lib/credit-usage";
import { useUsageStore } from "@/stores/usage-store";

function formatRenewalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function useCreditsGraphQL(enabled = true) {
  const setFromSnapshot = useUsageStore((s) => s.setFromSnapshot);

  const applyCredits = useCallback(
    (data: CreditsSummaryResult) => {
      const { summary } = data.credits;
      const current = useUsageStore.getState();

      setFromSnapshot({
        remainingCredits: summary.remaining,
        usedCredits: summary.used,
        totalCredits: summary.total,
        availablePercent: summary.availablePercent,
        moneyUsedInr:
          Math.round(summary.used * USAGE_RATES.inrPerCredit * 100) / 100,
        monthlyCallsUsed: current.monthlyCallsUsed,
        monthlyCallCapacity: current.monthlyCallCapacity,
      });

      useUsageStore.setState({
        creditsHydrated: true,
        ...(summary.renewalAt
          ? { resetDate: formatRenewalDate(summary.renewalAt) }
          : {}),
        ...(summary.planId ? { activePlan: summary.planId } : {}),
      });
    },
    [setFromSnapshot],
  );

  useCachedPagePoll({
    enabled,
    loadKey: "credits",
    fetchPage: fetchCreditsSummary,
    onData: applyCredits,
  });
}
