import { create } from "zustand";

type AgentDetailStore = {
  agentId: string | null;
  isLoading: boolean;
  error: string | null;
  successBanner: string | null;
  hydrate: (agentId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessBanner: (message: string | null) => void;
  reset: () => void;
};

export const useAgentDetailStore = create<AgentDetailStore>((set) => ({
  agentId: null,
  isLoading: true,
  error: null,
  successBanner: null,

  hydrate: (agentId) =>
    set({
      agentId,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setSuccessBanner: (message) => set({ successBanner: message }),

  reset: () =>
    set({
      agentId: null,
      isLoading: true,
      error: null,
      successBanner: null,
    }),
}));
