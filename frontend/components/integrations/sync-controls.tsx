"use client";

import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GoogleSheetsConfig, SyncHistoryEntry } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

type SyncControlsProps = {
  config: GoogleSheetsConfig;
  history: SyncHistoryEntry[];
  isSyncing: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  onSyncNow: () => void;
};

export function SyncControls({
  config,
  history,
  isSyncing,
  onToggleAutoSync,
  onSyncNow,
}: SyncControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-propnex-border bg-propnex-bg px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Auto Sync</p>
          <p className="text-xs text-propnex-muted">
            Automatically sync spreadsheet data every hour
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={config.autoSync}
            onChange={(e) => onToggleAutoSync(e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-propnex-border peer-checked:bg-propnex-accent after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onSyncNow}
          disabled={isSyncing}
          className="gap-2"
        >
          {isSyncing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sync Now
        </Button>
        {config.lastSyncResult ? (
          <span
            className={cn(
              "text-xs font-medium",
              config.lastSyncResult === "success"
                ? "text-success"
                : config.lastSyncResult === "error"
                  ? "text-destructive"
                  : "text-orange-400",
            )}
          >
            Last sync: {config.lastSyncMessage ?? config.lastSyncResult}
          </span>
        ) : null}
      </div>

      {history.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-propnex-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-propnex-border bg-propnex-bg">
              <tr>
                <th className="px-4 py-2 text-xs font-medium text-propnex-muted">
                  Date
                </th>
                <th className="px-4 py-2 text-xs font-medium text-propnex-muted">
                  Result
                </th>
                <th className="px-4 py-2 text-xs font-medium text-propnex-muted">
                  Rows
                </th>
                <th className="hidden px-4 py-2 text-xs font-medium text-propnex-muted sm:table-cell">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-propnex-border">
              {history.slice(0, 5).map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-2 text-xs text-foreground">
                    {new Date(entry.completedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={cn(
                        "text-xs font-medium capitalize",
                        entry.result === "success"
                          ? "text-success"
                          : entry.result === "error"
                            ? "text-destructive"
                            : "text-orange-400",
                      )}
                    >
                      {entry.result}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-foreground">
                    {entry.rowsSynced}
                  </td>
                  <td className="hidden px-4 py-2 text-xs text-propnex-muted sm:table-cell">
                    {entry.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
