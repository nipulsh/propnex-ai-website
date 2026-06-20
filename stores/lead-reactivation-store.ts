import { create } from "zustand";

import {
  type DormantLead,
  type InactivityFilter,
  type StatusFilter,
} from "@/lib/lead-reactivation-data";

const PAGE_SIZE = 10;

type LeadReactivationStore = {
  leads: DormantLead[];
  isLoading: boolean;
  error: string | null;
  status: StatusFilter;
  agentId: string;
  inactivity: InactivityFilter;
  currentPage: number;
  setLeads: (leads: DormantLead[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStatus: (value: StatusFilter) => void;
  setAgentId: (value: string) => void;
  setInactivity: (value: InactivityFilter) => void;
  setPage: (page: number) => void;
};

export const useLeadReactivationStore = create<LeadReactivationStore>((set) => ({
  leads: [],
  isLoading: false,
  error: null,
  status: "all",
  agentId: "all",
  inactivity: "all",
  currentPage: 1,

  setLeads: (leads) => set({ leads }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setStatus: (value) => set({ status: value, currentPage: 1 }),
  setAgentId: (value) => set({ agentId: value, currentPage: 1 }),
  setInactivity: (value) => set({ inactivity: value, currentPage: 1 }),
  setPage: (page) => set({ currentPage: Math.max(1, page) }),
}));

export const LEAD_REACTIVATION_PAGE_SIZE = PAGE_SIZE;
