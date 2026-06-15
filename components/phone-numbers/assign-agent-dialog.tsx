"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronDown, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAgentsStore } from "@/stores/agents-store";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";

type AssignAgentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumberId: string;
  direction: "inbound" | "outbound";
  currentAgentId: string;
};

export function AssignAgentDialog({
  open,
  onOpenChange,
  phoneNumberId,
  direction,
  currentAgentId,
}: AssignAgentDialogProps) {
  const agents = useAgentsStore((s) => s.agents);
  const setInboundAgent = usePhoneNumbersStore((s) => s.setInboundAgent);
  const setOutboundAgent = usePhoneNumbersStore((s) => s.setOutboundAgent);
  const [selectedAgentId, setSelectedAgentId] = useState(
    currentAgentId || agents[0]?.id || "",
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSelectedAgentId(currentAgentId || agents[0]?.id || "");
    }
    onOpenChange(nextOpen);
  }

  function handleAssign() {
    const agent = agents.find((entry) => entry.id === selectedAgentId);
    if (!agent) return;

    if (direction === "inbound") {
      setInboundAgent(phoneNumberId, agent.id, agent.name);
    } else {
      setOutboundAgent(phoneNumberId, agent.id, agent.name);
    }
    onOpenChange(false);
  }

  const title =
    direction === "inbound" ? "Change Inbound Agent" : "Change Outbound Agent";

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
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Select an AI voice agent for {direction} calls on this number.
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

          <div className="space-y-2">
            <label
              htmlFor="assign-agent-direction-select"
              className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
            >
              Agent
            </label>
            <div className="relative">
              <select
                id="assign-agent-direction-select"
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
            <Button type="button" onClick={handleAssign} className="h-11 flex-1">
              Assign
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
