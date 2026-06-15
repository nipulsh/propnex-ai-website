"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { getAIInsights } from "@/lib/home-dashboard-data";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function AIInsightsSection() {
  const dateRange = useHomeDashboardStore((s) => s.dateRange);

  const insights = useMemo(
    () => getAIInsights(dateRange),
    [dateRange],
  );

  return (
    <DashboardSection
      title="AI Insights"
      description="Actionable recommendations powered by your calling data."
    >
      <div className="space-y-3">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className="rounded-xl border border-propnex-border bg-propnex-panel p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-propnex-accent/10 text-propnex-accent">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {insight.headline}
                </h3>
                <p className="mt-1 text-sm text-propnex-muted">
                  {insight.description}
                </p>
                <Link
                  href={insight.actionHref}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-propnex-accent hover:underline"
                >
                  {insight.actionLabel}
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </DashboardSection>
  );
}
