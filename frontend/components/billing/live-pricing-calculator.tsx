"use client";

import { useMemo } from "react";

import {
  BILLING_PRICING,
  calculatePricingSummary,
  formatInr,
} from "@/lib/billing-pricing";
import { useBillingStore } from "@/stores/billing-store";

function PricingLine({
  label,
  detail,
  amount,
}: {
  label: string;
  detail?: string;
  amount: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <div>
        <p className="text-foreground">{label}</p>
        {detail ? (
          <p className="mt-0.5 text-xs text-propnex-muted">{detail}</p>
        ) : null}
      </div>
      <p className="shrink-0 font-medium text-foreground">{amount}</p>
    </div>
  );
}

export function LivePricingCalculator() {
  const resourceRequest = useBillingStore((state) => state.resourceRequest);

  const pricing = useMemo(
    () => calculatePricingSummary(resourceRequest),
    [resourceRequest],
  );

  const { channelQty, virtualNumberQty, expectedMonthlyCalls } =
    resourceRequest;

  return (
    <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <h3 className="text-sm font-semibold text-foreground">
        Live Pricing Calculator
      </h3>
      <p className="mt-1 text-xs text-propnex-muted">
        Costs update automatically as you adjust your request.
      </p>

      <div className="mt-5 space-y-4">
        {channelQty > 0 ? (
          <PricingLine
            label="Channel Cost"
            detail={`${channelQty} × ${formatInr(BILLING_PRICING.channels.costPerUnit)}`}
            amount={formatInr(pricing.channelCost)}
          />
        ) : null}

        {virtualNumberQty > 0 ? (
          <PricingLine
            label="Virtual Number Cost"
            detail={`${virtualNumberQty} × ${formatInr(BILLING_PRICING.virtualNumbers.costPerUnit)}`}
            amount={formatInr(pricing.virtualNumberCost)}
          />
        ) : null}

        <div className="border-t border-propnex-border pt-4">
          <PricingLine
            label="Call Usage Cost"
            detail={
              expectedMonthlyCalls > 0
                ? `${expectedMonthlyCalls.toLocaleString("en-IN")} calls — ${pricing.callTier.label}`
                : "No calls estimated"
            }
            amount={formatInr(pricing.callCost)}
          />
          {expectedMonthlyCalls >= 1000 ? (
            <p className="mt-2 rounded-md bg-propnex-accent/10 px-2 py-1 text-xs text-propnex-accent">
              Applied rate: {pricing.callTier.label}
            </p>
          ) : expectedMonthlyCalls > 0 ? (
            <p className="mt-2 text-xs text-propnex-muted">
              No charge for calls below 1,000 per month.
            </p>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-propnex-border pt-4">
          <PricingLine
            label="Subtotal"
            amount={formatInr(pricing.subtotal)}
          />
          <PricingLine
            label={`GST (${BILLING_PRICING.gstRate * 100}%)`}
            amount={formatInr(pricing.gst)}
          />
          <div className="flex items-center justify-between border-t border-propnex-border pt-3">
            <p className="text-base font-semibold text-foreground">
              Grand Total
            </p>
            <p className="text-lg font-bold text-propnex-accent">
              {formatInr(pricing.grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
