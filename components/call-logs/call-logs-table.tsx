"use client";

import Link from "next/link";

import { LeadTemperatureBadge } from "@/components/call-details/lead-temperature-badge";
import { formatDuration, type CallLog } from "@/lib/call-logs-data";

type CallLogsTableProps = {
  logs: CallLog[];
};

const TABLE_COLUMNS = 5;

export function CallLogsTable({ logs }: CallLogsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Calling Number
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Duration
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Lead Type
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              Lead Mobile
            </th>
            <th className="px-4 py-3 font-medium whitespace-nowrap" />
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
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">
                    {log.phoneNumber}
                  </p>
                  {log.lineLabel ? (
                    <p className="mt-0.5 truncate text-xs text-propnex-muted">
                      {log.lineLabel}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums text-foreground">
                  {formatDuration(log.durationSeconds)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <LeadTemperatureBadge temperature={log.leadTemperature} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">
                  {log.leadPhone}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Link
                    href={`/call-logs/${log.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-propnex-border bg-propnex-panel px-4 text-xs font-medium text-propnex-accent transition-colors hover:bg-propnex-accent/10"
                  >
                    Details
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
