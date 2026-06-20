"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronDown, Plus, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ToolRegistryEntry } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";
import { useAgentsStore } from "@/stores/agents-store";

type ConfigureToolAgentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: ToolRegistryEntry | null;
};

export function ConfigureToolAgentDialog({
  open,
  onOpenChange,
  tool,
}: ConfigureToolAgentDialogProps) {
  const router = useRouter();
  const agents = useAgentsStore((s) => s.agents);
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id ?? "");

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSelectedAgentId(agents[0]?.id ?? "");
    }
    onOpenChange(nextOpen);
  }

  function handleContinue() {
    if (!selectedAgentId) return;
    onOpenChange(false);
    router.push(`/agents/${selectedAgentId}#tools`);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg",
            "transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                Configure {tool?.name ?? "tool"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Choose which agent should use this capability during live calls.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-propnex-muted"
                />
              }
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {agents.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-propnex-muted">
                Create an agent first, then enable and configure tools on its
                detail page.
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/agents/create" />}
                className="h-11 w-full gap-2"
                onClick={() => onOpenChange(false)}
              >
                <Plus className="size-4" />
                Create agent
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="configure-tool-agent-select"
                  className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
                >
                  Agent
                </label>
                <div className="relative">
                  <select
                    id="configure-tool-agent-select"
                    value={selectedAgentId}
                    onChange={(event) => setSelectedAgentId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg py-2 pr-10 pl-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-11 flex-1 border-propnex-border bg-propnex-bg"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedAgentId}
                  className="h-11 flex-1"
                >
                  Continue
                </Button>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
