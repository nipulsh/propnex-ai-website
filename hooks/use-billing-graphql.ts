"use client";

import { useEffect, useState } from "react";

import { fetchBillingPage } from "@/lib/graphql/api";
import { useUsageStore } from "@/stores/usage-store";

export function useBillingGraphQL() {
  const setFromSnapshot = useUsageStore((s) => s.setFromSnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<
    {
      id: string;
      issuedAt: string;
      amountCents: number;
      status: string;
      description: string | null;
      currency: string;
    }[]
  >([]);
  const [subscription, setSubscription] = useState<{
    planName: string;
    status: string;
    currentPeriodEnd: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchBillingPage();
        if (cancelled) return;

        const summary = data.credits.summary;
        setFromSnapshot({
          totalCredits: summary.remaining + summary.used,
          usedCredits: summary.used,
          remainingCredits: summary.remaining,
          moneyUsedInr: 0,
          monthlyCallsUsed: 0,
          monthlyCallCapacity: 1000,
          availablePercent:
            summary.remaining + summary.used > 0
              ? Math.round(
                  (summary.remaining / (summary.remaining + summary.used)) *
                    100,
                )
              : 0,
        });

        setSubscription(data.billing.subscription);
        setInvoices(data.billing.invoices.edges.map((e) => e.node));
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load billing");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [setFromSnapshot]);

  return { isLoading, error, invoices, subscription };
}
