import type { LucideIcon } from "lucide-react";
import { BadgeCheck, CalendarDays } from "lucide-react";

import { billingSummary } from "@/lib/billing-data";

function InfoCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="min-w-0">
        <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
          {label}
        </p>
        <p className="mt-1 truncate text-lg font-semibold text-foreground">
          {value}
        </p>
        {subtext ? (
          <p className="mt-0.5 text-sm text-propnex-muted">{subtext}</p>
        ) : null}
      </div>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-propnex-border bg-[color-mix(in_srgb,var(--propnex-accent)_8%,var(--propnex-panel))] text-propnex-accent">
        <Icon className="size-5" />
      </div>
    </div>
  );
}

export function BillingPlanCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <InfoCard
        label="Active Plan"
        value={billingSummary.activePlan}
        icon={BadgeCheck}
      />
      <InfoCard
        label="Next Invoice"
        value={billingSummary.nextInvoiceAmount}
        subtext={`Due ${billingSummary.nextInvoiceDue}`}
        icon={CalendarDays}
      />
    </div>
  );
}
