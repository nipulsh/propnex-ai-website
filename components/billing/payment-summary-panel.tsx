"use client";

import { useMemo } from "react";
import { Loader2, ShoppingCart } from "lucide-react";

import { LivePricingCalculator } from "@/components/billing/live-pricing-calculator";
import { Button } from "@/components/ui/button";
import {
  BILLING_PRICING,
  calculatePricingSummary,
  formatInr,
  validateChannelQuantity,
} from "@/lib/billing-pricing";
import { useBillingStore } from "@/stores/billing-store";

export function PaymentSummaryPanel() {
  const resourceRequest = useBillingStore((state) => state.resourceRequest);
  const isPurchasing = useBillingStore((state) => state.isPurchasing);
  const isSavingDraft = useBillingStore((state) => state.isSavingDraft);
  const purchaseResources = useBillingStore((state) => state.purchaseResources);
  const saveAsDraft = useBillingStore((state) => state.saveAsDraft);

  const pricing = useMemo(
    () => calculatePricingSummary(resourceRequest),
    [resourceRequest],
  );

  const channelValidation = validateChannelQuantity(resourceRequest.channelQty);
  const hasItems =
    resourceRequest.channelQty > 0 ||
    resourceRequest.virtualNumberQty > 0 ||
    resourceRequest.expectedMonthlyCalls >= 1000;

  const canCheckout = channelValidation.valid && hasItems;

  return (
    <aside className="space-y-4">
      <LivePricingCalculator />

      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-5 text-propnex-accent" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Checkout
          </h2>
        </div>
        <p className="mt-1 text-sm text-propnex-muted">
          Review and complete your resource purchase.
        </p>

        <div className="mt-4 space-y-2 text-sm">
          {resourceRequest.channelQty > 0 ? (
            <div className="flex justify-between">
              <span className="text-propnex-muted">
                {resourceRequest.channelQty} Channels
              </span>
              <span className="text-foreground">
                {formatInr(pricing.channelCost)}
              </span>
            </div>
          ) : null}
          {resourceRequest.virtualNumberQty > 0 ? (
            <div className="flex justify-between">
              <span className="text-propnex-muted">
                {resourceRequest.virtualNumberQty} Virtual Numbers
              </span>
              <span className="text-foreground">
                {formatInr(pricing.virtualNumberCost)}
              </span>
            </div>
          ) : null}
          {resourceRequest.expectedMonthlyCalls >= 1000 ? (
            <div className="flex justify-between">
              <span className="text-propnex-muted">
                {resourceRequest.expectedMonthlyCalls.toLocaleString("en-IN")}{" "}
                Calls/mo
              </span>
              <span className="text-foreground">
                {formatInr(pricing.callCost)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-propnex-border pt-2">
            <span className="text-propnex-muted">
              GST ({BILLING_PRICING.gstRate * 100}%)
            </span>
            <span className="text-foreground">{formatInr(pricing.gst)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-foreground">Final Amount</span>
            <span className="text-propnex-accent">
              {formatInr(pricing.grandTotal)}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Button
            className="w-full"
            onClick={() => purchaseResources()}
            disabled={!canCheckout || isPurchasing || isSavingDraft}
          >
            {isPurchasing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Purchase Resources"
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => saveAsDraft()}
            disabled={isSavingDraft || isPurchasing}
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save As Draft"
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
