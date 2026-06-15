"use client";

import { useMemo } from "react";
import {
  Bot,
  Clock,
  Megaphone,
  Percent,
  Phone,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { DashboardSection } from "@/components/common/dashboard-section";
import { TrendBadge, formatTrendFooter } from "@/components/home/trend-badge";
import {
  getActiveAgentCount,
  getOverviewMetrics,
  getPeriodLabel,
} from "@/lib/home-dashboard-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function OverviewSection() {
  const dateRange = useHomeDashboardStore((s) => s.dateRange);

  const metrics = useMemo(
    () => getOverviewMetrics(dateRange, getActiveAgentCount()),
    [dateRange],
  );

  const periodLabel = getPeriodLabel(dateRange);

  const trendFooterClass = (percent: number) =>
    percent >= 0 ? "text-success" : "text-destructive";

  return (
    <DashboardSection
      title="Overview"
      description="High-level business metrics for your AI calling operation."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total Calls"
          value={metrics.totalCalls.formatted}
          icon={Phone}
          badge={
            <TrendBadge
              percent={metrics.totalCalls.trendPercent}
              periodLabel={periodLabel}
            />
          }
          footer={formatTrendFooter(metrics.totalCalls.trendPercent, periodLabel)}
          footerClassName={trendFooterClass(metrics.totalCalls.trendPercent)}
        />
        <StatCard
          title="Active Agents"
          value={metrics.activeAgents.formatted}
          icon={Bot}
          badge={
            <TrendBadge
              percent={metrics.activeAgents.trendPercent}
              periodLabel={periodLabel}
            />
          }
          footer={formatTrendFooter(metrics.activeAgents.trendPercent, periodLabel)}
          footerClassName={trendFooterClass(metrics.activeAgents.trendPercent)}
        />
        <StatCard
          title="Total Leads"
          value={metrics.totalLeads.formatted}
          icon={Users}
          badge={
            <TrendBadge
              percent={metrics.totalLeads.trendPercent}
              periodLabel={periodLabel}
            />
          }
          footer={formatTrendFooter(metrics.totalLeads.trendPercent, periodLabel)}
          footerClassName={trendFooterClass(metrics.totalLeads.trendPercent)}
        />
        <StatCard
          title="Active Campaigns"
          value={metrics.activeCampaigns.formatted}
          icon={Megaphone}
          badge={
            <TrendBadge
              percent={metrics.activeCampaigns.trendPercent}
              periodLabel={periodLabel}
            />
          }
          footer={formatTrendFooter(metrics.activeCampaigns.trendPercent, periodLabel)}
          footerClassName={trendFooterClass(metrics.activeCampaigns.trendPercent)}
        />
        <StatCard
          title="Conversion Rate"
          value={metrics.conversionRate.formatted}
          icon={Percent}
          badge={
            <TrendBadge
              percent={metrics.conversionRate.trendPercent}
              periodLabel={periodLabel}
            />
          }
          footer={formatTrendFooter(metrics.conversionRate.trendPercent, periodLabel)}
          footerClassName={trendFooterClass(metrics.conversionRate.trendPercent)}
        />
        <StatCard
          title="Avg Call Duration"
          value={metrics.avgCallDuration.formatted}
          icon={Clock}
          badge={
            <TrendBadge
              percent={metrics.avgCallDuration.trendPercent}
              periodLabel={periodLabel}
            />
          }
          footer={formatTrendFooter(metrics.avgCallDuration.trendPercent, periodLabel)}
          footerClassName={trendFooterClass(metrics.avgCallDuration.trendPercent)}
        />
      </div>
    </DashboardSection>
  );
}
