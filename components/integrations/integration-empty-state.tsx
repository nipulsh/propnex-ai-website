import { Plug } from "lucide-react";

import { Button } from "@/components/ui/button";

type IntegrationEmptyStateProps = {
  onBrowse?: () => void;
};

export function IntegrationEmptyState({ onBrowse }: IntegrationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-propnex-border bg-propnex-bg px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-propnex-accent/10 text-propnex-accent">
        <Plug className="size-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        No integrations connected
      </h3>
      <p className="mt-2 max-w-sm text-sm text-propnex-muted">
        Connect external services so your AI agents can access spreadsheets,
        calendars, and more during live conversations.
      </p>
      {onBrowse ? (
        <Button className="mt-6" size="sm" onClick={onBrowse}>
          Browse integrations
        </Button>
      ) : null}
    </div>
  );
}
