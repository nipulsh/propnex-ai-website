"use client";

import { useMemo } from "react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { ChartPeriodToggle } from "@/components/home/charts/chart-period-toggle";
import { LineChart } from "@/components/home/charts/line-chart";
import { getPerformanceChartData } from "@/lib/home-dashboard-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function PerformanceAnalyticsSection() {
  const dateRange = useHomeDashboardStore((s) => s.dateRange);
  const chartGranularity = useHomeDashboardStore((s) => s.chartGranularity);
  const setChartGranularity = useHomeDashboardStore((s) => s.setChartGranularity);

  const chartData = useMemo(
    () => getPerformanceChartData(chartGranularity, dateRange),
    [chartGranularity, dateRange],
  );

  const charts = [
    {
      title: "Calls Over Time",
      series: [
        {
          key: "calls",
          label: "Calls",
          color: "var(--propnex-accent)",
          values: chartData.callsOverTime,
        },
      ],
    },
    {
      title: "Lead Generation Trends",
      series: [
        {
          key: "leads",
          label: "Hot + Warm Leads",
          color: "#fb923c",
          values: chartData.leadGeneration,
        },
      ],
    },
    {
      title: "Campaign Performance",
      series: [
        {
          key: "campaigns",
          label: "Campaign Calls",
          color: "#22d3ee",
          values: chartData.campaignPerformance,
        },
      ],
    },
    {
      title: "Conversion Trends",
      series: [
        {
          key: "conversion",
          label: "Conversion Rate %",
          color: "#34c759",
          values: chartData.conversionTrend,
        },
      ],
    },
  ];

  return (
    <DashboardSection
      title="Performance Analytics"
      description="Track calling volume, lead generation, and conversion over time."
      action={
        <ChartPeriodToggle
          value={chartGranularity}
          onChange={setChartGranularity}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {charts.map((chart) => (
          <div
            key={chart.title}
            className="rounded-xl border border-propnex-border bg-propnex-panel p-5"
          >
            <h3 className="mb-4 text-sm font-medium text-foreground">
              {chart.title}
            </h3>
            <LineChart
              labels={chartData.labels}
              series={chart.series}
              ariaLabel={chart.title}
            />
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
