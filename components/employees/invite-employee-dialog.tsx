"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { useSideNotification } from "@/components/common/side-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchBranchesPage, inviteEmployee } from "@/lib/graphql/api";
import type { BranchAccessType, UserRole } from "@/lib/graphql/queries";
import { cn } from "@/lib/utils";

type InviteEmployeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "SALES", label: "Sales" },
  { value: "SUPPORT", label: "Support" },
  { value: "AGENT", label: "Agent" },
];

const LABEL_CLASS =
  "text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase";
const FIELD_CLASS =
  "h-10 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted";

export function InviteEmployeeDialog({
  open,
  onOpenChange,
  onInvited,
}: InviteEmployeeDialogProps) {
  const { notify } = useSideNotification();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState<UserRole>("SALES");
  const [branchAccessType, setBranchAccessType] =
    useState<BranchAccessType>("ALL");
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchBranchesPage(100)
      .then((res) =>
        setBranches(
          res.branches.connection.edges.map((e) => ({
            id: e.node.id,
            name: e.node.name,
          })),
        ),
      )
      .catch(() => setBranches([]));
  }, [open]);

  function reset() {
    setName("");
    setEmail("");
    setJobTitle("");
    setRole("SALES");
    setBranchAccessType("ALL");
    setBranchIds([]);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function toggleBranch(id: string) {
    setBranchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (branchAccessType === "SELECTED" && branchIds.length === 0) {
      setError("Select at least one branch.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await inviteEmployee({
        name: name.trim(),
        email: email.trim(),
        role,
        jobTitle: jobTitle.trim() || undefined,
        branchAccessType,
        branchIds: branchAccessType === "SELECTED" ? branchIds : undefined,
      });
      notify({ type: "success", message: "Invitation sent." });
      handleOpenChange(false);
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send invitation.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-propnex-border bg-propnex-panel p-6 shadow-xl",
            "data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold">
                Invite Employee
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Send an invitation to join your company workspace.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              className="rounded-md p-1 text-propnex-muted hover:bg-propnex-bg"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className={LABEL_CLASS}>Full name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className={LABEL_CLASS}>Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={FIELD_CLASS}
                  placeholder="jane@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Job title</label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={FIELD_CLASS}
                  placeholder="Sales Executive"
                />
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLASS}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className={cn(FIELD_CLASS, "w-full rounded-md border px-3")}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <p className={LABEL_CLASS}>Branch access</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={branchAccessType === "ALL"}
                    onChange={() => setBranchAccessType("ALL")}
                  />
                  All branches
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={branchAccessType === "SELECTED"}
                    onChange={() => setBranchAccessType("SELECTED")}
                  />
                  Selected branches
                </label>
              </div>
              {branchAccessType === "SELECTED" ? (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-propnex-border p-3">
                  {branches.length === 0 ? (
                    <p className="text-sm text-propnex-muted">No branches available.</p>
                  ) : (
                    branches.map((branch) => (
                      <label
                        key={branch.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={branchIds.includes(branch.id)}
                          onChange={() => toggleBranch(branch.id)}
                        />
                        {branch.name}
                      </label>
                    ))
                  )}
                </div>
              ) : null}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Sending…" : "Send invitation"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
