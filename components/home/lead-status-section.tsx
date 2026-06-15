"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Snowflake, Thermometer, Flame } from "lucide-react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { BarChart } from "@/components/home/charts/bar-chart";
import { DonutChart } from "@/components/home/charts/donut-chart";
import { DashboardEmptyState } from "@/components/home/dashboard-empty-state";
import { TrendBadge } from "@/components/home/trend-badge";
import { Button } from "@/components/ui/button";
import { LEAD_TEMPERATURE_STYLES } from "@/lib/call-detail-data";
import {
  getLeadStatusBreakdown,
  getPeriodLabel,
} from "@/lib/home-dashboard-data";
import { cn } from "@/lib/utils";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

const LEAD_CONFIG = [
  {
    key: "hot" as const,
    label: "Hot Leads",
    icon: Flame,
    color: "#f87171",
    href: "/call-logs?leadType=hot",
  },
  {
    key: "warm" as const,
    label: "Warm Leads",
    icon: Thermometer,
    color: "#fb923c",
    href: "/call-logs?leadType=warm",
  },
  {
    key: "cold" as const,
    label: "Cold Leads",
    icon: Snowflake,
    color: "#22d3ee",
    href: "/call-logs?leadType=cold",
  },
];

export function LeadStatusSection() {
  const dateRange = useHomeDashboardStore((s) => s.dateRange);

  const breakdown = useMemo(
    () => getLeadStatusBreakdown(dateRange),
    [dateRange],
  );

  const periodLabel = getPeriodLabel(dateRange);

  if (breakdown.total === 0) {
    return (
      <DashboardSection
        title="Lead Status Overview"
        description="Lead qualification insights across your calling pipeline."
      >
        <DashboardEmptyState
          title="No leads in this period"
          description="Adjust the date range or start making calls to see lead distribution."
          actionLabel="View Call Logs"
          actionHref="/call-logs"
        />
      </DashboardSection>
    );
  }

  const donutSegments = LEAD_CONFIG.map((c) => ({
    label: c.label,
    value: breakdown[c.key].count,
    color: c.color,
  }));

  const barItems = LEAD_CONFIG.map((c) => ({
    label: c.key.charAt(0).toUpperCase() + c.key.slice(1),
    value: breakdown[c.key].count,
    color: c.color,
  }));

  return (
    <DashboardSection
      title="Lead Status Overview"
      description="Lead qualification insights across your calling pipeline."
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {LEAD_CONFIG.map((config) => {
          const stats = breakdown[config.key];
          const styles = LEAD_TEMPERATURE_STYLES[config.key];
          const Icon = config.icon;

          return (
            <article
              key={config.key}
              className={cn(
                "rounded-xl border border-propnex-border bg-propnex-panel p-5",
                "border-l-4",
                config.key === "hot" && "border-l-destructive",
                config.key === "warm" && "border-l-orange-400",
                config.key === "cold" && "border-l-cyan-400",
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-propnex-muted">{config.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                    {stats.count}
                  </p>
                </div>
                <Icon className={cn("size-5", styles.className.split(" ")[0])} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                    styles.className,
                  )}
                >
                  {stats.percent}% of total
                </span>
                <TrendBadge percent={stats.trendPercent} periodLabel={periodLabel} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full justify-between text-propnex-accent"
                nativeButton={false}
                render={<Link href={config.href} />}
              >
                View {config.label}
                <ArrowRight className="size-4" />
              </Button>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Lead Distribution
          </h3>
          <DonutChart segments={donutSegments} />
        </div>
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Lead Count by Temperature
          </h3>
          <BarChart items={barItems} horizontal ariaLabel="Lead count by temperature" />
        </div>
      </div>
    </DashboardSection>
  );
}
