"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { callLogsToCsv, type CallLog } from "@/lib/call-logs-data";

type ExportCsvButtonProps = {
  logs: CallLog[];
};

export function ExportCsvButton({ logs }: ExportCsvButtonProps) {
  const handleExport = () => {
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
      disabled={logs.length === 0}
      className="h-11 gap-2 border-propnex-border bg-propnex-panel text-foreground sm:min-w-[160px]"
    >
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
