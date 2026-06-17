import { agents } from "@/lib/agents-data";
import { billingSummary } from "@/lib/billing-data";
import {
  callLogs,
  formatDuration,
  getDateRangeStart,
  type CallLog,
  type DateRangeOption,
} from "@/lib/call-logs-data";
import {
  getCallDetail,
  getLeadTemperatureForCall,
  type LeadTemperature,
} from "@/lib/call-detail-data";
import { dormantLeads } from "@/lib/lead-reactivation-data";

export type ChartGranularity = "daily" | "weekly" | "monthly";

export type CampaignStatus = "active" | "paused" | "draft" | "completed";

export type Campaign = {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  status: CampaignStatus;
  totalCalls: number;
  connectedCalls: number;
  conversionRate: number;
  generatedLeads: number;
  createdAt: number;
};

export type DemoStatus = "upcoming" | "completed" | "pending";

export type DemoRequest = {
  id: string;
  customerName: string;
  company: string;
  date: string;
  time: string;
  scheduledAt: number;
  status: DemoStatus;
};

export type ActivityType =
  | "agent-created"
  | "campaign-started"
  | "call-completed"
  | "lead-converted"
  | "demo-scheduled"
  | "resource-purchased";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: number;
  href?: string;
};

export type AlertSeverity = "critical" | "warning" | "info";

export type DashboardAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  href: string;
};

