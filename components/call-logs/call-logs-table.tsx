"use client";

import { ArrowDownLeft, ArrowUpRight, Mic } from "lucide-react";

import { LeadTemperatureBadge } from "@/components/call-details/lead-temperature-badge";
import {
  formatCallDate,
  formatCallTime,
  formatDuration,
  type CallLog,
} from "@/lib/call-logs-data";
import { formatCallCost, formatOutcome } from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type CallLogsTableProps = {
  logs: CallLog[];
};

function DirectionIcon({ direction }: { direction: CallLog["direction"] }) {
  if (direction === "outbound") {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-propnex-accent/15">
        <ArrowUpRight className="size-3.5 text-propnex-accent" />
      </span>
    );
  }

  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-success/15">
      <ArrowDownLeft className="size-3.5 text-success" />
    </span>
  );
}

function DirectionBadge({ direction }: { direction: CallLog["direction"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        direction === "inbound"
          ? "text-success bg-success/10"
          : "text-propnex-accent bg-propnex-accent/10",
      )}
    >
      {direction}
    </span>
  );
}

function StatusBadge({ status }: { status: CallLog["status"] }) {
  const styles: Record<CallLog["status"], string> = {
    completed: "text-success bg-success/10",
    missed: "text-destructive bg-destructive/10",
    voicemail: "text-propnex-accent bg-propnex-accent/10",
    failed: "text-orange-400 bg-orange-400/10",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

function truncateText(text: string, maxLength = 72): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

const TABLE_COLUMNS = 12;

export function CallLogsTable({ logs }: CallLogsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Date &amp; Time
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Direction
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Lead Name
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              From / To
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Agent</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Duration
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Lead Type
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Lead Score
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Outcome
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Cost</th>
            <th className="px-4 py-3 font-medium min-w-[200px]">
              AI Summary
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td
                colSpan={TABLE_COLUMNS}
                className="px-4 py-12 text-center text-propnex-muted"
              >
                No call logs match your filters.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-propnex-border/70 last:border-b-0"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="block font-medium text-foreground">
                    {formatCallDate(log.timestamp)}
                  </span>
                  <span className="mt-0.5 block text-xs text-propnex-muted">
                    {formatCallTime(log.timestamp)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <DirectionIcon direction={log.direction} />
                    <DirectionBadge direction={log.direction} />
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-medium text-foreground">
                    {log.leadName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">
                    {log.phoneNumber}
                  </p>
                  {log.lineLabel ? (
                    <p className="mt-0.5 truncate text-xs text-propnex-muted">
                      {log.lineLabel}
                    </p>
                  ) : null}
                  {log.hasRecording ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-propnex-accent">
                      <Mic className="size-3" />
                      Recording
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">
                  {log.agentName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums text-foreground">
                  {formatDuration(log.durationSeconds)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <LeadTemperatureBadge temperature={log.leadTemperature} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums text-foreground">
                  {log.leadScore}/100
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">
                  {log.outcome ? formatOutcome(log.outcome) : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="tabular-nums text-foreground">
                    {formatCallCost(log.callCost)}
                  </span>
                  {log.provider !== "—" ? (
                    <p className="mt-0.5 text-xs text-propnex-muted">
                      {log.provider}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 max-w-[240px] text-propnex-muted">
                  <p className="line-clamp-2 text-xs leading-relaxed">
                    {truncateText(log.summarySnippet)}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={log.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
