"use client";

import { useCallback, useState } from "react";

import { fetchCachedPage } from "@/lib/page-cache/client";
import type { BillingPageResult } from "@/lib/graphql/queries";
import type { PurchaseHistoryItem } from "@/lib/billing-resources-data";
import { useCachedPagePoll } from "@/hooks/use-cached-page-poll";
import { useBillingStore } from "@/stores/billing-store";

export function useBillingGraphQL() {
  const setInvoices = useBillingStore((s) => s.setInvoices);
  const setPurchaseHistory = useBillingStore((s) => s.setPurchaseHistory);
  const setSubscription = useBillingStore((s) => s.setSubscription);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyBillingData = useCallback(
    (data: BillingPageResult) => {
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
    },
    [setInvoices, setPurchaseHistory, setSubscription],
  );

  const fetchPage = useCallback(
    () => fetchCachedPage<BillingPageResult>("billing"),
    [],
  );

  useCachedPagePoll({
    loadKey: "billing",
    fetchPage,
    onData: applyBillingData,
    onError: (message) => setError(message),
    onLoading: setIsLoading,
  });

  return { isLoading, error };
}
