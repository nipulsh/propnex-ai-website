"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { callLogs, callLogsToCsv, filterCallLogs } from "@/lib/call-logs-data";
import { useCallLogsStore } from "@/stores/call-logs-store";

export function ExportCsvButton() {
  const dateRange = useCallLogsStore((state) => state.dateRange);
  const agentId = useCallLogsStore((state) => state.agentId);
  const status = useCallLogsStore((state) => state.status);

  const handleExport = () => {
    const logs = filterCallLogs(callLogs, dateRange, agentId, status);
    const csv = callLogsToCsv(logs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `call-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="h-11 w-full gap-2 border-propnex-border bg-propnex-panel text-foreground sm:w-auto sm:min-w-[160px]"
    >
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
