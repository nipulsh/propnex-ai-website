"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ToolRegistryEntry } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";
import { useAgentsStore } from "@/stores/agents-store";

type AgentToolCatalogCardProps = {
  tool: ToolRegistryEntry;
  onConfigure: () => void;
};

export function AgentToolCatalogCard({
  tool,
  onConfigure,
}: AgentToolCatalogCardProps) {
  const router = useRouter();
  const agents = useAgentsStore((s) => s.agents);
  const Icon = tool.icon;

  function handleConfigure() {
    if (agents.length === 0) {
      router.push("/agents/library");
      return;
    }
    if (agents.length === 1) {
      router.push(`/agents/${agents[0].id}#tools`);
      return;
    }
    onConfigure();
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleConfigure}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleConfigure();
        }
      }}
      className={cn(
        "group flex cursor-pointer flex-col rounded-xl border border-propnex-border bg-propnex-panel p-5",
        "transition-colors hover:border-propnex-accent/40 hover:bg-propnex-panel/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-propnex-accent/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-propnex-accent/15 text-propnex-accent transition-colors group-hover:bg-propnex-accent/25">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground">{tool.name}</h3>
          <p className="mt-1 text-sm text-propnex-muted">{tool.description}</p>
          <ul className="mt-2 space-y-0.5">
            {tool.examples.slice(0, 3).map((ex) => (
              <li
                key={ex}
                className="text-xs text-propnex-muted before:mr-1 before:content-['•']"
              >
                {ex}
              </li>
            ))}
          </ul>
          {tool.requiredIntegrationId ? (
            <p className="mt-3 text-xs text-propnex-muted">
              Requires a connected{" "}
              <Link
                href="/settings"
                onClick={(event) => event.stopPropagation()}
                className="text-propnex-accent hover:underline"
              >
                workspace integration
              </Link>
              .
            </p>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-fit gap-1.5"
        onClick={(event) => {
          event.stopPropagation();
          handleConfigure();
        }}
      >
        <Settings2 className="size-3.5" />
        Configure on agent
      </Button>
    </article>
  );
}
