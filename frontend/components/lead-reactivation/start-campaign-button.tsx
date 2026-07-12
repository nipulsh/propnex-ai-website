"use client";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StartCampaignButton() {
  return (
    <Button
      type="button"
      className="h-9 gap-2 bg-propnex-accent px-4 text-propnex-bg hover:bg-propnex-accent/90"
      onClick={() => {
        // Campaign launch will be wired to backend later.
      }}
    >
      <Play className="size-4" />
      Start Campaign
    </Button>
  );
}
