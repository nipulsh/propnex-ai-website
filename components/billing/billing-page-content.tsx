"use client";

import { BillingBanner } from "@/components/billing/billing-banner";
import { BillingSection } from "@/components/billing/billing-section";
import { PaymentSummaryPanel } from "@/components/billing/payment-summary-panel";
import { PurchaseHistoryTable } from "@/components/billing/purchase-history-table";
import { QuoteGenerationSection } from "@/components/billing/quote-generation-section";
import { ResourceRequestBuilder } from "@/components/billing/resource-request-builder";
import { ResourceValiditySection } from "@/components/billing/resource-validity-section";
import { RoiEstimatorSection } from "@/components/billing/roi-estimator-section";
import { UsageOverviewSection } from "@/components/billing/usage-overview-section";
import { PageHeader } from "@/components/common/page-header";
import { useBillingStore } from "@/stores/billing-store";

export function BillingPageContent() {
  const banner = useBillingStore((state) => state.banner);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <PageHeader
        title="Billing & Resources"
        description="Plan, estimate, and purchase infrastructure resources for your AI calling operations."
      />

      {banner ? (
        <BillingBanner type={banner.type} message={banner.message} />
      ) : null}

      <BillingSection
        title="Usage Overview"
        description="Current account resources and capacity utilization."
      >
        <UsageOverviewSection />
      </BillingSection>

      <div className="lg:hidden">
        <PaymentSummaryPanel />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <BillingSection
            id="resource-request"
            title="Resource Request Builder"
            description="Configure additional channels, numbers, and expected call volume."
          >
            <ResourceRequestBuilder />
          </BillingSection>

          <BillingSection
            title="Resource Validity"
            description="Active subscriptions and expiry information."
          >
            <ResourceValiditySection />
          </BillingSection>

          <BillingSection
            title="ROI Estimator"
            description="Understand the potential business impact of your calling operations."
          >
            <RoiEstimatorSection />
          </BillingSection>

          <BillingSection
            title="Quote Generation"
            description="Generate formal quotes for internal approval or procurement."
          >
            <QuoteGenerationSection />
          </BillingSection>

          <BillingSection
            title="Purchase History"
            description="Review previous resource purchases and invoices."
          >
            <PurchaseHistoryTable />
          </BillingSection>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-6">
            <PaymentSummaryPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
