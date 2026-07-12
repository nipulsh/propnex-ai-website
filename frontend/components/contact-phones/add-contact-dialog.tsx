"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronDown, Loader2, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { fetchBranchesPage, importUploadedContacts } from "@/lib/graphql/api";
import {
  CONTACT_PHONE_COUNTRIES,
  DEFAULT_CONTACT_PHONE_COUNTRY,
  buildStoredContactPhone,
} from "@/lib/country-dial-codes";
import { isValidContactPhone } from "@/lib/contact-phone-validation";
import { cn } from "@/lib/utils";

type BranchOption = { id: string; name: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AddContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
};

export function AddContactDialog({
  open,
  onOpenChange,
  onAdded,
}: AddContactDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState(DEFAULT_CONTACT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    fetchBranchesPage(100)
      .then((res) =>
        setBranches(
          res.branches.connection.edges.map((edge) => ({
            id: edge.node.id,
            name: edge.node.name,
          })),
        ),
      )
      .catch(() => setBranches([]));
  }, [open]);

  function toggleBranch(id: string) {
    setSelectedBranchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  function resetForm() {
    setName("");
    setEmail("");
    setAddress("");
    setCountry(DEFAULT_CONTACT_PHONE_COUNTRY);
    setPhone("");
    setError(null);
    setSelectedBranchIds([]);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isSubmitting) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (!trimmedPhone) {
      setError("Phone number is required.");
      return;
    }
    if (!isValidContactPhone(trimmedPhone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    const stored = buildStoredContactPhone(country, trimmedPhone);
    if (!stored) {
      setError("Invalid country or phone number.");
      return;
    }

    const selectedBranchNames = branches
      .filter((branch) => selectedBranchIds.includes(branch.id))
      .map((branch) => branch.name);

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await importUploadedContacts([
        {
          phone: stored,
          name: trimmedName,
          email: trimmedEmail || null,
          address: trimmedAddress || null,
          branchNames: selectedBranchNames,
        },
      ]);

      const { created, skipped } =
        result.uploadedContacts.importContacts;
      if (created === 0 && skipped > 0) {
        setError("A contact with this phone number already exists.");
        setIsSubmitting(false);
        return;
      }

      onAdded();
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add contact.");
    } finally {
      setIsSubmitting(false);
    }
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
                Add Contact
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Enter the contact&apos;s details to add them to your list.
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

          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="add-contact-name"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Name
              </label>
              <Input
                id="add-contact-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError(null);
                }}
                placeholder="Contact name"
                className="h-11 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="add-contact-phone"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Mobile Number
              </label>
              <div className="flex gap-2">
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-11 shrink-0 rounded-lg border border-propnex-border bg-propnex-bg px-2 text-sm text-foreground"
                  disabled={isSubmitting}
                  aria-label="Country"
                >
                  {CONTACT_PHONE_COUNTRIES.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label} (+{option.dialCode})
                    </option>
                  ))}
                </select>
                <Input
                  id="add-contact-phone"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setError(null);
                  }}
                  placeholder="10-digit local number"
                  className="h-11 min-w-0 flex-1 border-propnex-border bg-propnex-bg font-mono text-foreground placeholder:text-propnex-muted"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="add-contact-email"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Email
              </label>
              <Input
                id="add-contact-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                placeholder="name@example.com"
                className="h-11 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="add-contact-address"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Address
              </label>
              <Input
                id="add-contact-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Street, city, state"
                className="h-11 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted"
                disabled={isSubmitting}
              />
            </div>

            {branches.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
                  Assign to Branch
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="flex h-11 w-full items-center justify-between rounded-lg border border-propnex-border bg-propnex-bg px-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
                      />
                    }
                  >
                    <span
                      className={cn(
                        selectedBranchIds.length === 0 && "text-propnex-muted",
                      )}
                    >
                      {selectedBranchIds.length === 0
                        ? "No branch selected"
                        : branches
                            .filter((branch) =>
                              selectedBranchIds.includes(branch.id),
                            )
                            .map((branch) => branch.name)
                            .join(", ")}
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-propnex-muted" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-(--anchor-width)">
                    {branches.map((branch) => (
                      <DropdownMenuCheckboxItem
                        key={branch.id}
                        checked={selectedBranchIds.includes(branch.id)}
                        onCheckedChange={() => toggleBranch(branch.id)}
                      >
                        {branch.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}

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
                disabled={isSubmitting}
                className="h-11 flex-1 border-propnex-border bg-propnex-bg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Add Contact"
                )}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
