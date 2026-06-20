"use client";

import { useEffect, useState } from "react";

import { fetchBillingPage } from "@/lib/graphql/api";
import type { PurchaseHistoryItem } from "@/lib/billing-resources-data";
import { useBillingStore } from "@/stores/billing-store";

export function useBillingGraphQL() {
  const setInvoices = useBillingStore((s) => s.setInvoices);
  const setPurchaseHistory = useBillingStore((s) => s.setPurchaseHistory);
  const setSubscription = useBillingStore((s) => s.setSubscription);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchBillingPage();
        if (cancelled) return;

        setSubscription(data.billing.subscription);
        setInvoices(data.billing.invoices.edges.map((e) => e.node));
        setPurchaseHistory(
          data.credits.usageHistory.edges.map(
            (e): PurchaseHistoryItem => ({
              id: e.node.id,
              purchaseDate: e.node.createdAt.split("T")[0] ?? e.node.createdAt,
              resourceType: e.node.reason,
              quantity: Math.abs(e.node.amount),
              amount: Math.abs(e.node.amount),
              status: "completed",
              invoiceId: e.node.id,
            }),
          ),
        );
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
  }, [setInvoices, setPurchaseHistory, setSubscription]);

  return { isLoading, error };
}
