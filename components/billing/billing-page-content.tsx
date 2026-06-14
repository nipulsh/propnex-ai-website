import { BillingHeader } from "@/components/billing/billing-header";
import { BillingHistoryTable } from "@/components/billing/billing-history-table";
import { BillingPlanCards } from "@/components/billing/billing-plan-cards";
import { CreditsUsageCard } from "@/components/billing/credits-usage-card";

export function BillingPageContent() {
  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6">
      <BillingHeader />
      <CreditsUsageCard />
      <BillingPlanCards />
      <BillingHistoryTable />
    </div>
  );
}
