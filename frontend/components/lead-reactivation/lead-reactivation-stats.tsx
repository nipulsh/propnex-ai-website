"use client";

import type { ComponentType } from "react";
import { CalendarClock, RefreshCw, Users } from "lucide-react";

import type { DormantLead } from "@/lib/lead-reactivation-data";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  footer: string;
  icon: ComponentType<{ className?: string }>;
  footerClassName?: string;
  iconClassName?: string;
};

function StatCard({
  title,
  value,
  footer,
  icon: Icon,
  footerClassName,
  iconClassName,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-propnex-muted">{title}</p>
        <Icon className={cn("size-5 shrink-0", iconClassName ?? "text-propnex-accent")} />
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className={cn("mt-1 text-sm", footerClassName ?? "text-propnex-muted")}>
        {footer}
      </p>
    </article>
  );
}

type LeadReactivationStatsProps = {
  leads: DormantLead[];
};

export function LeadReactivationStats({ leads }: LeadReactivationStatsProps) {
  const avgInactive =
    leads.length > 0
      ? Math.round(
          leads.reduce((sum, lead) => sum + lead.daysInactive, 0) / leads.length,
        )
      : 0;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        title="Dormant Leads"
        value={leads.length.toLocaleString()}
        footer={`Avg ${avgInactive} days inactive`}
        icon={Users}
        footerClassName="text-orange-400"
        iconClassName="text-orange-400"
      />
      <StatCard
        title="Reactivation Rate"
        value={leads.length > 0 ? "—" : "0%"}
        footer="Based on completed re-engagement calls"
        icon={RefreshCw}
        footerClassName="text-success"
        iconClassName="text-propnex-accent"
      />
      <StatCard
        title="Scheduled Calls"
        value={leads
          .filter((lead) => lead.status === "scheduled")
          .length.toLocaleString()}
        footer="Queued for AI outreach"
        icon={CalendarClock}
        iconClassName="text-cyan-400"
      />
    </section>
  );
}
