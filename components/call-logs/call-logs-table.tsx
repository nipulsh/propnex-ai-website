"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";

import { CallLogsRecordingButton } from "@/components/call-logs/call-logs-recording-button";
import {
  formatCallDate,
  formatCallStatus,
  formatCallTime,
  formatDirection,
  formatDuration,
  formatSentimentOutcome,
  truncateCallId,
  type CallDirection,
  type CallLog,
  type CallStatus,
  type SentimentOutcome,
} from "@/lib/call-logs-data";
import { cn } from "@/lib/utils";

type CallLogsTableProps = {
  logs: CallLog[];
};

const TABLE_COLUMNS = 12;

function DirectionBadge({ direction }: { direction: CallDirection }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        direction === "inbound" && "bg-propnex-accent/10 text-propnex-accent",
        direction === "outbound" && "bg-cyan-400/10 text-cyan-400",
        direction === "demo" && "bg-violet-400/10 text-violet-300",
      )}
    >
      {formatDirection(direction)}
    </span>
  );
}

function StatusBadge({ status }: { status: CallStatus }) {
  const styles: Record<CallStatus, string> = {
    completed: "bg-success/10 text-success",
    missed: "bg-destructive/10 text-destructive",
    voicemail: "bg-propnex-accent/10 text-propnex-accent",
    failed: "bg-orange-400/10 text-orange-400",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {formatCallStatus(status)}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: SentimentOutcome | null }) {
  if (!outcome) {
    return <span className="text-propnex-muted">—</span>;
  }

  const styles: Record<SentimentOutcome, string> = {
    positive: "bg-success/10 text-success",
    neutral: "bg-propnex-accent/10 text-propnex-accent",
    negative: "bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        styles[outcome],
      )}
    >
      {formatSentimentOutcome(outcome)}
    </span>
  );
}

export function CallLogsTable({ logs }: CallLogsTableProps) {
  return (
    <div className="propnex-scrollbar overflow-x-auto">
      <table className="w-full min-w-[1480px] text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="px-4 py-3 font-medium whitespace-nowrap">Call ID</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Call Time
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Duration
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Assigned Number
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Customer Number
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Credits</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Direction
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Recording
            </th>
            <th className="min-w-[220px] px-4 py-3 font-medium whitespace-nowrap">
              Summary
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Outcome</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Transcription
            </th>
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
                  <Link
                    href={`/call-logs/${log.id}`}
                    className="font-mono text-xs text-propnex-accent hover:underline"
                    title={log.id}
                  >
                    {truncateCallId(log.id)}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">
                  <span className="block">{formatCallDate(log.timestamp)}</span>
                  <span className="text-xs text-propnex-muted">
                    {formatCallTime(log.timestamp)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums text-foreground">
                  {formatDuration(log.durationSeconds)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="font-medium text-foreground">{log.phoneNumber}</p>
                  {log.lineLabel ? (
                    <p className="mt-0.5 text-xs text-propnex-muted">
                      {log.lineLabel}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">
                  {log.leadPhone}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={log.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums text-foreground">
                  {log.creditsUsed > 0 ? log.creditsUsed : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <DirectionBadge direction={log.direction} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <CallLogsRecordingButton
                    recordingUrl={log.recordingUrl}
                    hasRecording={log.hasRecording}
                  />
                </td>
                <td className="max-w-[280px] px-4 py-3 text-propnex-muted">
                  <p className="line-clamp-2 text-xs leading-relaxed">
                    {log.summarySnippet}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <OutcomeBadge outcome={log.sentimentOutcome} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {log.hasTranscript ? (
                    <Link
                      href={`/call-logs/${log.id}#call-transcript`}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-propnex-border bg-propnex-panel px-2.5 text-xs font-medium text-propnex-accent transition-colors hover:bg-propnex-accent/10"
                    >
                      <MessageSquareText className="size-3.5" />
                      View
                    </Link>
                  ) : (
                    <span className="text-xs text-propnex-muted">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
