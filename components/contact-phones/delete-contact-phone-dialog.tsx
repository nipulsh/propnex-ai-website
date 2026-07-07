"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlertTriangle, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteContactPhoneDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  phoneLabel?: string;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeleteContactPhoneDialog({
  open,
  onOpenChange,
  count,
  phoneLabel,
  onConfirm,
  isDeleting = false,
}: DeleteContactPhoneDialogProps) {
  const isBulk = count > 1;
  const title = isBulk
    ? `Delete ${count} contacts?`
    : `Delete ${phoneLabel ?? "this contact"}?`;

  const description = isBulk
    ? "This will permanently remove the selected phone numbers from your list. This action cannot be undone."
    : "This will permanently remove this phone number from your list. This action cannot be undone.";

  function handleConfirm() {
    onConfirm();
  }

  function handleOpenChange(next: boolean) {
    if (isDeleting) return;
    onOpenChange(next);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
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
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-2 text-sm text-propnex-muted">
                  {description}
                </DialogPrimitive.Description>
              </div>
            </div>
            <DialogPrimitive.Close
              disabled={isDeleting}
              className="rounded-lg p-1 text-propnex-muted transition-colors hover:bg-propnex-bg hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
              className="h-11 flex-1 border-propnex-border bg-propnex-bg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="h-11 flex-1 bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
