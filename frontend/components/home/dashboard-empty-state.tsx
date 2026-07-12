import Link from "next/link";

import { Button } from "@/components/ui/button";

type DashboardEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export function DashboardEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-propnex-border bg-propnex-panel/50 px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-propnex-muted">{description}</p>
      {actionLabel && actionHref ? (
        <Button
          className="mt-4"
          size="sm"
          nativeButton={false}
          render={<Link href={actionHref} />}
        >
          {actionLabel}
        </Button>
      ) : actionLabel && onAction ? (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
