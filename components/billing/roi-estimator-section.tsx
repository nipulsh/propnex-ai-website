"use client";

import { useMemo } from "react";
import { AlertCircle, TrendingUp, Users, Wallet } from "lucide-react";

import { StatCard } from "@/components/call-details/stat-card";
import { calculateRoi, formatInr } from "@/lib/billing-pricing";
import { useBillingStore } from "@/stores/billing-store";
import { Input } from "@/components/ui/input";

export function RoiEstimatorSection() {
  const roiInputs = useBillingStore((state) => state.roiInputs);
  const setRoiInputs = useBillingStore((state) => state.setRoiInputs);

  const projection = useMemo(
    () =>
      calculateRoi({
        calls: roiInputs.expectedCalls,
        conversionRate: roiInputs.conversionRate,
        avgRevenuePerConversion: roiInputs.avgRevenuePerConversion,
      }),
    [roiInputs],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <label
            htmlFor="roi-calls"
            className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
          >
            Expected Calls
          </label>
          <Input
            id="roi-calls"
            type="number"
            min={0}
            value={roiInputs.expectedCalls}
            onChange={(e) =>
              setRoiInputs({
                expectedCalls: parseInt(e.target.value, 10) || 0,
              })
            }
            className="mt-2"
          />
        </div>
        <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
          <label
            htmlFor="roi-conversion"
            className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
          >
            Estimated Conversion Rate (%)
          </label>
          <Input
            id="roi-conversion"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={roiInputs.conversionRate}
            onChange={(e) =>
              setRoiInputs({
                conversionRate: parseFloat(e.target.value) || 0,
              })
            }
            className="mt-2"
          />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Expected Leads"
          value={projection.expectedLeads.toLocaleString("en-IN")}
          footer="Based on 35% lead rate"
          icon={Users}
        />
        <StatCard
          title="Estimated Conversions"
          value={projection.estimatedConversions.toLocaleString("en-IN")}
          footer={`At ${roiInputs.conversionRate}% conversion`}
          icon={TrendingUp}
        />
        <StatCard
          title="Revenue Potential"
          value={formatInr(projection.estimatedRevenue)}
          footer={`At ${formatInr(roiInputs.avgRevenuePerConversion)} per conversion`}
          icon={Wallet}
        />
      </section>

      <p className="flex items-start gap-2 rounded-lg border border-propnex-border bg-propnex-panel/50 px-4 py-3 text-xs text-propnex-muted">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        These projections are estimates only and do not guarantee business
        outcomes. Actual results depend on campaign quality, market conditions,
        and agent performance.
      </p>
    </div>
  );
}
