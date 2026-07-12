"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AddNumberDialog } from "@/components/phone-numbers/add-number-dialog";
import { Button } from "@/components/ui/button";

export function AddNumberButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-9 gap-2 px-4 shadow-[0_0_20px_color-mix(in_srgb,var(--propnex-accent)_35%,transparent)]"
      >
        <Plus className="size-4" />
        Add Number
      </Button>

      <AddNumberDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
