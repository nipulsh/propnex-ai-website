"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUploadedContact } from "@/lib/graphql/api";
import {
  CONTACT_PHONE_COUNTRIES,
  DEFAULT_CONTACT_PHONE_COUNTRY,
  buildStoredContactPhone,
} from "@/lib/country-dial-codes";
import { isValidContactPhone } from "@/lib/contact-phone-validation";
import type { SideNotificationType } from "@/components/common/side-notification";
import { cn } from "@/lib/utils";

type AddContactPhoneFormProps = {
  onAdded: () => void;
  onNotify?: (message: string, type: SideNotificationType) => void;
  className?: string;
};

export function AddContactPhoneForm({
  onAdded,
  onNotify,
  className,
}: AddContactPhoneFormProps) {
  const [country, setCountry] = useState(DEFAULT_CONTACT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function notify(message: string, type: SideNotificationType = "error") {
    onNotify?.(message, type);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = phone.trim();
    if (!trimmed) {
      notify("Phone number is required.");
      return;
    }
    if (!isValidContactPhone(trimmed)) {
      notify("Phone number must be exactly 10 digits.");
      return;
    }

    const stored = buildStoredContactPhone(country, trimmed);
    if (!stored) {
      notify("Invalid country or phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUploadedContact(stored);
      setPhone("");
      onAdded();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Unable to add phone number.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <select
        value={country}
        onChange={(event) => setCountry(event.target.value)}
        className="h-9 shrink-0 rounded-md border border-propnex-border bg-propnex-bg px-2 text-sm text-foreground"
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
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="10-digit local number"
        className="h-9 min-w-0 flex-1 border-propnex-border bg-propnex-bg font-mono"
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-9 shrink-0 border-transparent bg-propnex-accent px-4 text-propnex-bg hover:bg-propnex-accent/90"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Add Number"
        )}
      </Button>
    </form>
  );
}
