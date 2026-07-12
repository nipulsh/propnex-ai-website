import {
  Clock,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  Timer,
} from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { DetailSection } from "@/components/call-details/detail-section";
import { formatDuration } from "@/lib/call-logs-data";
import {
  formatTalkTime,
  type PhoneNumberOverviewMetrics,
} from "@/lib/phone-number-detail-data";

type PhoneNumberOverviewProps = {
  metrics: PhoneNumberOverviewMetrics;
};

export function PhoneNumberOverview({ metrics }: PhoneNumberOverviewProps) {
  return (
    <DetailSection
      title="Number Overview"
      description="Aggregate call performance for this number."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Calls"
          value={metrics.totalCalls.toLocaleString()}
          icon={PhoneCall}
        />
        <StatCard
          title="Inbound Calls"
          value={metrics.inboundCalls.toLocaleString()}
          icon={PhoneIncoming}
        />
        <StatCard
          title="Outbound Calls"
          value={metrics.outboundCalls.toLocaleString()}
          icon={PhoneCall}
        />
        <StatCard
          title="Missed Calls"
          value={metrics.missedCalls.toLocaleString()}
          icon={PhoneMissed}
        />
        <StatCard
          title="Avg Call Duration"
          value={formatDuration(metrics.averageDurationSeconds)}
          icon={Timer}
        />
        <StatCard
          title="Total Talk Time"
          value={formatTalkTime(metrics.totalTalkTimeSeconds)}
          icon={Clock}
        />
      </div>
    </DetailSection>
  );
}
