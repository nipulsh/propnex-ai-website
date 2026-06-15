import { DetailSection } from "@/components/call-details/detail-section";
import { MetricProgressBar } from "@/components/call-details/metric-progress-bar";
import { formatDuration } from "@/lib/call-logs-data";
import type { CallDetail } from "@/lib/call-detail-data";

type EngagementAnalyticsSectionProps = {
  engagement: CallDetail["engagement"];
  durationSeconds: number;
};

export function EngagementAnalyticsSection({
  engagement,
  durationSeconds,
}: EngagementAnalyticsSectionProps) {
  const totalTalk =
    engagement.customerTalkSeconds + engagement.agentTalkSeconds;
  const customerPercent =
    totalTalk > 0
      ? (engagement.customerTalkSeconds / totalTalk) * 100
      : 50;
  const agentPercent = 100 - customerPercent;

  return (
    <DetailSection
      title="Engagement Analytics"
      description="Talk-time distribution and engagement metrics."
    >
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <MetricProgressBar
              label="Customer Talk Time"
              value={customerPercent}
              showValue
            />
            <p className="text-xs text-propnex-muted">
              {formatDuration(engagement.customerTalkSeconds)} of{" "}
              {formatDuration(durationSeconds)} total
            </p>
            <MetricProgressBar
              label="Agent Talk Time"
              value={agentPercent}
              showValue
              barClassName="bg-propnex-accent-secondary"
            />
            <p className="text-xs text-propnex-muted">
              {formatDuration(engagement.agentTalkSeconds)} of{" "}
              {formatDuration(durationSeconds)} total
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Engagement Score
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {engagement.engagementScore}
                <span className="text-sm font-normal text-propnex-muted">
                  /100
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-propnex-border bg-propnex-bg p-4">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Silence Duration
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatDuration(engagement.silenceSeconds)}
              </p>
            </div>
            <div className="col-span-2 rounded-lg border border-propnex-border bg-propnex-bg p-4">
              <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Interruptions
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {engagement.interruptions}
                <span className="ml-2 text-sm font-normal text-propnex-muted">
                  detected during call
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DetailSection>
  );
}
