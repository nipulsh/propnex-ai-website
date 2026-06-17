"use client";

import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { DashboardSection } from "@/components/common/dashboard-section";
import { ResourceWarningBanner } from "@/components/home/resource-warning-banner";
import { Button } from "@/components/ui/button";
import { useUsageStore } from "@/stores/usage-store";

export function CreditsResourcesSection() {
  const remainingCredits = useUsageStore((s) => s.remainingCredits);
  const totalCredits = useUsageStore((s) => s.totalCredits);

  const creditPercent = Math.round((remainingCredits / totalCredits) * 100);
  const warnings: string[] = [];
  if (creditPercent < 20) {
    warnings.push("Credits Running Low");
  }

  return (
    <DashboardSection
      title="Credits"
      description="Your available calling credits."
    >
      {warnings.length > 0 ? (
        <div className="space-y-2">
          {warnings.map((warning) => (
            <ResourceWarningBanner key={warning} message={warning} />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <StatCard
            title="Available Credits"
            value={remainingCredits.toLocaleString("en-IN")}
            footer="Ready to use for calls and campaigns"
            icon={Coins}
          />
        </div>
        <Button
          className="gap-2 sm:shrink-0"
          nativeButton={false}
          render={<Link href="/billing" />}
        >
          Buy Credits
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </DashboardSection>
  );
}
