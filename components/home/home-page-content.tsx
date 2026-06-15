"use client";

import { PageHeader } from "@/components/common/page-header";
import { BillingBanner } from "@/components/billing/billing-banner";
import { AIInsightsSection } from "@/components/home/ai-insights-section";
import { CampaignOverviewSection } from "@/components/home/campaign-overview-section";
import { CreditsResourcesSection } from "@/components/home/credits-resources-section";
import { DateRangeSelector } from "@/components/home/date-range-selector";
import { DemoRequestsSection } from "@/components/home/demo-requests-section";
import { HomePageSkeleton } from "@/components/home/home-page-skeleton";
import { LeadStatusSection } from "@/components/home/lead-status-section";
import { NotificationsSection } from "@/components/home/notifications-section";
import { OverviewSection } from "@/components/home/overview-section";
import { PerformanceAnalyticsSection } from "@/components/home/performance-analytics-section";
import { PricingOverviewSection } from "@/components/home/pricing-overview-section";
import { QuickActionsSection } from "@/components/home/quick-actions-section";
import { RecentActivitySection } from "@/components/home/recent-activity-section";
import { ResourceWarningBanner } from "@/components/home/resource-warning-banner";
import { Button } from "@/components/ui/button";
import { INITIAL_RESOURCE_USAGE } from "@/lib/billing-resources-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { useSetupStore } from "@/stores/setup-store";
import { useUsageStore } from "@/stores/usage-store";

function ResourceWarningsStrip() {
  const channelUsage = useSetupStore((s) => s.channelUsage);
  const phoneNumbers = usePhoneNumbersStore((s) => s.numbers);
  const remainingCredits = useUsageStore((s) => s.remainingCredits);
  const totalCredits = useUsageStore((s) => s.totalCredits);

  const channelsAssigned =
    channelUsage.totalAssigned || INITIAL_RESOURCE_USAGE.channelsAssigned;
  const channelsActive =
    channelUsage.active || INITIAL_RESOURCE_USAGE.channelsActive;
  const virtualNumbers =
    phoneNumbers.length || INITIAL_RESOURCE_USAGE.virtualNumbers;
  const virtualCapacity = Math.max(virtualNumbers, 10);

  const creditPercent = (remainingCredits / totalCredits) * 100;
  const channelPercent = (channelsActive / channelsAssigned) * 100;

  const warnings: string[] = [];
  if (creditPercent < 20) warnings.push("Credits Running Low");
  if (channelPercent >= 80) warnings.push("Channels Near Capacity");
  if (virtualNumbers >= virtualCapacity) {
    warnings.push("Virtual Numbers Fully Assigned");
  }

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w) => (
        <ResourceWarningBanner key={w} message={w} />
      ))}
    </div>
  );
}

export function HomePageContent() {
  const isLoading = useHomeDashboardStore((s) => s.isLoading);
  const hasError = useHomeDashboardStore((s) => s.hasError);
  const resetError = useHomeDashboardStore((s) => s.resetError);

  if (hasError) {
    return (
      <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
        <PageHeader
          title="Home"
          description="Overview of your PropNex workspace."
        />
        <BillingBanner
          type="error"
          message="Unable to load dashboard data. Please try again."
        />
        <Button variant="outline" onClick={resetError} className="w-fit">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Home"
          description="Your command center for AI agents, campaigns, leads, and business performance."
        />
        <DateRangeSelector />
      </div>

      {isLoading ? (
        <HomePageSkeleton />
      ) : (
        <>
          <OverviewSection />
          <ResourceWarningsStrip />
          <PerformanceAnalyticsSection />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex min-w-0 flex-col gap-6">
              <LeadStatusSection />
              <CampaignOverviewSection />
              <DemoRequestsSection />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <PricingOverviewSection />
                <CreditsResourcesSection />
              </div>
              <RecentActivitySection />
            </div>

            <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
              <NotificationsSection />
              <QuickActionsSection />
              <AIInsightsSection />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
