"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import { LeadTemperatureBadge } from "@/components/call-details/lead-temperature-badge";
import {
  formatCallDate,
  formatCallTime,
  type CallLog,
} from "@/lib/call-logs-data";
import {
  getCallDetail,
  getLeadTemperatureForCall,
} from "@/lib/call-detail-data";
import { cn } from "@/lib/utils";

type AgentCallActivitySectionProps = {
  calls: CallLog[];
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AgentCallActivitySection({
  calls,
}: AgentCallActivitySectionProps) {
  return (
    <DetailSection
      id="calls"
      title="Call Activity"
      description="All calls associated with this agent."
    >
      <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
        {calls.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-propnex-muted">
            No calls recorded for this agent yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-propnex-border text-[0.65rem] tracking-[0.12em] text-propnex-muted uppercase">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-5 py-3 font-medium">Direction</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Outcome</th>
                  <th className="px-5 py-3 font-medium">Lead Score</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {calls.slice(0, 20).map((call) => {
                  const detail = getCallDetail(call.id);
                  const temperature = getLeadTemperatureForCall(call.id);
                  return (
                    <tr
                      key={call.id}
                      className="border-b border-propnex-border/60 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <p className="text-foreground">
                          {formatCallDate(call.timestamp)}
                        </p>
                        <p className="text-xs text-propnex-muted">
                          {formatCallTime(call.timestamp)}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {call.leadName}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 capitalize">
                          {call.direction === "inbound" ? (
                            <ArrowDownLeft className="size-3.5 text-success" />
                          ) : (
                            <ArrowUpRight className="size-3.5 text-propnex-accent" />
                          )}
                          {call.direction}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {formatDuration(call.durationSeconds)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                            call.status === "completed"
                              ? "bg-success/15 text-success"
                              : "bg-propnex-bg text-propnex-muted",
                          )}
                        >
                          {detail?.outcome?.replace("-", " ") ?? call.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {detail?.leadScore ?? "—"}
                          </span>
                          <LeadTemperatureBadge temperature={temperature} />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/call-logs/${call.id}`}
                          className="text-xs font-medium text-propnex-accent hover:underline"
                        >
                          View Analysis
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DetailSection>
  );
}
