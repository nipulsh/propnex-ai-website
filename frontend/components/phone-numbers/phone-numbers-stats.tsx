"use client";

import { Phone, PhoneCall, PhoneIncoming } from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { computePhoneNumberListStats } from "@/lib/phone-numbers-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

export function PhoneNumbersStats() {
  const numbers = usePhoneNumbersStore((state) => state.numbers);
  const stats = computePhoneNumberListStats(numbers);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Numbers"
        value={stats.totalNumbers.toString()}
        footer={`${stats.activeCount} active`}
        icon={Phone}
      />
      <StatCard
        title="Total Inbound Calls"
        value={stats.totalInbound.toLocaleString()}
        footer="Across all numbers"
        icon={PhoneIncoming}
      />
      <StatCard
        title="Total Outbound Calls"
        value={stats.totalOutbound.toLocaleString()}
        footer="Across all numbers"
        icon={PhoneCall}
      />
      <StatCard
        title="Combined Volume"
        value={stats.totalCalls.toLocaleString()}
        footer="Inbound + outbound"
        icon={Phone}
      />
    </section>
  );
}
