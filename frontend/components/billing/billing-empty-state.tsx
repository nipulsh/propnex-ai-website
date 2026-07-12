import { Button } from "@/components/ui/button";

type BillingEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function BillingEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: BillingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-propnex-border bg-propnex-panel/50 px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-propnex-muted">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
