import { create } from "zustand";

import type { ChartGranularity } from "@/lib/home-dashboard-data";
import type { DateRangeOption } from "@/lib/call-logs-data";

type HomeDashboardStore = {
  dateRange: DateRangeOption;
  chartGranularity: ChartGranularity;
  isLoading: boolean;
  hasError: boolean;
  dismissedAlertIds: string[];
  setDateRange: (range: DateRangeOption) => void;
  setChartGranularity: (granularity: ChartGranularity) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
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
  dismissAlert: (id) =>
    set((state) => ({
      dismissedAlertIds: [...state.dismissedAlertIds, id],
    })),
  resetError: () => set({ hasError: false }),
}));
