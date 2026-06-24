"use client";

import { PageHeader } from "@/components/common/page-header";
import { DateRangeSelector } from "@/components/home/date-range-selector";
import { DemoRequestsSection } from "@/components/home/demo-requests-section";
import { LeadStatusSection } from "@/components/home/lead-status-section";
import { OverviewSection } from "@/components/home/overview-section";
import { QuickActionsSection } from "@/components/home/quick-actions-section";
import { RecentActivitySection } from "@/components/home/recent-activity-section";
import { Button } from "@/components/ui/button";
import { useHomeDashboardGraphQL } from "@/hooks/use-home-dashboard-graphql";
import { usePageStatusNotification } from "@/hooks/use-page-status-notification";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function HomePageContent() {
  const { reload } = useHomeDashboardGraphQL();
  const isLoading = useHomeDashboardStore((s) => s.isLoading);
  const hasError = useHomeDashboardStore((s) => s.hasError);
  const resetError = useHomeDashboardStore((s) => s.resetError);

  usePageStatusNotification({
    isInitialLoading: isLoading,
    loadingMessage: "Loading dashboard…",
    loadingId: "home-loading",
    error: hasError
      ? "Unable to load dashboard data. Please try again."
      : undefined,
  });

  const handleRetry = () => {
    resetError();
    void reload({ showLoading: true });
  };

  return (
    <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Home"
          description="Your command center for leads, calls, and conversions."
        />
        <DateRangeSelector />
      </div>

      {hasError ? (
        <Button variant="outline" onClick={handleRetry} className="w-fit">
          Retry
        </Button>
      ) : null}

      <div className="flex flex-col gap-6">
        <OverviewSection />
        <QuickActionsSection />
        <LeadStatusSection />
        <RecentActivitySection />
        <DemoRequestsSection />
      </div>
    </div>
  );
}
