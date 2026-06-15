"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Coins, Hash, Phone, Radio } from "lucide-react";

import { MetricProgressBar } from "@/components/call-details/metric-progress-bar";
import { StatCard } from "@/components/call-details/stat-card";
import { DashboardSection } from "@/components/common/dashboard-section";
import { ResourceWarningBanner } from "@/components/home/resource-warning-banner";
import { INITIAL_RESOURCE_USAGE } from "@/lib/billing-resources-data";
import { Button } from "@/components/ui/button";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { useSetupStore } from "@/stores/setup-store";
import { useUsageStore } from "@/stores/usage-store";

export function CreditsResourcesSection() {
  const channelUsage = useSetupStore((s) => s.channelUsage);
  const phoneNumbers = usePhoneNumbersStore((s) => s.numbers);
  const remainingCredits = useUsageStore((s) => s.remainingCredits);
  const totalCredits = useUsageStore((s) => s.totalCredits);
  const monthlyCallsUsed = useUsageStore((s) => s.monthlyCallsUsed);
  const monthlyCallCapacity = useUsageStore((s) => s.monthlyCallCapacity);

  const usage = useMemo(() => {
    const channelsAssigned =
      channelUsage.totalAssigned || INITIAL_RESOURCE_USAGE.channelsAssigned;
    const channelsActive =
      channelUsage.active || INITIAL_RESOURCE_USAGE.channelsActive;
    const virtualNumbers =
      phoneNumbers.length || INITIAL_RESOURCE_USAGE.virtualNumbers;
    const virtualCapacity = Math.max(virtualNumbers, 10);

    return {
      channelsAssigned,
      channelsActive,
      virtualNumbers,
      virtualCapacity,
      creditPercent: Math.round((remainingCredits / totalCredits) * 100),
      channelPercent: Math.round((channelsActive / channelsAssigned) * 100),
    };
  }, [channelUsage, phoneNumbers.length, remainingCredits, totalCredits]);

  const warnings: string[] = [];
  if (usage.creditPercent < 20) {
    warnings.push("Credits Running Low");
  }
  if (usage.channelPercent >= 80) {
    warnings.push("Channels Near Capacity");
  }
  if (usage.virtualNumbers >= usage.virtualCapacity) {
    warnings.push("Virtual Numbers Fully Assigned");
  }

  return (
    <DashboardSection
      title="Credits & Resources"
      description="Monitor available credits and resource utilization."
    >
      {warnings.length > 0 ? (
        <div className="space-y-2">
          {warnings.map((warning) => (
            <ResourceWarningBanner key={warning} message={warning} />
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Available Credits"
          value={remainingCredits.toLocaleString("en-IN")}
          footer={`of ${totalCredits.toLocaleString("en-IN")} total`}
          icon={Coins}
        />
        <StatCard
          title="Calls Consumed"
          value={monthlyCallsUsed.toLocaleString("en-IN")}
          footer={`of ${monthlyCallCapacity.toLocaleString("en-IN")} monthly capacity`}
          icon={Phone}
        />
        <StatCard
          title="Channels Assigned"
          value={`${usage.channelsActive} / ${usage.channelsAssigned}`}
          footer="Active / total assigned"
          icon={Radio}
        />
        <StatCard
          title="Virtual Numbers"
          value={String(usage.virtualNumbers)}
          footer="Numbers in use"
          icon={Hash}
        />
      </div>

      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <MetricProgressBar
            label="Credit Balance"
            value={remainingCredits}
            max={totalCredits}
            showValue
            barClassName={
              usage.creditPercent < 20 ? "bg-destructive" : undefined
            }
          />
          <MetricProgressBar
            label="Channel Utilization"
            value={usage.channelsActive}
            max={usage.channelsAssigned}
            showValue
            barClassName={
              usage.channelPercent >= 80 ? "bg-orange-400" : undefined
            }
          />
          <MetricProgressBar
            label="Virtual Numbers"
            value={usage.virtualNumbers}
            max={usage.virtualCapacity}
            showValue
          />
          <MetricProgressBar
            label="Monthly Calls"
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
        Manage Resources
        <ArrowRight className="size-4" />
      </Button>
    </DashboardSection>
  );
}
