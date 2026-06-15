import {
  Calendar,
  Flame,
  PhoneCall,
  PhoneIncoming,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { DetailSection } from "@/components/call-details/detail-section";
import { PhoneNumberCallTrendChart } from "@/components/phone-numbers/detail/phone-number-call-trend-chart";
import type { PhoneNumberAnalytics } from "@/lib/phone-number-detail-data";

type PhoneNumberAnalyticsSectionProps = {
  analytics: PhoneNumberAnalytics;
};

export function PhoneNumberAnalyticsSection({
  analytics,
}: PhoneNumberAnalyticsSectionProps) {
  return (
    <DetailSection
      title="Call Analytics"
      description="Performance metrics and activity trends for this number."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Inbound Calls Today"
          value={analytics.inboundCallsToday.toString()}
          icon={PhoneIncoming}
        />
        <StatCard
          title="Outbound Calls Today"
          value={analytics.outboundCallsToday.toString()}
          icon={PhoneCall}
        />
        <StatCard
          title="Weekly Activity"
          value={analytics.weeklyActivity.toLocaleString()}
          footer="Last 7 days"
          icon={Calendar}
        />
        <StatCard
          title="Monthly Activity"
          value={analytics.monthlyActivity.toLocaleString()}
          footer="Last 30 days"
          icon={Calendar}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          footer="Outbound completed calls"
          icon={TrendingUp}
        />
        <StatCard
          title="Hot Leads Generated"
          value={analytics.hotLeadsGenerated.toString()}
          icon={Flame}
          iconClassName="text-orange-400"
        />
      </div>

      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <h3 className="text-sm font-medium text-foreground">Weekly Activity</h3>
        <p className="mt-0.5 text-xs text-propnex-muted">
          Inbound vs outbound call volume over the past 7 days
        </p>
        <div className="mt-4">
          <PhoneNumberCallTrendChart trend={analytics.dailyTrend} />
        </div>
      </div>
    </DetailSection>
  );
}
