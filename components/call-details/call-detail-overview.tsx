import {
  Clock,
  DollarSign,
  Phone,
  Target,
  Thermometer,
  Wifi,
} from "lucide-react";

import { LeadTemperatureBadge } from "@/components/call-details/lead-temperature-badge";
import { StatCard } from "@/components/call-details/stat-card";
import { formatDuration } from "@/lib/call-logs-data";
import type { CallDetail } from "@/lib/call-detail-data";
import {
  formatCallCost,
  formatOutcome,
  LEAD_TEMPERATURE_STYLES,
} from "@/lib/call-detail-data";

type CallDetailOverviewProps = {
  detail: CallDetail;
};

export function CallDetailOverview({ detail }: CallDetailOverviewProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Call Duration"
        value={formatDuration(detail.durationSeconds)}
        footer="Total connected time"
        icon={Clock}
      />
      <StatCard
        title="Call Cost"
        value={formatCallCost(detail.callCost)}
        footer={`via ${detail.provider}`}
        icon={DollarSign}
      />
      <StatCard
        title="Provider Used"
        value={detail.provider}
        footer="Telephony provider"
        icon={Wifi}
      />
      <StatCard
        title="Call Outcome"
        value={formatOutcome(detail.outcome)}
        footer="AI-classified result"
        icon={Target}
      />
      <StatCard
        title="Lead Score"
        value={`${detail.leadScore}/100`}
        footer={`${detail.conversionProbability}% conversion probability`}
        icon={Phone}
      />
      <StatCard
        title="Lead Status"
        value={LEAD_TEMPERATURE_STYLES[detail.leadTemperature].label}
        badge={<LeadTemperatureBadge temperature={detail.leadTemperature} />}
        footer={`${detail.interestLevel.charAt(0).toUpperCase()}${detail.interestLevel.slice(1)} interest level`}
        icon={Thermometer}
        iconClassName={
          detail.leadTemperature === "hot"
            ? "text-destructive"
            : detail.leadTemperature === "warm"
              ? "text-orange-400"
              : "text-cyan-400"
        }
      />
    </section>
  );
}
