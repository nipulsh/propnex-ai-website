"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/common/page-header";
import { LeadReactivationFilters } from "@/components/lead-reactivation/lead-reactivation-filters";
import { LeadReactivationPagination } from "@/components/lead-reactivation/lead-reactivation-pagination";
import { LeadReactivationStats } from "@/components/lead-reactivation/lead-reactivation-stats";
import { LeadReactivationTable } from "@/components/lead-reactivation/lead-reactivation-table";
import { StartCampaignButton } from "@/components/lead-reactivation/start-campaign-button";
import {
  dormantLeads,
  filterDormantLeads,
} from "@/lib/lead-reactivation-data";
import {
  LEAD_REACTIVATION_PAGE_SIZE,
  useLeadReactivationStore,
} from "@/stores/lead-reactivation-store";

export function LeadReactivationPageContent() {
  const status = useLeadReactivationStore((state) => state.status);
  const agentId = useLeadReactivationStore((state) => state.agentId);
  const inactivity = useLeadReactivationStore((state) => state.inactivity);
  const currentPage = useLeadReactivationStore((state) => state.currentPage);
  const setPage = useLeadReactivationStore((state) => state.setPage);

  const { leads, totalPages, totalCount } = useMemo(() => {
    const filtered = filterDormantLeads(
      dormantLeads,
      status,
      agentId,
      inactivity,
    );
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / LEAD_REACTIVATION_PAGE_SIZE));
    const start = (currentPage - 1) * LEAD_REACTIVATION_PAGE_SIZE;

    return {
      leads: filtered.slice(start, start + LEAD_REACTIVATION_PAGE_SIZE),
      totalPages: pages,
      totalCount: total,
    };
  }, [currentPage, status, agentId, inactivity]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Lead Reactivation"
          description="Re-engage dormant leads with automated AI voice outreach campaigns."
        />
        <StartCampaignButton />
      </div>

      <LeadReactivationStats />

      <LeadReactivationFilters />

      <div className="rounded-xl border border-propnex-border bg-propnex-panel">
        <LeadReactivationTable leads={leads} />
        <LeadReactivationPagination
          currentPage={Math.min(currentPage, totalPages)}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
