import type { ResourceRequest } from "@/lib/billing-resources-data";

export const BILLING_PRICING = {
  channels: {
    costPerUnit: 650,
    minPurchase: 3,
    validityMonths: 3,
  },
  virtualNumbers: {
    costPerUnit: 370,
  },
  callCharges: {
    tiers: [
      { minCalls: 0, maxCalls: 999, ratePerCall: 0 },
      { minCalls: 1000, maxCalls: 5000, ratePerCall: 4 },
      { minCalls: 5001, maxCalls: Infinity, ratePerCall: 3 },
    ],
  },
  gstRate: 0.18,
} as const;

export type CallPricingTier = {
  minCalls: number;
  maxCalls: number;
  ratePerCall: number;
  label: string;
};

export type PricingSummary = {
  channelCost: number;
  virtualNumberCost: number;
  callCost: number;
  subtotal: number;
  gst: number;
  grandTotal: number;
  callTier: CallPricingTier;
};

export type RoiProjection = {
  expectedLeads: number;
  estimatedConversions: number;
  estimatedRevenue: number;
};

export type ChannelValidation = {
  valid: boolean;
  message?: string;
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return inrFormatter.format(amount);
}

export function getCallPricingTier(monthlyCalls: number): CallPricingTier {
  const tier = BILLING_PRICING.callCharges.tiers.find(
    (t) => monthlyCalls >= t.minCalls && monthlyCalls <= t.maxCalls,
  );

  const active = tier ?? BILLING_PRICING.callCharges.tiers[0];

  let label: string;
  if (active.ratePerCall === 0) {
    label = "No charge (below 1,000 calls)";
  } else {
    label = `₹${active.ratePerCall} / call`;
  }

  return {
    minCalls: active.minCalls,
    maxCalls: active.maxCalls,
    ratePerCall: active.ratePerCall,
    label,
  };
}

export function calculateChannelCost(qty: number): number {
  if (qty <= 0) return 0;
  return qty * BILLING_PRICING.channels.costPerUnit;
}

export function calculateVirtualNumberCost(qty: number): number {
  if (qty <= 0) return 0;
  return qty * BILLING_PRICING.virtualNumbers.costPerUnit;
}

export function calculateCallUsageCost(monthlyCalls: number): number {
  const tier = getCallPricingTier(monthlyCalls);
  return monthlyCalls * tier.ratePerCall;
}

export function validateChannelQuantity(qty: number): ChannelValidation {
  if (qty === 0) return { valid: true };
  if (qty < BILLING_PRICING.channels.minPurchase) {
    return {
      valid: false,
      message: `Minimum purchase is ${BILLING_PRICING.channels.minPurchase} channels.`,
    };
  }
  return { valid: true };
}

export function calculatePricingSummary(
  request: ResourceRequest,
): PricingSummary {
  const channelCost = calculateChannelCost(request.channelQty);
  const virtualNumberCost = calculateVirtualNumberCost(
    request.virtualNumberQty,
  );
  const callTier = getCallPricingTier(request.expectedMonthlyCalls);
  const callCost = calculateCallUsageCost(request.expectedMonthlyCalls);
  const subtotal = channelCost + virtualNumberCost + callCost;
  const gst = Math.round(subtotal * BILLING_PRICING.gstRate);
  const grandTotal = subtotal + gst;

  return {
    channelCost,
    virtualNumberCost,
    callCost,
    subtotal,
    gst,
    grandTotal,
    callTier,
  };
}

export function calculateRoi(input: {
  calls: number;
  conversionRate: number;
  avgRevenuePerConversion?: number;
}): RoiProjection {
  const rate = Math.min(100, Math.max(0, input.conversionRate)) / 100;
  const avgRevenue = input.avgRevenuePerConversion ?? 5000;
  const expectedLeads = Math.round(input.calls * 0.35);
  const estimatedConversions = Math.round(expectedLeads * rate);
  const estimatedRevenue = estimatedConversions * avgRevenue;

  return { expectedLeads, estimatedConversions, estimatedRevenue };
}

export function generateQuoteId(): string {
  return `QTE-${Date.now()}`;
}

export function getDaysRemaining(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
