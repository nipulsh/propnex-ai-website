"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { CallLogsFilters } from "@/components/call-logs/call-logs-filters";
import {
  UploadCsvButtons,
  UploadLeadsFeedback,
  useUploadLeads,
} from "@/components/call-logs/upload-leads-section";
import { CallLogsPagination } from "@/components/call-logs/call-logs-pagination";
import { CallLogsTable } from "@/components/call-logs/call-logs-table";
import { ExportCsvButton } from "@/components/call-logs/export-csv-button";
import { PageHeader } from "@/components/common/page-header";
import { BillingBanner } from "@/components/billing/billing-banner";
import { useCallLogsGraphQL } from "@/hooks/use-call-logs-graphql";
import {
  getDateRangeStart,
  type CallLog,
} from "@/lib/call-logs-data";
import {
  CALL_LOGS_PAGE_SIZE,
  useCallLogsStore,
} from "@/stores/call-logs-store";

function mapGraphQLToCallLog(
  log: ReturnType<typeof useCallLogsGraphQL>["logs"][number],
): CallLog {
  return {
    id: log.id,
    timestamp: new Date(log.startedAt).getTime(),
    direction: log.direction as CallLog["direction"],
    phoneNumberId: log.phoneNumberId,
    phoneNumber: log.phoneNumber,
    lineLabel: log.lineLabel,
    leadName: log.leadName,
    agentId: log.agentId,
    agentName: log.agentName,
    status: log.status as CallLog["status"],
    durationSeconds: log.durationSeconds,
    outcome: log.outcome,
    leadTemperature: log.leadTemperature,
    leadScore: log.leadScore,
    callCost: log.callCost,
    provider: log.provider,
    summarySnippet: log.summarySnippet,
    hasRecording: log.hasRecording,
  };
}

export function CallLogsPageContent() {
  const upload = useUploadLeads();
  const searchParams = useSearchParams();
  const currentPage = useCallLogsStore((state) => state.currentPage);
  const dateRange = useCallLogsStore((state) => state.dateRange);
  const agentId = useCallLogsStore((state) => state.agentId);
  const status = useCallLogsStore((state) => state.status);
  const leadType = useCallLogsStore((state) => state.leadType);
  const setPage = useCallLogsStore((state) => state.setPage);
  const setLeadType = useCallLogsStore((state) => state.setLeadType);
  const setStatus = useCallLogsStore((state) => state.setStatus);

  const gqlFilter = useMemo(
    () => ({
      status: status !== "all" ? status.toUpperCase() : undefined,
      aiAgentId: agentId !== "all" ? agentId : undefined,
      dateFrom: new Date(getDateRangeStart(dateRange)).toISOString(),
    }),
    [status, agentId, dateRange],
  );

  const { logs: gqlLogs, isLoading, error } = useCallLogsGraphQL(gqlFilter);

  useEffect(() => {
    const leadTypeParam = searchParams.get("leadType");
    if (
      leadTypeParam === "hot" ||
      leadTypeParam === "warm" ||
      leadTypeParam === "cold"
    ) {
      setLeadType(leadTypeParam);
    }

    const statusParam = searchParams.get("status");
    if (
      statusParam === "completed" ||
      statusParam === "missed" ||
      statusParam === "voicemail" ||
      statusParam === "failed"
    ) {
      setStatus(statusParam);
    }
  }, [searchParams, setLeadType, setStatus]);

  const { logs, filteredLogs, totalPages, totalCount } = useMemo(() => {
    const mapped = gqlLogs.map(mapGraphQLToCallLog);
    const filtered =
      leadType === "all"
        ? mapped
        : mapped.filter((log) => log.leadTemperature === leadType);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / CALL_LOGS_PAGE_SIZE));
    const page = Math.min(currentPage, pages);
    const start = (page - 1) * CALL_LOGS_PAGE_SIZE;

    return {
      logs: filtered.slice(start, start + CALL_LOGS_PAGE_SIZE),
      filteredLogs: filtered,
      totalPages: pages,
      totalCount: total,
    };
  }, [gqlLogs, leadType, currentPage]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Call Logs"
          description="Monitor real-time interactions and historical performance across all your AI voice agents."
        />
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <UploadCsvButtons upload={upload} />
          <ExportCsvButton logs={filteredLogs} />
        </div>
      </div>

      <UploadLeadsFeedback upload={upload} />

      {isLoading ? (
        <BillingBanner type="info" message="Loading call logs..." />
      ) : null}

      {error ? (
        <BillingBanner
          type="error"
          message="Unable to load call logs. Please try again."
        />
      ) : null}

      <CallLogsFilters />

      <div className="rounded-xl border border-propnex-border bg-propnex-panel">
        <CallLogsTable logs={logs} />
        <CallLogsPagination
          currentPage={Math.min(currentPage, totalPages)}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
