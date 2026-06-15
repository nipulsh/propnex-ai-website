"use client";

import { BILLING_PRICING, formatInr, validateChannelQuantity } from "@/lib/billing-pricing";
import { useBillingStore } from "@/stores/billing-store";

import { AddonResourceCards } from "@/components/billing/addon-resource-cards";
import { QuantityStepper } from "@/components/billing/quantity-stepper";
import { Input } from "@/components/ui/input";

export function ResourceRequestBuilder() {
  const channelQty = useBillingStore((state) => state.resourceRequest.channelQty);
  const virtualNumberQty = useBillingStore(
    (state) => state.resourceRequest.virtualNumberQty,
  );
  const expectedMonthlyCalls = useBillingStore(
    (state) => state.resourceRequest.expectedMonthlyCalls,
  );
  const setChannelQty = useBillingStore((state) => state.setChannelQty);
  const setVirtualNumberQty = useBillingStore(
    (state) => state.setVirtualNumberQty,
  );
  const setExpectedMonthlyCalls = useBillingStore(
    (state) => state.setExpectedMonthlyCalls,
  );

  const channelValidation = validateChannelQuantity(channelQty);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <h3 className="text-sm font-semibold text-foreground">Channels</h3>
        <p className="mt-1 text-xs text-propnex-muted">
          Concurrent call channels for AI voice operations.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QuantityStepper value={channelQty} onChange={setChannelQty} />
          <div className="text-right text-sm">
            <p className="text-propnex-muted">
              {formatInr(BILLING_PRICING.channels.costPerUnit)} per channel
            </p>
            <p className="text-propnex-muted">
              Validity: {BILLING_PRICING.channels.validityMonths} months
            </p>
          </div>
        </div>

        {!channelValidation.valid ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {channelValidation.message}
          </p>
        ) : channelQty === 0 ? (
          <p className="mt-3 text-xs text-propnex-muted">
            Minimum purchase: {BILLING_PRICING.channels.minPurchase} channels
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <h3 className="text-sm font-semibold text-foreground">
          Virtual Numbers
        </h3>
        <p className="mt-1 text-xs text-propnex-muted">
          Dedicated phone numbers for inbound and outbound calls.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QuantityStepper
            value={virtualNumberQty}
            onChange={setVirtualNumberQty}
          />
          <p className="text-sm text-propnex-muted">
            {formatInr(BILLING_PRICING.virtualNumbers.costPerUnit)} per number
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <h3 className="text-sm font-semibold text-foreground">
          Expected Monthly Calls
        </h3>
        <p className="mt-1 text-xs text-propnex-muted">
          Estimate your monthly call volume for cost planning.
        </p>

        <div className="mt-4 space-y-4">
          <Input
            type="number"
            min={0}
            max={50000}
            value={expectedMonthlyCalls}
            onChange={(e) =>
              setExpectedMonthlyCalls(parseInt(e.target.value, 10) || 0)
            }
            className="max-w-[200px]"
          />
          <input
            type="range"
            min={0}
            max={15000}
            step={100}
            value={Math.min(expectedMonthlyCalls, 15000)}
            onChange={(e) =>
              setExpectedMonthlyCalls(parseInt(e.target.value, 10))
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color-mix(in_srgb,var(--propnex-muted)_20%,var(--propnex-panel))] accent-propnex-accent"
          />
          <div className="flex justify-between text-xs text-propnex-muted">
            <span>0</span>
            <span>15,000+</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Additional Resources
        </h3>
        <AddonResourceCards />
      </div>
    </div>
  );
}
