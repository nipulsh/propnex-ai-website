"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";

export function AIInsightsSection() {
  const analytics = useHomeDashboardStore((s) => s.analytics);
  const campaigns = useHomeDashboardStore((s) => s.campaigns);
  const leadBreakdown = useHomeDashboardStore((s) => s.leadBreakdown);

  const insights = useMemo(() => {
    const items: {
      id: string;
      headline: string;
      description: string;
      actionLabel: string;
      actionHref: string;
    }[] = [];

    if (analytics && analytics.conversionRate < 15 && analytics.totalCalls > 10) {
      items.push({
        id: "conversion",
        headline: "Conversion rate below target",
        description: `Your conversion rate is ${analytics.conversionRate}%. Review call outcomes and agent scripts to improve lead qualification.`,
        actionLabel: "View call logs",
        actionHref: "/call-logs",
      });
    }

    const hotLeads = leadBreakdown?.hot ?? 0;
    if (hotLeads > 0) {
      items.push({
        id: "hot-leads",
        headline: `${hotLeads} hot leads ready for follow-up`,
        description:
          "Prioritize outbound calls to hot leads while engagement is highest.",
        actionLabel: "View leads",
        actionHref: "/call-logs?leadType=hot",
      });
    }

    const activeCampaigns = campaigns.filter(
      (c) => c.status.toLowerCase() === "active",
    );
    if (activeCampaigns.length === 0 && campaigns.length > 0) {
      items.push({
        id: "campaigns",
        headline: "No active campaigns",
        description:
          "Resume or launch a campaign to keep your AI agents generating calls.",
        actionLabel: "Manage campaigns",
        actionHref: "/lead-reactivation",
      });
    }

    if (items.length === 0) {
      items.push({
        id: "default",
        headline: "Your workspace is performing steadily",
        description:
          "Keep monitoring call volume and lead temperature as your agents run.",
        actionLabel: "View dashboard",
        actionHref: "/dashboard",
      });
    }

    return items;
  }, [analytics, campaigns, leadBreakdown]);

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
