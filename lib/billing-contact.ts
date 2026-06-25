import {
  BILLING_PRICING,
  calculateChannelCost,
  formatInr,
} from "@/lib/billing-pricing";
import { USAGE_RATES } from "@/lib/credit-usage";

export type BillingContactIntent = "credits" | "channels";

export type BillingContactRequestInput = {
  intent: BillingContactIntent;
  quantity: number;
  phone?: string;
  notes?: string;
};

export const BILLING_SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_BILLING_SUPPORT_EMAIL ?? "billing@propnex.ai";

export const BILLING_CONTACT_INTENTS: BillingContactIntent[] = [
  "credits",
  "channels",
];

const INTENT_META: Record<
  BillingContactIntent,
  {
    label: string;
    title: string;
    description: string;
    quantityLabel: string;
    quantityHint: string;
    minQuantity: number;
    defaultQuantity: number;
  }
> = {
  credits: {
    label: "Credits",
    title: "Add Credits",
    description:
      "Top up your account so agents can keep making calls without interruption.",
    quantityLabel: "Credits to add",
    quantityHint: `₹${USAGE_RATES.inrPerCredit.toFixed(2)} per credit · ${USAGE_RATES.creditsPerChannelMinute} credits per call minute`,
    minQuantity: 100,
    defaultQuantity: 1000,
  },
  channels: {
    label: "Channels",
    title: "Add Channels",
    description:
      "Increase concurrent call capacity for outbound campaigns and inbound handling.",
    quantityLabel: "Channels to add",
    quantityHint: `${formatInr(BILLING_PRICING.channels.costPerUnit)} per channel · minimum ${BILLING_PRICING.channels.minPurchase} · valid ${BILLING_PRICING.channels.validityMonths} months`,
    minQuantity: BILLING_PRICING.channels.minPurchase,
    defaultQuantity: BILLING_PRICING.channels.minPurchase,
  },
};

export function parseBillingContactIntent(
  value: string | null | undefined,
): BillingContactIntent {
  if (value === "channels") return "channels";
  return "credits";
}

export function getBillingContactIntentMeta(intent: BillingContactIntent) {
  return INTENT_META[intent];
}

export function estimateBillingContactTotal(
  intent: BillingContactIntent,
  quantity: number,
): number {
  if (quantity <= 0) return 0;
  if (intent === "credits") {
    return Math.round(quantity * USAGE_RATES.inrPerCredit);
  }
  return calculateChannelCost(quantity);
}

export function validateBillingContactRequest(
  input: BillingContactRequestInput,
): string | null {
  const meta = getBillingContactIntentMeta(input.intent);

  if (!Number.isFinite(input.quantity) || input.quantity < meta.minQuantity) {
    return `Enter at least ${meta.minQuantity.toLocaleString("en-IN")} ${meta.label.toLowerCase()}.`;
  }

  if (input.phone?.trim()) {
    const digits = input.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return "Phone number must include at least 10 digits.";
    }
  }

  if (input.notes && input.notes.length > 2000) {
    return "Notes must be 2,000 characters or fewer.";
  }

  return null;
}

export function buildBillingContactMailto(
  input: BillingContactRequestInput & {
    companyName: string;
    contactName: string;
    email: string;
    requestId?: string;
  },
): string {
  const meta = getBillingContactIntentMeta(input.intent);
  const estimate = estimateBillingContactTotal(input.intent, input.quantity);
  const subject = `PropNex billing request — ${meta.title}`;
  const body = [
    `Request ID: ${input.requestId ?? "Pending"}`,
    `Company: ${input.companyName}`,
    `Contact: ${input.contactName}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    "",
    `Request type: ${meta.title}`,
    `Quantity: ${input.quantity.toLocaleString("en-IN")}`,
    `Estimated total: ${formatInr(estimate)} (excl. GST)`,
    "",
    input.notes?.trim() ? `Notes:\n${input.notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `mailto:${BILLING_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
