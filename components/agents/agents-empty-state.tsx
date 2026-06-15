import Link from "next/link";
import { Bot, Library, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type AgentsEmptyStateProps = {
  hasFilters: boolean;
};

export function AgentsEmptyState({ hasFilters }: AgentsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-propnex-border bg-propnex-panel/50 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-propnex-accent/15">
        <Bot className="size-7 text-propnex-accent" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {hasFilters ? "No agents match your filters" : "No agents yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-propnex-muted">
        {hasFilters
          ? "Try adjusting your search or filter criteria to find agents."
          : "Create a custom agent or deploy a ready-made template from the Agent Library."}
      </p>
      {!hasFilters ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/agents/create" />}
            className="gap-2"
          >
            <Plus className="size-4" />
            Create Agent
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/agents/library" />}
            variant="outline"
            className="gap-2 border-propnex-border bg-propnex-panel"
          >
            <Library className="size-4" />
            Open Agent Library
          </Button>
        </div>
      ) : null}
    </div>
  );
}
