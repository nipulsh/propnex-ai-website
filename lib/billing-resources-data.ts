import type { PricingSummary } from "@/lib/billing-pricing";
import { getDaysRemaining } from "@/lib/billing-pricing";

export type ResourceRequest = {
  channelQty: number;
  virtualNumberQty: number;
  expectedMonthlyCalls: number;
};

export type ResourceUsage = {
  channelsAssigned: number;
  channelsActive: number;
  channelsAvailable: number;
  virtualNumbers: number;
  monthlyCallsUsed: number;
  monthlyCallCapacity: number;
};

export type SubscriptionStatus = "active" | "expiring_soon" | "expired";

export type ActiveSubscription = {
  id: string;
  resourceType: "channels" | "virtual_numbers";
  quantity: number;
  purchasedOn: string;
  expiresOn: string;
  status: SubscriptionStatus;
};

export type PurchaseStatus =
  | "completed"
  | "pending"
  | "expired"
  | "cancelled";

export type PurchaseHistoryItem = {
  id: string;
  purchaseDate: string;
  resourceType: string;
  quantity: number;
  amount: number;
  status: PurchaseStatus;
  invoiceId: string;
};

export type QuoteStatus = "draft" | "sent" | "expired";

export type Quote = {
  id: string;
  createdDate: string;
  status: QuoteStatus;
  request: ResourceRequest;
  pricing: PricingSummary;
};

export type AddonResource = {
  id: string;
  name: string;
  description: string;
  comingSoon: boolean;
};

export const INITIAL_RESOURCE_USAGE: ResourceUsage = {
  channelsAssigned: 10,
  channelsActive: 4,
  channelsAvailable: 6,
  virtualNumbers: 3,
  monthlyCallsUsed: 4200,
  monthlyCallCapacity: 10000,
};

export const DEFAULT_RESOURCE_REQUEST: ResourceRequest = {
  channelQty: 0,
  virtualNumberQty: 0,
  expectedMonthlyCalls: 3000,
};

export function getSubscriptionStatus(expiryDate: string): SubscriptionStatus {
  const days = getDaysRemaining(expiryDate);
  if (days <= 0) return "expired";
  if (days <= 30) return "expiring_soon";
  return "active";
}

export const activeSubscriptions: ActiveSubscription[] = [
  {
    id: "sub-1",
    resourceType: "channels",
    quantity: 5,
    purchasedOn: "2026-07-01",
    expiresOn: "2026-10-01",
    status: getSubscriptionStatus("2026-10-01"),
  },
  {
    id: "sub-2",
    resourceType: "virtual_numbers",
    quantity: 3,
    purchasedOn: "2026-04-15",
    expiresOn: "2026-07-10",
    status: getSubscriptionStatus("2026-07-10"),
  },
];

export const initialPurchaseHistory: PurchaseHistoryItem[] = [
  {
    id: "pur-1",
    purchaseDate: "2026-05-20",
    resourceType: "Channels",
    quantity: 5,
    amount: 3250,
    status: "completed",
    invoiceId: "INV-2026-0520",
  },
  {
    id: "pur-2",
    purchaseDate: "2026-04-15",
    resourceType: "Virtual Numbers",
    quantity: 3,
    amount: 1110,
    status: "completed",
    invoiceId: "INV-2026-0415",
  },
  {
    id: "pur-3",
    purchaseDate: "2026-03-01",
    resourceType: "Call Capacity",
    quantity: 5000,
    amount: 20000,
    status: "expired",
    invoiceId: "INV-2026-0301",
  },
  {
    id: "pur-4",
    purchaseDate: "2026-06-10",
    resourceType: "Channels",
    quantity: 3,
    amount: 1950,
    status: "pending",
    invoiceId: "INV-2026-0610",
  },
];

export const ADDON_RESOURCES: AddonResource[] = [
  {
    id: "addon-recording",
    name: "Extended Call Recording Storage",
    description: "90-day retention with searchable transcripts and exports.",
    comingSoon: true,
  },
  {
    id: "addon-support",
    name: "Premium Support",
    description: "24/7 priority support with dedicated response SLA.",
    comingSoon: true,
  },
  {
    id: "addon-infra",
    name: "Dedicated Infrastructure",
    description: "Isolated telephony stack for high-volume operations.",
    comingSoon: true,
  },
  {
    id: "addon-integrations",
    name: "Custom Integrations",
    description: "Bespoke CRM, ERP, and webhook integrations.",
    comingSoon: true,
  },
];

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
};

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  expired: "Expired",
  cancelled: "Cancelled",
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  expired: "Expired",
};

export function formatResourceDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
