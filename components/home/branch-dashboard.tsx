"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Phone,
  PhoneCall,
  RefreshCw,
  Users,
  ShieldCheck,
} from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { DashboardSection } from "@/components/common/dashboard-section";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { useHomeDashboardStore } from "@/stores/home-dashboard-store";
import { fetchBranchDashboardPage } from "@/lib/graphql/api";
import { formatCallDate, formatCallTime } from "@/lib/call-logs-data";
import { getPeriodLabel } from "@/lib/home-dashboard-data";
import type { BranchDashboardResult } from "@/lib/graphql/queries/home";

export function BranchDashboard() {
  const { branchIds } = usePermissions();
  const dateRange = useHomeDashboardStore((s) => s.dateRange);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<BranchDashboardResult | null>(null);

  const branchId = branchIds[0];

  useEffect(() => {
    if (!branchId) return;

    let active = true;
    setIsLoading(true);
    setError(false);

    // Compute dates based on dateRange option
    const startMs = getDateRangeStartMs(dateRange);
    const dateFrom = startMs ? new Date(startMs).toISOString() : undefined;
    const dateTo = new Date().toISOString();

    fetchBranchDashboardPage(branchId, dateFrom, dateTo)
      .then((res) => {
        if (active) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [branchId, dateRange]);

  const periodLabel = getPeriodLabel(dateRange);

  // Stats derivations
  const recentCalls = data?.callLogs.recent ?? [];
  const analytics = data?.analytics.summary;
  const leadBreakdown = data?.leads.temperatureBreakdown;
  const branch = data?.branches.byId;

  const todayCallsCount = useMemo(() => {
    const todayStr = new Date().toDateString();
    return recentCalls.filter((c) => {
      if (!c.startedAt) return false;
      const date = new Date(c.startedAt);
      return !isNaN(date.getTime()) && date.toDateString() === todayStr;
    }).length;
  }, [recentCalls]);

  const avgDurationSeconds = useMemo(() => {
    if (recentCalls.length === 0) return 0;
    const total = recentCalls.reduce((sum, c) => sum + (c.durationSeconds || 0), 0);
    return Math.round(total / recentCalls.length);
  }, [recentCalls]);

  const formatDuration = (seconds: number) => {
    const s = seconds || 0;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  function getDateRangeStartMs(option: typeof dateRange) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    switch (option) {
      case "today":
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        return start.getTime();
      case "yesterday":
        const yesterday = new Date(now - day);
        yesterday.setUTCHours(0, 0, 0, 0);
        return yesterday.getTime();
      case "last-7-days":
        return now - 7 * day;
      case "last-30-days":
        return now - 30 * day;
      default:
        return null;
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[320px] flex-1 items-center justify-center">
        <RefreshCw className="size-5 animate-spin text-propnex-muted" />
        <span className="ml-2 text-sm text-propnex-muted">Loading branch dashboard…</span>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="flex h-full min-h-[320px] flex-1 flex-col items-center justify-center gap-4">
        <p className="text-sm text-propnex-muted">Unable to load dashboard data. Please try again.</p>
        <Button variant="outline" onClick={() => dateRange && setData(null)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Overview stats cards section */}
      <DashboardSection
        title="Overview"
        description={`High-level business metrics for ${branch.name}`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            title="Today's Calls"
            value={String(todayCallsCount)}
            icon={PhoneCall}
            footer="Dialed today"
          />
          <StatCard
            title="Total Calls"
            value={(analytics?.totalCalls ?? 0).toLocaleString("en-IN")}
            icon={Phone}
            footer={`Period · ${periodLabel}`}
          />
          <StatCard
            title="Answered Calls"
            value={(analytics?.connectedCalls ?? 0).toLocaleString("en-IN")}
            icon={ShieldCheck}
            footer="Connected status"
          />
          <StatCard
            title="Missed Calls"
            value={String((analytics?.totalCalls ?? 0) - (analytics?.connectedCalls ?? 0))}
            icon={PhoneCall}
            footer="Disconnected status"
            iconClassName="text-red-500"
          />
          <StatCard
            title="Avg Call Duration"
            value={formatDuration(avgDurationSeconds)}
            icon={Clock}
            footer="From recent calls"
          />
          <StatCard
            title="Total Leads"
            value={String(leadBreakdown?.total ?? 0)}
            icon={Users}
            footer="Qualified pipeline"
          />
        </div>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left column: Recent Calls */}
        <div className="xl:col-span-2">
          <DashboardSection
            title="Recent Calls"
            description="The latest incoming and outgoing calls for this branch."
          >
            {recentCalls.length === 0 ? (
              <div className="rounded-xl border border-propnex-border bg-propnex-panel p-8 text-center text-sm text-propnex-muted">
                No recent calls recorded for this branch.
              </div>
            ) : (
              <div className="rounded-xl border border-propnex-border bg-propnex-panel overflow-hidden">
                <div className="overflow-x-auto propnex-scrollbar">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-propnex-border bg-propnex-bg/50 text-xs font-semibold tracking-wider text-propnex-muted uppercase">
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Direction</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-propnex-border">
                      {recentCalls.slice(0, 10).map((call) => (
                        <tr
                          key={call.id}
                          className="hover:bg-propnex-bg/30 transition-colors group cursor-pointer"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            <Link href={`/call-logs/${call.id}`} className="block group-hover:text-propnex-accent">
                              {call.lead
                                ? `${call.lead.firstName ?? ""} ${call.lead.lastName ?? ""}`.trim() ||
                                  "Unknown Lead"
                                : "No Lead Attached"}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-propnex-muted capitalize">
                            {call.direction.toLowerCase()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                call.status === "COMPLETED"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {call.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-propnex-muted">
                            {formatDuration(call.durationSeconds)}
                          </td>
                          <td className="px-4 py-3 text-propnex-muted text-xs">
                            {formatCallDate(call.startedAt)} at {formatCallTime(call.startedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Right column: Branch Info & Quick Actions */}
        <div className="flex flex-col gap-6">
          <DashboardSection title="Branch Information" description="Branch configuration & active services.">
            <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5 space-y-4">
              <div>
                <label className="text-xs text-propnex-muted uppercase tracking-wider">Branch Name</label>
                <p className="mt-1 text-sm font-semibold text-foreground">{branch.name}</p>
              </div>

              <div>
                <label className="text-xs text-propnex-muted uppercase tracking-wider">Status</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      branch.status === "ACTIVE"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {branch.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-propnex-muted uppercase tracking-wider">AI calling service</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      branch.aiEnabled
                        ? "bg-purple-500/10 text-purple-500"
                        : "bg-propnex-bg text-propnex-muted border border-propnex-border"
                    }`}
                  >
                    {branch.aiEnabled ? "Active calling agent" : "Inactive"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-propnex-muted uppercase tracking-wider">Last Activity</label>
                <p className="mt-1 text-xs text-propnex-muted">
                  {branch.lastActivityAt
                    ? `${formatCallDate(branch.lastActivityAt)} at ${formatCallTime(branch.lastActivityAt)}`
                    : "No activity recorded"}
                </p>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Quick Actions" description="Fast options to navigate.">
            <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5 space-y-3">
              <Button
                render={<Link href="/call-logs" />}
                className="w-full h-10 gap-2 justify-start bg-propnex-accent/10 border border-propnex-accent/20 hover:bg-propnex-accent/20 text-propnex-accent"
              >
                <PhoneCall className="size-4" />
                View Call Logs
              </Button>
              <Button
                render={<Link href="/contact" />}
                className="w-full h-10 gap-2 justify-start bg-propnex-panel border border-propnex-border hover:bg-propnex-bg/50 text-foreground"
              >
                <Calendar className="size-4 text-propnex-muted" />
                Contact Support
              </Button>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
