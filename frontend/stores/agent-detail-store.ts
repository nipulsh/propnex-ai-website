import { create } from "zustand";

import type { AgentAssignedPhoneNumber } from "@/lib/agent-detail-data";
import type { CallLog } from "@/lib/call-logs-data";

type AgentDetailStore = {
  agentId: string | null;
  isLoading: boolean;
  error: string | null;
  successBanner: string | null;
  calls: CallLog[];
  assignedNumbers: AgentAssignedPhoneNumber[];
  hydrate: (agentId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessBanner: (message: string | null) => void;
  setCalls: (calls: CallLog[]) => void;
  setAssignedNumbers: (numbers: AgentAssignedPhoneNumber[]) => void;
  reset: () => void;
};

export const useAgentDetailStore = create<AgentDetailStore>((set) => ({
  agentId: null,
  isLoading: true,
  error: null,
  successBanner: null,
  calls: [],
  assignedNumbers: [],

  hydrate: (agentId) =>
    set({
      agentId,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setSuccessBanner: (message) => set({ successBanner: message }),
  setCalls: (calls) => set({ calls }),
  setAssignedNumbers: (assignedNumbers) => set({ assignedNumbers }),

  reset: () =>
    set({
      agentId: null,
      error: null,
      successBanner: null,
      calls: [],
      assignedNumbers: [],
    }),
}));
