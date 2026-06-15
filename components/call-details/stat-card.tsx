import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  footer?: string;
  icon?: ComponentType<{ className?: string }>;
  footerClassName?: string;
  iconClassName?: string;
  badge?: React.ReactNode;
};

export function StatCard({
  title,
  value,
  footer,
  icon: Icon,
  footerClassName,
  iconClassName,
  badge,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-propnex-muted">{title}</p>
        {Icon ? (
          <Icon
            className={cn(
              "size-5 shrink-0",
              iconClassName ?? "text-propnex-accent",
            )}
          />
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        {badge}
      </div>
      {footer ? (
        <p
          className={cn(
            "mt-1 text-sm",
            footerClassName ?? "text-propnex-muted",
          )}
        >
          {footer}
        </p>
      ) : null}
    </article>
  );
}
