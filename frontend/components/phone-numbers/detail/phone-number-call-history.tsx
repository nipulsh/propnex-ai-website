"use client";

import { useMemo } from "react";

import { DetailSection } from "@/components/call-details/detail-section";
import { PhoneNumberCallHistoryFilters } from "@/components/phone-numbers/detail/phone-number-call-history-filters";
import { PhoneNumberCallHistoryTable } from "@/components/phone-numbers/detail/phone-number-call-history-table";
import { PhoneNumberEmptyState } from "@/components/phone-numbers/detail/phone-number-empty-state";
import { PhoneNumbersPagination } from "@/components/phone-numbers/phone-numbers-pagination";
import { getDateRangeStart } from "@/lib/call-logs-data";
import {
  PHONE_NUMBER_HISTORY_PAGE_SIZE,
  usePhoneNumberDetailStore,
} from "@/stores/phone-number-detail-store";

type PhoneNumberCallHistoryProps = {
  phoneNumberId: string;
  hasAnyCalls: boolean;
  onAssignAgent: () => void;
  onTestNumber: () => void;
};

export function PhoneNumberCallHistory({
  hasAnyCalls,
  onAssignAgent,
  onTestNumber,
}: PhoneNumberCallHistoryProps) {
  const calls = usePhoneNumberDetailStore((s) => s.calls);
  const historyDirection = usePhoneNumberDetailStore(
    (s) => s.historyDirection,
  );
  const historyStatus = usePhoneNumberDetailStore((s) => s.historyStatus);
  const historyDateRange = usePhoneNumberDetailStore((s) => s.historyDateRange);
  const historyCustomFrom = usePhoneNumberDetailStore(
    (s) => s.historyCustomFrom,
  );
  const historyCustomTo = usePhoneNumberDetailStore((s) => s.historyCustomTo);
  const historyAgentId = usePhoneNumberDetailStore((s) => s.historyAgentId);
  const historyPage = usePhoneNumberDetailStore((s) => s.historyPage);
  const setHistoryPage = usePhoneNumberDetailStore((s) => s.setHistoryPage);

  const { pageCalls, totalPages, totalCount } = useMemo(() => {
    let filtered = [...calls];

    if (historyDirection !== "all") {
      filtered = filtered.filter((c) => c.direction === historyDirection);
    }
    if (historyStatus !== "all") {
      filtered = filtered.filter((c) => c.status === historyStatus);
    }
    if (historyAgentId !== "all") {
      filtered = filtered.filter((c) => c.agentId === historyAgentId);
    }

    const rangeStart = getDateRangeStart(historyDateRange);
    if (rangeStart) {
      filtered = filtered.filter((c) => c.timestamp >= rangeStart);
    }

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PHONE_NUMBER_HISTORY_PAGE_SIZE));
    const safePage = Math.min(historyPage, pages);
    const start = (safePage - 1) * PHONE_NUMBER_HISTORY_PAGE_SIZE;

    return {
      pageCalls: filtered.slice(start, start + PHONE_NUMBER_HISTORY_PAGE_SIZE),
      totalPages: pages,
      totalCount: total,
    };
  }, [
    calls,
    historyDirection,
    historyStatus,
    historyDateRange,
    historyCustomFrom,
    historyCustomTo,
    historyAgentId,
    historyPage,
  ]);

  if (!hasAnyCalls) {
    return (
      <DetailSection
        id="call-history"
        title="Call History"
        description="All calls associated with this number."
      >
        <PhoneNumberEmptyState
          onAssignAgent={onAssignAgent}
          onTestNumber={onTestNumber}
        />
      </DetailSection>
    );
  }

  return (
    <DetailSection
      id="call-history"
      title="Call History"
      description="All calls associated with this number. Click a row to view full call analysis."
    >
      <div className="space-y-4">
        <PhoneNumberCallHistoryFilters />
        <div className="rounded-xl border border-propnex-border bg-propnex-panel">
          <PhoneNumberCallHistoryTable calls={pageCalls} />
          <PhoneNumbersPagination
            currentPage={Math.min(historyPage, totalPages)}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setHistoryPage}
          />
        </div>
      </div>
    </DetailSection>
  );
}
