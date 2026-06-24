"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUploadedContact } from "@/lib/graphql/api";
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

    setIsSubmitting(true);
    try {
      await createUploadedContact(trimmed);
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
      <Input
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="9876543210"
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
