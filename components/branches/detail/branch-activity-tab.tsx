"use client";

import { Activity } from "lucide-react";

import type { BranchActivityNode } from "@/lib/graphql/queries";

type BranchActivityTabProps = {
  activities: BranchActivityNode[];
  isLoading: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function BranchActivityTab({
  activities,
  isLoading,
}: BranchActivityTabProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-8 text-center text-sm text-propnex-muted">
        Loading…
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-propnex-border bg-propnex-panel p-10 text-center text-sm text-propnex-muted">
        No activity recorded for this branch yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-propnex-border bg-propnex-panel p-6">
      <ol className="relative space-y-5 border-l border-propnex-border pl-6">
        {activities.map((item) => (
          <li key={item.id} className="relative">
            <span className="absolute -left-[1.9rem] flex size-6 items-center justify-center rounded-full border border-propnex-border bg-propnex-bg text-primary">
              <Activity className="size-3" />
            </span>
            <p className="text-sm font-medium text-foreground">{item.summary}</p>
            <p className="mt-0.5 text-xs text-propnex-muted">
              {item.type} · {formatDate(item.createdAt)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
