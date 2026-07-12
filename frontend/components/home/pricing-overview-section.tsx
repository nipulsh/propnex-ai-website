"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CreditCard, IndianRupee, Layers } from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { MetricProgressBar } from "@/components/call-details/metric-progress-bar";
import { DashboardSection } from "@/components/common/dashboard-section";
import { formatInr } from "@/lib/billing-pricing";
import { billingSummary } from "@/lib/billing-data";
import { INITIAL_RESOURCE_USAGE } from "@/lib/billing-resources-data";
import { Button } from "@/components/ui/button";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { useSetupStore } from "@/stores/setup-store";
import { useUsageStore } from "@/stores/usage-store";

export function PricingOverviewSection() {
  const channelUsage = useSetupStore((s) => s.channelUsage);
  const phoneNumbers = usePhoneNumbersStore((s) => s.numbers);
  const usedCredits = useUsageStore((s) => s.usedCredits);
  const totalCredits = useUsageStore((s) => s.totalCredits);
  const moneyUsedInr = useUsageStore((s) => s.moneyUsedInr);
  const monthlyCallsUsed = useUsageStore((s) => s.monthlyCallsUsed);
  const monthlyCallCapacity = useUsageStore((s) => s.monthlyCallCapacity);
  const activePlan = useUsageStore((s) => s.activePlan);

  const usage = useMemo(() => {
    const channelsAssigned =
      channelUsage.totalChannels || INITIAL_RESOURCE_USAGE.channelsAssigned;
    const channelsActive =
      INITIAL_RESOURCE_USAGE.channelsActive;
    const virtualNumbers =
      phoneNumbers.length || INITIAL_RESOURCE_USAGE.virtualNumbers;

    return {
      channelsAssigned,
      channelsActive,
      virtualNumbers,
      channelPercent: Math.round((channelsActive / channelsAssigned) * 100),
      callsPercent: Math.round((monthlyCallsUsed / monthlyCallCapacity) * 100),
      creditsPercent: Math.round((usedCredits / totalCredits) * 100),
    };
  }, [channelUsage, phoneNumbers.length, monthlyCallsUsed, monthlyCallCapacity, usedCredits, totalCredits]);

  return (
    <DashboardSection
      title="Pricing Overview"
      description="Account pricing tier and resource consumption summary."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Current Pricing Tier"
          value={activePlan}
          footer={`Renews ${billingSummary.resetDate}`}
          icon={Layers}
        />
        <StatCard
          title="Estimated Monthly Spend"
          value={formatInr(moneyUsedInr)}
          footer={`Next invoice: ${billingSummary.nextInvoiceAmount}`}
          icon={IndianRupee}
        />
      </div>

      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <h3 className="mb-4 text-sm font-medium text-foreground">
          Resource Consumption
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MetricProgressBar
            label="Channels"
            value={usage.channelsActive}
            max={usage.channelsAssigned}
            showValue
          />
          <MetricProgressBar
            label="Virtual Numbers"
            value={usage.virtualNumbers}
            max={Math.max(usage.virtualNumbers, 10)}
            showValue
          />
          <MetricProgressBar
            label="Calls This Month"
            value={monthlyCallsUsed}
            max={monthlyCallCapacity}
            showValue
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2 sm:w-auto"
        nativeButton={false}
        render={<Link href="/billing" />}
      >
        <CreditCard className="size-4" />
        View Full Billing Details
        <ArrowRight className="size-4" />
      </Button>
    </DashboardSection>
  );
}
