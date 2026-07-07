"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBranch } from "@/lib/graphql/api";
import { cn } from "@/lib/utils";

type CreateBranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  onNotify: (message: string, type: "success" | "error") => void;
};

const LABEL_CLASS =
  "text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase";
const FIELD_CLASS =
  "h-10 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted";

export function CreateBranchDialog({
  open,
  onOpenChange,
  onCreated,
  onNotify,
}: CreateBranchDialogProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function reset() {
    setName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setNotes("");
    setStatus("ACTIVE");
    setAiEnabled(false);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Branch name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await createBranch({
        name: trimmed,
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
        status,
        aiEnabled,
      });
      
      const createdBranch = res?.branches?.create;
      const branchEmail = createdBranch?.email;
      const isSent = createdBranch?.invitationEmailSent;

      if (branchEmail) {
        if (isSent) {
          onNotify(`Branch created successfully. An invitation email has been sent to ${branchEmail}.`, "success");
        } else {
          onNotify(`Branch created successfully, but the invitation email could not be delivered. Please try again using "Resend Invitation."`, "error");
        }
      } else {
        onNotify(`Branch "${trimmed}" created.`, "success");
      }

      handleOpenChange(false);
      onCreated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create branch.";
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
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
            "max-h-[90vh] overflow-y-auto rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-lg",
            "transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                Create Branch
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Add a new business unit to your company.
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
              <label htmlFor="branch-name" className={LABEL_CLASS}>
                Branch Name
              </label>
              <Input
                id="branch-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Downtown Office"
                className={FIELD_CLASS}
                aria-invalid={Boolean(error)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="branch-phone" className={LABEL_CLASS}>
                  Phone
                </label>
                <Input
                  id="branch-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 012 3456"
                  className={FIELD_CLASS}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="branch-email" className={LABEL_CLASS}>
                  Email
                </label>
                <Input
                  id="branch-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="branch@company.com"
                  className={FIELD_CLASS}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="branch-address" className={LABEL_CLASS}>
                Address
              </label>
              <Input
                id="branch-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City"
                className={FIELD_CLASS}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="branch-notes" className={LABEL_CLASS}>
                Notes
              </label>
              <textarea
                id="branch-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional notes about this branch"
                className="w-full resize-y rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm text-foreground outline-none placeholder:text-propnex-muted focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <label htmlFor="branch-status" className={LABEL_CLASS}>
                  Status
                </label>
                <select
                  id="branch-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 w-40 rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 pt-5 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="size-4 cursor-pointer accent-primary"
                />
                Enable AI agent
              </label>
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
              <Button type="submit" disabled={isSaving} className="h-10 flex-1">
                {isSaving ? "Creating…" : "Create Branch"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
