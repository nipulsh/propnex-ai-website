"use client";

import { BillingSection } from "@/components/billing/billing-section";
import { InvoicesTable } from "@/components/billing/invoices-table";
import { PurchaseHistoryTable } from "@/components/billing/purchase-history-table";
import { SimplePurchasePanel } from "@/components/billing/simple-purchase-panel";
import { PageHeader } from "@/components/common/page-header";
import { useBillingGraphQL } from "@/hooks/use-billing-graphql";
import { usePageStatusNotification } from "@/hooks/use-page-status-notification";

export function BillingPageContent() {
  const { isLoading, error } = useBillingGraphQL();

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading billing data…",
    loadingId: "billing-loading",
    error: error ?? undefined,
  });

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title="Billing"
        description="View pricing for credits, calls, and channels."
      />

      <SimplePurchasePanel />

      <BillingSection
        title="Invoices"
        description="Download and review your billing invoices."
      >
        <InvoicesTable />
      </BillingSection>

      <BillingSection
        title="Purchase History"
        description="Review previous resource purchases."
      >
        <PurchaseHistoryTable />
      </BillingSection>
    </div>
  );
}
