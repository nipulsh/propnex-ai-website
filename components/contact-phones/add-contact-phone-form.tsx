"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUploadedContact } from "@/lib/graphql/api";
import { isValidE164Phone } from "@/lib/csv-import";
import { cn } from "@/lib/utils";

type AddContactPhoneFormProps = {
  onAdded: () => void;
  className?: string;
};

export function AddContactPhoneForm({
  onAdded,
  className,
}: AddContactPhoneFormProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Phone number is required.");
      return;
    }
    if (!isValidE164Phone(trimmed)) {
      setError("Use E.164 format (e.g. +15550123456).");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUploadedContact(trimmed);
      setPhone("");
      onAdded();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add phone number.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={cn("flex flex-col gap-2 sm:flex-row sm:items-start", className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Input
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setError(null);
          }}
          placeholder="+15550123456"
          className="h-11 border-propnex-border bg-propnex-bg font-mono"
          disabled={isSubmitting}
        />
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-propnex-muted">E.164 format required</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 shrink-0 border-transparent bg-propnex-accent px-6 text-propnex-bg hover:bg-propnex-accent/90"
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
