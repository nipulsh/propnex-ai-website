"use client";

import Link from "next/link";

import {
  formatCallDate,
  formatCallTime,
  formatDuration,
  type CallLog,
} from "@/lib/call-logs-data";
import { getCallOutcome } from "@/lib/phone-number-detail-data";
import { cn } from "@/lib/utils";

type PhoneNumberCallHistoryTableProps = {
  calls: CallLog[];
};

function DirectionBadge({ direction }: { direction: CallLog["direction"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        direction === "inbound"
          ? "text-propnex-accent bg-propnex-accent/10"
          : "text-cyan-400 bg-cyan-400/10",
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

export function PhoneNumberCallHistoryTable({
  calls,
}: PhoneNumberCallHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Direction</th>
            <th className="px-5 py-3 font-medium">Lead Name</th>
            <th className="px-5 py-3 font-medium">Agent Used</th>
            <th className="px-5 py-3 font-medium">Duration</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {calls.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-8 text-center text-propnex-muted"
              >
                No calls match your filters.
              </td>
            </tr>
          ) : (
            calls.map((call) => (
              <tr
                key={call.id}
                className="cursor-pointer border-b border-propnex-border/70 last:border-b-0 hover:bg-propnex-accent/5"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/call-logs/${call.id}`}
                    className="block text-foreground hover:text-propnex-accent"
                  >
                    <span className="block">{formatCallDate(call.timestamp)}</span>
                    <span className="text-xs text-propnex-muted">
                      {formatCallTime(call.timestamp)}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <DirectionBadge direction={call.direction} />
                </td>
                <td className="px-5 py-4 text-foreground">{call.leadName}</td>
                <td className="px-5 py-4 text-propnex-muted">{call.agentName}</td>
                <td className="px-5 py-4 tabular-nums text-foreground">
                  {formatDuration(call.durationSeconds)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={call.status} />
                </td>
                <td className="px-5 py-4 text-propnex-muted">
                  {getCallOutcome(call.id)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
