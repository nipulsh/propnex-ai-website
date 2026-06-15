"use client";

import { useMemo } from "react";
import {
  Activity,
  Coins,
  Gauge,
  Hash,
  IndianRupee,
  Phone,
  Radio,
  Server,
} from "lucide-react";

import { MetricProgressBar } from "@/components/call-details/metric-progress-bar";
import { StatCard } from "@/components/call-details/stat-card";
import { formatInr } from "@/lib/billing-pricing";
import { INITIAL_RESOURCE_USAGE } from "@/lib/billing-resources-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { useSetupStore } from "@/stores/setup-store";
import { useUsageStore } from "@/stores/usage-store";

export function UsageOverviewSection() {
  const channelUsage = useSetupStore((state) => state.channelUsage);
  const phoneNumbers = usePhoneNumbersStore((state) => state.numbers);
  const usedCredits = useUsageStore((state) => state.usedCredits);
  const totalCredits = useUsageStore((state) => state.totalCredits);
  const moneyUsedInr = useUsageStore((state) => state.moneyUsedInr);
  const monthlyCallsUsed = useUsageStore((state) => state.monthlyCallsUsed);
  const monthlyCallCapacity = useUsageStore(
    (state) => state.monthlyCallCapacity,
  );

  const usage = useMemo(() => {
    const assigned = channelUsage.totalAssigned || INITIAL_RESOURCE_USAGE.channelsAssigned;
    const active = channelUsage.active || INITIAL_RESOURCE_USAGE.channelsActive;
    const available = Math.max(0, assigned - active);
    const virtualNumbers =
      phoneNumbers.length || INITIAL_RESOURCE_USAGE.virtualNumbers;

    return {
      channelsAssigned: assigned,
      channelsActive: active,
      channelsAvailable: available,
      virtualNumbers,
      monthlyCallsUsed,
      monthlyCallCapacity,
      usedCredits,
      totalCredits,
      moneyUsedInr,
    };
  }, [
    channelUsage,
    phoneNumbers.length,
    monthlyCallsUsed,
    monthlyCallCapacity,
    usedCredits,
    totalCredits,
    moneyUsedInr,
  ]);

  const callUtilization = Math.round(
    (usage.monthlyCallsUsed / usage.monthlyCallCapacity) * 100,
  );
  const creditUtilization = Math.round(
    (usage.usedCredits / usage.totalCredits) * 100,
  );

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Credits Used"
          value={usage.usedCredits.toLocaleString("en-IN")}
          footer={`of ${usage.totalCredits.toLocaleString("en-IN")} monthly allocation`}
          icon={Coins}
        />
        <StatCard
          title="Money Spent"
          value={formatInr(usage.moneyUsedInr)}
          footer="Usage charges this billing period"
          icon={IndianRupee}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Channels"
          value={usage.channelsAssigned.toString()}
          footer="Channels assigned to your account"
          icon={Server}
        />
        <StatCard
          title="Active Channels"
          value={usage.channelsActive.toString()}
          footer="Currently in use"
          icon={Activity}
        />
        <StatCard
          title="Available Channels"
          value={usage.channelsAvailable.toString()}
          footer="Ready for new campaigns"
          icon={Radio}
        />
        <StatCard
          title="Virtual Numbers"
          value={usage.virtualNumbers.toString()}
          footer="Provisioned numbers"
          icon={Hash}
        />
        <StatCard
          title="Monthly Calls Used"
          value={usage.monthlyCallsUsed.toLocaleString("en-IN")}
          footer="Calls this billing period"
          icon={Phone}
        />
        <StatCard
          title="Remaining Capacity"
          value={(
            usage.monthlyCallCapacity - usage.monthlyCallsUsed
          ).toLocaleString("en-IN")}
          footer={`of ${usage.monthlyCallCapacity.toLocaleString("en-IN")} monthly capacity`}
          icon={Gauge}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="text-sm font-medium text-foreground">Credit Usage</h3>
          <p className="mt-1 text-xs text-propnex-muted">
            {usage.usedCredits.toLocaleString("en-IN")} of{" "}
            {usage.totalCredits.toLocaleString("en-IN")} credits consumed
          </p>
          <MetricProgressBar
            className="mt-4"
            value={usage.usedCredits}
            max={usage.totalCredits}
            label="Credits"
            barClassName={
              creditUtilization > 80 ? "bg-amber-400" : undefined
            }
          />
        </div>
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="text-sm font-medium text-foreground">
            Channel Utilization
          </h3>
          <p className="mt-1 text-xs text-propnex-muted">
            {usage.channelsActive} of {usage.channelsAssigned} channels active
          </p>
          <MetricProgressBar
            className="mt-4"
            value={usage.channelsActive}
            max={usage.channelsAssigned}
            label="Usage"
          />
        </div>
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <h3 className="text-sm font-medium text-foreground">
            Call Capacity Usage
          </h3>
          <p className="mt-1 text-xs text-propnex-muted">
            {usage.monthlyCallsUsed.toLocaleString("en-IN")} of{" "}
            {usage.monthlyCallCapacity.toLocaleString("en-IN")} calls used
          </p>
          <MetricProgressBar
            className="mt-4"
            value={usage.monthlyCallsUsed}
            max={usage.monthlyCallCapacity}
            label="Monthly usage"
            barClassName={
              callUtilization > 80 ? "bg-amber-400" : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
