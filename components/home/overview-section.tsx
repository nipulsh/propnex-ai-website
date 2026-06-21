"use client";

import { useMemo } from "react";
import { Bot, Clock, Percent, Phone, Users } from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { DashboardSection } from "@/components/common/dashboard-section";
import { getPeriodLabel } from "@/lib/home-dashboard-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function OverviewSection() {
  const dateRange = useHomeDashboardStore((s) => s.dateRange);
  const analytics = useHomeDashboardStore((s) => s.analytics);
  const agentStatus = useHomeDashboardStore((s) => s.agentStatus);
  const leadBreakdown = useHomeDashboardStore((s) => s.leadBreakdown);
  const recentCalls = useHomeDashboardStore((s) => s.recentCalls);

  const periodLabel = getPeriodLabel(dateRange);

  const avgDurationSeconds = useMemo(() => {
    if (recentCalls.length === 0) return 0;
    const total = recentCalls.reduce((sum, c) => sum + c.durationSeconds, 0);
    return Math.round(total / recentCalls.length);
  }, [recentCalls]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <DashboardSection
      title="Overview"
      description="High-level business metrics for your AI calling operation."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          title="Total Calls"
          value={(analytics?.totalCalls ?? 0).toLocaleString("en-IN")}
          icon={Phone}
          footer={`Period · ${periodLabel}`}
        />
        <StatCard
          title="Active Agents"
          value={String(agentStatus?.active ?? 0)}
          icon={Bot}
          footer={`${agentStatus?.total ?? 0} total agents`}
        />
        <StatCard
          title="Total Leads"
          value={String(leadBreakdown?.total ?? 0)}
          icon={Users}
          footer="Qualified pipeline"
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics?.conversionRate ?? 0}%`}
          icon={Percent}
          footer={`${analytics?.connectedCalls ?? 0} connected calls`}
        />
        <StatCard
          title="Avg Call Duration"
          value={formatDuration(avgDurationSeconds)}
          icon={Clock}
          footer="From recent calls"
        />
      </div>
    </DashboardSection>
  );
}
