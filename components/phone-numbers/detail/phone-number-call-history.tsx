"use client";

import { useMemo } from "react";

import { DetailSection } from "@/components/call-details/detail-section";
import { PhoneNumberCallHistoryFilters } from "@/components/phone-numbers/detail/phone-number-call-history-filters";
import { PhoneNumberCallHistoryTable } from "@/components/phone-numbers/detail/phone-number-call-history-table";
import { PhoneNumberEmptyState } from "@/components/phone-numbers/detail/phone-number-empty-state";
import { PhoneNumbersPagination } from "@/components/phone-numbers/phone-numbers-pagination";
import { getCallsForPhoneNumberFiltered } from "@/lib/phone-number-detail-data";
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
  phoneNumberId,
  hasAnyCalls,
  onAssignAgent,
  onTestNumber,
}: PhoneNumberCallHistoryProps) {
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
    const filtered = getCallsForPhoneNumberFiltered(phoneNumberId, {
      direction: historyDirection,
      status: historyStatus,
      dateRange: historyDateRange,
      customFrom: historyCustomFrom,
      customTo: historyCustomTo,
      agentId: historyAgentId,
    });
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
    phoneNumberId,
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
