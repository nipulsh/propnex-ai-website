"use client";

import { BillingBanner } from "@/components/billing/billing-banner";
import { BillingSection } from "@/components/billing/billing-section";
import { InvoicesTable } from "@/components/billing/invoices-table";
import { PurchaseHistoryTable } from "@/components/billing/purchase-history-table";
import { SimplePurchasePanel } from "@/components/billing/simple-purchase-panel";
import { PageHeader } from "@/components/common/page-header";
import { useBillingStore } from "@/stores/billing-store";

export function BillingPageContent() {
  const banner = useBillingStore((state) => state.banner);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title="Billing"
        description="Purchase credits, channels, and phone numbers for your calling operations."
      />

      {banner ? (
        <BillingBanner type={banner.type} message={banner.message} />
      ) : null}

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
