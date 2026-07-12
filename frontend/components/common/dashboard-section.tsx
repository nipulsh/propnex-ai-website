import type { ReactNode } from "react";

type DashboardSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  id?: string;
  action?: ReactNode;
};

export function DashboardSection({
  title,
  description,
  children,
  id,
  action,
}: DashboardSectionProps) {
  return (
    <section id={id} className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-propnex-muted">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
