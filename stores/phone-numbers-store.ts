import { create } from "zustand";

import {
  type LabelFilter,
  type PhoneNumber,
  type PhoneNumberLabel,
  initialPhoneNumbers,
} from "@/lib/phone-numbers-data";

const PAGE_SIZE = 10;

type AddPhoneNumberInput = {
  number: string;
  label: PhoneNumberLabel;
  agentId: string;
  agentName: string;
};

type PhoneNumbersStore = {
  numbers: PhoneNumber[];
  searchQuery: string;
  agentId: string;
  label: LabelFilter;
  showFilters: boolean;
  currentPage: number;
  setSearchQuery: (value: string) => void;
  setAgentId: (value: string) => void;
  setLabel: (value: LabelFilter) => void;
  toggleFilters: () => void;
  setPage: (page: number) => void;
  addPhoneNumber: (input: AddPhoneNumberInput) => void;
};

export const usePhoneNumbersStore = create<PhoneNumbersStore>((set) => ({
  numbers: initialPhoneNumbers,
  searchQuery: "",
  agentId: "all",
  label: "all",
  showFilters: false,
  currentPage: 1,

  setSearchQuery: (value) => set({ searchQuery: value, currentPage: 1 }),
  setAgentId: (value) => set({ agentId: value, currentPage: 1 }),
  setLabel: (value) => set({ label: value, currentPage: 1 }),
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
  setPage: (page) => set({ currentPage: Math.max(1, page) }),

  addPhoneNumber: (input) =>
    set((state) => ({
      numbers: [
        {
          id: `pn-${Date.now()}`,
          number: input.number,
          labels: [input.label],
          agentId: input.agentId,
          agentName: input.agentName,
        },
        ...state.numbers,
      ],
      currentPage: 1,
    })),
}));

export const PHONE_NUMBERS_PAGE_SIZE = PAGE_SIZE;
