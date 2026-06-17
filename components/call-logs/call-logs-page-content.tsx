"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { CallLogsFilters } from "@/components/call-logs/call-logs-filters";
import { CallLogsPagination } from "@/components/call-logs/call-logs-pagination";
import { CallLogsTable } from "@/components/call-logs/call-logs-table";
import { ExportCsvButton } from "@/components/call-logs/export-csv-button";
import { PageHeader } from "@/components/common/page-header";
import {
  callLogs,
  filterCallLogs,
} from "@/lib/call-logs-data";
import {
  CALL_LOGS_PAGE_SIZE,
  useCallLogsStore,
} from "@/stores/call-logs-store";

export function CallLogsPageContent() {
  const searchParams = useSearchParams();
  const currentPage = useCallLogsStore((state) => state.currentPage);
  const dateRange = useCallLogsStore((state) => state.dateRange);
  const agentId = useCallLogsStore((state) => state.agentId);
  const status = useCallLogsStore((state) => state.status);
  const leadType = useCallLogsStore((state) => state.leadType);
  const setPage = useCallLogsStore((state) => state.setPage);
  const setLeadType = useCallLogsStore((state) => state.setLeadType);
  const setStatus = useCallLogsStore((state) => state.setStatus);

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

  const { logs, totalPages, totalCount } = useMemo(() => {
    const filtered = filterCallLogs(
      callLogs,
      dateRange,
      agentId,
      status,
      leadType,
    );
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / CALL_LOGS_PAGE_SIZE));
    const start = (currentPage - 1) * CALL_LOGS_PAGE_SIZE;

    return {
      logs: filtered.slice(start, start + CALL_LOGS_PAGE_SIZE),
      totalPages: pages,
      totalCount: total,
    };
  }, [currentPage, dateRange, agentId, status, leadType]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Call Logs"
          description="Monitor real-time interactions and historical performance across all your AI voice agents."
        />
        <ExportCsvButton />
      </div>

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
