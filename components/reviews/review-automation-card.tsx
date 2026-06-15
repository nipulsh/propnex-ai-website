import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReviewAutomationCard() {
  return (
    <section className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-propnex-accent/15">
            <Sparkles className="size-5 text-propnex-accent" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Generate Review Request</h3>
            <p className="mt-1 text-sm text-propnex-muted">
              Automate follow-up calls to collect customer feedback after completed
              interactions.
            </p>
          </div>
        </div>
        <Button className="shrink-0 shadow-[0_0_20px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]">
          Set Automation
        </Button>
      </div>
    </section>
  );
}
