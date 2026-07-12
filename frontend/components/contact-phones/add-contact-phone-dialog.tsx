"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Loader2, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUploadedContact } from "@/lib/graphql/api";
import {
  CONTACT_PHONE_COUNTRIES,
  DEFAULT_CONTACT_PHONE_COUNTRY,
  buildStoredContactPhone,
} from "@/lib/country-dial-codes";
import { isValidContactPhone } from "@/lib/contact-phone-validation";
import { cn } from "@/lib/utils";

type AddContactPhoneDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
};

export function AddContactPhoneDialog({
  open,
  onOpenChange,
  onAdded,
}: AddContactPhoneDialogProps) {
  const [country, setCountry] = useState(DEFAULT_CONTACT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setCountry(DEFAULT_CONTACT_PHONE_COUNTRY);
    setPhone("");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isSubmitting) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Phone number is required.");
      return;
    }
    if (!isValidContactPhone(trimmed)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    const stored = buildStoredContactPhone(country, trimmed);
    if (!stored) {
      setError("Invalid country or phone number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createUploadedContact(stored);
      onAdded();
      handleOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add phone number.",
      );
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
                Add Number
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Add a single phone number to your contact list.
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
                htmlFor="add-number-dialog-phone"
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
                  id="add-number-dialog-phone"
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
                  "Add Number"
                )}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
