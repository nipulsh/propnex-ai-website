"use client";

import { Headset, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

type PhoneNumberEmptyStateProps = {
  onAssignAgent: () => void;
  onTestNumber: () => void;
};

export function PhoneNumberEmptyState({
  onAssignAgent,
  onTestNumber,
}: PhoneNumberEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-propnex-border bg-propnex-panel px-6 py-12 text-center">
      <p className="max-w-md text-sm text-propnex-muted">
        No inbound or outbound activity found for this number.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onAssignAgent}
          className="gap-2 border-propnex-border bg-propnex-bg"
        >
          <Headset className="size-4" />
          Assign Agent
        </Button>
        <Button type="button" onClick={onTestNumber} className="gap-2">
          <UserPlus className="size-4" />
          Test Number
        </Button>
      </div>
    </div>
  );
}
