"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { LeadTemperatureBadge } from "@/components/call-details/lead-temperature-badge";
import {
  formatCallDate,
  formatCallTime,
  type CallLog,
} from "@/lib/call-logs-data";
import { getLeadTemperatureForCall } from "@/lib/call-detail-data";
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

export function CallLogsTable({ logs }: CallLogsTableProps) {
  return (
    <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
              <th className="px-5 py-3 font-medium">Date &amp; Time</th>
              <th className="px-5 py-3 font-medium">From / To</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">
                Agent
              </th>
              <th className="hidden px-5 py-3 font-medium lg:table-cell">
                Lead Type
              </th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-propnex-muted"
                >
                  No call logs match your filters.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="group border-b border-propnex-border/70 transition-colors last:border-b-0 hover:bg-propnex-accent/5"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/call-logs/${log.id}`}
                      className="block font-medium text-foreground"
                    >
                      {formatCallDate(log.timestamp)}
                    </Link>
                    <Link
                      href={`/call-logs/${log.id}`}
                      className="mt-0.5 block text-xs text-propnex-muted"
                    >
                      {formatCallTime(log.timestamp)}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/call-logs/${log.id}`}
                      className="flex items-start gap-3"
                    >
                      <DirectionIcon direction={log.direction} />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {log.phoneNumber}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-propnex-muted">
                          {log.lineLabel}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <Link
                      href={`/call-logs/${log.id}`}
                      className="block text-foreground"
                    >
                      {log.agentName}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-4 lg:table-cell">
                    <Link href={`/call-logs/${log.id}`}>
                      <LeadTemperatureBadge
                        temperature={getLeadTemperatureForCall(log.id)}
                      />
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/call-logs/${log.id}`}>
                      <StatusBadge status={log.status} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
    </div>
  );
}
