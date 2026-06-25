"use client";

import Link from "next/link";
import { Coins, Phone, Radio } from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { Button } from "@/components/ui/button";
import { BILLING_PRICING, formatInr } from "@/lib/billing-pricing";
import { USAGE_RATES } from "@/lib/credit-usage";

const CONTACT_CREDITS_HREF = "/contact?intent=credits";
const CONTACT_CHANNELS_HREF = "/contact?intent=channels";

export function SimplePurchasePanel() {
  const callCostPerMinute =
    USAGE_RATES.creditsPerChannelMinute * USAGE_RATES.inrPerCredit;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Cost per Credit"
          value={`₹${USAGE_RATES.inrPerCredit.toFixed(2)}`}
          footer="Charged per credit consumed"
          icon={Coins}
        />
        <StatCard
          title="Call Cost per Minute"
          value={`₹${callCostPerMinute.toFixed(2)}`}
          footer={`${USAGE_RATES.creditsPerChannelMinute} credits per minute`}
          icon={Phone}
        />
        <StatCard
          title="Channels Cost"
          value={formatInr(BILLING_PRICING.channels.costPerUnit)}
          footer={`Per channel · valid for ${BILLING_PRICING.channels.validityMonths} months`}
          icon={Radio}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          nativeButton={false}
          render={<Link href={CONTACT_CREDITS_HREF} />}
        >
          Add Credits
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={CONTACT_CHANNELS_HREF} />}
        >
          Add Channels
        </Button>
      </div>
    </div>
  );
}
