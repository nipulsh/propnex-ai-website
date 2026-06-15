import type { ComponentType } from "react";
import { Gauge, Globe, LineChart } from "lucide-react";

import { PHONE_NUMBER_STATS } from "@/lib/phone-numbers-data";
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

export function PhoneNumbersStats() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        title="Total Call Volume"
        value={PHONE_NUMBER_STATS.totalCallVolume.toLocaleString()}
        footer={PHONE_NUMBER_STATS.volumeTrend}
        icon={LineChart}
        footerClassName="text-success"
        iconClassName="text-cyan-400"
      />
      <StatCard
        title="Average Response Time"
        value={PHONE_NUMBER_STATS.averageResponseTime}
        footer={PHONE_NUMBER_STATS.responseTimeContext}
        icon={Gauge}
        iconClassName="text-propnex-accent"
      />
      <StatCard
        title="Active Regions"
        value={PHONE_NUMBER_STATS.activeRegions}
        footer={PHONE_NUMBER_STATS.regionsContext}
        icon={Globe}
        iconClassName="text-cyan-400"
      />
    </section>
  );
}
