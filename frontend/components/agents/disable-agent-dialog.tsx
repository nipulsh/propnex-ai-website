"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlertTriangle, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type DisableAgentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  onConfirm: () => void;
};

export function DisableAgentDialog({
  open,
  onOpenChange,
  agentName,
  onConfirm,
}: DisableAgentDialogProps) {
  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                  Disable {agentName}?
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-2 text-sm text-propnex-muted">
                  Disabling this agent may affect inbound and outbound call
                  routing and active workflows. Calls assigned to this agent may
                  fail or be rerouted. Confirm only if you intend to stop this
                  agent from handling calls.
                </DialogPrimitive.Description>
              </div>
            </div>
            <DialogPrimitive.Close
              className="rounded-lg p-1 text-propnex-muted transition-colors hover:bg-propnex-bg hover:text-foreground"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="mt-6 flex gap-3">
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
              onClick={handleConfirm}
              className="h-11 flex-1 bg-destructive text-white hover:bg-destructive/90"
            >
              Disable Agent
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