export type AIInsight = {
  id: string;
  headline: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export type TrendMetric = {
  value: number;
  previousValue: number;
  trendPercent: number;
  formatted: string;
};

export type OverviewMetrics = {
  totalCalls: TrendMetric;
  activeAgents: TrendMetric;
  totalLeads: TrendMetric;
  activeCampaigns: TrendMetric;
  conversionRate: TrendMetric;
  avgCallDuration: TrendMetric;
};

export type LeadCategoryStats = {
  count: number;
  percent: number;
  trendPercent: number;
};

export type LeadStatusBreakdown = {
  hot: LeadCategoryStats;
  warm: LeadCategoryStats;
  cold: LeadCategoryStats;
  total: number;
};

export type ChartBucket = {
  label: string;
  start: number;
  end: number;
};

export type PerformanceChartData = {
  labels: string[];
  callsOverTime: number[];
  leadGeneration: number[];
  campaignPerformance: number[];
  conversionTrend: number[];
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function computeTrendPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function makeTrendMetric(
  current: number,
  previous: number,
  formatter: (v: number) => string = (v) => v.toLocaleString("en-IN"),
): TrendMetric {
  return {
    value: current,
    previousValue: previous,
    trendPercent: computeTrendPercent(current, previous),
    formatted: formatter(current),
  };
}

export function getPeriodLabel(dateRange: DateRangeOption): string {
  const labels: Record<DateRangeOption, string> = {
    today: "vs yesterday",
    "last-7-days": "vs last week",
    "last-30-days": "vs last month",
    "last-90-days": "vs last quarter",
    custom: "vs prior period",
  };
  return labels[dateRange];
}

function getRangeBounds(dateRange: DateRangeOption): {
  start: number;
  end: number;
} {
  const end = Date.now();
  const start = getDateRangeStart(dateRange);
  return { start, end };
}

function getPreviousRangeBounds(dateRange: DateRangeOption): {
  start: number;
  end: number;
} {
  const { start, end } = getRangeBounds(dateRange);
  const duration = end - start;
  return { start: start - duration, end: start };
}

export function filterCallsByTimestamp(
  logs: CallLog[],
  start: number,
  end: number,
): CallLog[] {
  return logs.filter((log) => log.timestamp >= start && log.timestamp <= end);
}

function countUniqueLeads(logs: CallLog[]): number {
  return new Set(logs.map((l) => l.leadName)).size;
}

function getConversionRate(logs: CallLog[]): number {
  const completed = logs.filter((l) => l.status === "completed");
  if (completed.length === 0) return 0;
  const hot = completed.filter(
    (l) => getLeadTemperatureForCall(l.id) === "hot",
  ).length;
  return Math.round((hot / completed.length) * 100);
}

function getAvgDuration(logs: CallLog[]): number {
  const completed = logs.filter((l) => l.status === "completed");
  if (completed.length === 0) return 0;
  const total = completed.reduce((sum, l) => sum + l.durationSeconds, 0);
  return Math.round(total / completed.length);
}

const CAMPAIGN_SEEDS: Omit<Campaign, "id">[] = [
  {
    name: "Q2 Dormant Lead Revival",
    agentId: "lead-reactivation",
    agentName: "Lead Reactivation Agent",
    status: "active",
    totalCalls: 342,
    connectedCalls: 218,
    conversionRate: 24,
    generatedLeads: 52,
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },
  {
    name: "High-Value Buyer Nurture",
    agentId: "outbound-nurture",
    agentName: "Outbound Nurture",
    status: "active",
    totalCalls: 189,
    connectedCalls: 134,
    conversionRate: 31,
    generatedLeads: 41,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Spring Open House Outreach",
    agentId: "real-estate-qual",
    agentName: "Real Estate Qualifier",
    status: "active",
    totalCalls: 256,
    connectedCalls: 167,
    conversionRate: 18,
    generatedLeads: 30,
    createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Investor Portfolio Follow-up",
    agentId: "follow-up-agent",
    agentName: "Follow-Up Agent",
    status: "paused",
    totalCalls: 98,
    connectedCalls: 61,
    conversionRate: 12,
    generatedLeads: 7,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },
  {
    name: "New Listing Announcement",
    agentId: "vortex-sales",
    agentName: "Vortex Sales",
    status: "active",
    totalCalls: 412,
    connectedCalls: 289,
    conversionRate: 27,
    generatedLeads: 78,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Weekend Showing Reminders",
    agentId: "appointment-bot",
    agentName: "Appointment Bot",
    status: "completed",
    totalCalls: 156,
    connectedCalls: 112,
    conversionRate: 22,
    generatedLeads: 25,
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
  },
];

export const campaigns: Campaign[] = CAMPAIGN_SEEDS.map((seed, i) => ({
  id: `camp-${i + 1}`,
  ...seed,
}));

function generateDemoRequests(): DemoRequest[] {
  const rand = seededRandom(42);
  const names = [
    { customer: "Rachel Kim", company: "Horizon Realty" },
    { customer: "David Okonkwo", company: "Summit Properties" },
    { customer: "Lisa Martinez", company: "Coastal Living Group" },
    { customer: "James Wilson", company: "Metro Estates" },
    { customer: "Anita Desai", company: "Urban Nest" },
    { customer: "Tom Bradley", company: "Prime Holdings" },
    { customer: "Sofia Laurent", company: "Luxe Living Co." },
    { customer: "Kevin Park", company: "Pacific Realty" },
    { customer: "Emma Foster", company: "Greenfield Homes" },
    { customer: "Michael Tran", company: "Skyline Ventures" },
  ];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return names.map((entry, i) => {
    const dayOffset = Math.floor(rand() * 30) - 10;
    const scheduledAt = now + dayOffset * dayMs + Math.floor(rand() * 8) * 3600000;
    const date = new Date(scheduledAt);
    const status: DemoStatus =
      scheduledAt < now - dayMs
        ? "completed"
        : scheduledAt > now + 2 * dayMs
          ? "pending"
          : "upcoming";

    return {
      id: `demo-${i + 1}`,
      customerName: entry.customer,
      company: entry.company,
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      scheduledAt,
      status,
    };
  });
}

export const demoRequests = generateDemoRequests();

export function getLifetimeTotalCalls(): number {
  return callLogs.length;
}

export function getOverviewMetrics(
  dateRange: DateRangeOption,
  activeAgentCount: number,
): OverviewMetrics {
  const current = getRangeBounds(dateRange);
  const previous = getPreviousRangeBounds(dateRange);

  const currentCalls = filterCallsByTimestamp(
    callLogs,
    current.start,
    current.end,
  );
  const previousCalls = filterCallsByTimestamp(
    callLogs,
    previous.start,
    previous.end,
  );

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const prevActiveCampaigns = Math.max(1, activeCampaigns - 1);

  return {
    totalCalls: makeTrendMetric(currentCalls.length, previousCalls.length),
    activeAgents: makeTrendMetric(activeAgentCount, Math.max(1, activeAgentCount - 1)),
    totalLeads: makeTrendMetric(
      countUniqueLeads(currentCalls),
      countUniqueLeads(previousCalls),
    ),
    activeCampaigns: makeTrendMetric(activeCampaigns, prevActiveCampaigns),
    conversionRate: makeTrendMetric(
      getConversionRate(currentCalls),
      getConversionRate(previousCalls),
      (v) => `${v}%`,
    ),
    avgCallDuration: makeTrendMetric(
      getAvgDuration(currentCalls),
      getAvgDuration(previousCalls),
      (v) => formatDuration(v),
    ),
  };
}

function getLeadCounts(logs: CallLog[]): Record<LeadTemperature, number> {
  const counts: Record<LeadTemperature, number> = { hot: 0, warm: 0, cold: 0 };
  const completed = logs.filter((l) => l.status === "completed");
  for (const log of completed) {
    const temp = getLeadTemperatureForCall(log.id);
    counts[temp]++;
  }
  return counts;
}

export function getLeadStatusBreakdown(
  dateRange: DateRangeOption,
): LeadStatusBreakdown {
  const current = getRangeBounds(dateRange);
  const previous = getPreviousRangeBounds(dateRange);

  const currentCalls = filterCallsByTimestamp(
    callLogs,
    current.start,
    current.end,
  );
  const previousCalls = filterCallsByTimestamp(
    callLogs,
    previous.start,
    previous.end,
  );

  const currentCounts = getLeadCounts(currentCalls);
  const previousCounts = getLeadCounts(previousCalls);
  const total =
    currentCounts.hot + currentCounts.warm + currentCounts.cold;

  const toStats = (temp: LeadTemperature): LeadCategoryStats => {
    const count = currentCounts[temp];
    const prev = previousCounts[temp];
    return {
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      trendPercent: computeTrendPercent(count, prev),
    };
  };

  return {
    hot: toStats("hot"),
    warm: toStats("warm"),
    cold: toStats("cold"),
    total,
  };
}

export function getActiveCampaigns(): Campaign[] {
  return campaigns.filter((c) => c.status === "active");
}

export function getTopPerformingCampaigns(limit = 3): Campaign[] {
  return [...campaigns]
    .filter((c) => c.status === "active" || c.status === "completed")
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, limit);
}

export function getRecentlyCreatedCampaigns(limit = 3): Campaign[] {
  return [...campaigns]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function getDemosByStatus(status: DemoStatus): DemoRequest[] {
  return demoRequests.filter((d) => d.status === status);
}

export function getNextUpcomingDemo(): DemoRequest | null {
  const upcoming = demoRequests
    .filter((d) => d.status === "upcoming" && d.scheduledAt > Date.now())
    .sort((a, b) => a.scheduledAt - b.scheduledAt);
  return upcoming[0] ?? null;
}

function buildChartBuckets(
  granularity: ChartGranularity,
  dateRange: DateRangeOption,
): ChartBucket[] {
  const { start, end } = getRangeBounds(dateRange);
  const buckets: ChartBucket[] = [];
  const dayMs = 24 * 60 * 60 * 1000;

  if (granularity === "daily") {
    const days = Math.min(14, Math.ceil((end - start) / dayMs));
    for (let i = days - 1; i >= 0; i--) {
      const bucketStart = end - (i + 1) * dayMs;
      const bucketEnd = end - i * dayMs;
      const d = new Date(bucketStart);
      buckets.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        start: bucketStart,
        end: bucketEnd,
      });
    }
  } else if (granularity === "weekly") {
    const weeks = 8;
    for (let i = weeks - 1; i >= 0; i--) {
      const bucketEnd = end - i * 7 * dayMs;
      const bucketStart = bucketEnd - 7 * dayMs;
      buckets.push({
        label: `W${weeks - i}`,
        start: bucketStart,
        end: bucketEnd,
      });
    }
  } else {
    const months = 6;
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setMonth(d.getMonth() - i);
      const bucketStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const bucketEnd = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ).getTime();
      buckets.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        start: bucketStart,
        end: bucketEnd,
      });
    }
  }

  return buckets;
}

