import type { ComponentType } from "react";
import { CalendarClock, RefreshCw, Users } from "lucide-react";

import { LEAD_REACTIVATION_STATS } from "@/lib/lead-reactivation-data";
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

export function LeadReactivationStats() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        title="Dormant Leads"
        value={LEAD_REACTIVATION_STATS.dormantLeads.toLocaleString()}
        footer={LEAD_REACTIVATION_STATS.dormantTrend}
        icon={Users}
        footerClassName="text-orange-400"
        iconClassName="text-orange-400"
      />
      <StatCard
        title="Reactivation Rate"
        value={LEAD_REACTIVATION_STATS.reactivationRate}
        footer={LEAD_REACTIVATION_STATS.rateTrend}
        icon={RefreshCw}
        footerClassName="text-success"
        iconClassName="text-propnex-accent"
      />
      <StatCard
        title="Scheduled Calls"
        value={LEAD_REACTIVATION_STATS.scheduledCalls.toLocaleString()}
        footer={LEAD_REACTIVATION_STATS.scheduledContext}
        icon={CalendarClock}
        iconClassName="text-cyan-400"
      />
    </section>
  );
}
