"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bot } from "lucide-react";

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
  const currentPage = useCallLogsStore((state) => state.currentPage);
  const dateRange = useCallLogsStore((state) => state.dateRange);
  const agentId = useCallLogsStore((state) => state.agentId);
  const status = useCallLogsStore((state) => state.status);
  const setPage = useCallLogsStore((state) => state.setPage);

  const { logs, totalPages, totalCount } = useMemo(() => {
    const filtered = filterCallLogs(callLogs, dateRange, agentId, status);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / CALL_LOGS_PAGE_SIZE));
    const start = (currentPage - 1) * CALL_LOGS_PAGE_SIZE;

    return {
      logs: filtered.slice(start, start + CALL_LOGS_PAGE_SIZE),
      totalPages: pages,
      totalCount: total,
    };
  }, [currentPage, dateRange, agentId, status]);

  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-24">
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

      <Link
        href="/agents"
        className="fixed right-6 bottom-6 z-20 flex size-14 items-center justify-center rounded-full bg-propnex-accent text-propnex-bg shadow-[0_0_24px_color-mix(in_srgb,var(--propnex-accent)_45%,transparent)] transition-transform hover:scale-105 md:bottom-8"
        aria-label="Open agents"
      >
        <Bot className="size-6" />
      </Link>
    </div>
  );
}
