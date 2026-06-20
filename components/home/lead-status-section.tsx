"use client";

import Link from "next/link";
import { ArrowRight, Snowflake, Thermometer, Flame } from "lucide-react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { BarChart } from "@/components/home/charts/bar-chart";
import { DonutChart } from "@/components/home/charts/donut-chart";
import { DashboardEmptyState } from "@/components/home/dashboard-empty-state";
import { Button } from "@/components/ui/button";
import { LEAD_TEMPERATURE_STYLES } from "@/lib/call-detail-data";
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
  const breakdown = useHomeDashboardStore((s) => s.leadBreakdown);

  if (!breakdown || breakdown.total === 0) {
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
    value: breakdown[c.key],
    color: c.color,
  }));

  const barItems = LEAD_CONFIG.map((c) => ({
    label: c.key.charAt(0).toUpperCase() + c.key.slice(1),
    value: breakdown[c.key],
    color: c.color,
  }));

  return (
    <DashboardSection
      title="Lead Status Overview"
      description="Lead qualification insights across your calling pipeline."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
          <DonutChart segments={donutSegments} />
        </div>
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
          <BarChart items={barItems} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {LEAD_CONFIG.map((config) => {
          const count = breakdown[config.key];
          const percent =
            breakdown.total > 0
              ? Math.round((count / breakdown.total) * 100)
              : 0;
          const Icon = config.icon;
          const style = LEAD_TEMPERATURE_STYLES[config.key];

          return (
            <Link
              key={config.key}
              href={config.href}
              className="group rounded-xl border border-propnex-border bg-propnex-panel p-4 transition-colors hover:border-propnex-accent/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("size-4", style.className)} />
                  <span className="text-sm font-medium text-foreground">
                    {config.label}
                  </span>
                </div>
                <ArrowRight className="size-4 text-propnex-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {count}
              </p>
              <p className="text-xs text-propnex-muted">{percent}% of total</p>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" render={<Link href="/call-logs" />}>
          View all leads
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </DashboardSection>
  );
}
