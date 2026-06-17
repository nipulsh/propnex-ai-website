"use client";

import { Clock } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";

export function LeadReactivationPageContent() {
  return (
    <div className="propnex-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-6 pb-6">
      <PageHeader
        title="Lead Reactivation"
        description="Re-engage dormant leads with automated AI voice outreach."
      />

      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-propnex-border bg-propnex-panel/50 px-6 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-propnex-accent/10">
          <Clock className="size-8 text-propnex-accent" />
        </div>
        <span className="mt-6 inline-flex rounded-full border border-propnex-border bg-propnex-panel px-3 py-1 text-xs font-medium text-propnex-accent">
          Coming Soon
        </span>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Lead reactivation workflows are on the way
        </h2>
        <p className="mt-2 max-w-md text-sm text-propnex-muted">
          Soon you&apos;ll be able to identify dormant leads, launch re-engagement
          campaigns, and track conversions — all powered by PropNex AI agents.
        </p>
      </div>
    </div>
  );
}
