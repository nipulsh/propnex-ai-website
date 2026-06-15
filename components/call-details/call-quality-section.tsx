import { AlertTriangle } from "lucide-react";

import { DetailSection } from "@/components/call-details/detail-section";
import { QualityBadge } from "@/components/call-details/quality-badge";
import { formatDuration } from "@/lib/call-logs-data";
import type { CallDetail } from "@/lib/call-detail-data";

type CallQualitySectionProps = {
  callQuality: CallDetail["callQuality"];
};

export function CallQualitySection({ callQuality }: CallQualitySectionProps) {
  return (
    <DetailSection
      title="Call Quality Analysis"
      description="Connection, network, and audio quality metrics."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Connection Quality
            </p>
            <div className="mt-2">
              <QualityBadge rating={callQuality.connection} />
            </div>
          </div>
          <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Call Lag Score
            </p>
            <p className="mt-2 text-xl font-bold text-foreground">
              {callQuality.lagScore}
              <span className="text-sm font-normal text-propnex-muted"> ms</span>
            </p>
          </div>
          <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Network Stability
            </p>
            <div className="mt-2">
              <QualityBadge rating={callQuality.networkStability} />
            </div>
          </div>
          <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
            <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              Audio Quality
            </p>
            <div className="mt-2">
              <QualityBadge rating={callQuality.audioQuality} />
            </div>
          </div>
        </div>

        {callQuality.lagEvents.length > 0 ? (
          <div className="mt-6 border-t border-propnex-border pt-6">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-400" />
              <p className="text-sm font-medium text-foreground">
                Lag Events Detected
              </p>
            </div>
            <ul className="space-y-2">
              {callQuality.lagEvents.map((event, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-orange-400/20 bg-orange-400/5 px-4 py-2.5 text-sm"
                >
                  <span className="text-foreground">
                    At {formatDuration(event.atSeconds)}
                  </span>
                  <span className="text-orange-400">
                    {event.durationMs}ms lag
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </DetailSection>
  );
}
