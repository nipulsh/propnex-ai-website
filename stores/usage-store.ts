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
  recordUsage: (delta: UsageDelta) => void;
  recordCallUsage: (durationSeconds: number) => void;
  addCredits: (amount: number) => void;
};

const initialSnapshot: UsageSnapshot = {
  totalCredits: billingSummary.totalCredits,
  usedCredits: billingSummary.usedCredits,
  remainingCredits: billingSummary.remainingCredits,
  moneyUsedInr: Math.round(billingSummary.usedCredits * 0.31),
  monthlyCallsUsed: INITIAL_RESOURCE_USAGE.monthlyCallsUsed,
  monthlyCallCapacity: INITIAL_RESOURCE_USAGE.monthlyCallCapacity,
  availablePercent: billingSummary.availablePercent,
};

export const useUsageStore = create<UsageStore>((set, get) => ({
  ...initialSnapshot,
  totalLifetimeCalls: 0,
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

  addCredits: (amount) =>
    set((state) => ({
      totalCredits: state.totalCredits + amount,
      remainingCredits: state.remainingCredits + amount,
      availablePercent: Math.round(
        ((state.remainingCredits + amount) / (state.totalCredits + amount)) *
          100,
      ),
    })),
}));
