"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/common/page-header";
import { BillingBanner } from "@/components/billing/billing-banner";
import { LeadReactivationFilters } from "@/components/lead-reactivation/lead-reactivation-filters";
import { LeadReactivationStats } from "@/components/lead-reactivation/lead-reactivation-stats";
import { LeadReactivationTable } from "@/components/lead-reactivation/lead-reactivation-table";
import { useLeadReactivationGraphQL } from "@/hooks/use-lead-reactivation-graphql";
import {
  LEAD_REACTIVATION_PAGE_SIZE,
  useLeadReactivationStore,
} from "@/stores/lead-reactivation-store";

const LEAD_REACTIVATION_COMING_SOON = true;

export function LeadReactivationPageContent() {
  if (LEAD_REACTIVATION_COMING_SOON) {
    return (
      <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
        <PageHeader
          title="Lead Reactivation"
          description="Re-engage dormant leads with automated AI voice outreach."
        />
        <div className="flex flex-1 items-center justify-center rounded-xl border border-propnex-border bg-propnex-panel py-24">
          <p className="text-lg text-propnex-muted">Coming soon</p>
        </div>
      </div>
    );
  }

  return <LeadReactivationPageContentInner />;
}

function LeadReactivationPageContentInner() {
  useLeadReactivationGraphQL();

  const leads = useLeadReactivationStore((s) => s.leads);
  const isLoading = useLeadReactivationStore((s) => s.isLoading);
  const error = useLeadReactivationStore((s) => s.error);
  const currentPage = useLeadReactivationStore((s) => s.currentPage);

  const pageLeads = useMemo(() => {
    const start = (currentPage - 1) * LEAD_REACTIVATION_PAGE_SIZE;
    return leads.slice(start, start + LEAD_REACTIVATION_PAGE_SIZE);
  }, [leads, currentPage]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title="Lead Reactivation"
        description="Re-engage dormant leads with automated AI voice outreach."
      />

      {error ? <BillingBanner type="error" message={error} /> : null}
      {isLoading ? (
        <BillingBanner type="info" message="Loading dormant leads..." />
      ) : null}

      <LeadReactivationStats leads={leads} />
      <LeadReactivationFilters />

      <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
        <LeadReactivationTable leads={pageLeads} />
      </div>
    </div>
  );
}
