import { create } from "zustand";

import {
  type DirectionFilter,
  type PhoneNumber,
  type PhoneNumberStatus,
  type ProviderFilter,
  type StatusFilter,
  initialPhoneNumbers,
} from "@/lib/phone-numbers-data";
import type { TelephonyProvider } from "@/lib/setup-data";

const PAGE_SIZE = 10;

type AddPhoneNumberInput = {
  number: string;
  provider: TelephonyProvider;
  inboundAgentId: string;
  inboundAgentName: string;
  outboundAgentId: string;
  outboundAgentName: string;
};

type PhoneNumbersStore = {
  numbers: PhoneNumber[];
  searchQuery: string;
  direction: DirectionFilter;
  status: StatusFilter;
  provider: ProviderFilter;
  showFilters: boolean;
  currentPage: number;
  setSearchQuery: (value: string) => void;
  setDirection: (value: DirectionFilter) => void;
  setStatus: (value: StatusFilter) => void;
  setProvider: (value: ProviderFilter) => void;
  toggleFilters: () => void;
  setPage: (page: number) => void;
  addPhoneNumber: (input: AddPhoneNumberInput) => void;
  updatePhoneNumber: (id: string, patch: Partial<PhoneNumber>) => void;
  setInboundAgent: (
    id: string,
    agentId: string,
    agentName: string,
  ) => void;
  setOutboundAgent: (
    id: string,
    agentId: string,
    agentName: string,
  ) => void;
  setNumberStatus: (id: string, status: PhoneNumberStatus) => void;
};

export const usePhoneNumbersStore = create<PhoneNumbersStore>((set) => ({
  numbers: initialPhoneNumbers,
  searchQuery: "",
  direction: "all",
  status: "all",
  provider: "all",
  showFilters: false,
  currentPage: 1,

  setSearchQuery: (value) => set({ searchQuery: value, currentPage: 1 }),
  setDirection: (value) => set({ direction: value, currentPage: 1 }),
  setStatus: (value) => set({ status: value, currentPage: 1 }),
  setProvider: (value) => set({ provider: value, currentPage: 1 }),
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
  setPage: (page) => set({ currentPage: Math.max(1, page) }),

  addPhoneNumber: (input) =>
    set((state) => {
      const now = Date.now();
      return {
        numbers: [
          {
            id: `pn-${Date.now()}`,
            number: input.number,
            provider: input.provider,
            inboundAgentId: input.inboundAgentId,
            inboundAgentName: input.inboundAgentName,
            outboundAgentId: input.outboundAgentId,
            outboundAgentName: input.outboundAgentName,
            status: "active",
            inboundCallsCount: 0,
            outboundCallsCount: 0,
            lastActivityAt: null,
            createdAt: now,
            updatedAt: now,
          },
          ...state.numbers,
        ],
        currentPage: 1,
      };
    }),

  updatePhoneNumber: (id, patch) =>
    set((state) => ({
      numbers: state.numbers.map((entry) =>
        entry.id === id
          ? { ...entry, ...patch, updatedAt: Date.now() }
          : entry,
      ),
    })),

  setInboundAgent: (id, agentId, agentName) =>
    set((state) => ({
      numbers: state.numbers.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              inboundAgentId: agentId,
              inboundAgentName: agentName,
              updatedAt: Date.now(),
            }
          : entry,
      ),
    })),

  setOutboundAgent: (id, agentId, agentName) =>
    set((state) => ({
      numbers: state.numbers.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              outboundAgentId: agentId,
              outboundAgentName: agentName,
              updatedAt: Date.now(),
            }
          : entry,
      ),
    })),

  setNumberStatus: (id, status) =>
    set((state) => ({
      numbers: state.numbers.map((entry) =>
        entry.id === id ? { ...entry, status, updatedAt: Date.now() } : entry,
      ),
    })),
}));

export const PHONE_NUMBERS_PAGE_SIZE = PAGE_SIZE;
