import { create } from "zustand";

import type {
  CallHistoryDateRange,
  CallLog,
  DirectionFilter,
  StatusFilter,
} from "@/lib/call-logs-data";
import type { PhoneNumberStatus } from "@/lib/phone-numbers-data";

const HISTORY_PAGE_SIZE = 10;

type PhoneNumberDetailStore = {
  phoneNumberId: string | null;
  isLoading: boolean;
  error: string | null;
  historyDirection: DirectionFilter;
  historyStatus: StatusFilter;
  historyDateRange: CallHistoryDateRange;
  historyCustomFrom: string;
  historyCustomTo: string;
  historyAgentId: string;
  historyPage: number;
  testBanner: string | null;
  calls: CallLog[];
  hydrate: (phoneNumberId: string) => void;
  setCalls: (calls: CallLog[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  setHistoryDirection: (value: DirectionFilter) => void;
  setHistoryStatus: (value: StatusFilter) => void;
  setHistoryDateRange: (value: CallHistoryDateRange) => void;
  setHistoryCustomFrom: (value: string) => void;
  setHistoryCustomTo: (value: string) => void;
  setHistoryAgentId: (value: string) => void;
  setHistoryPage: (page: number) => void;
  setTestBanner: (message: string | null) => void;
};

export const usePhoneNumberDetailStore = create<PhoneNumberDetailStore>(
  (set) => ({
    phoneNumberId: null,
    isLoading: true,
    error: null,
    historyDirection: "all",
    historyStatus: "all",
    historyDateRange: "last-7-days",
    historyCustomFrom: "",
    historyCustomTo: "",
    historyAgentId: "all",
    historyPage: 1,
    testBanner: null,
    calls: [],

    hydrate: (phoneNumberId) =>
      set({
        phoneNumberId,
        isLoading: false,
        error: null,
      }),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, isLoading: false }),
    setCalls: (calls) => set({ calls }),

    reset: () =>
      set({
        phoneNumberId: null,
        isLoading: true,
        error: null,
        calls: [],
        historyDirection: "all",
        historyStatus: "all",
        historyDateRange: "last-7-days",
        historyCustomFrom: "",
        historyCustomTo: "",
        historyAgentId: "all",
        historyPage: 1,
        testBanner: null,
      }),

    setHistoryDirection: (value) =>
      set({ historyDirection: value, historyPage: 1 }),
    setHistoryStatus: (value) => set({ historyStatus: value, historyPage: 1 }),
    setHistoryDateRange: (value) =>
      set({ historyDateRange: value, historyPage: 1 }),
    setHistoryCustomFrom: (value) =>
      set({ historyCustomFrom: value, historyPage: 1 }),
    setHistoryCustomTo: (value) =>
      set({ historyCustomTo: value, historyPage: 1 }),
    setHistoryAgentId: (value) => set({ historyAgentId: value, historyPage: 1 }),
    setHistoryPage: (page) => set({ historyPage: Math.max(1, page) }),
    setTestBanner: (message) => set({ testBanner: message }),
  }),
);

export const PHONE_NUMBER_HISTORY_PAGE_SIZE = HISTORY_PAGE_SIZE;
