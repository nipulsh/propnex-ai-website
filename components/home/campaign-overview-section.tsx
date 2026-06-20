"use client";

import { useMemo } from "react";
import { Eye, MoreHorizontal, Pause, Pencil } from "lucide-react";

import { DashboardSection } from "@/components/common/dashboard-section";
import { BarChart } from "@/components/home/charts/bar-chart";
import type { HomeCampaign } from "@/stores/home-dashboard-store";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CampaignStatus = "active" | "paused" | "draft" | "completed";

const STATUS_STYLES: Record<CampaignStatus, string> = {
  active: "text-success bg-success/10",
  paused: "text-orange-400 bg-orange-400/10",
  draft: "text-propnex-muted bg-propnex-muted/10",
  completed: "text-cyan-400 bg-cyan-400/10",
};

function normalizeStatus(status: string): CampaignStatus {
  const lower = status.toLowerCase();
  if (
    lower === "active" ||
    lower === "paused" ||
    lower === "draft" ||
    lower === "completed"
  ) {
    return lower;
  }
  return "draft";
}

function CampaignRow({ campaign }: { campaign: HomeCampaign }) {
  const status = normalizeStatus(campaign.status);

  const handlePlaceholder = (action: string) => {
    window.alert(`${action} for "${campaign.name}" — coming soon.`);
  };

  return (
    <tr className="border-b border-propnex-border last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{campaign.name}</p>
        <p className="text-xs text-propnex-muted">{campaign.agentName}</p>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
            STATUS_STYLES[status],
          )}
        >
          {status}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-sm text-foreground md:table-cell">
        {campaign.totalCalls}
      </td>
      <td className="hidden px-4 py-3 text-sm text-foreground lg:table-cell">
        {campaign.connectedCalls}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-propnex-accent">
        {campaign.conversionRate}%
      </td>
      <td className="hidden px-4 py-3 text-sm text-foreground xl:table-cell">
        {campaign.generatedLeads}
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Campaign actions">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/lead-reactivation";
              }}
            >
              <Eye className="size-4" />
              View Campaign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePlaceholder("Edit")}>
              <Pencil className="size-4" />
              Edit Campaign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePlaceholder("Pause")}>
              <Pause className="size-4" />
              Pause Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function CampaignMiniCard({ campaign }: { campaign: HomeCampaign }) {
  return (
    <div className="rounded-lg border border-propnex-border bg-propnex-bg/50 p-3">
      <p className="truncate text-sm font-medium text-foreground">
        {campaign.name}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs text-propnex-muted">
        <span>{campaign.agentName}</span>
        <span className="font-medium text-propnex-accent">
          {campaign.conversionRate}%
        </span>
      </div>
    </div>
  );
}

export function CampaignOverviewSection() {
  const campaigns = useHomeDashboardStore((s) => s.campaigns);

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => normalizeStatus(c.status) === "active"),
    [campaigns],
  );

  const topPerforming = useMemo(
    () =>
      [...campaigns]
        .sort((a, b) => b.conversionRate - a.conversionRate)
        .slice(0, 3),
    [campaigns],
  );

  const recentlyCreated = useMemo(
    () =>
      [...campaigns]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3),
    [campaigns],
  );

  const barItems = topPerforming.map((c) => ({
    label: c.name.length > 20 ? `${c.name.slice(0, 18)}…` : c.name,
    value: c.conversionRate,
    color: "var(--propnex-accent)",
  }));

  if (campaigns.length === 0) {
    return (
      <DashboardSection
        title="Campaign Overview"
        description="Monitor active outreach campaigns and performance."
      >
        <p className="text-sm text-propnex-muted">No campaigns yet.</p>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection
      title="Campaign Overview"
      description="Monitor active outreach campaigns and performance."
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <div className="overflow-hidden rounded-xl border border-propnex-border bg-propnex-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-propnex-border bg-propnex-bg/50 text-xs text-propnex-muted">
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Calls</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Connected</th>
                  <th className="px-4 py-3 font-medium">Conv.</th>
                  <th className="hidden px-4 py-3 font-medium xl:table-cell">Leads</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCampaigns.map((campaign) => (
                  <CampaignRow key={campaign.id} campaign={campaign} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-4">
            <h3 className="text-sm font-medium text-foreground">Top Performing</h3>
            <div className="mt-3 space-y-2">
              {topPerforming.map((c) => (
                <CampaignMiniCard key={c.id} campaign={c} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-propnex-border bg-propnex-panel p-4">
            <h3 className="text-sm font-medium text-foreground">Recently Created</h3>
            <div className="mt-3 space-y-2">
              {recentlyCreated.map((c) => (
                <CampaignMiniCard key={c.id} campaign={c} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {barItems.length > 0 ? (
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Campaign Conversion Comparison
          </h3>
          <BarChart
            items={barItems}
            horizontal
            ariaLabel="Campaign conversion comparison"
          />
        </div>
      ) : null}
    </DashboardSection>
  );
}
