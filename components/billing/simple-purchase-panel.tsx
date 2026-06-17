"use client";

import { useMemo, useState } from "react";
import { Coins, Hash, Radio } from "lucide-react";

import { BillingSection } from "@/components/billing/billing-section";
import { QuantityStepper } from "@/components/billing/quantity-stepper";
import { StatCard } from "@/components/call-details/stat-card";
import { Button } from "@/components/ui/button";
import {
  BILLING_PRICING,
  calculateChannelCost,
  calculateVirtualNumberCost,
  formatInr,
  validateChannelQuantity,
} from "@/lib/billing-pricing";
import { useBillingStore } from "@/stores/billing-store";
import { useUsageStore } from "@/stores/usage-store";

const CREDITS_PER_PACK = 5000;
const CREDIT_PACK_PRICE = 1500;

export function SimplePurchasePanel() {
  const remainingCredits = useUsageStore((s) => s.remainingCredits);
  const addCredits = useUsageStore((s) => s.addCredits);
  const channelQty = useBillingStore((s) => s.resourceRequest.channelQty);
  const virtualNumberQty = useBillingStore(
    (s) => s.resourceRequest.virtualNumberQty,
  );
  const setChannelQty = useBillingStore((s) => s.setChannelQty);
  const setVirtualNumberQty = useBillingStore((s) => s.setVirtualNumberQty);
  const purchaseHistory = useBillingStore((s) => s.purchaseHistory);
  const setPurchaseHistory = useBillingStore.setState;
  const [creditPacks, setCreditPacks] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const totals = useMemo(() => {
    const channelCost = calculateChannelCost(channelQty);
    const numberCost = calculateVirtualNumberCost(virtualNumberQty);
    const creditCost = creditPacks * CREDIT_PACK_PRICE;
    const subtotal = channelCost + numberCost + creditCost;
    const gst = Math.round(subtotal * BILLING_PRICING.gstRate);
    return { subtotal, gst, grandTotal: subtotal + gst };
  }, [channelQty, virtualNumberQty, creditPacks]);

  const channelValidation = validateChannelQuantity(channelQty);
  const canPurchase =
    channelValidation.valid &&
    (channelQty > 0 || virtualNumberQty > 0 || creditPacks > 0);

  async function handlePurchase() {
    if (!canPurchase) return;
    setIsPurchasing(true);
    await new Promise((r) => setTimeout(r, 600));

    if (creditPacks > 0) {
      addCredits(creditPacks * CREDITS_PER_PACK);
    }

    const items: { type: string; qty: number; amount: number }[] = [];
    if (channelQty > 0) {
      items.push({
        type: "Channels",
        qty: channelQty,
        amount: calculateChannelCost(channelQty),
      });
    }
    if (virtualNumberQty > 0) {
      items.push({
        type: "Virtual Numbers",
        qty: virtualNumberQty,
        amount: calculateVirtualNumberCost(virtualNumberQty),
      });
    }
    if (creditPacks > 0) {
      items.push({
        type: "Credits",
        qty: creditPacks * CREDITS_PER_PACK,
        amount: creditPacks * CREDIT_PACK_PRICE,
      });
    }

    const newHistory = items.map((item, index) => ({
      id: `pur-${Date.now()}-${index}`,
      purchaseDate: new Date().toISOString(),
      resourceType: item.type,
      quantity: item.qty,
      amount: item.amount,
      status: "completed" as const,
      invoiceId: `INV-${Date.now().toString(36).toUpperCase()}`,
    }));

    setPurchaseHistory((state) => ({
      purchaseHistory: [...newHistory, ...state.purchaseHistory],
      banner: {
        type: "success" as const,
        message: "Purchase completed successfully.",
      },
    }));

    setChannelQty(0);
    setVirtualNumberQty(0);
    setCreditPacks(0);
    setIsPurchasing(false);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <BillingSection
          title="Credits"
          description="Purchase calling credits for your campaigns."
        >
          <StatCard
            title="Available Credits"
            value={remainingCredits.toLocaleString("en-IN")}
            icon={Coins}
            footer="Use credits for outbound calls and campaigns"
          />
          <div className="mt-4 flex items-center justify-between rounded-xl border border-propnex-border bg-propnex-panel p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Credit Packs</p>
              <p className="text-xs text-propnex-muted">
                {CREDITS_PER_PACK.toLocaleString()} credits ·{" "}
                {formatInr(CREDIT_PACK_PRICE)} each
              </p>
            </div>
            <QuantityStepper
              value={creditPacks}
              onChange={setCreditPacks}
              min={0}
              max={20}
            />
          </div>
        </BillingSection>

        <BillingSection
          title="Channels"
          description={`₹${BILLING_PRICING.channels.costPerUnit} per channel · min ${BILLING_PRICING.channels.minPurchase}`}
        >
          <div className="flex items-center justify-between rounded-xl border border-propnex-border bg-propnex-panel p-4">
            <div className="flex items-center gap-3">
              <Radio className="size-5 text-propnex-accent" />
              <p className="text-sm font-medium text-foreground">Channels</p>
            </div>
            <QuantityStepper
              value={channelQty}
              onChange={setChannelQty}
              min={0}
              max={50}
            />
          </div>
          {!channelValidation.valid ? (
            <p className="text-sm text-destructive">{channelValidation.message}</p>
          ) : null}
        </BillingSection>

        <BillingSection
          title="Virtual Numbers"
          description={`₹${BILLING_PRICING.virtualNumbers.costPerUnit} per number`}
        >
          <div className="flex items-center justify-between rounded-xl border border-propnex-border bg-propnex-panel p-4">
            <div className="flex items-center gap-3">
              <Hash className="size-5 text-propnex-accent" />
              <p className="text-sm font-medium text-foreground">
                Virtual Numbers
              </p>
            </div>
            <QuantityStepper
              value={virtualNumberQty}
              onChange={setVirtualNumberQty}
              min={0}
              max={20}
            />
          </div>
        </BillingSection>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-propnex-muted">
              <dt>Subtotal</dt>
              <dd>{formatInr(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-propnex-muted">
              <dt>GST (18%)</dt>
              <dd>{formatInr(totals.gst)}</dd>
            </div>
            <div className="flex justify-between border-t border-propnex-border pt-2 font-semibold text-foreground">
              <dt>Total</dt>
              <dd>{formatInr(totals.grandTotal)}</dd>
            </div>
          </dl>
          <Button
            className="mt-5 w-full"
            disabled={!canPurchase || isPurchasing}
            onClick={() => void handlePurchase()}
          >
            {isPurchasing ? "Processing…" : "Purchase"}
          </Button>
        </div>
      </div>
    </div>
  );
}
