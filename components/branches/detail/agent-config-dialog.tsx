"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateAgent } from "@/lib/graphql/api";
import type { BranchAgentNode } from "@/lib/graphql/queries";
import { cn } from "@/lib/utils";

type AgentConfigDialogProps = {
  open: boolean;
  agent: BranchAgentNode | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (agentId: string, systemPrompt: string | null) => void;
  onNotify: (message: string, type: "success" | "error") => void;
};

export function AgentConfigDialog({
  open,
  agent,
  onOpenChange,
  onSaved,
  onNotify,
}: AgentConfigDialogProps) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && agent) {
      setSystemPrompt(agent.systemPrompt ?? "");
    }
  }, [open, agent]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
  }

  async function handleSavePrompt() {
    if (!agent) return;
    setIsSaving(true);
    try {
      const trimmed = systemPrompt.trim() || null;
      await updateAgent(agent.id, { systemPrompt: trimmed });
      onNotify(`${agent.name}'s prompt updated.`, "success");
      onSaved(agent.id, trimmed);
      handleOpenChange(false);
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : "Unable to save prompt.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!agent) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2",
            "max-h-[90vh] overflow-y-auto rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg",
            "transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                Configure {agent.name}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                This prompt is unique to this agent and controls its
                behavior.
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

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="agent-system-prompt"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                System Prompt
              </label>
              <textarea
                id="agent-system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={14}
                placeholder="You are the AI assistant for this agent…"
                className="w-full resize-y rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-propnex-muted focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="h-10 border-propnex-border bg-propnex-bg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleSavePrompt()}
                disabled={isSaving}
                className="h-10"
              >
                {isSaving ? "Saving…" : "Save Prompt"}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