export function getPerformanceChartData(
  granularity: ChartGranularity,
  dateRange: DateRangeOption,
): PerformanceChartData {
  const buckets = buildChartBuckets(granularity, dateRange);
  const labels = buckets.map((b) => b.label);
  const callsOverTime: number[] = [];
  const leadGeneration: number[] = [];
  const campaignPerformance: number[] = [];
  const conversionTrend: number[] = [];

  const rand = seededRandom(granularity.length + dateRange.length);

  buckets.forEach((bucket, i) => {
    const logs = filterCallsByTimestamp(callLogs, bucket.start, bucket.end);
    callsOverTime.push(logs.length);

    const leads = logs.filter(
      (l) =>
        l.status === "completed" &&
        ["hot", "warm"].includes(getLeadTemperatureForCall(l.id)),
    ).length;
    leadGeneration.push(leads);

    const activeCamps = campaigns.filter((c) => c.status === "active");
    const campVolume = activeCamps.reduce(
      (sum, c) => sum + Math.round(c.totalCalls / buckets.length),
      0,
    );
    campaignPerformance.push(
      campVolume + Math.floor(rand() * 20 * (i + 1)),
    );

    conversionTrend.push(getConversionRate(logs));
  });

  return {
    labels,
    callsOverTime,
    leadGeneration,
    campaignPerformance,
    conversionTrend,
  };
}

