import { create } from "zustand";

import { billingSummary } from "@/lib/billing-data";
import { INITIAL_RESOURCE_USAGE } from "@/lib/billing-resources-data";
import {
  calculateUsageFromCallDuration,
  updateCreditsAndMoneyUsed,
  type UsageDelta,
  type UsageSnapshot,
} from "@/lib/credit-usage";

export { updateCreditsAndMoneyUsed } from "@/lib/credit-usage";

type UsageStore = UsageSnapshot & {
  resetDate: string;
  activePlan: string;
  totalLifetimeCalls: number;
  creditsHydrated: boolean;
  recordUsage: (delta: UsageDelta) => void;
  recordCallUsage: (durationSeconds: number) => void;
  setFromSnapshot: (snapshot: UsageSnapshot) => void;
  setCreditsHydrated: (hydrated: boolean) => void;
};

const initialSnapshot: UsageSnapshot = {
  totalCredits: 0,
  usedCredits: 0,
  remainingCredits: 0,
  moneyUsedInr: 0,
  monthlyCallsUsed: INITIAL_RESOURCE_USAGE.monthlyCallsUsed,
  monthlyCallCapacity: INITIAL_RESOURCE_USAGE.monthlyCallCapacity,
  availablePercent: 0,
};

export const useUsageStore = create<UsageStore>((set, get) => ({
  ...initialSnapshot,
  totalLifetimeCalls: 0,
  creditsHydrated: false,
  resetDate: billingSummary.resetDate,
  activePlan: billingSummary.activePlan,

  recordUsage: (delta) =>
    set((state) => updateCreditsAndMoneyUsed(state, delta)),

  recordCallUsage: (durationSeconds) => {
    const { monthlyCallsUsed, recordUsage } = get();
    const delta = calculateUsageFromCallDuration(
      durationSeconds,
      monthlyCallsUsed,
    );
    recordUsage(delta);
  },

  setFromSnapshot: (snapshot) =>
    set((state) => ({
      ...state,
      ...snapshot,
    })),

  setCreditsHydrated: (hydrated) => set({ creditsHydrated: hydrated }),
}));
