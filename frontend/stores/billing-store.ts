import { create } from "zustand";

import {
  calculatePricingSummary,
  generateQuoteId,
  validateChannelQuantity,
} from "@/lib/billing-pricing";
import {
  DEFAULT_RESOURCE_REQUEST,
  type PurchaseHistoryItem,
  type Quote,
  type ResourceRequest,
} from "@/lib/billing-resources-data";

type Banner = {
  type: "success" | "error" | "info";
  message: string;
};

export type BillingInvoiceItem = {
  id: string;
  issuedAt: string;
  amountCents: number;
  status: string;
  description: string | null;
  currency: string;
};

export type BillingSubscriptionItem = {
  planName: string;
  status: string;
  currentPeriodEnd: string;
  nextInvoiceAmount: number | null;
} | null;

type RoiInputs = {
  expectedCalls: number;
  conversionRate: number;
  avgRevenuePerConversion: number;
};

type BillingStore = {
  resourceRequest: ResourceRequest;
  roiInputs: RoiInputs;
  quotes: Quote[];
  invoices: BillingInvoiceItem[];
  subscription: BillingSubscriptionItem;
  purchaseHistory: PurchaseHistoryItem[];
  activeQuote: Quote | null;
  banner: Banner | null;
  isGeneratingQuote: boolean;
  isPurchasing: boolean;
  isSavingDraft: boolean;
  isSendingEmail: boolean;

  setInvoices: (invoices: BillingInvoiceItem[]) => void;
  setPurchaseHistory: (items: PurchaseHistoryItem[]) => void;
  setSubscription: (subscription: BillingSubscriptionItem) => void;
  setChannelQty: (qty: number) => void;
  setVirtualNumberQty: (qty: number) => void;
  setExpectedMonthlyCalls: (calls: number) => void;
  setRoiInputs: (inputs: Partial<RoiInputs>) => void;
  generateQuote: () => Promise<void>;
  purchaseResources: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  downloadQuote: (id: string) => void;
  sendQuoteToEmail: (id: string) => Promise<void>;
  clearBanner: () => void;
};

function hasRequestItems(request: ResourceRequest): boolean {
  return (
    request.channelQty > 0 ||
    request.virtualNumberQty > 0 ||
    request.expectedMonthlyCalls >= 1000
  );
}

function validateRequest(request: ResourceRequest): string | null {
  const channelValidation = validateChannelQuantity(request.channelQty);
  if (!channelValidation.valid) return channelValidation.message ?? null;
  if (!hasRequestItems(request)) {
    return "Add at least one resource or set expected calls to 1,000+ to continue.";
  }
  return null;
}

function buildQuote(
  request: ResourceRequest,
  status: Quote["status"],
): Quote {
  return {
    id: generateQuoteId(),
    createdDate: new Date().toISOString(),
    status,
    request: { ...request },
    pricing: calculatePricingSummary(request),
  };
}

