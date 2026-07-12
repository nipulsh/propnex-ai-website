import { create } from "zustand";

import type { ChartGranularity } from "@/lib/home-dashboard-data";
import type { DateRangeOption } from "@/lib/call-logs-data";
import type { HomePageResult } from "@/lib/graphql/queries";

export type HomeActivityItem = {
  id: string;
  type: string;
  title: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
};

export type HomeSchedulerEvent = {
  id: string;
  type: string;
  title: string;
  startAt: string;
  status: string;
};

type HomeDashboardStore = {
  dateRange: DateRangeOption;
  chartGranularity: ChartGranularity;
  isLoading: boolean;
  hasError: boolean;
  analytics: HomePageResult["analytics"]["summary"] | null;
  agentStatus: HomePageResult["agents"]["statusSummary"] | null;
  leadBreakdown: HomePageResult["leads"]["temperatureBreakdown"] | null;
  recentCalls: HomePageResult["callLogs"]["recent"];
  events: HomeActivityItem[];
  schedulerEvents: HomeSchedulerEvent[];
  setDateRange: (range: DateRangeOption) => void;
  setChartGranularity: (granularity: ChartGranularity) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
  setPageData: (data: HomePageResult) => void;
  resetError: () => void;
};

export const useHomeDashboardStore = create<HomeDashboardStore>((set) => ({
  dateRange: "last-7-days",
  chartGranularity: "daily",
  isLoading: false,
  hasError: false,
  analytics: null,
  agentStatus: null,
  leadBreakdown: null,
  recentCalls: [],
  events: [],
  schedulerEvents: [],

  setDateRange: (range) => set({ dateRange: range }),

  setChartGranularity: (granularity) => set({ chartGranularity: granularity }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ hasError: error, isLoading: false }),

  setPageData: (data) =>
    set({
      analytics: data.analytics.summary,
      agentStatus: data.agents.statusSummary,
      leadBreakdown: data.leads.temperatureBreakdown,
      recentCalls: data.callLogs.recent,
      events: data.events.recent,
      schedulerEvents: data.scheduler.upcoming,
      isLoading: false,
      hasError: false,
    }),

  resetError: () => set({ hasError: false }),
}));
