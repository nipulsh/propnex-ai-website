"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronDown, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agents } from "@/lib/agents-data";
import { isValidE164Phone } from "@/lib/csv-import";
import {
  ADD_NUMBER_LABEL_OPTIONS,
  type PhoneNumberLabel,
} from "@/lib/phone-numbers-data";
import { usePhoneNumbersStore } from "@/stores/phone-numbers-store";
import { cn } from "@/lib/utils";

type AddNumberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddNumberDialog({ open, onOpenChange }: AddNumberDialogProps) {
  const addPhoneNumber = usePhoneNumbersStore((state) => state.addPhoneNumber);

  const [number, setNumber] = useState("");
  const [label, setLabel] = useState<PhoneNumberLabel>("MAIN");
  const [agentId, setAgentId] = useState(agents[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setNumber("");
    setLabel("MAIN");
    setAgentId(agents[0]?.id ?? "");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = number.trim();
    if (!trimmed) {
      setError("Phone number is required.");
      return;
    }

    if (!isValidE164Phone(trimmed)) {
      setError("Use E.164 format (e.g. +15550123456).");
      return;
    }

    const agent = agents.find((entry) => entry.id === agentId);
    if (!agent) {
      setError("Select a valid agent.");
      return;
    }

    addPhoneNumber({
      number: trimmed,
      label,
      agentId: agent.id,
      agentName: agent.name,
    });

    handleOpenChange(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs"
        />
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
                Add Phone Number
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-propnex-muted">
                Assign a new gateway number to an agent.
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
              <label
                htmlFor="add-number-phone"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Phone Number
              </label>
              <Input
                id="add-number-phone"
                type="tel"
                value={number}
                onChange={(event) => {
                  setNumber(event.target.value);
                  setError(null);
                }}
                placeholder="+15550123456"
                className="h-11 border-propnex-border bg-propnex-bg text-foreground placeholder:text-propnex-muted"
                aria-invalid={Boolean(error)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="add-number-label"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Label
              </label>
              <div className="relative">
                <select
                  id="add-number-label"
                  value={label}
                  onChange={(event) =>
                    setLabel(event.target.value as PhoneNumberLabel)
                  }
                  className="h-11 w-full appearance-none rounded-lg border border-propnex-border bg-propnex-bg py-2 pr-10 pl-3 text-sm text-foreground outline-none focus-visible:border-propnex-accent focus-visible:ring-2 focus-visible:ring-propnex-accent/30"
                >
                  {ADD_NUMBER_LABEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-propnex-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="add-number-agent"
                className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase"
              >
                Assigned Agent
              </label>
              <div className="relative">
                <select
                  id="add-number-agent"
                  value={agentId}
                  onChange={(event) => setAgentId(event.target.value)}
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
                className="h-11 flex-1 border-propnex-border bg-propnex-bg"
              >
                Cancel
              </Button>
              <Button type="submit" className="h-11 flex-1">
                Add Number
              </Button>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
