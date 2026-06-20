import { create } from "zustand";

import type { ChartGranularity } from "@/lib/home-dashboard-data";
import type { DateRangeOption } from "@/lib/call-logs-data";
import type { HomePageResult } from "@/lib/graphql/queries";

export type HomeCampaign = {
  id: string;
  name: string;
  status: string;
  agentId: string | null;
  agentName: string;
  totalCalls: number;
  connectedCalls: number;
  conversionRate: number;
  generatedLeads: number;
  createdAt: string;
};

export type HomeActivityItem = {
  id: string;
  type: string;
  title: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
};

export type HomeNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
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
  dismissedAlertIds: string[];
  analytics: HomePageResult["analytics"]["summary"] | null;
  agentStatus: HomePageResult["agents"]["statusSummary"] | null;
  leadBreakdown: HomePageResult["leads"]["temperatureBreakdown"] | null;
  campaigns: HomeCampaign[];
  recentCalls: HomePageResult["callLogs"]["recent"];
  events: HomeActivityItem[];
  notifications: HomeNotification[];
  schedulerEvents: HomeSchedulerEvent[];
  setDateRange: (range: DateRangeOption) => void;
  setChartGranularity: (granularity: ChartGranularity) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
  setPageData: (data: HomePageResult) => void;
  dismissAlert: (id: string) => void;
  resetError: () => void;
};

const LOADING_DELAY_MS = 400;

let loadingTimer: ReturnType<typeof setTimeout> | null = null;

function triggerLoading(
  set: (partial: Partial<HomeDashboardStore>) => void,
) {
  if (loadingTimer) clearTimeout(loadingTimer);
  set({ isLoading: true, hasError: false });
  loadingTimer = setTimeout(() => {
    set({ isLoading: false });
    loadingTimer = null;
  }, LOADING_DELAY_MS);
}

export const useHomeDashboardStore = create<HomeDashboardStore>((set) => ({
  dateRange: "last-7-days",
  chartGranularity: "daily",
  isLoading: false,
  hasError: false,
  dismissedAlertIds: [],
  analytics: null,
  agentStatus: null,
  leadBreakdown: null,
  campaigns: [],
  recentCalls: [],
  events: [],
  notifications: [],
  schedulerEvents: [],

  setDateRange: (range) => {
    triggerLoading(set);
    set({ dateRange: range });
  },

  setChartGranularity: (granularity) => {
    triggerLoading(set);
    set({ chartGranularity: granularity });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ hasError: error, isLoading: false }),

  setPageData: (data) =>
    set({
      analytics: data.analytics.summary,
      agentStatus: data.agents.statusSummary,
      leadBreakdown: data.leads.temperatureBreakdown,
      campaigns: data.campaigns.list,
      recentCalls: data.callLogs.recent,
      events: data.events.recent,
      notifications: data.notifications.list.edges.map((e) => e.node),
      schedulerEvents: data.scheduler.upcoming,
      isLoading: false,
      hasError: false,
    }),

  dismissAlert: (id) =>
    set((state) => ({
      dismissedAlertIds: [...state.dismissedAlertIds, id],
    })),
  resetError: () => set({ hasError: false }),
}));