export function getRecentActivity(): ActivityItem[] {
  const items: ActivityItem[] = [];
  const now = Date.now();

  const recentCalls = [...callLogs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  recentCalls.forEach((call) => {
    items.push({
      id: `act-call-${call.id}`,
      type: "call-completed",
      title: "Call Completed",
      description: `${call.leadName} — ${call.agentName}`,
      timestamp: call.timestamp,
      href: `/call-logs/${call.id}`,
    });
  });

  agents.slice(0, 2).forEach((agent, i) => {
    items.push({
      id: `act-agent-${agent.id}`,
      type: "agent-created",
      title: "Agent Created",
      description: agent.name,
      timestamp: now - (i + 4) * 3600000,
      href: "/agents",
    });
  });

  campaigns
    .filter((c) => c.status === "active")
    .slice(0, 2)
    .forEach((camp, i) => {
      items.push({
        id: `act-camp-${camp.id}`,
        type: "campaign-started",
        title: "Campaign Started",
        description: camp.name,
        timestamp: camp.createdAt + i * 1000,
        href: "/lead-reactivation",
      });
    });

  const hotCalls = callLogs
    .filter(
      (c) =>
        c.status === "completed" &&
        getLeadTemperatureForCall(c.id) === "hot",
    )
    .slice(0, 2);

  hotCalls.forEach((call) => {
    items.push({
      id: `act-lead-${call.id}`,
      type: "lead-converted",
      title: "Lead Converted",
      description: `${call.leadName} marked as hot lead`,
      timestamp: call.timestamp,
      href: `/call-logs/${call.id}`,
    });
  });

  demoRequests
    .filter((d) => d.status === "upcoming" || d.status === "pending")
    .slice(0, 2)
    .forEach((demo) => {
      items.push({
        id: `act-demo-${demo.id}`,
        type: "demo-scheduled",
        title: "Demo Scheduled",
        description: `${demo.customerName} — ${demo.company}`,
        timestamp: demo.scheduledAt,
      });
    });

  items.push({
    id: "act-resource-1",
    type: "resource-purchased",
    title: "Resource Purchased",
    description: "Extra Credit Pack (5,000)",
    timestamp: now - 5 * 24 * 60 * 60 * 1000,
    href: "/billing",
  });

  return items
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 12);
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type AlertInput = {
  remainingCredits: number;
  totalCredits: number;
  channelsActive: number;
  channelsAssigned: number;
  virtualNumbers: number;
  virtualNumberCapacity: number;
};

export function getDashboardAlerts(input: AlertInput): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const creditPercent = (input.remainingCredits / input.totalCredits) * 100;

  if (creditPercent < 20) {
    alerts.push({
      id: "alert-low-credit",
      severity: "critical",
      title: "Low Credit Alert",
      message: `Only ${Math.round(creditPercent)}% credits remaining. Top up to avoid service interruption.`,
      href: "/billing",
    });
  }

  const lowConversion = campaigns.find(
    (c) => c.status === "active" && c.conversionRate < 15,
  );
  if (lowConversion) {
    alerts.push({
      id: `alert-campaign-${lowConversion.id}`,
      severity: "warning",
      title: "Campaign Performance Alert",
      message: `"${lowConversion.name}" conversion rate is below 15%. Review agent script and targeting.`,
      href: "/lead-reactivation",
    });
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const failedRecent = callLogs.filter(
    (c) => c.status === "failed" && c.timestamp > Date.now() - dayMs,
  ).length;
  if (failedRecent > 0) {
    alerts.push({
      id: "alert-failed-calls",
      severity: "warning",
      title: "Failed Call Alert",
      message: `${failedRecent} call${failedRecent > 1 ? "s" : ""} failed in the last 24 hours.`,
      href: "/call-logs?status=failed",
    });
  }

  const upcomingDemo = demoRequests.find(
    (d) =>
      d.status === "upcoming" &&
      d.scheduledAt > Date.now() &&
      d.scheduledAt < Date.now() + dayMs,
  );
  if (upcomingDemo) {
    alerts.push({
      id: `alert-demo-${upcomingDemo.id}`,
      severity: "info",
      title: "Demo Reminder",
      message: `Demo with ${upcomingDemo.customerName} (${upcomingDemo.company}) is within 24 hours.`,
      href: "#demo-requests",
    });
  }

  const resetDate = new Date(billingSummary.resetDate);
  const daysToReset = Math.ceil(
    (resetDate.getTime() - Date.now()) / dayMs,
  );
  if (daysToReset > 0 && daysToReset <= 7) {
    alerts.push({
      id: "alert-resource-expiry",
      severity: "info",
      title: "Resource Expiry Warning",
      message: `Billing cycle resets in ${daysToReset} day${daysToReset > 1 ? "s" : ""} on ${billingSummary.resetDate}.`,
      href: "/billing",
    });
  }

  if (
    input.channelsAssigned > 0 &&
    input.channelsActive / input.channelsAssigned >= 0.8
  ) {
    alerts.push({
      id: "alert-channels-capacity",
      severity: "warning",
      title: "Channels Near Capacity",
      message: `${input.channelsActive} of ${input.channelsAssigned} channels are active.`,
      href: "/billing",
    });
  }

  if (
    input.virtualNumberCapacity > 0 &&
    input.virtualNumbers >= input.virtualNumberCapacity
  ) {
    alerts.push({
      id: "alert-numbers-full",
      severity: "warning",
      title: "Virtual Numbers Fully Assigned",
      message: "All virtual number slots are in use.",
      href: "/setup#phone-numbers",
    });
  }

  return alerts;
}

export function getAIInsights(dateRange: DateRangeOption): AIInsight[] {
  const breakdown = getLeadStatusBreakdown(dateRange);
  const topCampaign = getTopPerformingCampaigns(1)[0];
  const periodLabel = getPeriodLabel(dateRange);
  const insights: AIInsight[] = [];

  if (breakdown.hot.trendPercent !== 0) {
    insights.push({
      id: "insight-hot-leads",
      headline: `Hot leads ${breakdown.hot.trendPercent >= 0 ? "increased" : "decreased"} by ${Math.abs(breakdown.hot.trendPercent)}%`,
      description: `You have ${breakdown.hot.count} hot leads (${breakdown.hot.percent}% of total) ${periodLabel}.`,
      actionLabel: "View Hot Leads",
      actionHref: "/call-logs?leadType=hot",
    });
  }

  if (topCampaign) {
    insights.push({
      id: "insight-top-campaign",
      headline: `"${topCampaign.name}" leads conversion`,
      description: `This campaign achieved a ${topCampaign.conversionRate}% conversion rate with ${topCampaign.generatedLeads} leads generated.`,
      actionLabel: "View Campaign",
      actionHref: "/lead-reactivation",
    });
  }

  const agentScores = agents
    .filter((a) => a.status === "active")
    .map((agent) => {
      const agentCalls = callLogs.filter(
        (c) => c.agentId === agent.id && c.status === "completed",
      );
      const avgEngagement =
        agentCalls.length > 0
          ? agentCalls.reduce((sum, c) => {
              const detail = getCallDetail(c.id);
              return sum + (detail?.engagement.engagementScore ?? 50);
            }, 0) / agentCalls.length
          : 0;
      return { agent, score: avgEngagement };
    })
    .sort((a, b) => b.score - a.score);

  const bestAgent = agentScores[0];
  if (bestAgent && bestAgent.score > 0) {
    insights.push({
      id: "insight-best-agent",
      headline: `${bestAgent.agent.name} achieved the best engagement score`,
      description: `Average engagement of ${Math.round(bestAgent.score)}% across recent completed calls.`,
      actionLabel: "View Agents",
      actionHref: "/agents",
    });
  }

  const dormantCount = dormantLeads.filter((l) => l.status === "dormant").length;
  if (dormantCount > 0) {
    insights.push({
      id: "insight-reactivation",
      headline: `${dormantCount} leads recommended for reactivation`,
      description:
        "Dormant contacts with high re-engagement potential are ready for outreach campaigns.",
      actionLabel: "Start Reactivation",
      actionHref: "/lead-reactivation",
    });
  }

  const { start, end } = getRangeBounds(dateRange);
  const currentCalls = filterCallsByTimestamp(callLogs, start, end);
  const conversion = getConversionRate(currentCalls);
  insights.push({
    id: "insight-conversion",
    headline: `Overall conversion rate is ${conversion}%`,
    description:
      conversion >= 20
        ? "Your AI calling operation is performing above industry benchmarks."
        : "Consider refining agent scripts and lead targeting to improve conversions.",
    actionLabel: "View Call Logs",
    actionHref: "/call-logs",
  });

  return insights.slice(0, 6);
}

export function getActiveAgentCount(): number {
  return agents.filter((a) => a.status === "active" && a.enabled).length;
}
