import { Phone } from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import {
  formatCallDate,
  formatCallTime,
  formatDuration,
} from "@/lib/call-logs-data";
import type { CallDetail } from "@/lib/call-detail-data";
import { formatOutcome } from "@/lib/call-detail-data";

type LeadHistorySectionProps = {
  history: CallDetail["leadHistory"];
};

export function LeadHistorySection({ history }: LeadHistorySectionProps) {
  return (
    <DetailSection
      title="Lead History"
      description="Previous interactions with this lead."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-propnex-muted">
            First interaction with this lead.
          </p>
        ) : (
          <ol className="relative space-y-0 border-l border-propnex-border pl-6">
            {history.map((entry, index) => (
              <li key={entry.id} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[1.55rem] flex size-7 items-center justify-center rounded-full border border-propnex-border bg-propnex-bg">
                  <Phone className="size-3.5 text-propnex-accent" />
                </span>
                <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatOutcome(entry.outcome)}
                      </p>
                      <p className="mt-0.5 text-xs text-propnex-muted">
                        {formatCallDate(entry.date)} at{" "}
                        {formatCallTime(entry.date)}
                      </p>
                    </div>
                    <span className="text-xs text-propnex-muted">
                      {formatDuration(entry.durationSeconds)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-propnex-muted">
                    Assigned agent: {entry.agentName}
                  </p>
                </div>
                {index < history.length - 1 ? null : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </DetailSection>
  );
}
