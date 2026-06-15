import { getCallPricingTier } from "@/lib/billing-pricing";

export const USAGE_RATES = {
  /** Credits consumed per minute of active channel time */
  creditsPerChannelMinute: 3,
  /** INR charged per credit consumed */
  inrPerCredit: 0.31,
  /** Minimum credits for a completed call */
  minCreditsPerCall: 1,
} as const;

export type UsageDelta = {
  credits?: number;
  moneyInr?: number;
  calls?: number;
};

export type UsageSnapshot = {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  moneyUsedInr: number;
  monthlyCallsUsed: number;
  monthlyCallCapacity: number;
  availablePercent: number;
};

export function calculateUsageFromCallDuration(
  durationSeconds: number,
  monthlyCallsSoFar: number,
): UsageDelta {
  const credits = Math.max(
    USAGE_RATES.minCreditsPerCall,
    Math.ceil(durationSeconds / 60) * USAGE_RATES.creditsPerChannelMinute,
  );
  const tier = getCallPricingTier(monthlyCallsSoFar + 1);
  const moneyInr =
    tier.ratePerCall > 0
      ? tier.ratePerCall
      : Math.round(credits * USAGE_RATES.inrPerCredit * 100) / 100;

  return { credits, moneyInr, calls: 1 };
}

export function calculateActiveChannelTick(
  activeChannels: number,
  elapsedSeconds: number,
): UsageDelta {
  if (activeChannels <= 0 || elapsedSeconds <= 0) {
    return { credits: 0, moneyInr: 0, calls: 0 };
  }

  const channelMinutes = (activeChannels * elapsedSeconds) / 60;
  const credits =
    Math.round(channelMinutes * USAGE_RATES.creditsPerChannelMinute * 100) /
    100;
  const moneyInr = Math.round(credits * USAGE_RATES.inrPerCredit * 100) / 100;

  return { credits, moneyInr, calls: 0 };
}

/**
 * Applies a usage delta and returns an updated snapshot with derived fields.
 */
export function updateCreditsAndMoneyUsed(
  current: UsageSnapshot,
  delta: UsageDelta,
): UsageSnapshot {
  const usedCredits = current.usedCredits + (delta.credits ?? 0);
  const moneyUsedInr = current.moneyUsedInr + (delta.moneyInr ?? 0);
  const monthlyCallsUsed = current.monthlyCallsUsed + (delta.calls ?? 0);
  const remainingCredits = Math.max(0, current.totalCredits - usedCredits);
  const availablePercent = Math.round(
    (remainingCredits / current.totalCredits) * 100,
  );

  return {
    ...current,
    usedCredits,
    moneyUsedInr,
    monthlyCallsUsed,
    remainingCredits,
    availablePercent,
  };
}
