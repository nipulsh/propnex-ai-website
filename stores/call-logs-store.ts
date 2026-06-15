import { create } from "zustand";

import {
  type DateRangeOption,
  type StatusFilter,
} from "@/lib/call-logs-data";

const PAGE_SIZE = 10;

type CallLogsStore = {
  dateRange: DateRangeOption;
  agentId: string;
  status: StatusFilter;
  currentPage: number;
  setDateRange: (value: DateRangeOption) => void;
  setAgentId: (value: string) => void;
  setStatus: (value: StatusFilter) => void;
  setPage: (page: number) => void;
};

export const useCallLogsStore = create<CallLogsStore>((set) => ({
  dateRange: "last-7-days",
  agentId: "all",
  status: "all",
  currentPage: 1,

  setDateRange: (value) => set({ dateRange: value, currentPage: 1 }),
  setAgentId: (value) => set({ agentId: value, currentPage: 1 }),
  setStatus: (value) => set({ status: value, currentPage: 1 }),
  setPage: (page) => set({ currentPage: Math.max(1, page) }),
}));

export const CALL_LOGS_PAGE_SIZE = PAGE_SIZE;