export const useBillingStore = create<BillingStore>((set, get) => ({
  resourceRequest: { ...DEFAULT_RESOURCE_REQUEST },
  roiInputs: {
    expectedCalls: 3000,
    conversionRate: 12,
    avgRevenuePerConversion: 5000,
  },
  quotes: [],
  invoices: [],
  subscription: null,
  purchaseHistory: [],
  activeQuote: null,
  banner: null,
  isGeneratingQuote: false,
  isPurchasing: false,
  isSavingDraft: false,
  isSendingEmail: false,

  setInvoices: (invoices) => set({ invoices }),
  setPurchaseHistory: (purchaseHistory) => set({ purchaseHistory }),
  setSubscription: (subscription) => set({ subscription }),

  setChannelQty: (qty) =>
    set((state) => ({
      resourceRequest: {
        ...state.resourceRequest,
        channelQty: Math.max(0, qty),
      },
    })),

  setVirtualNumberQty: (qty) =>
    set((state) => ({
      resourceRequest: {
        ...state.resourceRequest,
        virtualNumberQty: Math.max(0, qty),
      },
    })),

  setExpectedMonthlyCalls: (calls) =>
    set((state) => ({
      resourceRequest: {
        ...state.resourceRequest,
        expectedMonthlyCalls: Math.max(0, calls),
      },
    })),

  setRoiInputs: (inputs) =>
    set((state) => ({
      roiInputs: { ...state.roiInputs, ...inputs },
    })),

  generateQuote: async () => {
    const { resourceRequest } = get();
    const error = validateRequest(resourceRequest);
    if (error) {
      set({ banner: { type: "error", message: error } });
      return;
    }

    set({ isGeneratingQuote: true, banner: null });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const quote = buildQuote(resourceRequest, "sent");
    set((state) => ({
      quotes: [quote, ...state.quotes],
      activeQuote: quote,
      isGeneratingQuote: false,
      banner: {
        type: "success",
        message: `Quote ${quote.id} generated successfully.`,
      },
    }));
  },

  purchaseResources: async () => {
    const { resourceRequest } = get();
    const error = validateRequest(resourceRequest);
    if (error) {
      set({ banner: { type: "error", message: error } });
      return;
    }

    set({ isPurchasing: true, banner: null });
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const pricing = calculatePricingSummary(resourceRequest);
    const now = new Date().toISOString().split("T")[0];
    const newItems: PurchaseHistoryItem[] = [];

    if (resourceRequest.channelQty > 0) {
      newItems.push({
        id: `pur-${Date.now()}-ch`,
        purchaseDate: now,
        resourceType: "Channels",
        quantity: resourceRequest.channelQty,
        amount: pricing.channelCost,
        status: "completed",
        invoiceId: `INV-${Date.now()}`,
      });
    }

    if (resourceRequest.virtualNumberQty > 0) {
      newItems.push({
        id: `pur-${Date.now()}-vn`,
        purchaseDate: now,
        resourceType: "Virtual Numbers",
        quantity: resourceRequest.virtualNumberQty,
        amount: pricing.virtualNumberCost,
        status: "completed",
        invoiceId: `INV-${Date.now()}-vn`,
      });
    }

    if (resourceRequest.expectedMonthlyCalls >= 1000) {
      newItems.push({
        id: `pur-${Date.now()}-calls`,
        purchaseDate: now,
        resourceType: "Call Capacity",
        quantity: resourceRequest.expectedMonthlyCalls,
        amount: pricing.callCost,
        status: "completed",
        invoiceId: `INV-${Date.now()}-calls`,
      });
    }

    set((state) => ({
      purchaseHistory: [...newItems, ...state.purchaseHistory],
      isPurchasing: false,
      banner: {
        type: "success",
        message: "Resources purchased successfully. Invoice details added to history.",
      },
    }));
  },

  saveAsDraft: async () => {
    const { resourceRequest } = get();
    const channelValidation = validateChannelQuantity(resourceRequest.channelQty);
    if (!channelValidation.valid) {
      set({ banner: { type: "error", message: channelValidation.message! } });
      return;
    }

    set({ isSavingDraft: true, banner: null });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const quote = buildQuote(resourceRequest, "draft");
    set((state) => ({
      quotes: [quote, ...state.quotes],
      activeQuote: quote,
      isSavingDraft: false,
      banner: {
        type: "info",
        message: `Draft saved as ${quote.id}.`,
      },
    }));
  },

  downloadQuote: (id) => {
    const quote = get().quotes.find((q) => q.id === id);
    if (!quote) {
      set({ banner: { type: "error", message: "Quote not found." } });
      return;
    }

    const blob = new Blob([JSON.stringify(quote, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${quote.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    set({
      banner: {
        type: "success",
        message: `Quote ${quote.id} downloaded.`,
      },
    });
  },

  sendQuoteToEmail: async (id) => {
    const quote = get().quotes.find((q) => q.id === id);
    if (!quote) {
      set({ banner: { type: "error", message: "Quote not found." } });
      return;
    }

    set({ isSendingEmail: true, banner: null });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    set({
      isSendingEmail: false,
      banner: {
        type: "success",
        message: `Quote ${quote.id} sent to your registered email.`,
      },
    });
  },

  clearBanner: () => set({ banner: null }),
}));
