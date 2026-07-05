"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchAgentsList, updateAgent } from "@/lib/graphql/api";
import { cn } from "@/lib/utils";

type AssignableAgent = {
  id: string;
  name: string;
  type: string;
  branchId: string | null;
};

type AssignAgentDialogProps = {
  open: boolean;
  branchId: string;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
  onNotify: (message: string, type: "success" | "error") => void;
};

export function AssignAgentDialog({
  open,
  branchId,
  onOpenChange,
  onAssigned,
  onNotify,
}: AssignAgentDialogProps) {
  const [agents, setAgents] = useState<AssignableAgent[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelectedId("");
    setIsLoading(true);
    fetchAgentsList()
      .then((res) => {
        const assignable = (res.agents.list as AssignableAgent[]).filter(
          (agent) => agent.branchId !== branchId,
        );
        setAgents(assignable);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Unable to load agents.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [open, branchId]);

  function handleOpenChange(next: boolean) {
    if (!next) setError(null);
    onOpenChange(next);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId) {
      setError("Select an agent to assign.");
      return;
    }

    setIsSaving(true);
    try {
      await updateAgent(selectedId, { branchId });
      const agent = agents.find((a) => a.id === selectedId);
      onNotify(
        `${agent?.name ?? "Agent"} assigned to this branch.`,
        "success",
      );
      handleOpenChange(false);
      onAssigned();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to assign agent.";
      setError(message);
      onNotify(message, "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "max-h-[90vh] overflow-y-auto rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg",
            "transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                Add Agent
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Assign an existing AI agent to this branch.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="assign-agent-select" className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                Agent
              </label>
              {isLoading ? (
                <div className="flex h-10 items-center rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-propnex-muted">
                  Loading agents…
                </div>
              ) : agents.length === 0 ? (
                <div className="rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-propnex-muted">
                  No agents available. Create a new AI agent first.
                </div>
              ) : (
                <select
                  id="assign-agent-select"
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setError(null);
                  }}
                  className="h-10 w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
                >
                  <option value="">Select an agent…</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.type})
                      {agent.branchId ? " — currently in another branch" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="h-10 flex-1 border-propnex-border bg-propnex-bg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isLoading || agents.length === 0}
                className="h-10 flex-1"
              >
                {isSaving ? "Assigning…" : "Assign Agent"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
